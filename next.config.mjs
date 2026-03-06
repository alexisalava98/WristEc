/** @type {import('next').NextConfig} */
const nextConfig = {
  // Disable client-side router cache for dynamic pages so navigating back
  // always hits the server instead of serving a stale RSC payload.
  experimental: {
    staleTimes: {
      dynamic: 0,
    },
  },
  images: {
    // Permitir imágenes de dominios externos comunes para relojes
    remotePatterns: [
      { protocol: 'https', hostname: '**.jomashop.com' },
      { protocol: 'https', hostname: '**.amazon.com' },
      { protocol: 'https', hostname: '**.ssl-images-amazon.com' },
      { protocol: 'https', hostname: '**' },
    ],
  },
}

export default nextConfig
