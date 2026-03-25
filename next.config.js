/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['better-sqlite3'],
  },
  async redirects() {
    return [
      { source: "/fyeo", destination: "/flags", permanent: true },
      { source: "/fyeo/:path*", destination: "/:path*", permanent: true },
    ];
  },
};

module.exports = nextConfig;
