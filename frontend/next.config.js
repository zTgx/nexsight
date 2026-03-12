/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === 'production'

const nextConfig = {
  // Only use export mode in production
  ...(isProd && { output: 'export' }),
  // Use local .next for dev, Python package for production build
  distDir: isProd ? '../nexsight/webui/static' : '.next',
  images: {
    unoptimized: true,
  },
  // For development, proxy API requests to Python backend
  // Note: WebSocket cannot be proxied, handled in frontend code
  ...(process.env.NODE_ENV === 'development' && {
    async rewrites() {
      return [
        {
          source: '/api/:path*',
          destination: 'http://127.0.0.1:9988/api/:path*',
        },
      ]
    },
  }),
}

module.exports = nextConfig
