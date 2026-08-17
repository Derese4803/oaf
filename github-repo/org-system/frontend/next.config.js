/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    // Hardcoded to the deployed backend. Override with BACKEND_URL env var
    // if you ever need to point at a different backend (e.g. local dev).
    const backend = process.env.BACKEND_URL || "https://org-system.netlify.app";
    return [
      {
        source: "/api/:path*",
        destination: `${backend}/api/:path*`,
      },
    ];
  },
};
module.exports = nextConfig;
