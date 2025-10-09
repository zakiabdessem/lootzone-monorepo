
"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Typography,
  Switch,
  FormControlLabel,
  MenuItem,
  Alert,
  CircularProgress,
} from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { Add, Edit, Delete } from "@mui/icons-material";
import { useState } from "react";
import { Formik, Form } from "formik";
import * as Yup from "yup";
import { api } from "@lootzone/trpc-shared";

const validationSchema = Yup.object({
  label: Yup.string().required("Label is required"),
  productId: Yup.string().required("Product is required"),
  displayOrder: Yup.number().min(0).required("Display order is required"),
});

interface HeroSlideFormData {
  label: string;
  productId: string;
  isActive: boolean;
  displayOrder: number;
}

export default function HeroSlidesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const { data: slides, isLoading, refetch } = api.heroSlide.getAllForAdmin.useQuery();
  const { data: products } = api.product.getAll.useQuery();
  
  const createSlide = api.heroSlide.create.useMutation({
    onSuccess: () => {
      setAlert({ type: 'success', message: 'Hero slide created successfully!' });
      refetch();
      setDialogOpen(false);
      setTimeout(() => setAlert(null), 3000);
    },
    onError: (error) => {
      setAlert({ type: 'error', message: error.message });
      setTimeout(() => setAlert(null), 5000);
    },
  });

  const updateSlide = api.heroSlide.update.useMutation({
    onSuccess: () => {
      setAlert({ type: 'success', message: 'Hero slide updated successfully!' });
      refetch();
      setDialogOpen(false);
      setEditingSlide(null);
      setTimeout(() => setAlert(null), 3000);
    },
    onError: (error) => {
      setAlert({ type: 'error', message: error.message });
      setTimeout(() => setAlert(null), 5000);
    },
  });

  const deleteSlide = api.heroSlide.delete.useMutation({
    onSuccess: () => {
      setAlert({ type: 'success', message: 'Hero slide deleted successfully!' });
      refetch();
      setTimeout(() => setAlert(null), 3000);
    },
    onError: (error) => {
      setAlert({ type: 'error', message: error.message });
      setTimeout(() => setAlert(null), 5000);
    },
  });

  const handleEdit = (slide: any) => {
    setEditingSlide(slide);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this hero slide?')) {
      deleteSlide.mutate({ id });
    }
  };

  const handleSubmit = (values: HeroSlideFormData) => {
    if (editingSlide) {
      updateSlide.mutate({ id: editingSlide.id, ...values });
    } else {
      createSlide.mutate(values);
    }
  };

  const columns: GridColDef[] = [
    { field: 'label', headerName: 'Label', width: 200 },
    { 
      field: 'product', 
      headerName: 'Product', 
      width: 300,
      valueGetter: (value, row) => row.product?.title || 'N/A'
    },
    { field: 'displayOrder', headerName: 'Order', width: 100 },
    { 
      field: 'isActive', 
      headerName: 'Active', 
      width: 100,
      type: 'boolean'
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 120,
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          icon={<Edit />}
          label="Edit"
          onClick={() => handleEdit(params.row)}
        />,
        <GridActionsCellItem
          key="delete"
          icon={<Delete />}
          label="Delete"
          onClick={() => handleDelete(params.row.id)}
        />,
      ],
    },
  ];

  const initialValues: HeroSlideFormData = {
    label: editingSlide?.label || "",
    productId: editingSlide?.productId || "",
    isActive: editingSlide?.isActive ?? true,
    displayOrder: editingSlide?.displayOrder || 0,
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Hero Slides Management
      </Typography>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Hero Slides</Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                setEditingSlide(null);
                setDialogOpen(true);
              }}
            >
              Add Hero Slide
            </Button>
          </Box>

          {isLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : (
            <div style={{ height: 400, width: "100%" }}>
              <DataGrid
                rows={slides || []}
                columns={columns}
                pageSize={10}
                disableRowSelectionOnClick
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSlide ? 'Edit Hero Slide' : 'Create Hero Slide'}
        </DialogTitle>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
            <Form>
              <DialogContent>
                <TextField
                  name="label"
                  label="Label (use \n for line breaks)"
                  value={values.label}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.label && Boolean(errors.label)}
                  helperText={touched.label && errors.label}
                  fullWidth
                  margin="normal"
                  placeholder="MINTY\nLEGENDS"
                />

                <TextField
                  name="productId"
                  label="Product"
                  select
                  value={values.productId}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.productId && Boolean(errors.productId)}
                  helperText={touched.productId && errors.productId}
                  fullWidth
                  margin="normal"
                >
                  {products?.map((product) => (
                    <MenuItem key={product.id} value={product.id}>
                      {product.title}
                    </MenuItem>
                  ))}
                </TextField>

                <TextField
                  name="displayOrder"
                  label="Display Order"
                  type="number"
                  value={values.displayOrder}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.displayOrder && Boolean(errors.displayOrder)}
                  helperText={touched.displayOrder && errors.displayOrder}
                  fullWidth
                  margin="normal"
                />

                <FormControlLabel
                  control={
                    <Switch
                      name="isActive"
                      checked={values.isActive}
                      onChange={(e) => handleChange({ target: { name: 'isActive', value: e.target.checked }})}
                    />
                  }
                  label="Active"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button 
                  type="submit" 
                  variant="contained"
                  disabled={isSubmitting || createSlide.isPending || updateSlide.isPending}
                >
                  {editingSlide ? 'Update' : 'Create'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
}
