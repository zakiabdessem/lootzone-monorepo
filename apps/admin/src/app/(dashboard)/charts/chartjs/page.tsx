"use client";

import React from "react";
import type { ReactElement } from "react";
import styled from "@emotion/styled";
import NextLink from "next/link";

import {
  Grid,
  Link,
  Breadcrumbs as MuiBreadcrumbs,
  Divider as MuiDivider,
  Typography,
} from "@mui/material";
import { spacing } from "@mui/system";

import LineChart from "@/components/pages/charts/chartjs/LineChart";
import BarChart from "@/components/pages/charts/chartjs/BarChart";
import DoughnutChart from "@/components/pages/charts/chartjs/DoughnutChart";
import PieChart from "@/components/pages/charts/chartjs/PieChart";
import RadarChart from "@/components/pages/charts/chartjs/RadarChart";
import PolarChart from "@/components/pages/charts/chartjs/PolarChart";

const Divider = styled(MuiDivider)(spacing);

const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);

function Chartjs() {
  return (
    <React.Fragment>
      <Typography variant="h3" gutterBottom display="inline">
        Chart.js
      </Typography>
      <Breadcrumbs aria-label="Breadcrumb" mt={2}>
        <Link component={NextLink} href="/">
          Dashboard
        </Link>
        <Link component={NextLink} href="/">
          Charts
        </Link>
        <Typography>Chart.js</Typography>
      </Breadcrumbs>
      <Divider my={6} />
      <Grid container spacing={6}>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <LineChart />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <BarChart />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <DoughnutChart />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <PieChart />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <RadarChart />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <PolarChart />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default Chartjs;
