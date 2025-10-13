"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@lootzone/trpc-shared";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Save } from "lucide-react";

const validationSchema = z.object({
  siteName: z.string().min(1, "Site name is required"),
  currency: z.string().min(1, "Currency is required"),
  siteAnnouncementHtml: z.string().min(1, "Site announcement is required"),
  siteSubAnnouncement: z.string().min(1, "Sub announcement is required"),
  supportEmail: z.string().email("Invalid email").min(1, "Support email is required"),
  whatsappNumber: z.string().min(1, "WhatsApp number is required"),
  whatsappLink: z.string().url("Invalid URL").min(1, "WhatsApp link is required"),
  telegramLink: z.string().url("Invalid URL").min(1, "Telegram link is required"),
  primaryColor: z.string().min(1, "Primary color is required"),
  accentColor: z.string().min(1, "Accent color is required"),
  isMaintenanceMode: z.boolean(),
  isRegistrationEnabled: z.boolean(),
  isEmailVerificationRequired: z.boolean(),
});

type SiteSettingsFormData = z.infer<typeof validationSchema>;

export default function SiteSettingsPage() {
  const {
    data: settings,
    isLoading,
    refetch,
  } = api.siteSettings.get.useQuery();

  const form = useForm<SiteSettingsFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      siteName: "",
      currency: "USD",
      siteAnnouncementHtml: "",
      siteSubAnnouncement: "",
      supportEmail: "",
      whatsappNumber: "",
      whatsappLink: "",
      telegramLink: "",
      primaryColor: "#000000",
      accentColor: "#ffffff",
      isMaintenanceMode: false,
      isRegistrationEnabled: true,
      isEmailVerificationRequired: false,
    },
  });

  const updateSettings = api.siteSettings.update.useMutation({
    onSuccess: () => {
      toast.success("Settings updated successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  // Update form when settings are loaded
  React.useEffect(() => {
    if (settings) {
      form.reset({
        siteName: settings.siteName || "",
        currency: settings.currency || "USD",
        siteAnnouncementHtml: settings.siteAnnouncementHtml || "",
        siteSubAnnouncement: settings.siteSubAnnouncement || "",
        supportEmail: settings.supportEmail || "",
        whatsappNumber: settings.whatsappNumber || "",
        whatsappLink: settings.whatsappLink || "",
        telegramLink: settings.telegramLink || "",
        primaryColor: settings.primaryColor || "#000000",
        accentColor: settings.accentColor || "#ffffff",
        isMaintenanceMode: settings.isMaintenanceMode || false,
        isRegistrationEnabled: settings.isRegistrationEnabled ?? true,
        isEmailVerificationRequired: settings.isEmailVerificationRequired || false,
      });
    }
  }, [settings, form]);

  const onSubmit = (values: SiteSettingsFormData) => {
    updateSettings.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Loading settings...</div>
      </div>
    );
  }

  if (!settings) {
    return (
      <Alert>
        <AlertDescription>Failed to load site settings</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Site Settings</h1>
          <p className="text-muted-foreground">
            Configure your site's appearance, contact information, and features
          </p>
        </div>
        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={updateSettings.isPending}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          Save Settings
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="My Website" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="siteAnnouncementHtml"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Site Announcement (HTML)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="<h1>Welcome to our site!</h1>" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="siteSubAnnouncement"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sub Announcement</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Additional information" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="supportEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Support Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} placeholder="support@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Number</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="+1234567890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="whatsappLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Link</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://wa.me/1234567890" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="telegramLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telegram Link</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://t.me/yourchannel" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="accentColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accent Color</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Features */}
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="isMaintenanceMode"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Maintenance Mode</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Enable maintenance mode to restrict site access
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isRegistrationEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Registration</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Allow new users to register accounts
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isEmailVerificationRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Email Verification Required</FormLabel>
                      <div className="text-sm text-muted-foreground">
                        Require email verification for new accounts
                      </div>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
