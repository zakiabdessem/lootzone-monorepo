"use client";

import React from "react";
import styled from "@emotion/styled";

import { CssBaseline, Paper } from "@mui/material";

import Logo from "@/vendor/logo.svg";

import Settings from "@/components/Settings";
import GlobalStyle from "@/components/GlobalStyle";
import GuestGuard from "@/components/guards/GuestGuard";

interface AuthType {
  children?: React.ReactNode;
}

const Root = styled.div`
  max-width: 520px;
  margin: 0 auto;
  justify-content: center;
  align-items: center;
  display: flex;
  min-height: 100%;
  flex-direction: column;
`;

const Brand = styled(Logo)`
  fill: ${(props) => props.theme.palette.primary.main};
  width: 64px;
  height: 64px;
  margin-bottom: 32px;
`;

const Wrapper = styled(Paper)`
  padding: ${(props) => props.theme.spacing(6)};

  ${(props) => props.theme.breakpoints.up("md")} {
    padding: ${(props) => props.theme.spacing(10)};
  }
`;

const Auth: React.FC<AuthType> = ({ children }) => {
  return (
    <GuestGuard>
      <Root>
        <CssBaseline />
        <GlobalStyle />
        <Brand />
        <Wrapper>{children}</Wrapper>
        <Settings />
      </Root>
    </GuestGuard>
  );
};

export default Auth;
