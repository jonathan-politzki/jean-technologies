/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        // Enable modern edge runtime
        runtime: 'experimental-edge',
    },
    // Disable user agent parsing in middleware
    skipMiddlewareUrlNormalize: true,
    skipTrailingSlashRedirect: true,
}

module.exports = nextConfig