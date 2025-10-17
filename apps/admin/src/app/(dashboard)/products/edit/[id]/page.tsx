"use client";

import styled from "@emotion/styled";
import {
  Alert,
  Box,
  CircularProgress,
  Link,
  Breadcrumbs as MuiBreadcrumbs,
  Divider as MuiDivider,
  Typography,
} from "@mui/material";
import { spacing } from "@mui/system";
import NextLink from "next/link";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import ProductCreateForm from "../../../../../components/products/ProductCreateForm";
import { api } from "@lootzone/trpc-shared";

const Divider = styled(MuiDivider)(spacing);
const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);

function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  // Fetch the product data
  const {
    data: product,
    isLoading,
    error,
  } = api.product.adminGetById.useQuery(
    { id: productId },
    {
      enabled: !!productId,
    }
  );

  const updateProduct = api.product.update.useMutation({
    onSuccess: () => {
      router.push("/products");
    },
    onError: (error: any) => {
      console.error("Product update failed:", error);
    },
  });

  const handleSubmit = async (values: any) => {
    console.log("Form submitted", values);
    try {
      await updateProduct.mutateAsync({
        id: productId,
        ...values,
      });
    } catch (error) {
      console.error("Failed to update product:", error);
    }
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading product: {error.message}
      </Alert>
    );
  }

  if (!product) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Product not found
      </Alert>
    );
  }

  // Transform product data to match form format
  const initialValues = {
    title: product.title,
    description: product.description,
    slug: product.slug,
    image: product.image,
    gallery: product.gallery || [],
    platformIcon: product.platformIcon || null,
    platformName: product.platformName || null,
    region: product.region,
    categoryId: product.categoryId, // Use categoryId for the form
    keyFeatures: product.keyFeatures || [],
    deliveryInfo: product.deliveryInfo || "",
    deliverySteps: product.deliverySteps || [],
    terms: product.terms || "",
    importantNotes: product.importantNotes || [],
    isActive: product.isActive ?? true,
    showInRecentlyViewed: product.showInRecentlyViewed ?? false,
    showInRecommended: product.showInRecommended ?? false,
    variants: product.variants?.map((variant: any) => ({
      id: variant.id,
      name: variant.name,
      price: variant.price,
      originalPrice: variant.originalPrice,
      stock: variant.stock || 0,
      isInfiniteStock: variant.isInfiniteStock || false,
    })) || [],
  };

  console.log("Product data:", product);
  console.log("Initial values for form:", initialValues);

  return (
    <React.Fragment>
      <Typography variant="h3" gutterBottom display="inline">
        Edit Product
      </Typography>

      <Breadcrumbs aria-label="Breadcrumb" mt={2}>
        <Link component={NextLink} href="/">
          Dashboard
        </Link>
        <Link component={NextLink} href="/products">
          Products
        </Link>
        <Typography>Edit</Typography>
      </Breadcrumbs>

      <Divider my={6} />

      <ProductCreateForm
        onSubmit={handleSubmit}
        isLoading={updateProduct.isPending}
        initialValues={initialValues}
        isEditMode={true}
      />
    </React.Fragment>
  );
}

export default EditProductPage;