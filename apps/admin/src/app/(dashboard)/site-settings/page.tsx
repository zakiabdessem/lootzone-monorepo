
"use client";

import { 
  Box, 
  Button, 
  Card, 
  CardContent, 
  Grid2 as Grid, 
  TextField, 
  Typography, 
  Alert,
  CircularProgress 
} from "@mui/material";
import { Formik, Form } from "formik";
import { Save } from "@mui/icons-material";
import * as Yup from "yup";
import { api } from "~/utils/trpc";
import { useState } from "react";

const validationSchema = Yup.object({
  siteName: Yup.string().required("Site name is required"),
  currency: Yup.string().required("Currency is required"),
  siteAnnouncementHtml: Yup.string().required("Site announcement is required"),
  siteSubAnnouncement: Yup.string().required("Sub announcement is required"),
  supportEmail: Yup.string().email("Invalid email").required("Support email is required"),
  whatsappNumber: Yup.string().required("WhatsApp number is required"),
  whatsappLink: Yup.string().url("Invalid URL").required("WhatsApp link is required"),
  telegramLink: Yup.string().url("Invalid URL").required("Telegram link is required"),
  primaryColor: Yup.string().required("Primary color is required"),
  accentColor: Yup.string().required("Accent color is required"),
});

export default function SiteSettingsPage() {
  const [alert, setAlert] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  
  const { data: settings, isLoading, refetch } = api.siteSettings.get.useQuery();
  const updateSettings = api.siteSettings.update.useMutation({
    onSuccess: () => {
      setAlert({ type: 'success', message: 'Settings updated successfully!' });
      refetch();
      setTimeout(() => setAlert(null), 3000);
    },
    onError: (error) => {
      setAlert({ type: 'error', message: error.message });
      setTimeout(() => setAlert(null), 5000);
    },
  });

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (!settings) {
    return (
      <Typography color="error">Failed to load site settings</Typography>
    );
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
            {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
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
                      error={touched.siteAnnouncementHtml && Boolean(errors.siteAnnouncementHtml)}
                      helperText={touched.siteAnnouncementHtml && errors.siteAnnouncementHtml}
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
                      error={touched.siteSubAnnouncement && Boolean(errors.siteSubAnnouncement)}
                      helperText={touched.siteSubAnnouncement && errors.siteSubAnnouncement}
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
                      error={touched.supportEmail && Boolean(errors.supportEmail)}
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
                      error={touched.whatsappNumber && Boolean(errors.whatsappNumber)}
                      helperText={touched.whatsappNumber && errors.whatsappNumber}
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
                      error={touched.whatsappLink && Boolean(errors.whatsappLink)}
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
                      error={touched.telegramLink && Boolean(errors.telegramLink)}
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
                      error={touched.primaryColor && Boolean(errors.primaryColor)}
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
                        {isSubmitting || updateSettings.isPending ? 'Saving...' : 'Save Settings'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </CardContent>
      </Card>
    </Box>
  );
}
