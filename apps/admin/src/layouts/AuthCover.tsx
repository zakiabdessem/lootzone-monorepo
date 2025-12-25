"use client";

import React from "react";
import styled from "@emotion/styled";
import { CssBaseline, Grid, useMediaQuery, useTheme } from "@mui/material";

import Logo from "@/vendor/logo.svg";

import Settings from "@/components/Settings";
import GlobalStyle from "@/components/GlobalStyle";

// Logo is imported as StaticImageData at runtime, not a React component

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

const BrandWrapper = styled.div`
  position: absolute;
  bottom: 48px;
  left: 48px;
  
  img {
    width: 64px;
    height: 64px;
    filter: brightness(0) invert(1);
  }
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

  // #region agent log
  // Log Logo usage after fix
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7243/ingest/3d9fcd46-85e9-4fb7-88a8-afc7afe702e2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'AuthCover.tsx:61',message:'Using Logo as image data',data:{logoHasSrc:!!(Logo as any)?.src,logoSrc:(Logo as any)?.src},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'FIX'})}).catch(()=>{});
  }
  // #endregion

  const logoData = Logo as any;

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
              <BrandWrapper>
                {logoData?.src && <img src={logoData.src} alt="Logo" width={64} height={64} />}
              </BrandWrapper>
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
