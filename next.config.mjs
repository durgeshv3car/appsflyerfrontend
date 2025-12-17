/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true, // Faster minification
  output: 'standalone', // Optional: good for production deployments

  // Optional: customize the build output directory
  distDir: '.next',

  // Optional: fallback for missing pages (prevents some prerender issues)
  async redirects() {
    return [
      {
        source: '/old-path',
        destination: '/new-path',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

