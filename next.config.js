/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb'
        }
    },
    skipMiddlewareUrlNormalize: true,
    skipTrailingSlashRedirect: true,
    experimental: {
        runtime: 'edge',
        serverComponents: true
    }
}

module.exports = nextConfig