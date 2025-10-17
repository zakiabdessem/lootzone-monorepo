import styled from "@emotion/styled";
import { spacing, SpacingProps } from "@mui/system";
import { Formik } from "formik";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import * as Yup from "yup";

import {
    Checkbox,
    FormControlLabel,
    Link,
    Alert as MuiAlert,
    Button as MuiButton,
    TextField as MuiTextField,
    Typography as MuiTypography,
} from "@mui/material";

import useAuth from "@/hooks/useAuth";

const Alert = styled(MuiAlert)(spacing);

const TextField = styled(MuiTextField)<{ my?: number }>(spacing);

interface ButtonProps extends SpacingProps {
  component?: React.ElementType;
  to?: string;
  target?: string;
}

const Button = styled(MuiButton)<ButtonProps>(spacing);

const Centered = styled(MuiTypography)`
  text-align: center;
`;

interface TypographyProps extends SpacingProps {
  as?: string;
}

const Typography = styled(MuiTypography)<TypographyProps>(spacing);

function SignIn() {
  const router = useRouter();
  const { signIn } = useAuth();

  return (
    <Formik
      initialValues={{
        email: "",
        password: "",
        submit: false,
      }}
      validationSchema={Yup.object().shape({
        email: Yup.string()
          .email("Must be a valid email")
          .max(255)
          .required("Email is required"),
        password: Yup.string().max(255).required("Password is required"),
      })}
      onSubmit={async (values, { setErrors, setStatus, setSubmitting }) => {
        console.log("🔍 [SIGN_IN] Form submitted with email:", values.email);
        try {
          console.log("🔍 [SIGN_IN] Calling signIn function...");
          await signIn(values.email, values.password);
          console.log("🔍 [SIGN_IN] Sign in successful, redirecting to dashboard...");
          router.push("/dashboard/analytics");
        } catch (error: any) {
          console.error("❌ [SIGN_IN] Sign in error:", error);
          const message = error.message || "Something went wrong";

          setStatus({ success: false });
          setErrors({ submit: message });
          setSubmitting(false);
        }
      }}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit,
        isSubmitting,
        touched,
        values,
      }) => (
        <form noValidate onSubmit={handleSubmit}>
          <Alert mt={3} mb={3} severity="info">
            Enter your admin credentials to access the dashboard
          </Alert>
          {errors.submit && (
            <Alert mt={2} mb={3} severity="warning">
              {errors.submit}
            </Alert>
          )}
          <TextField
            type="email"
            name="email"
            label="Email Address"
            value={values.email}
            error={Boolean(touched.email && errors.email)}
            fullWidth
            helperText={touched.email && errors.email}
            onBlur={handleBlur}
            onChange={handleChange}
            my={2}
          />
          <TextField
            type="password"
            name="password"
            label="Password"
            value={values.password}
            error={Boolean(touched.password && errors.password)}
            fullWidth
            helperText={touched.password && errors.password}
            onBlur={handleBlur}
            onChange={handleChange}
            my={2}
          />
          <Typography as="div" mb={2} variant="caption">
            <Link href="reset-password" component={NextLink}>
              Forgot password?
            </Link>
          </Typography>
          <FormControlLabel
            control={<Checkbox value="remember" color="primary" />}
            label="Remember me"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            mb={3}
          >
            Sign in
          </Button>
          <Centered>Need help? Contact your system administrator</Centered>
        </form>
      )}
    </Formik>
  );
}

export default SignIn;
