"use client";

import styled from "@emotion/styled";
import { api } from "@lootzone/trpc-shared";
import {
  Box,
  Button,
  Card,
  CardContent,
  Divider as MuiDivider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputLabel,
  MenuItem,
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
import {
  Platform,
  Region,
} from "../../../../trpc-app/src/constants/enums";
import BasicInformationSection from "./form-sections/BasicInformationSection";
import MediaSection from "./form-sections/MediaSection";
import KeyFeaturesManager from "./form-sections/KeyFeaturesManager";
import ImportantNotesManager from "./form-sections/ImportantNotesManager";
import DeliveryStepsManager from "./form-sections/DeliveryStepsManager";
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
    ? `${process.env.NEXT_PUBLIC_APP_URL}${PlatformIcons[platform]}`
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
  title: Yup.string().max(255).required("Title is required"),
  slug: Yup.string().max(255).required("Slug is required"),
  description: Yup.string().max(10000).required("Description is required"),
  image: Yup.string().url("Must be a valid URL").required("Image is required"),
  gallery: Yup.array().of(Yup.string().url("Must be valid URLs")),
  platformName: Yup.string().nullable(),
  platformIcon: Yup.string().nullable(),
  region: Yup.string().oneOf(Object.values(Region)).required("Region is required"),
  isActive: Yup.boolean(),
  categoryId: Yup.string().required("Category is required"),
  keyFeatures: Yup.array().min(1, "At least one key feature is required"),
  deliveryInfo: Yup.string(),
  deliverySteps: Yup.array().of(Yup.string()),
  terms: Yup.string(),
  importantNotes: Yup.array().of(Yup.string()),
  variants: Yup.array().of(
    Yup.object().shape({
      name: Yup.string().max(255).required("Variant name is required"),
      price: Yup.number().min(1).required("Price is required"),
      originalPrice: Yup.number().min(1).required("Original price is required"),
      stock: Yup.number().min(0),
      isInfiniteStock: Yup.boolean(),
    })
  ).min(1, "At least one variant is required"),
});

interface ProductCreateFormProps {
  onSubmit: (values: any) => void;
  isLoading?: boolean;
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
  categoryId: string;
  keyFeatures: string[];
  deliveryInfo: string;
  deliverySteps: string[];
  terms: string;
  importantNotes: string[];
  variants: ProductVariant[];
}

export default function ProductCreateForm({ onSubmit, isLoading = false }: ProductCreateFormProps) {
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

  const formik = useFormik<ProductFormValues>({
    initialValues: {
      title: "",
      slug: "",
      description: "",
      image: "",
      gallery: [] as string[],
      platformName: null as Platform | null,
      platformIcon: null as string | null,
      region: Region.GLOBAL,
      isActive: true,
      categoryId: "",
      keyFeatures: [],
      deliveryInfo: "",
      deliverySteps: [],
      terms: "",
      importantNotes: [],
      variants: [] as ProductVariant[],
    },
    validationSchema,
    onSubmit: async (values) => {
      // No transformation needed since we're already using arrays
      onSubmit(values);
    },
  });

  const { values, errors, touched, handleChange, handleBlur, setFieldValue } = formik;

  const {
    data: slugCheckData,
    isLoading: isSlugChecking,
    refetch: checkSlug,
  } = api.product.checkSlug.useQuery(
    { slug: values.slug },
    {
      enabled: false,
    },
  );

  useEffect(() => {
    if (slugCheckData !== undefined) {
      setIsSlugAvailable(slugCheckData);
    }
  }, [slugCheckData]);

  useEffect(() => {
    setFieldValue("slug", slugify(values.title));
  }, [values.title, setFieldValue]);

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

  const { data: categories } = api.category.getProduct.useQuery();

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
                      const selectedPlatform = platforms.find((p) => p.name === platformName);
                      setFieldValue("platformName", platformName);
                      setFieldValue("platformIcon", selectedPlatform?.icon || null);
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
                <FormControl fullWidth error={touched.region && Boolean(errors.region)}>
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
                  {touched.region && errors.region && <FormHelperText>{errors.region}</FormHelperText>}
                </FormControl>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth error={touched.categoryId && Boolean(errors.categoryId)}>
                  <InputLabel>Category</InputLabel>
                  <Select
                    name="categoryId"
                    value={values.categoryId}
                    onChange={handleChange}
                    label="Category"
                  >
                    {categories?.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {touched.categoryId && errors.categoryId && <FormHelperText>{errors.categoryId}</FormHelperText>}
                </FormControl>
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
                            id: `${Date.now()}`,
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