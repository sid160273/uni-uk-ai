/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'plus.unsplash.com',
            },
            {
                protocol: 'https',
                hostname: 'images.pexels.com',
            },
        ],
    },
    async redirects() {
        return [
            {
                source: '/ads.txt',
                destination: 'https://srv.adstxtmanager.com/19390/uni-uk.ai',
                permanent: true,
            },
        ];
    },
};

export default nextConfig;
