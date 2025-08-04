
"use client";

import {
  Card,
  CardContent,
  Grid,
  TextField,
  IconButton,
  Typography,
  Box,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { Trash2 } from "lucide-react";

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  stock?: number;
  isInfiniteStock: boolean;
}

interface VariantCardProps {
  variant: ProductVariant;
  index: number;
  handleChange: (e: any) => void;
  onRemove: () => void;
}

export default function VariantCard({
  variant,
  index,
  handleChange,
  onRemove,
}: VariantCardProps) {
  return (
    <Card sx={{ mt: 2, p: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="subtitle1">
            Variant {index + 1}
          </Typography>
          <IconButton
            color="error"
            onClick={onRemove}
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
  );
}
