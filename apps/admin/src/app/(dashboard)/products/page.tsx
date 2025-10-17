"use client";

import styled from "@emotion/styled";
import NextLink from "next/link";
import React, { useState } from "react";

import {
    Add as AddIcon,
    Archive as ArchiveIcon,
    FilterList as FilterListIcon,
    RemoveRedEye as RemoveRedEyeIcon,
    Visibility as VisibilityIcon,
} from "@mui/icons-material";
import {
    Box,
    Button,
    Checkbox,
    Grid,
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
    Switch,
    Chip,
    CircularProgress,
    Alert,
} from "@mui/material";
import { spacing } from "@mui/system";
import { api } from "@lootzone/trpc-shared";
import ProductVariantsModal from "@/components/products/ProductVariantsModal";

const Divider = styled(MuiDivider)(spacing);
const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);
const Paper = styled(MuiPaper)(spacing);

const Spacer = styled.div`
  flex: 1 1 100%;
`;

const ToolbarTitle = styled.div`
  min-width: 150px;
`;

const ProductInfo = styled.div`
  display: flex;
  align-items: center;
`;

const ImageWrapper = styled.div`
  width: 60px;
  height: 60px;
  padding: ${(props) => props.theme.spacing(1)};
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
  object-fit: cover;
`;

type ProductType = {
  id: string;
  title: string;
  description: string;
  image: string;
  region: string;
  platformName: string | null;
  isActive: boolean;
  showInRecentlyViewed?: boolean;
  showInRecommended?: boolean;
  category: {
    id: string;
    name: string;
  };
  variants: Array<{
    id: string;
    name: string;
    price: number;
    originalPrice: number;
    isActive: boolean;
  }>;
};

type HeadCell = {
  id: string;
  alignment: "left" | "center" | "right" | "justify" | "inherit" | undefined;
  label: string;
  disablePadding?: boolean;
};

const headCells: Array<HeadCell> = [
  { id: "product", alignment: "left", label: "Product" },
  { id: "category", alignment: "left", label: "Category" },
  { id: "region", alignment: "left", label: "Region" },
  { id: "variants", alignment: "center", label: "Variants" },
  { id: "status", alignment: "center", label: "Status" },
  { id: "recentlyViewed", alignment: "center", label: "Recently Viewed" },
  { id: "recommended", alignment: "center", label: "Recommended" },
  { id: "actions", alignment: "right", label: "Actions" },
];

type EnhancedTableHeadProps = {
  numSelected: number;
  order: "desc" | "asc";
  orderBy: string;
  rowCount: number;
  onSelectAllClick: (e: any) => void;
  onRequestSort: (e: any, property: string) => void;
};

const EnhancedTableHead: React.FC<EnhancedTableHeadProps> = (props) => {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
  } = props;
  const createSortHandler = (property: string) => (event: any) => {
    onRequestSort(event, property);
  };

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
        {headCells.map((headCell: HeadCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.alignment}
            padding={headCell.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : "asc"}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

type EnhancedTableToolbarProps = { numSelected: number };
const EnhancedTableToolbar = (props: EnhancedTableToolbarProps) => {
  const { numSelected } = props;

  return (
    <Toolbar>
      <ToolbarTitle>
        {numSelected > 0 ? (
          <Typography color="inherit" variant="subtitle1">
            {numSelected} selected
          </Typography>
        ) : (
          <Typography variant="h6" id="tableTitle">
            Products
          </Typography>
        )}
      </ToolbarTitle>
      <Spacer />
      <div>
        {numSelected > 0 ? (
          <Tooltip title="Delete">
            <IconButton aria-label="Delete" size="large">
              <ArchiveIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="Filter list">
            <IconButton aria-label="Filter list" size="large">
              <FilterListIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </Toolbar>
  );
};

function EnhancedTable() {
  const [order, setOrder] = React.useState<"desc" | "asc">("desc");
  const [orderBy, setOrderBy] = React.useState("createdAt");
  const [selected, setSelected] = React.useState<Array<string>>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);
  const [variantsModal, setVariantsModal] = useState<{
    open: boolean;
    variants: any[];
    productTitle: string;
  }>({
    open: false,
    variants: [],
    productTitle: "",
  });

  // Fetch products data
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = api.product.adminList.useQuery({
    limit: rowsPerPage,
    offset: page * rowsPerPage,
  });

  // Toggle product active status
  const toggleActiveMutation = api.product.toggleActive.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Toggle recently viewed status
  const toggleRecentlyViewedMutation = api.product.toggleRecentlyViewed.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  // Toggle recommended status
  const toggleRecommendedMutation = api.product.toggleRecommended.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const handleRequestSort = (event: any, property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked && productsData?.products) {
      const newSelecteds: Array<string> = products.map((n: ProductType) => n.id);
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

  const handleToggleActive = (productId: string, currentStatus: boolean) => {
    toggleActiveMutation.mutate({
      id: productId,
      isActive: !currentStatus,
    });
  };

  const handleToggleRecentlyViewed = (productId: string, currentStatus: boolean) => {
    toggleRecentlyViewedMutation.mutate({
      id: productId,
      showInRecentlyViewed: !currentStatus,
    });
  };

  const handleToggleRecommended = (productId: string, currentStatus: boolean) => {
    toggleRecommendedMutation.mutate({
      id: productId,
      showInRecommended: !currentStatus,
    });
  };

  const handleViewVariants = (variants: any[], productTitle: string) => {
    setVariantsModal({
      open: true,
      variants,
      productTitle,
    });
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        Error loading products: {error.message}
      </Alert>
    );
  }

  const coerceDecimalToNumber = (value: any): number => {
    if (value == null) return 0;
    if (
      typeof value === "object" &&
      "toNumber" in value &&
      typeof (value as any).toNumber === "function"
    ) {
      return (value as any).toNumber();
    }
    return Number(value);
  };

  // Convert Decimal fields to number for compatibility with ProductType
  const products: ProductType[] = (productsData?.products || []).map((product) => ({
    ...product,
    variants: product.variants.map((variant) => ({
      ...variant,
      price: coerceDecimalToNumber(variant.price),
      originalPrice: coerceDecimalToNumber(variant.originalPrice)
    }))
  }));
  const totalCount = productsData?.totalCount || 0;

  return (
    <div>
      <Paper>
        <EnhancedTableToolbar numSelected={selected.length} />
        <TableContainer>
          <Table
            aria-labelledby="tableTitle"
            size={"medium"}
            aria-label="enhanced table"
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={products.length}
            />
            <TableBody>
              {products.map((product: ProductType, index: number) => {
                const isItemSelected = isSelected(product.id);
                const labelId = `enhanced-table-checkbox-${index}`;

                return (
                  <TableRow
                    hover
                    role="checkbox"
                    aria-checked={isItemSelected}
                    tabIndex={-1}
                    key={product.id}
                    selected={isItemSelected}
                  >
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        inputProps={{ "aria-labelledby": labelId }}
                        onClick={(event) => handleClick(event, product.id)}
                      />
                    </TableCell>
                    <TableCell component="th" id={labelId} scope="row">
                      <ProductInfo>
                        <ImageWrapper>
                          <Image src={product.image} alt={product.title} />
                        </ImageWrapper>
                        <Box ml={2}>
                          <Typography variant="body1" fontWeight="medium">
                            {product.title}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="textSecondary"
                            sx={{
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '300px',
                            }}
                          >
                            {product.description}
                          </Typography>
                          {product.platformName && (
                            <Chip
                              label={product.platformName}
                              size="small"
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                        </Box>
                      </ProductInfo>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.category.name}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.region}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                        <Typography variant="body2" fontWeight="medium">
                          {product.variants.length}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleViewVariants(product.variants, product.title)}
                          disabled={product.variants.length === 0}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={product.isActive}
                        onChange={() => handleToggleActive(product.id, product.isActive)}
                        disabled={toggleActiveMutation.isPending}
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={product.showInRecentlyViewed ?? false}
                        onChange={() => handleToggleRecentlyViewed(product.id, product.showInRecentlyViewed ?? false)}
                        disabled={toggleRecentlyViewedMutation.isPending}
                        color="secondary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={product.showInRecommended ?? false}
                        onChange={() => handleToggleRecommended(product.id, product.showInRecommended ?? false)}
                        disabled={toggleRecommendedMutation.isPending}
                        color="info"
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton aria-label="delete" size="large">
                        <ArchiveIcon />
                      </IconButton>
                      <IconButton aria-label="details" size="large">
                        <RemoveRedEyeIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      <ProductVariantsModal
        open={variantsModal.open}
        onClose={() => setVariantsModal({ ...variantsModal, open: false })}
        variants={variantsModal.variants}
        productTitle={variantsModal.productTitle}
      />
    </div>
  );
}

function Products() {
  return (
    <React.Fragment>
      <Grid justifyContent="space-between" container spacing={10}>
        <Grid>
          <Typography variant="h3" gutterBottom display="inline">
            Products
          </Typography>

          <Breadcrumbs aria-label="Breadcrumb" mt={2}>
            <Link component={NextLink} href="/">
              Dashboard
            </Link>
            <Link component={NextLink} href="/">
              Pages
            </Link>
            <Typography>Products</Typography>
          </Breadcrumbs>
        </Grid>
        <Grid>
          <div>
            <NextLink href="/products/create" passHref>
              <Button variant="contained" color="primary">
                <AddIcon />
                New Product
              </Button>
            </NextLink>
          </div>
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

export default Products;