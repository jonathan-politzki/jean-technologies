/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        serverActions: true
    },
    skipMiddlewareUrlNormalize: true,
    skipTrailingSlashRedirect: true,
    middleware: {
        skipUserAgent: true,
        skipMiddlewareUrlNormalize: true
    }
}

module.exports = nextConfig