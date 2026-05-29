/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // @neviso/types ships compiled JS, but transpile it for safety in dev.
  transpilePackages: ['@neviso/types'],
  eslint: {
    // Lint is run explicitly in the gate; don't fail `next build` on lint.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
