import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    // Profile, child and verification photos are uploaded to Cloudinary by the backend.
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
}

export default nextConfig
