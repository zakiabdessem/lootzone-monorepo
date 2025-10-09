module.exports = {
  
  typescript: {
    // Allow production builds to successfully complete even if there are type errors
    ignoreBuildErrors: true,
  },
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
  eslint: {
    // Ignore ESLint errors during builds
    ignoreDuringBuilds: true,
  },
  // Disable static generation for error pages to avoid React context issues
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  // Force dynamic rendering for all pages to avoid React context issues
  output: 'standalone',
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
    "@mui/material": {
      transform: "@mui/material//{{member}}",
    },
    "@mui/icons-material": {
      transform: "@mui/icons-material//{{member}}",
    },
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: [
        {
          loader: "@svgr/webpack",
          options: {
            svgoConfig: {
              plugins: [
                {
                  name: "removeViewBox",
                  active: false,
                },
              ],
            },
          },
        },
      ],
    });

    return config;
  },
};
