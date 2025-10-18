
import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Typography,
  Alert
} from '@mui/material';
import { api } from '@lootzone/trpc-shared';
import CategoryIcon, { getAvailableIcons } from '../ui/CategoryIcon';

interface CategoryCreateModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CategoryCreateModal: React.FC<CategoryCreateModalProps> = ({
  open,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    type: 'product',
    icon: '',
    displayOrder: 0,
    isActive: true,
    selectedIcon: ''
  });
  const [error, setError] = useState('');

  const { mutateAsync: createCategory, isLoading } = api.category.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
      resetForm();
    },
    onError: (error) => {
      setError(error.message);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      slug: '',
      type: 'product',
      icon: '',
      displayOrder: 0,
      isActive: true,
      selectedIcon: ''
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCategory({
        name: formData.name,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, '-'),
        type: formData.type as any,
        icon: formData.icon || undefined,
        displayOrder: formData.displayOrder,
        isActive: formData.isActive
      });
    } catch (error) {
      console.error('Failed to create category:', error);
    }
  };

  const availableIcons = getAvailableIcons();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Create New Category</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Category Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                fullWidth
                required
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Slug"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                fullWidth
                placeholder="Auto-generated from name"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                label="Icon URL"
                value={formData.icon}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                fullWidth
                placeholder="e.g., /drms/capcut.svg"
                helperText="Path to the icon file in the public/drms folder"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  label="Type"
                >
                  <MenuItem value="smart">Smart</MenuItem>
                  <MenuItem value="simple">Simple</MenuItem>
                  <MenuItem value="product">Product</MenuItem>
                  <MenuItem value="utility">Utility</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                label="Display Order"
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                fullWidth
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Icon Preview:
              </Typography>
              <CategoryIcon 
                name={formData.name}
                iconPath={formData.icon || undefined}
                size={32}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isLoading || !formData.name}>
            {isLoading ? 'Creating...' : 'Create Category'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default CategoryCreateModal;
