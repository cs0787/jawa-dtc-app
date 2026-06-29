

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // For static export (important)
  images: {
    unoptimized: true,        // Required for Vercel + static export
  },
  trailingSlash: true,
};

export default nextConfig;
