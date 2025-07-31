import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/utils/api";

function CategoryManagement() {
  const queryClient = useQueryClient();

  // ✅ This is the syntax you wanted!
  const {
    data: categoriesData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.category.getAll(),
  });

  const { data: smartCategoriesData, isLoading: isLoadingSmart } = useQuery({
    queryKey: ['smartCategories'],
    queryFn: () => api.category.getSmart(),
  });

  const categories = categoriesData?.result?.data;
  const smartCategories = smartCategoriesData?.result?.data;

  // ✅ Mutations with full type safety
  const createCategory = useMutation({
    mutationFn: (data: { name: string; description?: string }) => api.category.create(data),
    onSuccess: () => {
      // Invalidate and refetch categories
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      console.error("Failed to create category:", error);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: (data: { id: string }) => api.category.delete(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      console.error("Failed to delete category:", error);
    },
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert severity="error">
          Error loading categories: {error.message}
        </Alert>
      </Box>
    );
  }

  const handleCreateCategory = () => {
    createCategory.mutate({
      name: `New Category ${Date.now()}`,
      description: "Auto-generated category",
    });
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory.mutate({ id });
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "description", headerName: "Description", width: 300 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={() => handleDeleteCategory(params.row.id)}
          disabled={deleteCategory.isPending}
        >
          {deleteCategory.isPending ? "Deleting..." : "Delete"}
        </Button>
      ),
    },
  ];

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        API Demo - Category Management
      </Typography>

      <Box display="flex" gap={3}>
        {/* Smart Categories */}
        <Box flex={1}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Smart Categories
              </Typography>
              {isLoadingSmart ? (
                <CircularProgress size={24} />
              ) : (
                <Box>
                  {smartCategories?.map((category: any) => (
                    <Box
                      key={category.id}
                      display="flex"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Typography variant="body2">{category.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({category.count})
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>

        {/* Main Categories Table */}
        <Box flex={2}>
          <Card>
            <CardContent>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
              >
                <Typography variant="h6">All Categories</Typography>
                <Button
                  variant="contained"
                  onClick={handleCreateCategory}
                  disabled={createCategory.isPending}
                >
                  {createCategory.isPending ? "Creating..." : "Add Category"}
                </Button>
              </Box>

              <DataGrid
                rows={categories || []}
                columns={columns}
                autoHeight
                disableRowSelectionOnClick
                pageSizeOptions={[5, 10, 25]}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 5 },
                  },
                }}
              />
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Status Messages */}
      {createCategory.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to create category: {createCategory.error.message}
        </Alert>
      )}

      {deleteCategory.error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          Failed to delete category: {deleteCategory.error.message}
        </Alert>
      )}
    </Box>
  );
}

export default CategoryManagement;
