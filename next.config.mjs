import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // The Studio folder has its own Sanity install. The Next app must keep
    // using the root copies, or /studio pulls the nested studio install into the app build.
    config.resolve.modules = [
      path.join(root, 'node_modules'),
      ...(Array.isArray(config.resolve.modules) ? config.resolve.modules : ['node_modules']),
    ]
    if (isServer) {
      config.externals.push('@sanity/orderable-document-list')
    }
    return config
  },
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: true },
      { source: '/admin', destination: '/studio', permanent: false },
      { source: '/admin/:path*', destination: '/studio/:path*', permanent: false },
      { source: '/book', destination: '/shop', permanent: true },
    ]
  },
  compiler: {
    styledComponents: true,
  },
  serverExternalPackages: [
    'sanity',
    '@sanity/vision',
    '@sanity/orderable-document-list',
    'styled-components',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '/images/**',
      },
    ],
  },
}

export default nextConfig
