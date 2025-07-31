"use client";

import React from "react";

import { Typography } from "@mui/material";

import ResetPasswordComponent from "@/components/auth/ResetPassword";

function ResetPassword() {
  return (
    <React.Fragment>
      <Typography component="h1" variant="h3" align="center" gutterBottom>
        Reset Password
      </Typography>
      <Typography component="h2" variant="subtitle1" align="center">
        Enter your email to reset your password
      </Typography>

      <ResetPasswordComponent />
    </React.Fragment>
  );
}

export default ResetPassword;
