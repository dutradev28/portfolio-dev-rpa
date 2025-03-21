/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '/portfolio-dev-rpa',
  images: {
    unoptimized: true
  },
  trailingSlash: true
};

export default nextConfig;
