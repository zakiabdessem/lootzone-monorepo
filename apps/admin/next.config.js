/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Empty turbopack config to silence the error (Next.js 16 uses Turbopack by default)
  turbopack: {},
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
    tsconfigPath: "./tsconfig.json",
  },
  modularizeImports: {
    "@mui/material": {
      transform: "@mui/material//{{member}}",
    },
    "@mui/icons-material": {
      transform: "@mui/icons-material//{{member}}",
    },
  },
  webpack: (config, { isServer }) => {
    // SVG loader
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

    // Optimize memory usage for production builds
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Vendor chunk for node_modules
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            // Common chunk
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
        },
      };
    }

    return config;
  },
};

module.exports = nextConfig;
