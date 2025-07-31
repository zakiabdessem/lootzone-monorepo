import { api } from "@lootzone/trpc-shared";
import {
    Alert,
    Box,
    Card,
    CardContent,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Typography,
} from "@mui/material";

function TRPCDemo() {
  const {
    data: categories = [],
    isLoading: categoriesLoading,
    error: categoriesError,
  } = api.category.getAll.useQuery();

  const { data: products = [], isLoading: productsLoading } =
    api.product.getAll.useQuery();

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        tRPC Demo
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="success.main">
            ✅ Setup Complete!
          </Typography>
          <Typography variant="body1" paragraph>
            Your admin dashboard is now speaking to the T3 backend through tRPC.
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li>✅ tRPC shared package</li>
            <li>✅ React Query integration</li>
            <li>✅ End-to-end type safety</li>
          </Box>
          <Alert severity="success" sx={{ mt: 2 }}>
            <strong>Status:</strong> Connected to T3 app with tRPC!
          </Alert>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Categories from T3 App
          </Typography>
          {categoriesLoading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : categoriesError ? (
            <Alert severity="error">
              Error loading categories: {categoriesError.message}
            </Alert>
          ) : (
            <List>
              {categories.map((category: any) => (
                <ListItem key={category.id}>
                  <ListItemText primary={category.name} />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Products (sample 5)
          </Typography>
          {productsLoading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {products.slice(0, 5).map((product: any) => (
                <ListItem key={product.id}>
                  <ListItemText
                    primary={product.name}
                    secondary={`$${product.price}`}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default TRPCDemo;
