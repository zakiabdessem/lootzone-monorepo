import React from "react";
import {
  Card,
  CardContent,
  Grid,
  TextField,
  IconButton,
  Switch,
  FormControlLabel,
  Typography,
} from "@mui/material";
import { Trash2 } from "lucide-react";
import { useFormikContext } from "formik";

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
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export default function VariantCard({
  variant,
  index,
  handleChange,
  onRemove,
}: VariantCardProps) {
  const formik = useFormikContext<any>();

  const getFieldError = (fieldName: string) => {
    const errors = formik.errors.variants;
    const touched = formik.touched.variants;

    if (Array.isArray(errors) && Array.isArray(touched) && 
        errors[index] && touched[index] && 
        typeof errors[index] === 'object' && typeof touched[index] === 'object') {
      return (errors[index] as any)[fieldName] && (touched[index] as any)[fieldName] ? (errors[index] as any)[fieldName] : null;
    }
    return null;
  };

  const isFieldTouched = (fieldName: string) => {
    const touched = formik.touched.variants;
    if (Array.isArray(touched) && touched[index] && typeof touched[index] === 'object') {
      return !!(touched[index] as any)[fieldName];
    }
    return false;
  };

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              name={`variants[${index}].name`}
              label="Variant Name"
              value={variant.name}
              onChange={handleChange}
              onBlur={formik.handleBlur}
              error={isFieldTouched('name') && Boolean(getFieldError('name'))}
              helperText={isFieldTouched('name') && getFieldError('name')}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              name={`variants[${index}].price`}
              label="Price"
              type="number"
              value={variant.price}
              onChange={handleChange}
              onBlur={formik.handleBlur}
              error={isFieldTouched('price') && Boolean(getFieldError('price'))}
              helperText={isFieldTouched('price') && getFieldError('price')}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              name={`variants[${index}].originalPrice`}
              label="Original Price"
              type="number"
              value={variant.originalPrice}
              onChange={handleChange}
              onBlur={formik.handleBlur}
              error={isFieldTouched('originalPrice') && Boolean(getFieldError('originalPrice'))}
              helperText={isFieldTouched('originalPrice') && getFieldError('originalPrice')}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <TextField
              name={`variants[${index}].stock`}
              label="Stock"
              type="number"
              value={variant.stock || 0}
              onChange={handleChange}
              onBlur={formik.handleBlur}
              error={!variant.isInfiniteStock && isFieldTouched('stock') && Boolean(getFieldError('stock'))}
              helperText={!variant.isInfiniteStock && isFieldTouched('stock') && getFieldError('stock')}
              disabled={variant.isInfiniteStock}
              fullWidth
              size="small"
            />
          </Grid>
          <Grid size={{ xs: 6, md: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  name={`variants[${index}].isInfiniteStock`}
                  checked={variant.isInfiniteStock}
                  onChange={handleChange}
                  size="small"
                />
              }
              label={
                <Typography variant="caption">Infinite Stock</Typography>
              }
            />
          </Grid>
          <Grid size={{ xs: 12, md: 1 }}>
            <IconButton onClick={onRemove} color="error">
              <Trash2 size={16} />
            </IconButton>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}