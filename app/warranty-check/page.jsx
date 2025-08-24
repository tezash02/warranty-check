"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default function WarrantyCheck() {
  const [serialNumber, setSerialNumber] = useState("");
  const [warranty, setWarranty] = useState(null);
  const [error, setError] = useState(null);

  const checkWarranty = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("sales")
        .select(
          `
          *,
          product:products (
            name,
            serial_number,
            image_url
          )
        `
        )
        .eq("products.serial_number", serialNumber)
        .single();

      if (error) throw error;

      if (data) {
        const today = new Date();
        const endDate = new Date(data.warranty_end_date);
        const status = today <= endDate ? "Under Warranty" : "Expired";
        setWarranty({ ...data, status });
      } else {
        setError("No warranty information found for this serial number");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
          Check Warranty Status
        </h2>
        <form onSubmit={checkWarranty} className="space-y-6">
          <div>
            <input
              type="text"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter Serial Number"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Check Warranty
          </button>
        </form>

        {error && (
          <div className="mt-8 bg-red-50 p-4 rounded-md">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {warranty && (
          <div className="mt-8 bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {warranty.product.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Serial Number: {warranty.product.serial_number}
                </p>
              </div>
              {warranty.product.image_url && (
                <img
                  src={warranty.product.image_url}
                  alt={warranty.product.name}
                  className="w-full h-48 object-cover rounded-md"
                />
              )}
              <div className="border-t border-gray-200 pt-4">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Purchase Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(warranty.sales_date).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">
                      Warranty End Date
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(
                        warranty.warranty_end_date
                      ).toLocaleDateString()}
                    </dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">
                      Status
                    </dt>
                    <dd
                      className={`mt-1 text-sm font-bold ${
                        warranty.status === "Under Warranty"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {warranty.status}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
