// next.config.js
/** @type {import('next').NextConfig} */
module.exports = {
  typescript: { ignoreBuildErrors: true },
  env: { NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL },
  eslint: { ignoreDuringBuilds: true },
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  output: 'standalone',
  // Disable static generation completely to avoid React context issues
  experimental: {
    forceSwcTransforms: true,
  },
  transpilePackages: [
    "@fullcalendar/core",
    "@babel/preset-react",
    "@fullcalendar/common",
    "@fullcalendar/daygrid",
    "@fullcalendar/interaction",
    "@fullcalendar/react",
    "@mui/system",
    "@mui/material",
    "@mui/icons-material",
    "@mui/x-data-grid",
    "@mui/x-date-pickers",
    "@lootzone/trpc-shared",
  ],
  modularizeImports: {
    "@mui/material": { transform: "@mui/material/{{member}}" },         // fix double slash
    "@mui/icons-material": { transform: "@mui/icons-material/{{member}}" } // fix double slash
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [{
        loader: "@svgr/webpack",
        options: { svgoConfig: { plugins: [{ name: "removeViewBox", active: false }] } }
      }],
    });
    return config;
  },
};
