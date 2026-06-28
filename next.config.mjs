/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',           // Important for static export
  images: {
    unoptimized: true,        // Required for GitHub Pages
  },
  trailingSlash: true,
};

export default nextConfig;
