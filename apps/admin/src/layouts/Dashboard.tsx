"use client";

import styled from "@emotion/styled";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";

import {
  Box,
  CssBaseline,
  Container as MuiContainer,
  Paper as MuiPaper,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { spacing } from "@mui/system";

import Footer from "@/components/Footer";
import GlobalStyle from "@/components/GlobalStyle";
import AuthGuard from "@/components/guards/AuthGuard";
import Navbar from "@/components/navbar/Navbar";
import Settings from "@/components/Settings";
import dashboardItems from "@/components/sidebar/dashboardItems";
import Sidebar from "@/components/sidebar/Sidebar";

const drawerWidth = 258;

const Root = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Drawer = styled.div`
  ${(props) => props.theme.breakpoints.up("md")} {
    width: ${drawerWidth}px;
    flex-shrink: 0;
  }
`;

const AppContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  width: 0;
`;

const Paper = styled(MuiPaper)(spacing);

const Container = styled(MuiContainer)`
  height: 100%;
`;

const MainContent = styled(Paper)`
  flex: 1;
  background: ${(props) => props.theme.palette.background.default};

  @media all and (-ms-high-contrast: none), (-ms-high-contrast: active) {
    flex: none;
  }

  .MuiPaper-root .MuiPaper-root {
    box-shadow: none;
  }
`;

interface DashboardType {
  children?: React.ReactNode;
}

const DashboardApp: React.FC<DashboardType> = ({ children }) => {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Close mobile menu when navigation occurs
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const theme = useTheme();
  const isLgDown = useMediaQuery(theme.breakpoints.down("lg"));

  return (
    <AuthGuard>
      <Root>
        <CssBaseline />
        <GlobalStyle />
        <Drawer>
          <Box sx={{ display: { xs: "block", lg: "none" } }}>
            <Sidebar
              PaperProps={{ style: { width: drawerWidth } }}
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              items={dashboardItems}
            />
          </Box>
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <Sidebar
              PaperProps={{ style: { width: drawerWidth } }}
              items={dashboardItems}
            />
          </Box>
        </Drawer>
        <AppContent>
          <Navbar onDrawerToggle={handleDrawerToggle} />
          <MainContent p={isLgDown ? 5 : 12}>
            <Container maxWidth="xl">{children}</Container>
          </MainContent>
          <Footer />
        </AppContent>
        <Settings />
      </Root>
    </AuthGuard>
  );
};

export default DashboardApp;
