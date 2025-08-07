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
  }
}

module.exports = nextConfig
