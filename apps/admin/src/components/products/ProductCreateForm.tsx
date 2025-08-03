"use client";

import styled from "@emotion/styled";
import { api } from "@lootzone/trpc-shared";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { spacing } from "@mui/system";
import { FieldArray, FormikProvider, useFormik } from "formik";
import { CheckCircle, Plus, Trash2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import * as Yup from "yup";
import {
  Platform,
  Region,
} from "../../../../trpc-app/src/constants/enums";

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

// Helper function to convert comma-separated string to array
const stringToArray = (str: string): string[] => {
  return str.split(",").map(item => item.trim()).filter(item => item.length > 0);
};

// Helper function to convert array to comma-separated string
const arrayToString = (arr: string[]): string => {
  return arr.join(", ");
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
  deliveryStepsString: Yup.string(),
  terms: Yup.string(),
  importantNotesString: Yup.string(),
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
  deliveryStepsString: string;
  terms: string;
  importantNotesString: string;
  variants: ProductVariant[];
}

export default function ProductCreateForm({ onSubmit, isLoading = false }: ProductCreateFormProps) {
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState<string>("");

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
      deliveryStepsString: "",
      terms: "",
      importantNotesString: "",
      variants: [] as ProductVariant[],
    },
    validationSchema,
    onSubmit: async (values) => {
      // Transform the form values to match Prisma schema
      const transformedValues = {
        ...values,
        deliverySteps: stringToArray(values.deliveryStepsString),
        importantNotes: stringToArray(values.importantNotesString),
      };
      onSubmit(transformedValues);
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

  // Handle gallery image input
  const [galleryInput, setGalleryInput] = useState("");

  const addGalleryImage = () => {
    if (galleryInput.trim()) {
      setFieldValue("gallery", [...values.gallery, galleryInput.trim()]);
      setGalleryInput("");
    }
  };

  const removeGalleryImage = (index: number) => {
    const newGallery = values.gallery.filter((_, i) => i !== index);
    setFieldValue("gallery", newGallery);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter((t) => t !== tag)
      : [...selectedTags, tag];

    setSelectedTags(newTags);
    formik.setFieldValue("tags", newTags);
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      const updatedFeatures = [...formik.values.keyFeatures, newFeature.trim()];
      formik.setFieldValue("keyFeatures", updatedFeatures);
      setNewFeature("");
    }
  };

  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = formik.values.keyFeatures.filter((_, i) => i !== index);
    formik.setFieldValue("keyFeatures", updatedFeatures);
  };

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit}>
        <Card>
          <CardContent>
            <Grid container spacing={3}>
              {/* Basic Information */}
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

              {/* Media */}
              <Grid size={12}>
                <Divider my={3} />
                <Typography variant="h6" gutterBottom>
                  Media
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="image"
                  label="Main Image URL"
                  value={values.image}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.image && Boolean(errors.image)}
                  helperText={touched.image && errors.image}
                  fullWidth
                />
              </Grid>

              <Grid size={12}>
                <Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Gallery Images
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                    <TextField
                      label="Image URL"
                      value={galleryInput}
                      onChange={(e) => setGalleryInput(e.target.value)}
                      size="small"
                      sx={{ flexGrow: 1 }}
                    />
                    <Button
                      variant="outlined"
                      onClick={addGalleryImage}
                      startIcon={<Plus size={16} />}
                    >
                      Add
                    </Button>
                  </Box>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {values.gallery.map((imageUrl, index) => (
                      <Chip
                        key={index}
                        label={`Image ${index + 1}`}
                        onDelete={() => removeGalleryImage(index)}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                </Box>
              </Grid>

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
                <Box sx={{ mt: 2, mb: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Key Features
                  </Typography>
                  <TextField
                    fullWidth
                    id="newFeature"
                    label="Add new feature"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddFeature();
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <IconButton onClick={handleAddFeature} disabled={!newFeature.trim()}>
                          <Add />
                        </IconButton>
                      ),
                    }}
                  />
                  {formik.values.keyFeatures.length > 0 && (
                    <Paper sx={{ mt: 2, maxHeight: 200, overflow: 'auto' }}>
                      <List>
                        {formik.values.keyFeatures.map((feature, index) => (
                          <ListItem key={index} divider>
                            <ListItemText primary={feature} />
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                onClick={() => handleRemoveFeature(index)}
                                size="small"
                              >
                                <Delete />
                              </IconButton>
                            </ListItemSecondaryAction>
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}
                  {touched.keyFeatures && errors.keyFeatures && (
                    <FormHelperText error={true}>{errors.keyFeatures}</FormHelperText>
                  )}
                </Box>
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

              <Grid size={12}>
                <TextField
                  name="deliveryStepsString"
                  label="Delivery Steps (comma-separated)"
                  value={values.deliveryStepsString}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.deliveryStepsString && Boolean(errors.deliveryStepsString)}
                  helperText={touched.deliveryStepsString && errors.deliveryStepsString}
                  fullWidth
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

              <Grid size={12}>
                <TextField
                  name="importantNotesString"
                  label="Important Notes (comma-separated)"
                  value={values.importantNotesString}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.importantNotesString && Boolean(errors.importantNotesString)}
                  helperText={touched.importantNotesString && errors.importantNotesString}
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
                        <Card key={variant.id} sx={{ mt: 2, p: 2 }}>
                          <CardContent>
                            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                              <Typography variant="subtitle1">
                                Variant {index + 1}
                              </Typography>
                              <IconButton
                                color="error"
                                onClick={() => arrayHelpers.remove(index)}
                                size="small"
                              >
                                <Trash2 size={16} />
                              </IconButton>
                            </Box>
                            <Grid container spacing={2}>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  label="Variant Name"
                                  name={`variants.${index}.name`}
                                  value={variant.name}
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  label="Price"
                                  type="number"
                                  name={`variants.${index}.price`}
                                  value={variant.price}
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <TextField
                                  label="Original Price"
                                  type="number"
                                  name={`variants.${index}.originalPrice`}
                                  value={variant.originalPrice}
                                  onChange={handleChange}
                                  fullWidth
                                />
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      name={`variants.${index}.isInfiniteStock`}
                                      checked={variant.isInfiniteStock}
                                      onChange={handleChange}
                                      color="primary"
                                    />
                                  }
                                  label="Infinite Stock"
                                />
                              </Grid>
                              {!variant.isInfiniteStock && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <TextField
                                    label="Stock"
                                    type="number"
                                    name={`variants.${index}.stock`}
                                    value={variant.stock || 0}
                                    onChange={handleChange}
                                    fullWidth
                                  />
                                </Grid>
                              )}
                            </Grid>
                          </CardContent>
                        </Card>
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