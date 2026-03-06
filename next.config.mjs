/** @type {import('next').NextConfig} */
const nextConfig = {
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
