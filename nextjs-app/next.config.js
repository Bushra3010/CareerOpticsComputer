/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: false,
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'http', hostname: 'localhost', port: '54321' },
      { protocol: 'https', hostname: '*' },
    ],
  },
};

export default nextConfig;
