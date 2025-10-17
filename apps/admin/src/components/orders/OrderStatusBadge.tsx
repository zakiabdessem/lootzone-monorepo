import React from "react";
import { Chip } from "@mui/material";
import { green, orange, red, blue, purple } from "@mui/material/colors";

type OrderStatus = "pending" | "processing" | "completed" | "cancelled" | "refunded";
type PaymentStatus = "draft" | "pending" | "paid" | "failed" | "expired" | "cancelled";

interface OrderStatusBadgeProps {
  status: string;
  size?: "small" | "medium";
}

interface PaymentStatusBadgeProps {
  status: string;
  size?: "small" | "medium";
}

const orderStatusConfig: Record<
  OrderStatus,
  { label: string; color: string; bgcolor: string }
> = {
  pending: {
    label: "Pending",
    color: "#fff",
    bgcolor: orange[700],
  },
  processing: {
    label: "Processing",
    color: "#fff",
    bgcolor: blue[600],
  },
  completed: {
    label: "Completed",
    color: "#fff",
    bgcolor: green[600],
  },
  cancelled: {
    label: "Cancelled",
    color: "#fff",
    bgcolor: red[600],
  },
  refunded: {
    label: "Refunded",
    color: "#fff",
    bgcolor: purple[600],
  },
};

const paymentStatusConfig: Record<
  PaymentStatus,
  { label: string; color: string; bgcolor: string }
> = {
  draft: {
    label: "Draft",
    color: "#000",
    bgcolor: "#e0e0e0",
  },
  pending: {
    label: "Payment Pending",
    color: "#fff",
    bgcolor: orange[600],
  },
  paid: {
    label: "Paid",
    color: "#fff",
    bgcolor: green[600],
  },
  failed: {
    label: "Payment Failed",
    color: "#fff",
    bgcolor: red[700],
  },
  expired: {
    label: "Expired",
    color: "#fff",
    bgcolor: red[400],
  },
  cancelled: {
    label: "Cancelled",
    color: "#fff",
    bgcolor: red[600],
  },
};

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = "small" }) => {
  const config = orderStatusConfig[status as OrderStatus] || {
    label: status,
    color: "#000",
    bgcolor: "#e0e0e0",
  };

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        color: config.color,
        bgcolor: config.bgcolor,
        fontWeight: 500,
      }}
    />
  );
};

export const PaymentStatusBadge: React.FC<PaymentStatusBadgeProps> = ({
  status,
  size = "small",
}) => {
  const config = paymentStatusConfig[status as PaymentStatus] || {
    label: status,
    color: "#000",
    bgcolor: "#e0e0e0",
  };

  return (
    <Chip
      label={config.label}
      size={size}
      sx={{
        color: config.color,
        bgcolor: config.bgcolor,
        fontWeight: 500,
      }}
    />
  );
};
