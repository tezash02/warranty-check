"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const createSupabaseServerClient = () => {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options });
        },
        remove(name, options) {
          cookieStore.set({ name, value, ...options });
        },
      },
    }
  );
};

export async function addProduct(productData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated.");
  }

  const { data, error } = await supabase.from("products").insert([
    {
      name: productData.name,
      serial_number: productData.serial_number,
      model_number: productData.model_number,
      purchase_price: parseFloat(productData.purchase_price),
      manufacture_date: productData.manufacture_date,
      warranty_period_months: parseInt(productData.warranty_period_months),
      created_by: user.id,
      image_url: productData.image_url,
    },
  ]);

  if (error) {
    throw error;
  }
  return data;
}

export async function updateProduct(productData) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .update({
      name: productData.name,
      serial_number: productData.serial_number,
      model_number: productData.model_number,
      purchase_price: parseFloat(productData.purchase_price),
      manufacture_date: productData.manufacture_date,
      warranty_period_months: parseInt(productData.warranty_period_months),
      image_url: productData.image_url,
    })
    .eq("id", productData.id);

  if (error) {
    throw error;
  }
  return data;
}

export async function fetchProducts() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("products").select("*");
  if (error) {
    throw error;
  }
  return data;
}

export async function addDistributor(distributorData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated.");
  }

  // 1. Generate a random temporary password
  const temporaryPassword =
    Math.random().toString(36).slice(-12) +
    Math.random().toString(36).toUpperCase().slice(-4) +
    Math.random().toString(21).slice(-4);

  // 2. Create auth user for distributor
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: distributorData.email,
      password: temporaryPassword,
      email_confirm: true, // Auto-confirm email
    });

  if (authError) throw authError;

  // 3. Add user role
  const { error: roleError } = await supabase.from("users").insert([
    {
      id: authData.user.id,
      role: "distributor",
    },
  ]);

  if (roleError) throw roleError;

  // 4. Create distributor record
  const { data, error: distributorError } = await supabase
    .from("distributors")
    .insert([
      {
        id: authData.user.id, // Use same ID as auth user
        name: distributorData.name,
        email: distributorData.email,
        company_id: user.id,
      },
    ]);

  if (distributorError) throw distributorError;

  // 5. Send password reset email to distributor
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(
    distributorData.email
  );

  if (resetError) throw resetError;

  return {
    ...data,
    message: `Distributor created successfully. A password reset link has been sent to ${distributorData.email}`,
  };
}

export async function updateDistributor(distributorData) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("distributors")
    .update({
      name: distributorData.name,
      email: distributorData.email,
    })
    .eq("id", distributorData.id);

  if (error) {
    throw error;
  }
  return data;
}

export async function fetchDistributors() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("distributors").select("*");
  if (error) {
    throw error;
  }
  return data;
}

export async function addSale(saleData) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("User not authenticated.");
  }

  const { data, error } = await supabase.from("sales").insert([
    {
      product_id: saleData.product_id,
      distributor_id: saleData.distributor_id,
      customer_name: saleData.customer_name,
      customer_email: saleData.customer_email,
      customer_phone: saleData.customer_phone,
      sales_date: saleData.sales_date,
      warranty_start_date: saleData.warranty_start_date,
      warranty_end_date: saleData.warranty_end_date,
    },
  ]);

  if (error) {
    throw error;
  }
  return data;
}

export async function fetchSales() {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase.from("sales").select(`
      *,
      products (name, serial_number, image_url),
      distributors (name)
    `);
  if (error) {
    throw error;
  }
  return data;
}

export async function fetchAssignedProducts() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("User not authenticated.");
  }

  const { data: distributorData, error: distributorError } = await supabase
    .from("distributors")
    .select("id")
    .eq("email", user.email)
    .single();

  if (distributorError || !distributorData) {
    throw new Error("Distributor not found.");
  }

  const distributorId = distributorData.id;

  const { data, error } = await supabase
    .from("products")
    .select(
      "id, name, serial_number, model_number, warranty_period_months, image_url"
    )
    .eq("assigned_distributor_id", distributorId);

  if (error) {
    throw error;
  }
  return data;
}

export async function checkWarranty(serialOrModel) {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("products")
    .select(
      `
      *,
      sales (customer_name, sales_date, warranty_start_date, warranty_end_date)
    `
    )
    .or(`serial_number.eq.${serialOrModel},model_number.eq.${serialOrModel}`)
    .single();

  if (error) {
    throw error;
  }
  return data;
}

export async function uploadProductImage(file, userId) {
  const supabase = createSupabaseServerClient();
  const filePath = `${userId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("product-images")
    .upload(filePath, file);

  if (error) {
    throw error;
  }
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/product-images/${filePath}`;
}
