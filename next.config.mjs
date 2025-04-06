// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['images.unsplash.com'],
    },
    eslint: {
      // Warning instead of error during builds
      ignoreDuringBuilds: true,
    },
  };
  
  export default nextConfig;