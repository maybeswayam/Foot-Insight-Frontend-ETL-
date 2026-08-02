/** @type {import('next').NextConfig} */
const nextConfig = {
  // Archive JSON is read once per process and served with Cache-Control.
  // Keep images unoptimized — we use local/proxied <img> URLs extensively.
  images: {
    unoptimized: true,
  },
  // Compress API JSON responses
  compress: true,
}

export default nextConfig
