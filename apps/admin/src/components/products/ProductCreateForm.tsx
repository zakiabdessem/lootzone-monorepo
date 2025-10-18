"use client";

import styled from "@emotion/styled";
import { api } from "@lootzone/trpc-shared";
import {
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
  Divider as MuiDivider,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { spacing } from "@mui/system";
import { FieldArray, FormikProvider, useFormik } from "formik";
import { Plus } from "lucide-react";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import { Platform, ProductCategory, Region } from "../../../../trpc-app/src/constants/enums";
import BasicInformationSection from "./form-sections/BasicInformationSection";
import DeliveryStepsManager from "./form-sections/DeliveryStepsManager";
import ImportantNotesManager from "./form-sections/ImportantNotesManager";
import KeyFeaturesManager from "./form-sections/KeyFeaturesManager";
import MediaSection from "./form-sections/MediaSection";
import CategoryCheckboxSelector from "./form-sections/CategoryCheckboxSelector";
import VariantCard from "./form-sections/VariantCard";

const Divider = styled(MuiDivider)(spacing);

export const PlatformIcons = {
  [Platform.STEAM]: "/drms/steam.svg",
  [Platform.XBOX]: "/drms/xbox.svg",
  [Platform.ROCKSTAR]: "/drms/rockstar.svg",
  [Platform.PLAYSTATION]: "/drms/playstation.svg",
  [Platform.NINTENDO]: null,
  [Platform.DISCORD]: "/drms/discord.svg",
  [Platform.WINDOWS_STORE]: "/drms/windows-store.svg",
  [Platform.EPIC_GAMES]: "/drms/epic-games.svg",
  [Platform.WINDOWS]: "/drms/windows.svg",
  [Platform.GOOGLE_PLAY]: "/drms/google-play.svg",
  [Platform.APPLE]: "/drms/apple.svg",
  [Platform.NETFLIX]: "/drms/netflix.svg",
  [Platform.CURSOR]: "/drms/cursor.png",
  [Platform.JETBRAINS]: "/drms/jetbrains.svg",
  [Platform.SPOTIFY]: "/drms/spotify.svg",
  [Platform.CRUNCHYROLL]: "/drms/crunchyroll.png",
  [Platform.DUOLINGO]: "/drms/duolingo.jpg",
  [Platform.AUTODESK]: "/drms/autodesk.png",
};

const platforms = Object.values(Platform).map((platform) => ({
  name: platform,
  icon: PlatformIcons[platform]
    ? `${process.env.NEXT_PUBLIC_API_URL}${PlatformIcons[platform]}`
    : null,
}));

const regions = Object.values(Region);

function slugify(text: string) {
  if (!text) {
    return "";
  }
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

type ProductVariant = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  stock?: number;
  isInfiniteStock: boolean;
};

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters")
    .required("Title is required"),
  slug: Yup.string()
    .min(1, "Slug is required")
    .max(255, "Slug must be less than 255 characters")
    .required("Slug is required"),
  description: Yup.string()
    .min(10, "Description must be at least 10 characters")
    .max(10000, "Description must be less than 10000 characters")
    .required("Description is required"),
  image: Yup.string().url("Must be a valid URL").required("Image is required"),
  gallery: Yup.array().of(Yup.string().url("Must be valid URLs")).default([]),
  platformName: Yup.mixed()
    .oneOf([...Object.values(Platform)])
    .nullable(),
  platformIcon: Yup.string().nullable(),
  region: Yup.string()
    .oneOf(Object.values(Region), "Invalid region")
    .required("Region is required"),
  isActive: Yup.boolean().default(true),
  showInRecentlyViewed: Yup.boolean().default(false),
  showInRecommended: Yup.boolean().default(false),
  categoryIds: Yup.array()
    .of(Yup.string().min(1, "Category is required"))
    .min(1, "Select at least one category")
    .required("Category selection is required"),
  keyFeatures: Yup.array()
    .of(Yup.string().min(1, "Key feature cannot be empty"))
    .min(1, "At least one key feature is required")
    .required("Key features are required"),
  deliveryInfo: Yup.string()
    .min(5, "Delivery info must be at least 5 characters")
    .required("Delivery info is required"),
  deliverySteps: Yup.array()
    .of(Yup.string().min(1, "Delivery step cannot be empty"))
    .min(1, "At least one delivery step is required")
    .required("Delivery steps are required"),
  terms: Yup.string()
    .min(10, "Terms must be at least 10 characters")
    .required("Terms are required"),
  importantNotes: Yup.array()
    .of(Yup.string().min(1, "Note cannot be empty"))
    .min(1, "At least one important note is required")
    .required("Important notes are required"),
  variants: Yup.array()
    .of(
      Yup.object().shape({
        id: Yup.string().required("Variant ID is required"),
        name: Yup.string()
          .min(1, "Variant name is required")
          .max(255, "Variant name must be less than 255 characters")
          .required("Variant name is required"),
        price: Yup.number()
          .positive("Price must be positive")
          .required("Price is required"),
        originalPrice: Yup.number()
          .positive("Original price must be positive")
          .required("Original price is required"),
        stock: Yup.number()
          .min(0, "Stock cannot be negative")
          .when("isInfiniteStock", {
            is: false,
            then: (schema) =>
              schema.required("Stock is required when not infinite"),
            otherwise: (schema) => schema.notRequired(),
          }),
        isInfiniteStock: Yup.boolean().default(false),
      })
    )
    .min(1, "At least one variant is required")
    .required("Variants are required")
    .test(
      "variants-not-empty",
      "Please fill in all variant details before submitting",
      function (variants) {
        if (!variants || variants.length === 0) return false;

        return variants.every(
          (variant) =>
            variant &&
            variant.name &&
            variant.name.trim() !== "" &&
            variant.price > 0 &&
            variant.originalPrice > 0
        );
      }
    ),
});

interface ProductCreateFormProps {
  onSubmit: (values: any) => void;
  isLoading?: boolean;
  initialValues?: Partial<ProductFormValues>;
  isEditMode?: boolean;
}

interface ProductFormValues {
  title: string;
  slug: string;
  description: string;
  image: string;
  gallery: string[];
  platformName: Platform | null;
  platformIcon: string | null;
  region: Region;
  isActive: boolean;
  showInRecentlyViewed: boolean;
  showInRecommended: boolean;
  categoryIds: string[];
  keyFeatures: string[];
  deliveryInfo: string;
  deliverySteps: string[];
  terms: string;
  importantNotes: string[];
  variants: ProductVariant[];
}

export default function ProductCreateForm({
  onSubmit,
  isLoading = false,
  initialValues: providedInitialValues,
  isEditMode = false,
}: ProductCreateFormProps) {
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

  const defaultInitialValues: ProductFormValues = {
    title: "",
    slug: "",
    description: "",
    image: "",
    gallery: [] as string[],
    platformName: null as Platform | null,
    platformIcon: null as string | null,
    region: Region.GLOBAL,
    isActive: true,
    showInRecentlyViewed: false,
    showInRecommended: false,
    categoryIds: [],
    keyFeatures: [],
    deliveryInfo: "",
    deliverySteps: [],
    terms: "",
    importantNotes: [],
    variants: [] as ProductVariant[],
  };

  const formik = useFormik<ProductFormValues>({
    initialValues: providedInitialValues 
      ? { ...defaultInitialValues, ...providedInitialValues }
      : defaultInitialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { setSubmitting, setFieldError }) => {
      try {
        console.log("Form values before submission:", values);

        // Transform the data to match TRPC schema expectations
        const transformedValues = {
          ...values,
          // Handle platform fields - if no platform selected, don't include them
          ...(values.platformName
            ? {
                platformName: values.platformName,
                platformIcon: values.platformIcon || undefined,
              }
            : {}),
          // Map categoryIds to categories array expected by backend
          categories: values.categoryIds,
          // Ensure variants have the correct structure
          variants: values.variants.map((variant) => ({
            id: variant.id,
            name: variant.name,
            price: variant.price,
            originalPrice: variant.originalPrice,
            stock: variant.isInfiniteStock ? undefined : variant.stock,
            isInfiniteStock: variant.isInfiniteStock,
            region: values.region, // Use product region for variants
          })),
        };

        console.log("Transformed values for submission:", transformedValues);
        const { categoryIds: _omitCategoryIds, ...submitPayload } = transformedValues;
        await onSubmit(submitPayload);
      } catch (error) {
        console.error("Form submission error:", error);
        setSubmitting(false);
      }
    },
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } =
    formik;

  const {
    data: slugCheckData,
    isLoading: isSlugChecking,
    refetch: checkSlug,
  } = api.product.checkSlug.useQuery(
    { slug: values.slug },
    {
      enabled: false,
    }
  );

  // Debug: Track and log form errors
  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      console.log("Formik errors:", errors);
    }
  }, [errors]);

  useEffect(() => {
    if (slugCheckData !== undefined) {
      setIsSlugAvailable(slugCheckData);
    }
  }, [slugCheckData]);

  useEffect(() => {
    // Only auto-generate slug from title in create mode
    if (!isEditMode) {
      setFieldValue("slug", slugify(values.title));
    }
  }, [values.title, setFieldValue, isEditMode]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (values.slug) {
        checkSlug();
      } else {
        setIsSlugAvailable(null);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [values.slug, checkSlug]);

  const { data: categories, isLoading: categoriesLoading } = api.category.getAll.useQuery({
    type: ProductCategory.PRODUCT,
  });

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              {/* Basic Information */}
              <BasicInformationSection
                values={{
                  title: values.title,
                  slug: values.slug,
                  description: values.description,
                }}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                handleBlur={handleBlur}
                isSlugChecking={isSlugChecking}
                isSlugAvailable={isSlugAvailable}
              />

              {/* Media */}
              <Grid size={12}>
                <Divider my={3} />
              </Grid>
              <MediaSection
                values={{
                  image: values.image,
                  gallery: values.gallery,
                }}
                errors={errors}
                touched={touched}
                handleChange={handleChange}
                handleBlur={handleBlur}
                setFieldValue={setFieldValue}
              />

              {/* Platform & Region */}
              <Grid size={12}>
                <Divider my={3} />
                <Typography variant="h6" gutterBottom>
                  Platform & Region
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>Platform</InputLabel>
                  <Select
                    name="platformName"
                    value={values.platformName || ""}
                    onChange={(e) => {
                      const platformName = e.target.value as Platform;
                      const selectedPlatform = platforms.find(
                        (p) => p.name === platformName
                      );
                      setFieldValue("platformName", platformName);
                      setFieldValue(
                        "platformIcon",
                        selectedPlatform?.icon || null
                      );
                    }}
                    label="Platform"
                  >
                    <MenuItem value="">
                      <em>No Platform</em>
                    </MenuItem>
                    {platforms.map((p) => (
                      <MenuItem key={p.name} value={p.name}>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          {p.icon && (
                            <img
                              src={p.icon}
                              alt={p.name}
                              style={{
                                width: 24,
                                height: 24,
                                marginRight: 8,
                              }}
                            />
                          )}
                          {p.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl
                  fullWidth
                  error={touched.region && Boolean(errors.region)}
                >
                  <InputLabel>Region</InputLabel>
                  <Select
                    name="region"
                    value={values.region}
                    onChange={handleChange}
                    label="Region"
                  >
                    {regions.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.region && errors.region && (
                    <FormHelperText>{errors.region}</FormHelperText>
                  )}
                </FormControl>
              </Grid>

              <Grid size={12}>
                <CategoryCheckboxSelector
                  categories={categories ?? []}
                  selectedCategoryIds={values.categoryIds}
                  onChange={(newIds: string[]) => setFieldValue("categoryIds", newIds)}
                  error={touched.categoryIds && Boolean(errors.categoryIds)}
                  helperText={
                    touched.categoryIds && typeof errors.categoryIds === "string"
                      ? errors.categoryIds
                      : undefined
                  }
                  isLoading={categoriesLoading}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isActive"
                      checked={values.isActive}
                      onChange={handleChange}
                      color="primary"
                    />
                  }
                  label="Is Active"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      name="showInRecentlyViewed"
                      checked={values.showInRecentlyViewed}
                      onChange={handleChange}
                      color="secondary"
                    />
                  }
                  label="Show in Recently Viewed"
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      name="showInRecommended"
                      checked={values.showInRecommended}
                      onChange={handleChange}
                      color="info"
                    />
                  }
                  label="Show in Recommended"
                />
              </Grid>

              {/* Product Details */}
              <Grid size={12}>
                <Divider my={3} />
                <Typography variant="h6" gutterBottom>
                  Product Details
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <KeyFeaturesManager
                  keyFeatures={values.keyFeatures}
                  setFieldValue={setFieldValue}
                  error={errors.keyFeatures}
                  touched={touched.keyFeatures}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="deliveryInfo"
                  label="Delivery Info"
                  value={values.deliveryInfo}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.deliveryInfo && Boolean(errors.deliveryInfo)}
                  helperText={touched.deliveryInfo && errors.deliveryInfo}
                  fullWidth
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DeliveryStepsManager
                  deliverySteps={values.deliverySteps}
                  setFieldValue={setFieldValue}
                  error={errors.deliverySteps}
                  touched={touched.deliverySteps}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ImportantNotesManager
                  importantNotes={values.importantNotes}
                  setFieldValue={setFieldValue}
                  error={errors.importantNotes}
                  touched={touched.importantNotes}
                />
              </Grid>

              <Grid size={12}>
                <TextField
                  name="terms"
                  label="Terms"
                  value={values.terms}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  multiline
                  rows={4}
                  error={touched.terms && Boolean(errors.terms)}
                  helperText={touched.terms && errors.terms}
                  fullWidth
                />
              </Grid>

              {/* Product Variants */}
              <Grid size={12}>
                <Divider my={3} />
                <Typography variant="h6" gutterBottom>
                  Product Variants
                </Typography>
                <FieldArray
                  name="variants"
                  render={(arrayHelpers) => (
                    <div>
                      {values.variants.map((variant, index) => (
                        <VariantCard
                          key={variant.id}
                          variant={variant}
                          index={index}
                          handleChange={handleChange}
                          onRemove={() => arrayHelpers.remove(index)}
                        />
                      ))}
                      <Button
                        variant="outlined"
                        sx={{ mt: 2 }}
                        onClick={() =>
                          arrayHelpers.push({
                            id: `variant-${Date.now()}-${Math.random()
                              .toString(36)
                              .substr(2, 9)}`,
                            name: "",
                            price: 0,
                            originalPrice: 0,
                            stock: 0,
                            isInfiniteStock: false,
                          })
                        }
                        startIcon={<Plus size={16} />}
                      >
                        Add Variant
                      </Button>
                      {touched.variants &&
                        errors.variants &&
                        typeof errors.variants === "string" && (
                          <FormHelperText error sx={{ mt: 1 }}>
                            {errors.variants}
                          </FormHelperText>
                        )}
                    </div>
                  )}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Box mt={3}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            size="large"
          >
            {isLoading ? "Creating..." : "Create Product"}
          </Button>
        </Box>
      </form>
    </FormikProvider>
  );
}
