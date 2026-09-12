/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: ['@blacksentinel/shared'],
  experimental: {
    optimizePackageImports: ['lucide-react', '@xyflow/react'],
  },
};

module.exports = nextConfig;
