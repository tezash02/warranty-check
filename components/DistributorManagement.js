"use client";

import { useState, useEffect } from "react";
import {
  addDistributor,
  updateDistributor,
  fetchDistributors,
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

export default function DistributorManagement() {
  const [distributors, setDistributors] = useState([]);
  const [newDistributor, setNewDistributor] = useState({
    name: "",
    email: "",
  });
  const [editingDistributor, setEditingDistributor] = useState(null);

  useEffect(() => {
    loadDistributors();
  }, []);

  async function loadDistributors() {
    try {
      const data = await fetchDistributors();
      setDistributors(data);
    } catch (error) {
      console.error("Error fetching distributors:", error);
    }
  }

  async function handleAddDistributor(e) {
    e.preventDefault();
    try {
      await addDistributor(newDistributor);
      setNewDistributor({
        name: "",
        email: "",
      });
      loadDistributors();
    } catch (error) {
      console.error("Error adding distributor:", error);
    }
  }

  async function handleUpdateDistributor(e) {
    e.preventDefault();
    if (!editingDistributor) return;

    try {
      await updateDistributor(editingDistributor);
      setEditingDistributor(null);
      setNewDistributor({
        name: "",
        email: "",
      });
      loadDistributors();
    } catch (error) {
      console.error("Error updating distributor:", error);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Distributors</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={
            editingDistributor ? handleUpdateDistributor : handleAddDistributor
          }
          className="mb-8"
        >
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="distributorName">Distributor Name</Label>
              <Input
                id="distributorName"
                type="text"
                placeholder="Distributor Name"
                value={
                  editingDistributor
                    ? editingDistributor.name
                    : newDistributor.name
                }
                onChange={(e) =>
                  editingDistributor
                    ? setEditingDistributor({
                        ...editingDistributor,
                        name: e.target.value,
                      })
                    : setNewDistributor({
                        ...newDistributor,
                        name: e.target.value,
                      })
                }
                required
              />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="distributorEmail">Distributor Email</Label>
              <Input
                id="distributorEmail"
                type="email"
                placeholder="Distributor Email"
                value={
                  editingDistributor
                    ? editingDistributor.email
                    : newDistributor.email
                }
                onChange={(e) =>
                  editingDistributor
                    ? setEditingDistributor({
                        ...editingDistributor,
                        email: e.target.value,
                      })
                    : setNewDistributor({
                        ...newDistributor,
                        email: e.target.value,
                      })
                }
                required
              />
            </div>
          </div>
          <Button type="submit" className="mr-2">
            {editingDistributor ? "Update Distributor" : "Add Distributor"}
          </Button>
          {editingDistributor && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditingDistributor(null)}
            >
              Cancel Edit
            </Button>
          )}
        </form>

        <h4 className="text-xl font-semibold mb-4">Existing Distributors</h4>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {distributors.map((distributor) => (
                <TableRow key={distributor.id}>
                  <TableCell>{distributor.name}</TableCell>
                  <TableCell>{distributor.email}</TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingDistributor(distributor)}
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
