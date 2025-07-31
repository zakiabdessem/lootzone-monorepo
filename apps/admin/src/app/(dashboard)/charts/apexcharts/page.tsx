"use client";

import React, { useEffect } from "react";
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

import AreaChart from "@/components/pages/charts/apexcharts/AreaChart";
import BarChart from "@/components/pages/charts/apexcharts/BarChart";
import CandlestickChart from "@/components/pages/charts/apexcharts/CandlestickChart";
import ColumnChart from "@/components/pages/charts/apexcharts/ColumnChart";
import HeatmapChart from "@/components/pages/charts/apexcharts/HeatmapChart";
import LineChart from "@/components/pages/charts/apexcharts/LineChart";
import MixedChart from "@/components/pages/charts/apexcharts/MixedChart";
import PieChart from "@/components/pages/charts/apexcharts/PieChart";

const Divider = styled(MuiDivider)(spacing);

const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);

function ApexCharts() {
  useEffect(() => {
    setTimeout(() => {
      window.dispatchEvent(new Event("resize"));
    }, 100);
  }, []);

  return (
    <React.Fragment>
      <Typography variant="h3" gutterBottom display="inline">
        ApexCharts
      </Typography>
      <Breadcrumbs aria-label="Breadcrumb" mt={2}>
        <Link component={NextLink} href="/">
          Dashboard
        </Link>
        <Link component={NextLink} href="/">
          Charts
        </Link>
        <Typography>ApexCharts</Typography>
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
          <AreaChart />
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
          <ColumnChart />
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
          <HeatmapChart />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <MixedChart />
        </Grid>
        <Grid
          size={{
            xs: 12,
            md: 6,
          }}
        >
          <CandlestickChart />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default ApexCharts;
