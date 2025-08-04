
"use client";

import { Grid, TextField, Typography, InputAdornment, Tooltip, CircularProgress } from "@mui/material";
import { CheckCircle, XCircle } from "lucide-react";

interface BasicInformationSectionProps {
  values: {
    title: string;
    slug: string;
    description: string;
  };
  errors: any;
  touched: any;
  handleChange: (e: any) => void;
  handleBlur: (e: any) => void;
  isSlugChecking: boolean;
  isSlugAvailable: boolean | null;
}

export default function BasicInformationSection({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  isSlugChecking,
  isSlugAvailable,
}: BasicInformationSectionProps) {
  return (
    <>
      <Grid size={12}>
        <Typography variant="h6" gutterBottom>
          Basic Information
        </Typography>
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          name="title"
          label="Title"
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.title && Boolean(errors.title)}
          helperText={touched.title && errors.title}
          fullWidth
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6 }}>
        <TextField
          name="slug"
          label="Slug"
          value={values.slug}
          InputProps={{
            readOnly: true,
            endAdornment: (
              <InputAdornment position="end">
                {isSlugChecking ? (
                  <CircularProgress size={20} />
                ) : isSlugAvailable === true ? (
                  <Tooltip title="Slug is available">
                    <CheckCircle color="green" />
                  </Tooltip>
                ) : isSlugAvailable === false ? (
                  <Tooltip title="Slug is already taken">
                    <XCircle color="red" />
                  </Tooltip>
                ) : null}
              </InputAdornment>
            ),
          }}
          error={touched.slug && Boolean(errors.slug)}
          helperText={touched.slug && errors.slug}
          fullWidth
        />
      </Grid>

      <Grid size={12}>
        <TextField
          name="description"
          label="Description"
          value={values.description}
          onChange={handleChange}
          onBlur={handleBlur}
          multiline
          rows={4}
          error={touched.description && Boolean(errors.description)}
          helperText={touched.description && errors.description}
          fullWidth
        />
      </Grid>
    </>
  );
}
