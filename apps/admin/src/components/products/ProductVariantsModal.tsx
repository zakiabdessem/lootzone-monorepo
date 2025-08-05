
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Typography,
  Box,
} from "@mui/material";

interface ProductVariant {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  isActive: boolean;
}

interface ProductVariantsModalProps {
  open: boolean;
  onClose: () => void;
  variants: ProductVariant[];
  productTitle: string;
}

export default function ProductVariantsModal({
  open,
  onClose,
  variants,
  productTitle,
}: ProductVariantsModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6">Variants for "{productTitle}"</Typography>
      </DialogTitle>
      <DialogContent>
        <TableContainer component={Paper} elevation={0}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Original Price</TableCell>
                <TableCell align="right">Sale Price</TableCell>
                <TableCell align="center">Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {variants.map((variant) => (
                <TableRow key={variant.id}>
                  <TableCell>
                    <Typography variant="body2">{variant.name}</Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" color="textSecondary">
                      ${variant.originalPrice.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="bold">
                      ${variant.price.toFixed(2)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={variant.isActive ? "Active" : "Inactive"}
                      color={variant.isActive ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {variants.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="body2" color="textSecondary">
              No variants found for this product.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
