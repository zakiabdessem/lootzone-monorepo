"use client";

import styled from "@emotion/styled";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import {
    Add as AddIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    FilterList as FilterListIcon,
} from "@mui/icons-material";
import {
    Box,
    Button,
    Checkbox,
    IconButton,
    Link,
    Breadcrumbs as MuiBreadcrumbs,
    Divider as MuiDivider,
    Paper as MuiPaper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Toolbar,
    Tooltip,
    Typography,
    Chip,
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Switch,
    Radio,
    RadioGroup,
    FormControl,
    FormLabel,
} from "@mui/material";
import { spacing } from "@mui/system";
import { api } from "@lootzone/trpc-shared";

const Divider = styled(MuiDivider)(spacing);
const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);
const Paper = styled(MuiPaper)(spacing);

const Spacer = styled.div`
  flex: 1 1 100%;
`;

const ToolbarTitle = styled.div`
  min-width: 150px`;

function CouponsPage() {
    const router = useRouter();
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(undefined);
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [selectedCoupon, setSelectedCoupon] = useState<any>(null);

    // Form state
    const [formData, setFormData] = useState({
        code: "",
        discountType: "percentage" as "percentage" | "fixed",
        discountValue: 0,
        minOrderAmount: 0,
        maxUses: null as number | null,
        expiresAt: null as Date | null,
        isActive: true,
    });

    // Fetch coupons
    const { data: couponsData, isLoading, error, refetch } = api.coupon.getAll.useQuery({
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm || undefined,
        isActive: isActiveFilter,
        sortBy: "createdAt",
        sortOrder: "desc",
    });

    // Mutations
    const createCoupon = api.coupon.create.useMutation({
        onSuccess: () => {
            refetch();
            setCreateDialogOpen(false);
            resetForm();
        },
        onError: (error) => {
            alert(error.message);
        },
    });

    const updateCoupon = api.coupon.update.useMutation({
        onSuccess: () => {
            refetch();
            setEditDialogOpen(false);
            setSelectedCoupon(null);
            resetForm();
        },
        onError: (error) => {
            alert(error.message);
        },
    });

    const deleteCoupon = api.coupon.delete.useMutation({
        onSuccess: () => {
            refetch();
        },
        onError: (error) => {
            alert(error.message);
        },
    });

    const resetForm = () => {
        setFormData({
            code: "",
            discountType: "percentage",
            discountValue: 0,
            minOrderAmount: 0,
            maxUses: null,
            expiresAt: null,
            isActive: true,
        });
    };

    const handleCreate = () => {
        createCoupon.mutate(formData);
    };

    const handleUpdate = () => {
        if (!selectedCoupon) return;
        updateCoupon.mutate({
            id: selectedCoupon.id,
            ...formData,
        });
    };

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this coupon?")) {
            deleteCoupon.mutate({ id });
        }
    };

    const handleEdit = (coupon: any) => {
        setSelectedCoupon(coupon);
        setFormData({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue,
            minOrderAmount: coupon.minOrderAmount || 0,
            maxUses: coupon.maxUses,
            expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt) : null,
            isActive: coupon.isActive,
        });
        setEditDialogOpen(true);
    };

    const handleChangePage = (event: unknown, newPage: number) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const formatDate = (date: Date | string | null) => {
        if (!date) return "No Expiry";
        return new Date(date).toLocaleDateString();
    };

    return (
        <React.Fragment>
            <Box mb={4}>
                <Breadcrumbs aria-label="Breadcrumb" mb={2}>
                    <Link href="/">Dashboard</Link>
                    <Typography>Coupons</Typography>
                </Breadcrumbs>

                <Typography variant="h3" gutterBottom display="inline">
                    Coupon Management
                </Typography>
            </Box>

            <Divider my={6} />

            <Paper>
                <Toolbar>
                    <ToolbarTitle>
                        <Typography variant="h6" id="tableTitle">
                            Coupons
                        </Typography>
                    </ToolbarTitle>
                    <Spacer />
                    <Button
                        variant="contained"
                        color="primary"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            resetForm();
                            setCreateDialogOpen(true);
                        }}
                    >
                        Create Coupon
                    </Button>
                </Toolbar>

                <Box px={4} pb={2}>
                    <TextField
                        fullWidth
                        placeholder="Search by code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                    />
                </Box>

                {isLoading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Box p={4}>
                        <Alert severity="error">Failed to load coupons: {error.message}</Alert>
                    </Box>
                ) : (
                    <>
                        <TableContainer>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Code</TableCell>
                                        <TableCell>Type</TableCell>
                                        <TableCell>Value</TableCell>
                                        <TableCell>Min Order</TableCell>
                                        <TableCell>Uses</TableCell>
                                        <TableCell>Expiry</TableCell>
                                        <TableCell>Status</TableCell>
                                        <TableCell align="right">Actions</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {couponsData?.coupons.map((coupon) => (
                                        <TableRow key={coupon.id}>
                                            <TableCell>
                                                <Typography variant="subtitle2" fontWeight={600}>
                                                    {coupon.code}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={coupon.discountType}
                                                    size="small"
                                                    color={coupon.discountType === "percentage" ? "primary" : "secondary"}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                {coupon.discountType === "percentage"
                                                    ? `${coupon.discountValue}%`
                                                    : `${coupon.discountValue} DA`}
                                            </TableCell>
                                            <TableCell>
                                                {coupon.minOrderAmount ? `${coupon.minOrderAmount} DA` : "None"}
                                            </TableCell>
                                            <TableCell>
                                                {coupon.currentUses}
                                                {coupon.maxUses ? ` / ${coupon.maxUses}` : " / ∞"}
                                            </TableCell>
                                            <TableCell>{formatDate(coupon.expiresAt)}</TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={coupon.isActive ? "Active" : "Inactive"}
                                                    size="small"
                                                    color={coupon.isActive ? "success" : "default"}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Edit">
                                                    <IconButton size="small" onClick={() => handleEdit(coupon)}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Delete">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleDelete(coupon.id)}
                                                        color="error"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>

                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            component="div"
                            count={couponsData?.total || 0}
                            rowsPerPage={rowsPerPage}
                            page={page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </>
                )}
            </Paper>

            {/* Create Dialog */}
            <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Create New Coupon</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={2}>
                        <TextField
                            label="Coupon Code"
                            value={formData.code}
                            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            fullWidth
                            placeholder="e.g., SAVE20"
                            inputProps={{ maxLength: 20 }}
                        />

                        <FormControl component="fieldset">
                            <FormLabel component="legend">Discount Type</FormLabel>
                            <RadioGroup
                                row
                                value={formData.discountType}
                                onChange={(e) =>
                                    setFormData({ ...formData, discountType: e.target.value as "percentage" | "fixed" })
                                }
                            >
                                <FormControlLabel value="percentage" control={<Radio />} label="Percentage" />
                                <FormControlLabel value="fixed" control={<Radio />} label="Fixed Amount (DA)" />
                            </RadioGroup>
                        </FormControl>

                        <TextField
                            label={formData.discountType === "percentage" ? "Discount (%)" : "Discount Amount (DA)"}
                            type="number"
                            value={formData.discountValue}
                            onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                            fullWidth
                            inputProps={{
                                min: formData.discountType === "percentage" ? 1 : 0,
                                max: formData.discountType === "percentage" ? 100 : 100000,
                            }}
                        />

                        <TextField
                            label="Minimum Order Amount (DA)"
                            type="number"
                            value={formData.minOrderAmount}
                            onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) })}
                            fullWidth
                            inputProps={{ min: 0 }}
                        />

                        <TextField
                            label="Max Uses (Leave empty for unlimited)"
                            type="number"
                            value={formData.maxUses || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : null })
                            }
                            fullWidth
                            inputProps={{ min: 0 }}
                        />

                        <TextField
                            label="Expiry Date (Optional)"
                            type="date"
                            value={formData.expiresAt ? formData.expiresAt.toISOString().split("T")[0] : ""}
                            onChange={(e) =>
                                setFormData({ ...formData, expiresAt: e.target.value ? new Date(e.target.value) : null })
                            }
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                            }
                            label="Active"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setCreateDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleCreate} variant="contained" color="primary" disabled={createCoupon.isPending}>
                        {createCoupon.isPending ? "Creating..." : "Create"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Coupon</DialogTitle>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2} mt={2}>
                        <TextField label="Coupon Code" value={formData.code} fullWidth disabled />

                        <FormControl component="fieldset">
                            <FormLabel component="legend">Discount Type</FormLabel>
                            <RadioGroup
                                row
                                value={formData.discountType}
                                onChange={(e) =>
                                    setFormData({ ...formData, discountType: e.target.value as "percentage" | "fixed" })
                                }
                            >
                                <FormControlLabel value="percentage" control={<Radio />} label="Percentage" />
                                <FormControlLabel value="fixed" control={<Radio />} label="Fixed Amount (DA)" />
                            </RadioGroup>
                        </FormControl>

                        <TextField
                            label={formData.discountType === "percentage" ? "Discount (%)" : "Discount Amount (DA)"}
                            type="number"
                            value={formData.discountValue}
                            onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) })}
                            fullWidth
                            inputProps={{
                                min: formData.discountType === "percentage" ? 1 : 0,
                                max: formData.discountType === "percentage" ? 100 : 100000,
                            }}
                        />

                        <TextField
                            label="Minimum Order Amount (DA)"
                            type="number"
                            value={formData.minOrderAmount}
                            onChange={(e) => setFormData({ ...formData, minOrderAmount: parseFloat(e.target.value) })}
                            fullWidth
                            inputProps={{ min: 0 }}
                        />

                        <TextField
                            label="Max Uses (Leave empty for unlimited)"
                            type="number"
                            value={formData.maxUses || ""}
                            onChange={(e) =>
                                setFormData({ ...formData, maxUses: e.target.value ? parseInt(e.target.value) : null })
                            }
                            fullWidth
                            inputProps={{ min: 0 }}
                        />

                        <TextField
                            label="Expiry Date (Optional)"
                            type="date"
                            value={formData.expiresAt ? formData.expiresAt.toISOString().split("T")[0] : ""}
                            onChange={(e) =>
                                setFormData({ ...formData, expiresAt: e.target.value ? new Date(e.target.value) : null })
                            }
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        <FormControlLabel
                            control={
                                <Switch
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                            }
                            label="Active"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleUpdate} variant="contained" color="primary" disabled={updateCoupon.isPending}>
                        {updateCoupon.isPending ? "Updating..." : "Update"}
                    </Button>
                </DialogActions>
            </Dialog>
        </React.Fragment>
    );
}

export default CouponsPage;

