/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  async redirects() {
    return [
      {
        source: '/business',
        destination: '/super',
        permanent: true,
      },
      {
        source: '/',
        destination: '/super',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;