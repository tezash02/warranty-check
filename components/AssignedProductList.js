"use client";

import { useState, useEffect } from "react";
import { fetchAssignedProducts } from "@/app/api/server-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AssignedProductList() {
  const [products, setProducts] = useState([]);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assigned Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Model Number</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    {product.image_url && (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                  </TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell>{product.serial_number}</TableCell>
                  <TableCell>{product.model_number}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
