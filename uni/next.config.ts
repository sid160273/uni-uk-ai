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
      {
        protocol: 'https',
        hostname: '*.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
    // Disable image optimization to allow external image CDN to handle it
    unoptimized: false,
  },
  async redirects() {
    return [
      // Common university name variations to proper slugs
      {
        source: '/universities/strathclyde',
        destination: '/universities/strath-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/oxford',
        destination: '/universities/ox-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/cambridge',
        destination: '/universities/cam-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/edinburgh',
        destination: '/universities/ed-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/glasgow',
        destination: '/universities/gla-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/aberdeen',
        destination: '/universities/abdn-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/manchester',
        destination: '/universities/manchester-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/birmingham',
        destination: '/universities/bham-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/liverpool',
        destination: '/universities/liv-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/leeds',
        destination: '/universities/leeds-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/ucl',
        destination: '/universities/ucl-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/kcl',
        destination: '/universities/kcl-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/lse',
        destination: '/universities/lse-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/imperial',
        destination: '/universities/imperial-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/warwick',
        destination: '/universities/warwick-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/durham',
        destination: '/universities/dur-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/bristol',
        destination: '/universities/bris-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/nottingham',
        destination: '/universities/nottingham-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/southampton',
        destination: '/universities/soton-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/sheffield',
        destination: '/universities/shef-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/york',
        destination: '/universities/york-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/leicester',
        destination: '/universities/le-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/newcastle',
        destination: '/universities/ncl-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/exeter',
        destination: '/universities/exeter-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/sussex',
        destination: '/universities/sussex-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/loughborough',
        destination: '/universities/lboro-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/bath',
        destination: '/universities/bath-ac-uk',
        permanent: true,
      },
      {
        source: '/universities/stirling',
        destination: '/universities/stir-ac-uk',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
