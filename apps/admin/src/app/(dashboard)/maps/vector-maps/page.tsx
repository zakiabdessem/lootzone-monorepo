"use client";

import React from "react";
import type { ReactElement } from "react";
import styled from "@emotion/styled";
import NextLink from "next/link";

import {
  Card,
  CardContent,
  Grid,
  Link,
  Breadcrumbs as MuiBreadcrumbs,
  Divider as MuiDivider,
  Typography,
} from "@mui/material";
import { spacing } from "@mui/system";

import World from "@/components/pages/maps/vector-maps/World";
import USA from "@/components/pages/maps/vector-maps/USA";

const Divider = styled(MuiDivider)(spacing);

const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);

function VectorMaps() {
  return (
    <React.Fragment>
      <Typography variant="h3" gutterBottom display="inline">
        Vector Maps
      </Typography>
      <Breadcrumbs aria-label="Breadcrumb" mt={2}>
        <Link component={NextLink} href="/">
          Dashboard
        </Link>
        <Link component={NextLink} href="/">
          Maps
        </Link>
        <Typography>Vector Maps</Typography>
      </Breadcrumbs>
      <Divider my={6} />
      <Grid container spacing={6}>
        <Grid size={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Jsvectormap
              </Typography>

              <Typography variant="body2">
                A JavaScript library for creating interactive maps.{" "}
                <Link href="https://github.com/kadoshms/react-jvectormap">
                  Documentation & map downloads
                </Link>
                .
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={6}>
          <World />
        </Grid>
        <Grid
          size={{
            xs: 12,
            lg: 6,
          }}
        >
          <USA />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default VectorMaps;
