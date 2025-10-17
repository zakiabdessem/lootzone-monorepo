"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { Poppins } from "next/font/google";
import React from "react";
import { Provider } from "react-redux";

import { TRPCProvider } from "@/components/providers/TRPCProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import useTheme from "@/hooks/useTheme";
import { store } from "@/redux/store";
import createTheme from "@/theme";

import { AuthProvider } from "@/contexts/JWTContext";
// import { AuthProvider } from "@/contexts/FirebaseAuthContext";
// import { AuthProvider } from "@/contexts/Auth0Context";
// import { AuthProvider } from "@/contexts/CognitoContext";

// Global CSS imports
import "@/i18n";
import "@/vendor/perfect-scrollbar.css";
import "animate.css/animate.min.css";

// Initialize Chart.js
import "chart.js/auto";

const poppins = Poppins({
  subsets: ["latin"],
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700", "800"],
});

function RootLayout({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();

  return (
    <html lang="en">
      <body className={poppins.variable}>
        <TRPCProvider>
          <AppRouterCacheProvider>
            <Provider store={store}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <MuiThemeProvider theme={createTheme(theme)}>
                  <AuthProvider>{children}</AuthProvider>
                </MuiThemeProvider>
              </LocalizationProvider>
            </Provider>
          </AppRouterCacheProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}

const withThemeProvider = (Component: React.ComponentType<any>) => {
  const AppWithThemeProvider = (props: any) => {
    return (
      <ThemeProvider>
        <Component {...props} />
      </ThemeProvider>
    );
  };
  AppWithThemeProvider.displayName = "AppWithThemeProvider";
  return AppWithThemeProvider;
};

export default withThemeProvider(RootLayout);
