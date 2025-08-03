"use client";

import styled from "@emotion/styled";
import NextLink from "next/link";
import React from "react";

import {
    Add as AddIcon,
    Archive as ArchiveIcon,
    FilterList as FilterListIcon,
    RemoveRedEye as RemoveRedEyeIcon,
    Star as StarIcon,
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
} from "@mui/material";
import { orange } from "@mui/material/colors";
import { spacing } from "@mui/system";

const Divider = styled(MuiDivider)(spacing);

const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);

const Paper = styled(MuiPaper)(spacing);

const Spacer = styled.div`
  flex: 1 1 100%;
`;

const ToolbarTitle = styled.div`
  min-width: 150px;
`;

const Customer = styled.div`
  display: flex;
  align-items: center;
`;

const ImageWrapper = styled.div`
  width: 50px;
  height: 50px;
  padding: ${(props) => props.theme.spacing(1)};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Image = styled.img`
  max-width: 100%;
  max-height: 100%;
`;

const Rating = styled.div`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing(1)};
`;

const RatingIcon = styled(StarIcon)`
  color: ${() => orange[400]};
`;

function createData(
  id: string,
  name: string,
  variant: string,
  price: string,
  stock: number,
  category: string,
  rating: string,
  reviews: number,
  image: string
) {
  return { id, name, variant, price, stock, category, rating, reviews, image };
}

type RowType = {
  [key: string]: string | number;
  id: string;
  name: string;
  variant: string;
  price: string;
  stock: number;
  category: string;
  rating: string;
  reviews: number;
  image: string;
};
const rows: Array<RowType> = [
  createData(
    "1",
    "Apple iPad Pro",
    "Silver",
    "$ 1,399.00",
    48,
    "Tablets",
    "4.6",
    55,
    "/static/img/products/product-9.png"
  ),
  createData(
    "2",
    "Apple iPad Pro",
    "Space Gray",
    "$ 1,399.00",
    48,
    "Tablets",
    "4.3",
    25,
    "/static/img/products/product-8.png"
  ),
  createData(
    "3",
    "Apple iPhone 15 Pro Max",
    "Blue Titanium",
    "$ 1499.00",
    38,
    "Smartphones",
    "4.6",
    40,
    "/static/img/products/product-4.png"
  ),
  createData(
    "4",
    "Apple iPhone 15 Pro Max",
    "Natural Titanium",
    "$ 1499.00",
    30,
    "Smartphones",
    "4.8",
    50,
    "/static/img/products/product-3.png"
  ),
  createData(
    "5",
    "Apple iPhone 15 Pro Max",
    "White Titanium",
    "$ 1499.00",
    45,
    "Smartphones",
    "4.9",
    60,
    "/static/img/products/product-5.png"
  ),
  createData(
    "6",
    'Apple MacBook Pro 16"',
    "Silver",
    "$ 2,399.00",
    55,
    "Notebooks",
    "4.7",
    45,
    "/static/img/products/product-7.png"
  ),
  createData(
    "7",
    'Apple MacBook Pro 16"',
    "Space Black",
    "$ 2,399.00",
    50,
    "Notebooks",
    "4.4",
    30,
    "/static/img/products/product-6.png"
  ),
  createData(
    "8",
    "Apple Watch SE",
    "Midnight",
    "$ 299.00",
    49,
    "Smartwatches",
    "4.7",
    40,
    "/static/img/products/product-11.png"
  ),
  createData(
    "9",
    "Apple Watch SE",
    "Silver",
    "$ 299.00",
    30,
    "Smartwatches",
    "4.7",
    40,
    "/static/img/products/product-12.png"
  ),
  createData(
    "10",
    "Apple Watch SE",
    "Starlight",
    "$ 299.00",
    54,
    "Smartwatches",
    "4.5",
    35,
    "/static/img/products/product-10.png"
  ),
  createData(
    "11",
    "Apple Watch Series 9",
    "Midnight",
    "$ 349.00",
    42,
    "Smartwatches",
    "4.2",
    20,
    "/static/img/products/product-1.png"
  ),
  createData(
    "12",
    "Apple Watch Series 9",
    "Starlight",
    "$ 349.00",
    54,
    "Smartwatches",
    "4.5",
    35,
    "/static/img/products/product-2.png"
  ),
];

function descendingComparator(a: RowType, b: RowType, orderBy: string) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order: "desc" | "asc", orderBy: string) {
  return order === "desc"
    ? (a: RowType, b: RowType) => descendingComparator(a, b, orderBy)
    : (a: RowType, b: RowType) => -descendingComparator(a, b, orderBy);
}

function stableSort(
  array: Array<RowType>,
  comparator: (a: RowType, b: RowType) => number
) {
  const stabilizedThis = array.map((el: RowType, index: number) => ({
    el,
    index,
  }));
  stabilizedThis.sort((a, b) => {
    const order = comparator(a.el, b.el);
    if (order !== 0) return order;
    return a.index - b.index;
  });
  return stabilizedThis.map((element) => element.el);
}

type HeadCell = {
  id: string;
  alignment: "left" | "center" | "right" | "justify" | "inherit" | undefined;
  label: string;
  disablePadding?: boolean;
};
const headCells: Array<HeadCell> = [
  { id: "name", alignment: "left", label: "Item Name" },
  { id: "price", alignment: "right", label: "Price" },
  { id: "stock", alignment: "right", label: "Stock" },
  { id: "category", alignment: "left", label: "Category" },
  { id: "rating", alignment: "left", label: "Rating" },
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
  const [order, setOrder] = React.useState<"desc" | "asc">("asc");
  const [orderBy, setOrderBy] = React.useState("customer");
  const [selected, setSelected] = React.useState<Array<string>>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(6);

  const handleRequestSort = (event: any, property: string) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelecteds: Array<string> = rows.map((n: RowType) => n.id);
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
    setRowsPerPage(parseInt(event.target.value, 6));
    setPage(0);
  };

  const isSelected = (id: string) => selected.indexOf(id) !== -1;

  const emptyRows =
    rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

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
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row: RowType, index: number) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={`${row.id}-${index}`}
                      selected={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          inputProps={{ "aria-labelledby": labelId }}
                          onClick={(event) => handleClick(event, row.id)}
                        />
                      </TableCell>
                      <TableCell component="th" id={labelId} scope="row">
                        <Customer>
                          <ImageWrapper>
                            <Image src={row.image} alt={row.name} />
                          </ImageWrapper>
                          <Box ml={3}>
                            <Typography variant="body1">{row.name}</Typography>
                            <Typography variant="body1" color="textSecondary">
                              {row.variant}
                            </Typography>
                          </Box>
                        </Customer>
                      </TableCell>
                      <TableCell align="right">{row.price}</TableCell>
                      <TableCell align="right">{row.stock}</TableCell>
                      <TableCell align="left">{row.category}</TableCell>
                      <TableCell>
                        <Rating>
                          <RatingIcon />
                          <Typography variant="body1">{row.rating} </Typography>
                          <Typography variant="body1" color="textSecondary">
                            of {row.reviews} Reviews
                          </Typography>
                        </Rating>
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
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={7} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[6, 12, 18]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
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
