import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
    // Disable image optimization to allow external image CDN to handle it
    unoptimized: false,
  },
  async redirects() {
    return [
      {
        source: '/universities/strathclyde',
        destination: '/universities/strath-ac-uk',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
