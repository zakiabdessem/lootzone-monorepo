import React from "react";
import styled from "@emotion/styled";
import NextLink from "next/link";
import {
  Box,
  Breadcrumbs as MuiBreadcrumbs,
  Divider as MuiDivider,
  Grid,
  Link,
  Typography as MuiTypography,
} from "@mui/material";
import { spacing } from "@mui/system";

import Code from "@/components/Code";

const Divider = styled(MuiDivider)(spacing);
const Breadcrumbs = styled(MuiBreadcrumbs)(spacing);
const Typography = styled(MuiTypography)(spacing);

function Introduction() {
  return (
    <Box mb={10}>
      <Typography variant="h3" gutterBottom>
        Introduction
      </Typography>
      <Typography variant="subtitle1" gutterBottom my={4}>
        In Next.js 13 and up, the App Router introduces a new way to handle
        routing using a file-based routing system. Instead of creating routes
        through the <code>pages</code> directory, routes are now defined using
        the <code>app</code> directory. Each folder within the <code>app</code>{" "}
        directory corresponds to a route segment, allowing for more powerful and
        flexible routing configurations.
      </Typography>
    </Box>
  );
}

function LayoutRoutes() {
  return (
    <Box mb={10}>
      <Typography variant="h3" gutterBottom>
        Layout Routes
      </Typography>
      <Typography variant="subtitle1" gutterBottom my={4}>
        With the App Router, you can define layouts that are shared across
        multiple routes. This is done using special files like{" "}
        <code>layout.js</code> and <code>error.js</code> within your route
        segments.
        <Code>
          {`// app/layout.js
import React from 'react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
`}
        </Code>
        <Code>
          {`// app/dashboard/layout.js
import React from 'react';
import RootLayout from '../layout';

export default function DashboardLayout({ children }) {
  return (
    <RootLayout>
      <div className="dashboard-layout">
        {children}
      </div>
    </RootLayout>
  );
}
`}
        </Code>
      </Typography>
    </Box>
  );
}

function NestedRoutes() {
  return (
    <Box mb={10}>
      <Typography variant="h3" gutterBottom>
        Nested Routes
      </Typography>
      <Typography variant="subtitle1" gutterBottom my={4}>
        The App Router supports deeply nested routes by organizing files into
        nested folders. Each folder can contain its own <code>page.js</code> and{" "}
        <code>layout.js</code> files.
        <Code>
          {`// app/blog/page.js
export default function BlogPage() {
  return <h1>Blog</h1>;
}

// app/blog/first-post/page.js
export default function FirstPostPage() {
  return <h1>First Post</h1>;
}
`}
        </Code>
      </Typography>
    </Box>
  );
}

function LinkingBetweenPages() {
  return (
    <Box mb={10}>
      <Typography variant="h3" gutterBottom>
        Linking Between Pages
      </Typography>
      <Typography variant="subtitle1" gutterBottom my={4}>
        You can navigate between pages using the <code>Link</code> component.
        The App Router uses <code>next/link</code> to handle client-side
        transitions.
        <Code>
          {`import Link from 'next/link';

export default function Home() {
  return (
    <ul>
      <li>
        <Link href="/">Home</Link>
      </li>
      <li>
        <Link href="/about">About Us</Link>
      </li>
      <li>
        <Link href="/blog/first-post">Blog Post</Link>
      </li>
    </ul>
  );
}
`}
        </Code>
      </Typography>
    </Box>
  );
}

function Routing() {
  return (
    <React.Fragment>
      <Grid container spacing={6} justifyContent="center">
        <Grid
          size={{
            xs: 12,
            lg: 9,
            xl: 7,
          }}
        >
          <Typography variant="h2" gutterBottom display="inline">
            Routing
          </Typography>

          <Breadcrumbs aria-label="Breadcrumb" mt={2}>
            <Link component={NextLink} href="/">
              Home
            </Link>
            <Link component={NextLink} href="/documentation">
              Documentation
            </Link>
            <Typography>Routing</Typography>
          </Breadcrumbs>

          <Divider my={6} />

          <Introduction />
          <LayoutRoutes />
          <NestedRoutes />
          <LinkingBetweenPages />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

export default Routing;
