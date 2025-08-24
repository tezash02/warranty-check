"use client";

import { useState, useEffect } from "react";
import { fetchSales } from "@/app/api/server-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function SalesOverview() {
  const [sales, setSales] = useState([]);

  useEffect(() => {
    loadSales();
  }, []);

  async function loadSales() {
    try {
      const data = await fetchSales();
      setSales(data);
    } catch (error) {
      console.error("Error fetching sales:", error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Sales Date</TableHead>
                <TableHead>Warranty End Date</TableHead>
                <TableHead>Distributor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sales.map((sale) => (
                <TableRow key={sale.id}>
                  <TableCell>{sale.products.name}</TableCell>
                  <TableCell>{sale.products.serial_number}</TableCell>
                  <TableCell>{sale.customer_name}</TableCell>
                  <TableCell>{sale.sales_date}</TableCell>
                  <TableCell>{sale.warranty_end_date}</TableCell>
                  <TableCell>
                    {sale.distributors ? sale.distributors.name : "Direct Sale"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
