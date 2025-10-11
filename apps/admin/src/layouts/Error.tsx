"use client";

import React from "react";
import styled from "@emotion/styled";

import { CssBaseline } from "@mui/material";

import Settings from "@/components/Settings";
import GlobalStyle from "@/components/GlobalStyle";

interface ErrorType {
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

const Error: React.FC<ErrorType> = ({ children }) => {
  return (
    <Root>
      <CssBaseline />
      <GlobalStyle />
      {children}
    </Root>
  );
};

export default Error;
