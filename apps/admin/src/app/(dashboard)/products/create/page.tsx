"use client";

import styled from "@emotion/styled";
import {
  Link,
  Breadcrumbs as MuiBreadcrumbs,
  Divider as MuiDivider,
  Typography,
} from "@mui/material";
import { spacing } from "@mui/system";
import NextLink from "next/link";
import React from "react";
import ProductCreateForm from "../../../../components/products/ProductCreateForm";

const Divider = styled(MuiDivider)(spacing);
const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);

function CreateProductPage() {
  const handleSubmit = async (values: any) => {
    console.log("Form submitted", values);
    // Here you would call your mutation to create the product
    // For example:
    // await createProduct.mutateAsync(values);
  };

  return (
    <React.Fragment>
      <Typography variant="h3" gutterBottom display="inline">
        Create Product
      </Typography>

      <Breadcrumbs aria-label="Breadcrumb" mt={2}>
        <Link component={NextLink} href="/">
          Dashboard
        </Link>
        <Link component={NextLink} href="/products">
          Products
        </Link>
        <Typography>Create</Typography>
      </Breadcrumbs>

      <Divider my={6} />

      <ProductCreateForm onSubmit={handleSubmit} />
    </React.Fragment>
  );
}

export default CreateProductPage;
