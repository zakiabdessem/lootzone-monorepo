"use client";

import React from "react";
import styled from "@emotion/styled";

import { CssBaseline, Paper } from "@mui/material";

import Logo from "@/vendor/logo.svg";

import Settings from "@/components/Settings";
import GlobalStyle from "@/components/GlobalStyle";
import GuestGuard from "@/components/guards/GuestGuard";

// Logo is imported as StaticImageData at runtime, not a React component
type LogoType = typeof Logo extends { src: string } ? typeof Logo : never;

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

const BrandWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 32px;
  
  img {
    width: 64px;
    height: 64px;
    filter: ${(props) => {
      // Convert theme primary color to filter for SVG coloring
      const color = props.theme.palette.primary.main;
      // This is a simplified approach - for exact color matching, 
      // we'd need to convert hex to CSS filter values
      return 'brightness(0) saturate(100%)';
    }};
  }
`;

const Wrapper = styled(Paper)`
  padding: ${(props) => props.theme.spacing(6)};

  ${(props) => props.theme.breakpoints.up("md")} {
    padding: ${(props) => props.theme.spacing(10)};
  }
`;

const Auth: React.FC<AuthType> = ({ children }) => {
  // #region agent log
  // Log Logo usage after fix
  if (typeof window !== 'undefined') {
    fetch('http://127.0.0.1:7243/ingest/3d9fcd46-85e9-4fb7-88a8-afc7afe702e2',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'Auth.tsx:52',message:'Using Logo as image data',data:{logoHasSrc:!!(Logo as any)?.src,logoSrc:(Logo as any)?.src},timestamp:Date.now(),sessionId:'debug-session',runId:'post-fix',hypothesisId:'FIX'})}).catch(()=>{});
  }
  // #endregion
  
  const logoData = Logo as any;
  
  return (
    <GuestGuard>
      <Root>
        <CssBaseline />
        <GlobalStyle />
        <BrandWrapper>
          {logoData?.src && <img src={logoData.src} alt="Logo" width={64} height={64} />}
        </BrandWrapper>
        <Wrapper>{children}</Wrapper>
        <Settings />
      </Root>
    </GuestGuard>
  );
};

export default Auth;
