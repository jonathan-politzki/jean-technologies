/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  distDir: '.next',
  experimental: {
    outputFileTracingRoot: process.env.VERCEL ? undefined : __dirname,
  }
}

module.exports = nextConfig 