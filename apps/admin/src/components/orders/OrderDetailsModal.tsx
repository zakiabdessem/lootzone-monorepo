"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  Divider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Alert,
  Avatar,
} from "@mui/material";
import {
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { api } from "@lootzone/trpc-shared";
import { OrderStatusBadge, PaymentStatusBadge } from "./OrderStatusBadge";

interface OrderDetailsModalProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  onOrderUpdated?: () => void;
}

type OrderStatus = "pending" | "processing" | "completed" | "cancelled" | "refunded";

const orderStatuses: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  open,
  onClose,
  orderId,
  onOrderUpdated,
}) => {
  const [orderStatus, setOrderStatus] = useState<OrderStatus | "">("");
  const [notes, setNotes] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const utils = api.useUtils();

  const {
    data: order,
    isLoading,
    error,
  } = api.order.adminGetOrder.useQuery(
    { orderId },
    {
      enabled: open && !!orderId,
    }
  );

  // Update state when order data is loaded
  React.useEffect(() => {
    if (order) {
      setOrderStatus(order.status as OrderStatus);
      setNotes(order.notes || "");
      setHasChanges(false);
    }
  }, [order]);

  const updateStatusMutation = api.order.updateOrderStatus.useMutation({
    onSuccess: () => {
      utils.order.getAllOrders.invalidate();
      utils.order.adminGetOrder.invalidate({ orderId });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setHasChanges(false);
      onOrderUpdated?.();
    },
  });

  const updateNotesMutation = api.order.updateOrderNotes.useMutation({
    onSuccess: () => {
      utils.order.adminGetOrder.invalidate({ orderId });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      setHasChanges(false);
    },
  });

  const handleStatusChange = (newStatus: OrderStatus) => {
    setOrderStatus(newStatus);
    setHasChanges(true);
  };

  const handleNotesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotes(event.target.value);
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!order || orderStatus === "") return; // Prevent saving if status is empty

    const promises = [];

    // Update status if changed and valid
    if (orderStatus !== order.status) {
      promises.push(
        updateStatusMutation.mutateAsync({
          orderId,
          status: orderStatus,
        })
      );
    }

    // Update notes if changed
    if (notes !== (order.notes || "")) {
      promises.push(
        updateNotesMutation.mutateAsync({
          orderId,
          notes: notes || null,
        })
      );
    }

    if (promises.length === 0) return; // Nothing to update

    await Promise.all(promises);
  };

  const handleClose = () => {
    setHasChanges(false);
    setSaveSuccess(false);
    onClose();
  };

  const isSaving = updateStatusMutation.isLoading || updateNotesMutation.isLoading;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      fullScreen={false}
      PaperProps={{
        sx: {
          minHeight: "80vh",
          maxHeight: "90vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 2,
        }}
      >
        <Typography variant="h5" component="div">
          Order Details
        </Typography>
        <Button onClick={handleClose} color="inherit" size="small">
          <CloseIcon />
        </Button>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ pt: 3 }}>
        {isLoading && (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            Failed to load order details: {error.message}
          </Alert>
        )}

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Order updated successfully!
          </Alert>
        )}

        {order && (
          <Grid container spacing={3}>
            {/* Customer Information Section */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, height: "100%" }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Customer Information
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {order.user ? (
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Name
                    </Typography>
                    <Typography variant="body1" gutterBottom fontWeight={500}>
                      {order.user.firstName} {order.user.lastName}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                      Email
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {order.user.email}
                    </Typography>

                    {order.user.phone && (
                      <>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                          sx={{ mt: 2 }}
                        >
                          Phone
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {order.user.phone}
                        </Typography>
                      </>
                    )}

                    <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                      User ID
                    </Typography>
                    <Typography variant="body1" gutterBottom fontFamily="monospace" fontSize={13}>
                      {order.user.id}
                    </Typography>
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    Guest Checkout
                  </Typography>
                )}
              </Paper>
            </Grid>

            {/* Order Information Section */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Paper sx={{ p: 3, height: "100%" }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Order Information
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Order ID
                </Typography>
                <Typography variant="body1" gutterBottom fontFamily="monospace" fontSize={13}>
                  {order.id}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                  Created
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(order.createdAt).toLocaleString()}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                  Last Updated
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {new Date(order.updatedAt).toLocaleString()}
                </Typography>

                <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 2 }}>
                  Total Amount
                </Typography>
                <Typography variant="h6" gutterBottom color="primary" fontWeight={600}>
                  {order.totalAmount.toFixed(2)} {order.currency}
                </Typography>

                <Box sx={{ mt: 2 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Order Status</InputLabel>
                    <Select
                      value={orderStatus}
                      label="Order Status"
                      onChange={(e) => handleStatusChange(e.target.value as OrderStatus)}
                    >
                      {orderStatuses.map((status) => (
                        <MenuItem key={status.value} value={status.value}>
                          {status.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Paper>
            </Grid>

            {/* Order Items Section */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Order Items
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Product</TableCell>
                        <TableCell>Variant</TableCell>
                        <TableCell align="center">Quantity</TableCell>
                        <TableCell align="right">Unit Price</TableCell>
                        <TableCell align="right">Total</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {order.items.map((item: any) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={2}>
                              <Avatar
                                src={item.productImage}
                                alt={item.productTitle}
                                variant="rounded"
                                sx={{ width: 50, height: 50 }}
                              />
                              <Typography variant="body2">{item.productTitle}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{item.variantName}</TableCell>
                          <TableCell align="center">{item.quantity}</TableCell>
                          <TableCell align="right">
                            {item.price.toFixed(2)} {order.currency}
                          </TableCell>
                          <TableCell align="right">
                            {item.totalPrice.toFixed(2)} {order.currency}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={4} align="right">
                          <Typography variant="subtitle1" fontWeight={600}>
                            Subtotal:
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="subtitle1" fontWeight={600}>
                            {order.totalAmount.toFixed(2)} {order.currency}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            </Grid>

            {/* Payment Details Section */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Payment Details
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Payment Method
                    </Typography>
                    <Typography variant="body1" gutterBottom textTransform="capitalize">
                      {order.paymentMethod}
                    </Typography>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Payment Status
                    </Typography>
                    <Box>
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </Box>
                  </Grid>

                  {order.paymentId && (
                    <Grid size={{ xs: 12 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Payment ID
                      </Typography>
                      <Typography variant="body1" fontFamily="monospace" fontSize={13}>
                        {order.paymentId}
                      </Typography>
                    </Grid>
                  )}
                </Grid>

                {/* Chargily Webhook Events */}
                {order.chargilyWebhookEvents && order.chargilyWebhookEvents.length > 0 && (
                  <Box sx={{ mt: 3 }}>
                    <Accordion>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="subtitle1">
                          Chargily Webhook Events ({order.chargilyWebhookEvents.length})
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Box sx={{ maxHeight: 300, overflow: "auto" }}>
                          {order.chargilyWebhookEvents.map((event: any, index: number) => (
                            <Box
                              key={index}
                              sx={{
                                mb: 2,
                                p: 2,
                                bgcolor: "grey.50",
                                borderRadius: 1,
                                border: "1px solid",
                                borderColor: "grey.200",
                              }}
                            >
                              <Typography variant="caption" color="text.secondary">
                                Event {index + 1}
                              </Typography>
                              <pre
                                style={{
                                  fontSize: 11,
                                  overflow: "auto",
                                  margin: "8px 0 0 0",
                                  fontFamily: "monospace",
                                }}
                              >
                                {JSON.stringify(event, null, 2)}
                              </pre>
                            </Box>
                          ))}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                )}
              </Paper>
            </Grid>

            {/* Admin Notes Section */}
            <Grid size={{ xs: 12 }}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Admin Notes (Internal Only)
                </Typography>
                <Divider sx={{ mb: 2 }} />

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  value={notes}
                  onChange={handleNotesChange}
                  placeholder="Add internal notes about this order (not visible to customers)..."
                  variant="outlined"
                />

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                  These notes are only visible to administrators and will not be shown to customers.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ p: 2, justifyContent: "space-between" }}>
        <Button onClick={handleClose} color="inherit">
          Close
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          color="primary"
          disabled={!hasChanges || isSaving}
          startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
        >
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
