import { TypographyVariantsOptions } from "@mui/material/styles";

const typography: TypographyVariantsOptions = {
  fontFamily: "var(--font-poppins), 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: 14,
  fontWeightLight: 300,
  fontWeightRegular: 400,
  fontWeightMedium: 500,
  fontWeightBold: 700,
  fontWeightExtraBold: 800,
  h1: {
    fontSize: "2rem",
    fontWeight: 700,
    lineHeight: 1.25,
  },
  h2: {
    fontSize: "1.75rem",
    fontWeight: 700,
    lineHeight: 1.25,
  },
  h3: {
    fontSize: "1.5rem",
    fontWeight: 600,
    lineHeight: 1.25,
  },
  h4: {
    fontSize: "1.125rem",
    fontWeight: 500,
    lineHeight: 1.25,
  },
  h5: {
    fontSize: "1.0625rem",
    fontWeight: 500,
    lineHeight: 1.25,
  },
  h6: {
    fontSize: "1rem",
    fontWeight: 500,
    lineHeight: 1.25,
  },
  body1: {
    fontSize: 14,
  },
  button: {
    textTransform: "none",
  },
};

export default typography;
