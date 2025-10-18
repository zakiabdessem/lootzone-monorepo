"use client";

import React, { useState } from "react";
import type { ReactElement } from "react";
import styled from "@emotion/styled";
import NextLink from "next/link";

import {
  Box,
  Breadcrumbs as MuiBreadcrumbs,
  Button,
  Checkbox,
  Divider as MuiDivider,
  Grid,
  IconButton,
  Link,
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
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Archive as ArchiveIcon,
  FilterList as FilterListIcon,
  RemoveRedEye as RemoveRedEyeIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { spacing, SpacingProps } from "@mui/system";
import { api } from "@lootzone/trpc-shared";
import { OrderStatusBadge, PaymentStatusBadge } from "../../../components/orders/OrderStatusBadge";
import { OrderDetailsModal } from "../../../components/orders/OrderDetailsModal";

const Divider = styled(MuiDivider)(spacing);

const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);

const Paper = styled(MuiPaper)(spacing);

const Spacer = styled.div`
  flex: 1 1 100%;
`;

const ToolbarTitle = styled.div`
  min-width: 150px;
`;

type OrderType = {
  id: string;
  userId: string | null;
  user: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
  } | null;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  totalAmount: number;
  currency: string;
  createdAt: string;
};

type EnhancedTableHeadProps = {
  numSelected: number;
  rowCount: number;
  onSelectAllClick: (e: any) => void;
};

const headCells = [
  { id: "id", label: "Order ID" },
  { id: "customer", label: "Customer" },
  { id: "date", label: "Date" },
  { id: "total", label: "Total" },
  { id: "paymentStatus", label: "Payment" },
  { id: "status", label: "Status" },
  { id: "actions", label: "Actions" },
];

const EnhancedTableHead: React.FC<EnhancedTableHeadProps> = (props) => {
  const { onSelectAllClick, numSelected, rowCount } = props;

  return (
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox">
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            inputProps={{ "aria-label": "select all" }}
          />
        </TableCell>
        {headCells.map((headCell) => (
          <TableCell key={headCell.id}>{headCell.label}</TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

type EnhancedTableToolbarProps = {
  numSelected: number;
  statusFilter: string;
  searchQuery: string;
  onStatusFilterChange: (value: string) => void;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
};

const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
  const { numSelected, statusFilter, searchQuery, onStatusFilterChange, onSearchChange, onRefresh } = props;

  return (
    <Toolbar sx={{ gap: 2, flexWrap: "wrap" }}>
      <ToolbarTitle>
        {numSelected > 0 ? (
          <Typography color="inherit" variant="subtitle1">
            {numSelected} selected
          </Typography>
        ) : (
          <Typography variant="h6" id="tableTitle">
            Orders
          </Typography>
        )}
      </ToolbarTitle>
      <Spacer />
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <TextField
          size="small"
          placeholder="Search by Order ID or Customer..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{ minWidth: 250 }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={(e) => onStatusFilterChange(e.target.value)}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="processing">Processing</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
            <MenuItem value="refunded">Refunded</MenuItem>
          </Select>
        </FormControl>
        <Tooltip title="Refresh">
          <IconButton onClick={onRefresh} size="large">
            <RefreshIcon />
          </IconButton>
        </Tooltip>
      </div>
    </Toolbar>
  );
};

function EnhancedTable() {
  const [selected, setSelected] = useState<Array<string>>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const {
    data,
    isLoading,
    error,
    refetch,
  } = api.order.getAllOrders.useQuery({
    limit: rowsPerPage,
    offset: page * rowsPerPage,
    status: statusFilter || undefined,
    search: searchQuery || undefined,
  });

  const orders = data?.orders || [];
  const totalCount = data?.totalCount || 0;

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds = orders.map((n: any) => n.id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    id: string
  ) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: Array<string> = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleViewOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
  };

  const handleCloseModal = () => {
    setSelectedOrderId(null);
  };

  const handleOrderUpdated = () => {
    refetch();
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  return (
    <div>
      <Paper>
        <EnhancedTableToolbar
          numSelected={selected.length}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          onStatusFilterChange={setStatusFilter}
          onSearchChange={setSearchQuery}
          onRefresh={() => refetch()}
        />
        
        {error && (
          <Box p={3}>
            <Alert severity="error">Failed to load orders: {error.message}</Alert>
          </Box>
        )}

        <TableContainer>
          <Table
            aria-labelledby="tableTitle"
            size={"medium"}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              numSelected={selected.length}
              onSelectAllClick={handleSelectAllClick}
              rowCount={orders.length}
            />
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography color="text.secondary">No orders found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order: any, index: number) => {
                  const isItemSelected = isSelected(order.id);
                  const labelId = `enhanced-table-checkbox-${index}`;
                  const customerName = order.user
                    ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() ||
                      order.user.email
                    : order.checkoutDraft?.fullName || "Guest";

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={order.id}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ "aria-labelledby": labelId }}
                          onClick={(event) => handleClick(event, order.id)}
                        />
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" fontFamily="monospace" fontSize={12}>
                          #{order.id.slice(0, 8)}
                        </Typography>
                      </TableCell>
                      <TableCell>{customerName}</TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={500}>
                          {order.totalAmount.toFixed(2)} {order.currency}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <PaymentStatusBadge status={order.paymentStatus} />
                      </TableCell>
                      <TableCell>
                        <OrderStatusBadge status={order.status} />
                      </TableCell>
                      <TableCell padding="none" align="right">
                        <Box mr={2}>
                          <Tooltip title="View Details">
                            <IconButton
                              aria-label="details"
                              size="large"
                              onClick={() => handleViewOrder(order.id)}
                            >
                              <RemoveRedEyeIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {selectedOrderId && (
        <OrderDetailsModal
          open={!!selectedOrderId}
          onClose={handleCloseModal}
          orderId={selectedOrderId}
          onOrderUpdated={handleOrderUpdated}
        />
      )}
    </div>
  );
}


function OrderList() {
  return (
    <React.Fragment>
      <Grid justifyContent="space-between" container spacing={10}>
        <Grid>
          <Typography variant="h3" gutterBottom display="inline">
            Orders
          </Typography>

          <Breadcrumbs aria-label="Breadcrumb" mt={2}>
            <Link component={NextLink} href="/">
              Dashboard
            </Link>
            <Typography>Orders</Typography>
          </Breadcrumbs>
        </Grid>
      </Grid>
      <Divider my={6} />
      <Grid container spacing={6}>
        <Grid size={12}>
          <EnhancedTable />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default OrderList;
