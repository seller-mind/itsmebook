/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'oaidalleapiprodscus.blob.core.windows.net',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'dashscope-result-bj.oss-cn-beijing.aliyuncs.com',
      },
      {
        protocol: 'https',
        hostname: 'dashscope-7c2c.oss-accelerate.aliyuncs.com',
      },
      {
        protocol: 'https',
        hostname: '**.oss-accelerate.aliyuncs.com',
      },
      {
        protocol: 'https',
        hostname: '**.oss-cn-beijing.aliyuncs.com',
      },
      {
        protocol: 'https',
        hostname: 'dashscope.aliyuncs.com',
      },
    ],
  },
};

module.exports = nextConfig;
