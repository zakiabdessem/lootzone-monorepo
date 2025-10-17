"use client";

import React from "react";
import styled from "@emotion/styled";
import { CssBaseline, Grid, useMediaQuery, useTheme } from "@mui/material";

import Logo from "@/vendor/logo.svg";

import Settings from "@/components/Settings";
import GlobalStyle from "@/components/GlobalStyle";

interface AuthCoverType {
  children?: React.ReactNode;
}

const Root = styled.div`
  background: ${(props) => props.theme.palette.background.default};
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 100vh;
`;

const Brand = styled(Logo)`
  fill: ${(props) => props.theme.palette.common.white};
  width: 64px;
  height: 64px;
  position: absolute;
  bottom: 48px;
  left: 48px;
`;

const LeftSide = styled.div`
  background-image: url("/static/img/unsplash/unsplash-5.jpg");
  background-size: cover;
  background-position: center;
  border-radius: 20px;
  position: relative;
  height: calc(100% - ${(props) => props.theme.spacing(8)});
  width: calc(100% - ${(props) => props.theme.spacing(8)});
  margin: ${(props) => props.theme.spacing(4)};
`;

const RightSide = styled.div`
  padding: ${(props) => props.theme.spacing(4)};
  margin: 0 auto;
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;
  flex-direction: column;
  max-width: 480px;
`;

const AuthCover: React.FC<AuthCoverType> = ({ children }) => {
  const theme = useTheme();
  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));

  return (
    <Root>
      <CssBaseline />
      <GlobalStyle />
      <Grid container style={{ minHeight: "100vh", width: "100%" }}>
        {isLargeScreen && (
          <Grid
            size={{
              xs: 12,
              lg: 7,
            }}
          >
            <LeftSide>
              <Brand />
            </LeftSide>
          </Grid>
        )}
        <Grid
          size={{
            xs: 12,
            lg: 5,
          }}
        >
          <RightSide>
            {children}
            <Settings />
          </RightSide>
        </Grid>
      </Grid>
    </Root>
  );
};

export default AuthCover;
