"use client";

import { useState, useEffect } from "react";
import {
  addProduct,
  updateProduct,
  fetchProducts,
  uploadProductImage,
} from "../app/api/server-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    serial_number: "",
    model_number: "",
    purchase_price: "",
    manufacture_date: "",
    warranty_period_months: "",
    image: null,
  });
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      const data = await fetchProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  }

  async function handleAddProduct(e) {
    e.preventDefault();

    let imageUrl = null;
    if (newProduct.image) {
      try {
        imageUrl = await uploadProductImage(
          newProduct.image,
          "placeholder-user-id"
        ); // Placeholder
      } catch (error) {
        console.error("Error uploading image:", error);
        return;
      }
    }

    try {
      await addProduct({
        ...newProduct,
        purchase_price: parseFloat(newProduct.purchase_price),
        warranty_period_months: parseInt(newProduct.warranty_period_months),
        image_url: imageUrl,
      });
      setNewProduct({
        name: "",
        serial_number: "",
        model_number: "",
        purchase_price: "",
        manufacture_date: "",
        warranty_period_months: "",
        image: null,
      });
      loadProducts();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  }

  async function handleUpdateProduct(e) {
    e.preventDefault();
    if (!editingProduct) return;

    let imageUrl = editingProduct.image_url;
    if (newProduct.image) {
      try {
        imageUrl = await uploadProductImage(
          newProduct.image,
          "placeholder-user-id"
        ); // Placeholder
      } catch (error) {
        console.error("Error uploading image:", error);
        return;
      }
    }

    try {
      await updateProduct({
        ...editingProduct,
        purchase_price: parseFloat(editingProduct.purchase_price),
        warranty_period_months: parseInt(editingProduct.warranty_period_months),
        image_url: imageUrl,
      });
      setEditingProduct(null);
      setNewProduct({
        name: "",
        serial_number: "",
        model_number: "",
        purchase_price: "",
        manufacture_date: "",
        warranty_period_months: "",
        image: null,
      });
      loadProducts();
    } catch (error) {
      console.error("Error updating product:", error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Products</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={editingProduct ? handleUpdateProduct : handleAddProduct}
          className="mb-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="productName">Product Name</Label>
              <Input
                id="productName"
                type="text"
                placeholder="Product Name"
                value={editingProduct ? editingProduct.name : newProduct.name}
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({
                        ...editingProduct,
                        name: e.target.value,
                      })
                    : setNewProduct({ ...newProduct, name: e.target.value })
                }
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="serialNumber">Serial Number</Label>
              <Input
                id="serialNumber"
                type="text"
                placeholder="Serial Number"
                value={
                  editingProduct
                    ? editingProduct.serial_number
                    : newProduct.serial_number
                }
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({
                        ...editingProduct,
                        serial_number: e.target.value,
                      })
                    : setNewProduct({
                        ...newProduct,
                        serial_number: e.target.value,
                      })
                }
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="modelNumber">Model Number</Label>
              <Input
                id="modelNumber"
                type="text"
                placeholder="Model Number"
                value={
                  editingProduct
                    ? editingProduct.model_number
                    : newProduct.model_number
                }
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({
                        ...editingProduct,
                        model_number: e.target.value,
                      })
                    : setNewProduct({
                        ...newProduct,
                        model_number: e.target.value,
                      })
                }
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="purchasePrice">Purchase Price</Label>
              <Input
                id="purchasePrice"
                type="number"
                placeholder="Purchase Price"
                value={
                  editingProduct
                    ? editingProduct.purchase_price
                    : newProduct.purchase_price
                }
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({
                        ...editingProduct,
                        purchase_price: e.target.value,
                      })
                    : setNewProduct({
                        ...newProduct,
                        purchase_price: e.target.value,
                      })
                }
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="manufactureDate">Manufacture Date</Label>
              <Input
                id="manufactureDate"
                type="date"
                placeholder="Manufacture Date"
                value={
                  editingProduct
                    ? editingProduct.manufacture_date
                    : newProduct.manufacture_date
                }
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({
                        ...editingProduct,
                        manufacture_date: e.target.value,
                      })
                    : setNewProduct({
                        ...newProduct,
                        manufacture_date: e.target.value,
                      })
                }
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="warrantyPeriod">Warranty Period (months)</Label>
              <Input
                id="warrantyPeriod"
                type="number"
                placeholder="Warranty Period (months)"
                value={
                  editingProduct
                    ? editingProduct.warranty_period_months
                    : newProduct.warranty_period_months
                }
                onChange={(e) =>
                  editingProduct
                    ? setEditingProduct({
                        ...editingProduct,
                        warranty_period_months: e.target.value,
                      })
                    : setNewProduct({
                        ...newProduct,
                        warranty_period_months: e.target.value,
                      })
                }
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="productImage">Product Image</Label>
              <Input
                id="productImage"
                type="file"
                accept="image/*"
                onChange={(e) =>
                  setNewProduct({ ...newProduct, image: e.target.files[0] })
                }
              />
            </div>
          </div>
          <Button type="submit" className="mr-2">
            {editingProduct ? "Update Product" : "Add Product"}
          </Button>
          {editingProduct && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingProduct(null)}
            >
              Cancel Edit
            </Button>
          )}
        </form>

        <h4 className="text-xl font-semibold mb-4">Existing Products</h4>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Serial Number</TableHead>
                <TableHead>Actions</TableHead>
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
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProduct(product)}
                    >
                      Edit
                    </Button>
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
