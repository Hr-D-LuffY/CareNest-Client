import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      // Profile, child and verification photos are uploaded to Cloudinary by the backend.
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      // People who sign in with Google keep their Google profile photo (User.profilePhoto).
      { protocol: 'https', hostname: 'lh3.googleusercontent.com' },
    ],
  },
}

export default nextConfig
