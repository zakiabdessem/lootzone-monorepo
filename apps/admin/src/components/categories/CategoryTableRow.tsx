
import React from 'react';
import { Switch } from '@mui/material';
import { GridActionsCellItem } from '@mui/x-data-grid';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '../ui/CategoryIcon';

interface Category {
  id: string;
  name: string;
  type: string;
  displayOrder: number;
  isActive: boolean;
  icon?: string | null;
}

interface CategoryTableRowProps {
  category: Category;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
  isSaving?: boolean;
}

export const CategoryTableRow: React.FC<CategoryTableRowProps> = ({
  category,
  onEdit,
  onDelete,
  onToggleActive,
  isSaving = false
}) => {
  return {
    ...category,
    iconDisplay: (
      <CategoryIcon 
        name={category.name}
        iconPath={category.icon}
        size={20}
      />
    ),
    activeToggle: (
      <Switch
        checked={category.isActive}
        onChange={() => onToggleActive(category.id, category.isActive)}
        color="primary"
        disabled={isSaving}
      />
    ),
    actions: [
      <GridActionsCellItem
        key="edit"
        icon={<EditIcon />}
        label="Edit"
        onClick={() => onEdit(category.id)}
        showInMenu
      />,
      <GridActionsCellItem
        key="delete"
        icon={<DeleteIcon color="error" />}
        label="Delete"
        onClick={() => onDelete(category.id)}
        showInMenu
      />,
    ],
  };
};

export default CategoryTableRow;
