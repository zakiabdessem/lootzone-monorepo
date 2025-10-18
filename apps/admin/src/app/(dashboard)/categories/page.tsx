"use client";

import { api } from "@lootzone/trpc-shared";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { Box, Button, Card, CardContent, CircularProgress, Switch, Typography } from "@mui/material";
import { styled } from "@mui/material/styles";
import { DataGrid, GridActionsCellItem, GridColDef, GridRowEditStopReasons } from "@mui/x-data-grid";
import React, { useState } from "react";
import CategoryIcon from "../../../components/ui/CategoryIcon";
import CategoryCreateModal from "../../../components/categories/CategoryCreateModal";

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '& .saving-row': {
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
    '&:hover': {
      backgroundColor: 'rgba(25, 118, 210, 0.12)',
    },
  },
}));

const columns: GridColDef[] = [
  {
    field: "icon",
    headerName: "Icon",
    width: 80,
    renderCell: (params) => (
      <CategoryIcon 
        name={params.row.name}
        iconPath={params.row.icon}
        size={24}
      />
    ),
    sortable: false,
  },
  {
    field: "iconPath",
    headerName: "Icon URL",
    flex: 1,
    minWidth: 200,
    editable: true,
  },
  {
    field: "name",
    headerName: "Name",
    flex: 1,
    minWidth: 180,
    editable: true,
  },
  {
    field: "type",
    headerName: "Type",
    flex: 1,
    minWidth: 120,
    editable: true,
    type: 'singleSelect',
    valueOptions: [
      { value: 'smart', label: 'Smart' },
      { value: 'simple', label: 'Simple' },
      { value: 'product', label: 'Product' },
      { value: 'utility', label: 'Utility' },
    ],
  },
  {
    field: "displayOrder",
    headerName: "Order",
    width: 100,
    editable: true,
    type: 'number',
  },
  {
    field: "isActive",
    headerName: "Active",
    width: 100,
    renderCell: (params) => (
      <Switch
        checked={params.value}
        onChange={() => params.row.onToggleActive?.()}
        color="primary"
      />
    ),
  },
  {
    field: "actions",
    type: "actions",
    headerName: "Actions",
    width: 120,
    getActions: (params) => [
      <GridActionsCellItem
        icon={<EditIcon />}
        label="Edit"
        onClick={() => params.row.onEdit?.()}
        showInMenu
      />,
      <GridActionsCellItem
        icon={<DeleteIcon color="error" />}
        label="Delete"
        onClick={() => params.row.onDelete?.()}
        showInMenu
      />,
    ],
  },
];

const CategoryTablePage: React.FC = () => {
  const {
    data: categories = [],
    isLoading: loading,
    error,
    refetch,
  } = api.category.getAll.useQuery();

  const { mutateAsync: updateCategory } = api.category.update.useMutation({
    onSuccess: () => refetch(),
  });
  const { mutateAsync: deleteCategory } = api.category.delete.useMutation({
    onSuccess: () => refetch(),
  });
  const { mutateAsync: toggleCategoryActive } = api.category.toggleActive.useMutation({
    onSuccess: () => refetch(),
  });
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [savingRowId, setSavingRowId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    await deleteCategory({ id });
    refetch();
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await toggleCategoryActive({ id, isActive: !isActive });
    refetch();
  };

    const handleRowEditStop = async (params: any, event: any) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
  };

  const processRowUpdate = async (newRow: any, oldRow: any) => {
    // Only update if there are actual changes
    const changedFields: any = {};
    let hasChanges = false;

    ['name', 'type', 'displayOrder', 'iconPath'].forEach(field => {
      if (newRow[field] !== oldRow[field]) {
        // Map iconPath field to icon for the API
        const apiField = field === 'iconPath' ? 'icon' : field;
        changedFields[apiField] = newRow[field];
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setSavingRowId(newRow.id);
      try {
        const updateData = { id: newRow.id, ...changedFields };
        await updateCategory(updateData);
        refetch();
      } finally {
        setSavingRowId(null);
      }
    }

    return newRow;
  };

  const rows = categories.map((cat) => ({
    ...cat,
    iconPath: cat.icon || '',
    onEdit: () => {
      // Double-click or use the edit button to start editing
      console.log('Edit category:', cat.id);
    },
    onDelete: () => handleDelete(cat.id),
    onToggleActive: () => handleToggleActive(cat.id, cat.isActive),
  }));

  return (
    <Card>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">Category Management</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
          >
            New Category
          </Button>
        </Box>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">{error.message}</Typography>
        ) : (
          <div style={{ height: 600, width: "100%" }}>
                        <StyledDataGrid
              rows={rows}
              columns={columns}
              getRowId={(row) => row.id}
              loading={loading}
              getRowClassName={(params) =>
                savingRowId === params.id ? 'saving-row' : ''
              }
              disableRowSelectionOnClick
              pageSizeOptions={[10, 25, 50]}
              initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
              editMode="row"
              onRowEditStop={handleRowEditStop}
              processRowUpdate={processRowUpdate}
            />
          </div>
        )}
        <CategoryCreateModal
          open={createModalOpen}
          onClose={() => setCreateModalOpen(false)}
          onSuccess={() => refetch()}
        />
      </CardContent>
    </Card>
  );
};

export default CategoryTablePage;
