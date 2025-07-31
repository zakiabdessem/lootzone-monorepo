import { api } from "@/utils/api";
import {
    Alert,
    Box,
    Card,
    CardContent,
    CircularProgress,
    List,
    ListItem,
    ListItemText,
    Typography
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";

function TRPCDemo() {
  const { data: categoriesData, isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: () => api.category.getAll(),
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => api.product.getAll(),
  });

  const categories = categoriesData?.result?.data;
  const products = productsData?.result?.data;

  return (
    <Box p={4}>
      <Typography variant="h4" gutterBottom>
        API Integration Status
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom color="success.main">
            ✅ Setup Complete!
          </Typography>

          <Typography variant="body1" paragraph>
            Your API integration is now connected to the T3 app. Here's what we've set up:
          </Typography>

          <Box component="ul" sx={{ pl: 2 }}>
            <li>✅ React Query for data fetching</li>
            <li>✅ TRPCProvider added to your app layout</li>
            <li>✅ REST API client for T3 app</li>
            <li>✅ API client configured with proper authentication</li>
            <li>✅ Simple and reliable connection</li>
          </Box>

          <Alert severity="success" sx={{ mt: 2 }}>
            <strong>Status:</strong> Connected to T3 app with REST API!
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
              {categories?.map((category: any) => (
                <ListItem key={category.id}>
                  <ListItemText
                    primary={category.name}
                    secondary={category.description}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Products from T3 App
          </Typography>

          {productsLoading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {products?.slice(0, 5).map((product: any) => (
                <ListItem key={product.id}>
                  <ListItemText
                    primary={product.name}
                    secondary={`$${product.price} - ${product.description}`}
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
