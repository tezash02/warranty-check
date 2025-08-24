"use client";

import { useState, useEffect } from "react";
import { addSale, fetchAssignedProducts } from "@/app/api/server-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function RegisterSale() {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [salesDate, setSalesDate] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadAssignedProducts();
  }, []);

  async function loadAssignedProducts() {
    try {
      const data = await fetchAssignedProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching assigned products:", error);
    }
  }

  async function handleRegisterSale(e) {
    e.preventDefault();
    setMessage("");

    const product = products.find((p) => p.id === selectedProduct);
    if (!product) {
      setMessage("Please select a product.");
      return;
    }

    const salesDateObj = new Date(salesDate);
    const warrantyEndDate = new Date(salesDateObj);
    warrantyEndDate.setMonth(
      warrantyEndDate.getMonth() + product.warranty_period_months
    );

    try {
      await addSale({
        product_id: selectedProduct,
        customer_name: customerName,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        sales_date: salesDate,
        warranty_start_date: salesDate,
        warranty_end_date: warrantyEndDate.toISOString().split("T")[0],
      });
      setMessage("Sale registered successfully!");
      setSelectedProduct("");
      setCustomerName("");
      setCustomerEmail("");
      setCustomerPhone("");
      setSalesDate("");
    } catch (error) {
      console.error("Error registering sale:", error);
      setMessage(`Error registering sale: ${error.message}`);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register New Sale</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleRegisterSale}>
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="product">Product</Label>
              <Select
                onValueChange={setSelectedProduct}
                value={selectedProduct}
              >
                <SelectTrigger id="product">
                  <SelectValue placeholder="Select a product" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.serial_number})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="customerName">Customer Name</Label>
              <Input
                id="customerName"
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="customerPhone">Customer Phone</Label>
              <Input
                id="customerPhone"
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="salesDate">Sales Date</Label>
              <Input
                id="salesDate"
                type="date"
                value={salesDate}
                onChange={(e) => setSalesDate(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Register Sale
          </Button>
          {message && (
            <p className="mt-4 text-center text-green-500">{message}</p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
