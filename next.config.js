/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: true,
  },
  env: {
    VERCEL_URL: process.env.VERCEL_URL,
  },
}

module.exports = nextConfig 