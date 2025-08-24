import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return req.cookies.get(name)?.value;
        },
        set(name, value, options) {
          req.cookies.set({ name, value, ...options });
        },
        remove(name, options) {
          req.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define public paths that don't require authentication
  const publicPaths = ["/login", "/warranty-check", "/"];

  // If user is not logged in and trying to access a protected path, redirect to login
  if (!user && !publicPaths.includes(req.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // If user is logged in and trying to access login page, redirect to dashboard
  if (user && req.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Fetch user role from public.users table
  let userRole = null;
  if (user) {
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (userError) {
      console.error("Error fetching user role:", userError);
      // Handle error, maybe redirect to an error page or logout
      return NextResponse.redirect(new URL("/login", req.url));
    }
    userRole = userData ? userData.role : null;
  }

  // Role-based access control
  if (userRole) {
    if (req.nextUrl.pathname.startsWith("/dashboard")) {
      // Example: Only 'company' and 'distributor' roles can access dashboard
      if (userRole !== "company" && userRole !== "distributor") {
        return NextResponse.redirect(new URL("/login", req.url)); // Or a forbidden page
      }
    }
    // Add more role-based path restrictions as needed
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
