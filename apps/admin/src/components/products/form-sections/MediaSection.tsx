
"use client";

import { Grid, TextField, Typography, Box, Button, Chip } from "@mui/material";
import { Plus } from "lucide-react";
import { useState } from "react";

interface MediaSectionProps {
  values: {
    image: string;
    gallery: string[];
  };
  errors: any;
  touched: any;
  handleChange: (e: any) => void;
  handleBlur: (e: any) => void;
  setFieldValue: (field: string, value: any) => void;
}

export default function MediaSection({
  values,
  errors,
  touched,
  handleChange,
  handleBlur,
  setFieldValue,
}: MediaSectionProps) {
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

  return (
    <>
      <Grid size={12}>
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
    </>
  );
}
