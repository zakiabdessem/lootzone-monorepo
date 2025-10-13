"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@lootzone/trpc-shared";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Plus, Edit, Trash2 } from "lucide-react";

const validationSchema = z.object({
  label: z.string().min(1, "Label is required"),
  productId: z.string().min(1, "Product is required"),
  displayOrder: z.number().min(0, "Display order must be 0 or greater"),
  isActive: z.boolean(),
});

type HeroSlideFormData = z.infer<typeof validationSchema>;

export default function HeroSlidesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);

  const { data: slides, isLoading, refetch } = api.heroSlide.getAllForAdmin.useQuery();
  const { data: products } = api.product.getAll.useQuery();
  
  const form = useForm<HeroSlideFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      label: "",
      productId: "",
      displayOrder: 0,
      isActive: true,
    },
  });

  const createSlide = api.heroSlide.create.useMutation({
    onSuccess: () => {
      toast.success('Hero slide created successfully!');
      refetch();
      setDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateSlide = api.heroSlide.update.useMutation({
    onSuccess: () => {
      toast.success('Hero slide updated successfully!');
      refetch();
      setDialogOpen(false);
      setEditingSlide(null);
      form.reset();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteSlide = api.heroSlide.delete.useMutation({
    onSuccess: () => {
      toast.success('Hero slide deleted successfully!');
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleEdit = (slide: any) => {
    setEditingSlide(slide);
    form.reset({
      label: slide.label || "",
      productId: slide.productId || "",
      displayOrder: slide.displayOrder || 0,
      isActive: slide.isActive ?? true,
    });
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this hero slide?')) {
      deleteSlide.mutate({ id });
    }
  };

  const onSubmit = (values: HeroSlideFormData) => {
    if (editingSlide) {
      updateSlide.mutate({ id: editingSlide.id, ...values });
    } else {
      createSlide.mutate(values);
    }
  };

  const handleOpenDialog = () => {
    setEditingSlide(null);
    form.reset({
      label: "",
      productId: "",
      displayOrder: 0,
      isActive: true,
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Hero Slides Management</h1>
        <Button onClick={handleOpenDialog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Hero Slide
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Hero Slides</CardTitle>
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
                  <TableHead>Label</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slides?.map((slide) => (
                  <TableRow key={slide.id}>
                    <TableCell className="whitespace-pre-line">{slide.label}</TableCell>
                    <TableCell>{slide.product?.title || 'N/A'}</TableCell>
                    <TableCell>{slide.displayOrder}</TableCell>
                    <TableCell>
                      <Switch checked={slide.isActive} disabled />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(slide)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(slide.id)}
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingSlide ? 'Edit Hero Slide' : 'Create Hero Slide'}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="label"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label (use \n for line breaks)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="MINTY\nLEGENDS"
                        className="h-20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products?.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="displayOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Order</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createSlide.isPending || updateSlide.isPending}
                >
                  {editingSlide ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
