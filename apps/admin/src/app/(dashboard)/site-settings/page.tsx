"use client";

import { api } from "@lootzone/trpc-shared";
import { Add, Delete, Edit, Save } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { Grid } from "@mui/system";
import { Form, Formik } from "formik";
import { useState } from "react";
import * as Yup from "yup";

const validationSchema = Yup.object({
  siteName: Yup.string().required("Site name is required"),
  currency: Yup.string().required("Currency is required"),
  siteAnnouncementHtml: Yup.string().required("Site announcement is required"),
  siteSubAnnouncement: Yup.string().required("Sub announcement is required"),
  supportEmail: Yup.string()
    .email("Invalid email")
    .required("Support email is required"),
  whatsappNumber: Yup.string().required("WhatsApp number is required"),
  whatsappLink: Yup.string()
    .url("Invalid URL")
    .required("WhatsApp link is required"),
  telegramLink: Yup.string()
    .url("Invalid URL")
    .required("Telegram link is required"),
  primaryColor: Yup.string().required("Primary color is required"),
  accentColor: Yup.string().required("Accent color is required"),
});

export default function SiteSettingsPage() {
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    data: settings,
    isLoading,
    refetch,
  } = api.siteSettings.get.useQuery();
  const updateSettings = api.siteSettings.update.useMutation({
    onSuccess: () => {
      setAlert({ type: "success", message: "Settings updated successfully!" });
      refetch();
      setTimeout(() => setAlert(null), 3000);
    },
    onError: (error) => {
      setAlert({ type: "error", message: error.message });
      setTimeout(() => setAlert(null), 5000);
    },
  });

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={400}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!settings) {
    return <Typography color="error">Failed to load site settings</Typography>;
  }

  const initialValues = {
    siteName: settings.siteName,
    currency: settings.currency,
    siteAnnouncementHtml: settings.siteAnnouncementHtml,
    siteSubAnnouncement: settings.siteSubAnnouncement,
    supportEmail: settings.supportEmail,
    whatsappNumber: settings.whatsappNumber,
    whatsappLink: settings.whatsappLink,
    telegramLink: settings.telegramLink,
    primaryColor: settings.primaryColor,
    accentColor: settings.accentColor,
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Site Settings
      </Typography>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 3 }}>
          {alert.message}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={(values, { setSubmitting }) => {
              updateSettings.mutate(values, {
                onSettled: () => setSubmitting(false),
              });
            }}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              isSubmitting,
            }) => (
              <Form>
                <Grid container spacing={3}>
                  <Grid size={12}>
                    <Typography variant="h6" gutterBottom>
                      Basic Information
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      name="siteName"
                      label="Site Name"
                      value={values.siteName}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.siteName && Boolean(errors.siteName)}
                      helperText={touched.siteName && errors.siteName}
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      name="currency"
                      label="Currency"
                      value={values.currency}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.currency && Boolean(errors.currency)}
                      helperText={touched.currency && errors.currency}
                      fullWidth
                    />
                  </Grid>

                  <Grid size={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Announcements
                    </Typography>
                  </Grid>

                  <Grid size={12}>
                    <TextField
                      name="siteAnnouncementHtml"
                      label="Site Announcement HTML"
                      value={values.siteAnnouncementHtml}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.siteAnnouncementHtml &&
                        Boolean(errors.siteAnnouncementHtml)
                      }
                      helperText={
                        touched.siteAnnouncementHtml &&
                        errors.siteAnnouncementHtml
                      }
                      fullWidth
                      multiline
                      rows={3}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      name="siteSubAnnouncement"
                      label="Sub Announcement"
                      value={values.siteSubAnnouncement}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.siteSubAnnouncement &&
                        Boolean(errors.siteSubAnnouncement)
                      }
                      helperText={
                        touched.siteSubAnnouncement &&
                        errors.siteSubAnnouncement
                      }
                      fullWidth
                    />
                  </Grid>

                  <Grid size={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Contact Information
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      name="supportEmail"
                      label="Support Email"
                      type="email"
                      value={values.supportEmail}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.supportEmail && Boolean(errors.supportEmail)
                      }
                      helperText={touched.supportEmail && errors.supportEmail}
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      name="whatsappNumber"
                      label="WhatsApp Number"
                      value={values.whatsappNumber}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.whatsappNumber && Boolean(errors.whatsappNumber)
                      }
                      helperText={
                        touched.whatsappNumber && errors.whatsappNumber
                      }
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      name="whatsappLink"
                      label="WhatsApp Link"
                      type="url"
                      value={values.whatsappLink}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.whatsappLink && Boolean(errors.whatsappLink)
                      }
                      helperText={touched.whatsappLink && errors.whatsappLink}
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      name="telegramLink"
                      label="Telegram Link"
                      type="url"
                      value={values.telegramLink}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.telegramLink && Boolean(errors.telegramLink)
                      }
                      helperText={touched.telegramLink && errors.telegramLink}
                      fullWidth
                    />
                  </Grid>

                  <Grid size={12}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      Theme Colors
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      name="primaryColor"
                      label="Primary Color"
                      type="color"
                      value={values.primaryColor}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={
                        touched.primaryColor && Boolean(errors.primaryColor)
                      }
                      helperText={touched.primaryColor && errors.primaryColor}
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }}>
                    <TextField
                      name="accentColor"
                      label="Accent Color"
                      type="color"
                      value={values.accentColor}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.accentColor && Boolean(errors.accentColor)}
                      helperText={touched.accentColor && errors.accentColor}
                      fullWidth
                    />
                  </Grid>

                  <Grid size={12}>
                    <Box display="flex" justifyContent="flex-end" mt={3}>
                      <Button
                        type="submit"
                        variant="contained"
                        startIcon={<Save />}
                        disabled={isSubmitting || updateSettings.isPending}
                      >
                        {isSubmitting || updateSettings.isPending
                          ? "Saving..."
                          : "Save Settings"}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>

      <HeroSlideManagement />
    </Box>
  );
}

function HeroSlideManagement() {
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [alert, setAlert] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    data: heroSlides,
    isLoading,
    refetch,
  } = api.heroSlide.getAllForAdmin.useQuery();
  const { data: products } = api.product.list.useQuery({ limit: 100 });

  const createHeroSlide = api.heroSlide.create.useMutation({
    onSuccess: () => {
      setAlert({
        type: "success",
        message: "Hero slide created successfully!",
      });
      refetch();
      setShowForm(false);
      setTimeout(() => setAlert(null), 3000);
    },
    onError: (error) => {
      setAlert({ type: "error", message: error.message });
      setTimeout(() => setAlert(null), 5000);
    },
  });

  const updateHeroSlide = api.heroSlide.update.useMutation({
    onSuccess: () => {
      setAlert({
        type: "success",
        message: "Hero slide updated successfully!",
      });
      refetch();
      setEditingSlide(null);
      setTimeout(() => setAlert(null), 3000);
    },
    onError: (error) => {
      setAlert({ type: "error", message: error.message });
      setTimeout(() => setAlert(null), 5000);
    },
  });

  const deleteHeroSlide = api.heroSlide.delete.useMutation({
    onSuccess: () => {
      setAlert({
        type: "success",
        message: "Hero slide deleted successfully!",
      });
      refetch();
      setTimeout(() => setAlert(null), 3000);
    },
    onError: (error) => {
      setAlert({ type: "error", message: error.message });
      setTimeout(() => setAlert(null), 5000);
    },
  });

  const heroSlideValidation = Yup.object({
    label: Yup.string()
      .required("Label is required")
      .max(100, "Label must be less than 100 characters"),
    productId: Yup.string().required("Product is required"),
    displayOrder: Yup.number().required("Display order is required").min(0),
    isActive: Yup.boolean(),
  });

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight={200}
        mt={4}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box mt={4}>
      <Card>
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography variant="h5" gutterBottom>
              Hero Slide Management
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setShowForm(true)}
              disabled={showForm || editingSlide}
            >
              Add Hero Slide
            </Button>
          </Box>

          {alert && (
            <Alert severity={alert.type} sx={{ mb: 3 }}>
              {alert.message}
            </Alert>
          )}

          {(showForm || editingSlide) && (
            <Box mb={4} p={3} border="1px solid #e0e0e0" borderRadius={1}>
              <Typography variant="h6" gutterBottom>
                {editingSlide ? "Edit Hero Slide" : "Create New Hero Slide"}
              </Typography>

              <Formik
                initialValues={{
                  label: editingSlide?.label || "",
                  productId: editingSlide?.productId || "",
                  displayOrder:
                    editingSlide?.displayOrder || heroSlides?.length || 0,
                  isActive: editingSlide?.isActive ?? true,
                }}
                validationSchema={heroSlideValidation}
                onSubmit={(values, { setSubmitting }) => {
                  if (editingSlide) {
                    updateHeroSlide.mutate(
                      { ...values, id: editingSlide.id },
                      {
                        onSettled: () => setSubmitting(false),
                      }
                    );
                  } else {
                    createHeroSlide.mutate(values, {
                      onSettled: () => setSubmitting(false),
                    });
                  }
                }}
              >
                {({
                  values,
                  errors,
                  touched,
                  handleChange,
                  handleBlur,
                  isSubmitting,
                }) => (
                  <Form>
                    <Grid container spacing={3}>
                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          name="label"
                          label="Hero Text"
                          placeholder="PACK\nDESIGNER"
                          value={values.label}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={touched.label && Boolean(errors.label)}
                          helperText={
                            (touched.label && errors.label) ||
                            "Type \\n (backslash-n) where you want line breaks. Example: PACK\\nDESIGNER will show on two lines."
                          }
                          fullWidth
                          multiline
                          rows={3}
                        />
                        {values.label && (
                          <Box mt={1} p={2} bgcolor="grey.100" borderRadius={1}>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                              Preview:
                            </Typography>
                            {values.label
                              .replace(/\\n/g, '\n')
                              .split('\n')
                              .map((line, i) => (
                                <Typography key={i} variant="h6" fontWeight="bold">
                                  {line}
                                </Typography>
                              ))}
                          </Box>
                        )}
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <FormControl
                          fullWidth
                          error={touched.productId && Boolean(errors.productId)}
                        >
                          <InputLabel>Product</InputLabel>
                          <Select
                            name="productId"
                            value={values.productId}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            label="Product"
                          >
                            {products?.items?.map((product) => (
                              <MenuItem key={product.id} value={product.id}>
                                {product.title}
                              </MenuItem>
                            ))}
                          </Select>
                          {touched.productId && errors.productId && (
                            <Typography
                              variant="caption"
                              color="error"
                              sx={{ mt: 1, ml: 2 }}
                            >
                              {errors.productId}
                            </Typography>
                          )}
                        </FormControl>
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <TextField
                          name="displayOrder"
                          label="Display Order"
                          type="number"
                          value={values.displayOrder}
                          onChange={handleChange}
                          onBlur={handleBlur}
                          error={
                            touched.displayOrder && Boolean(errors.displayOrder)
                          }
                          helperText={
                            touched.displayOrder && errors.displayOrder
                          }
                          fullWidth
                        />
                      </Grid>

                      <Grid size={{ xs: 12, md: 6 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              name="isActive"
                              checked={values.isActive}
                              onChange={handleChange}
                            />
                          }
                          label="Active"
                        />
                      </Grid>

                      <Grid size={12}>
                        <Box display="flex" gap={2} justifyContent="flex-end">
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setShowForm(false);
                              setEditingSlide(null);
                            }}
                          >
                            Cancel
                          </Button>
                          <Button
                            type="submit"
                            variant="contained"
                            disabled={isSubmitting}
                          >
                            {isSubmitting
                              ? "Saving..."
                              : editingSlide
                              ? "Update"
                              : "Create"}
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </Form>
                )}
              </Formik>
            </Box>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Order</TableCell>
                  <TableCell>Label</TableCell>
                  <TableCell>Product</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {heroSlides?.map((slide) => (
                  <TableRow key={slide.id}>
                    <TableCell>{slide.displayOrder}</TableCell>
                    <TableCell>
                      <Box>
                        {slide.label
                          .replace(/\\n/g, '\n')
                          .split('\n')
                          .map((line, i) => (
                            <div key={i}>{line}</div>
                          ))}
                      </Box>
                    </TableCell>
                    <TableCell>{slide.product.title}</TableCell>
                    <TableCell>
                      <Typography
                        color={
                          slide.isActive ? "success.main" : "text.secondary"
                        }
                      >
                        {slide.isActive ? "Active" : "Inactive"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        onClick={() => setEditingSlide(slide)}
                        disabled={showForm || editingSlide}
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        onClick={() => deleteHeroSlide.mutate({ id: slide.id })}
                        color="error"
                        disabled={deleteHeroSlide.isPending}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {(!heroSlides || heroSlides.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography color="text.secondary">
                        No hero slides configured. Click "Add Hero Slide" to get
                        started.
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
}
