"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@lootzone/trpc-shared";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Eye, Edit, Trash2, Archive, RotateCcw } from "lucide-react";
import Image from "next/image";

export default function ProductsPage() {
  const [showArchived, setShowArchived] = useState(false);

  const { data: products, isLoading, refetch: refetchProducts } = api.product.adminList.useQuery();

  const deleteProduct = api.product.delete.useMutation({
    onSuccess: () => {
      toast.success('Product deleted successfully!');
      refetchProducts();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const toggleActiveProduct = api.product.toggleActive.useMutation({
    onSuccess: () => {
      toast.success('Product status updated successfully!');
      refetchProducts();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const restoreProduct = api.product.restore.useMutation({
    onSuccess: () => {
      toast.success('Product restored successfully!');
      refetchProducts();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const toggleActive = api.product.toggleActive.useMutation({
    onSuccess: () => {
      toast.success('Product status updated!');
      refetchProducts();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to permanently delete this product?')) {
      deleteProduct.mutate({ id });
    }
  };

  const handleArchive = (id: string) => {
    if (confirm('Are you sure you want to change this product\'s active status?')) {
      toggleActiveProduct.mutate({ id });
    }
  };

  const handleRestore = (id: string) => {
    restoreProduct.mutate({ id });
  };

  const handleToggleActive = (id: string, isActive: boolean) => {
    toggleActive.mutate({ id, isActive: !isActive });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products Management</h1>
          <p className="text-muted-foreground">
            Manage your product catalog, pricing, and availability
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowArchived(!showArchived)}
          >
            {showArchived ? "Hide Archived" : "Show Archived"}
          </Button>
          <Button asChild>
            <Link href="/dashboard/products/create">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Platform</TableHead>
                  <TableHead>Region</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products?.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                              No Image
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{product.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{product.category?.name || 'Uncategorized'}</Badge>
                    </TableCell>
                    <TableCell>{product.platformName || 'N/A'}</TableCell>
                    <TableCell>{product.region}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={product.isActive}
                          onCheckedChange={() => handleToggleActive(product.id, product.isActive)}
                        />
                        <span className="text-sm">
                          {product.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/products/${product.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/dashboard/products/edit/${product.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        {!product.isArchived ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleArchive(product.id)}
                          >
                            <Archive className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRestore(product.id)}
                          >
                            <RotateCcw className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
