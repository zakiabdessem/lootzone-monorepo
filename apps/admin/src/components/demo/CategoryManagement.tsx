import { api } from "@lootzone/trpc-shared";
import {
    Alert,
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    Typography,
} from "@mui/material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";

function CategoryManagement() {
  // tRPC hooks
  const {
    data: categories = [],
    isLoading,
    error,
  } = api.category.getAll.useQuery();

  const { data: smartCategories = [], isLoading: isLoadingSmart } =
    api.category.getSmart.useQuery();

  const utils = api.useContext();

  // Mutations
  const createCategory = api.category.create.useMutation({
    onSuccess: () => utils.category.getAll.invalidate(),
  });

  const deleteCategory = api.category.delete.useMutation({
    onSuccess: () => utils.category.getAll.invalidate(),
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
      slug: `new-category-${Date.now()}`,
      type: "PRODUCT", // default type
    } as any);
  };

  const handleDeleteCategory = (id: string) => {
    deleteCategory.mutate({ id });
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "name", headerName: "Name", width: 200 },
    { field: "slug", headerName: "Slug", width: 200 },
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
          disabled={deleteCategory.isLoading}
        >
          {deleteCategory.isLoading ? "Deleting..." : "Delete"}
        </Button>
      ),
    },
  ];

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        Category Management (tRPC)
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
                  {smartCategories.map((category: any) => (
                    <Box
                      key={category.id}
                      display="flex"
                      justifyContent="space-between"
                      mb={1}
                    >
                      <Typography variant="body2">{category.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ({category.children?.length ?? 0})
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
                  disabled={createCategory.isLoading}
                >
                  {createCategory.isLoading ? "Creating..." : "Add Category"}
                </Button>
              </Box>

              <DataGrid
                rows={categories}
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
