/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
    ],
    domains: ["img.freepik.com", "veterinaire-tour-hassan.com"],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.node/,
      use: "raw-loader",
    });
    
    // Comprehensive fix for all import issues
    config.resolve.alias = {
      ...config.resolve.alias,
      'react-dom/server': 'react-dom/server.browser',
      'unist-util-visit-parents/do-not-use-color': 'unist-util-visit-parents',
      canvas: false,
    };
    
    // Handle the problematic import with a more comprehensive rule
    config.module.rules.push({
      test: /node_modules\/unist-util-visit-parents\/.*\.js$/,
      use: {
        loader: 'string-replace-loader',
        options: {
          search: "require('unist-util-visit-parents/do-not-use-color')",
          replace: "require('unist-util-visit-parents')",
          flags: 'g'
        }
      }
    });
    
    // Additional rule for any file that might import the problematic module
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      include: /node_modules/,
      use: {
        loader: 'string-replace-loader',
        options: {
          search: "from 'unist-util-visit-parents/do-not-use-color'",
          replace: "from 'unist-util-visit-parents'",
          flags: 'g'
        }
      }
    });
    
    // Fix for PDF viewer canvas module issue
    config.resolve.fallback = {
      ...config.resolve.fallback,
      canvas: false,
      fs: false,
      path: false,
      crypto: false,
      stream: false,
      util: false,
    };
    
    // Handle PDF.js worker
    config.module.rules.push({
      test: /pdf\.worker\.min\.js$/,
      type: 'asset/resource',
    });
    
    return config;
  },
  serverExternalPackages: ['@sanity/client'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },

  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Bundle analyzer and optimization
  productionBrowserSourceMaps: false,
  
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb'
    },
    optimizeCss: true,
    scrollRestoration: true,
  },
  
  // Compression and caching
  compress: true,
  poweredByHeader: false,


  output: 'standalone', 

}

module.exports = nextConfig


// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://www.npmjs.com/package/@sentry/webpack-plugin#options

    org: "eric-dufitimana",
    project: "crc-platform",

    // Only print logs for uploading source maps in CI
    silent: !process.env.CI,

    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
    // This can increase your server load as well as your hosting bill.
    // Note: Check that the configured route will not match with your Next.js middleware, otherwise reporting of client-
    // side errors will fail.
    tunnelRoute: "/monitoring",

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,

    // Enables automatic instrumentation of Vercel Cron Monitors. (Does not yet work with App Router route handlers.)
    // See the following for more information:
    // https://docs.sentry.io/product/crons/
    // https://vercel.com/docs/cron-jobs
    automaticVercelMonitors: true,
  }
);
