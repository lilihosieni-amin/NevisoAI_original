/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Shared workspace packages ship TS/ESM source — let Next transpile them.
  transpilePackages: ['@neviso/ui', '@neviso/errors', '@neviso/jalali', '@neviso/phone'],
};

export default nextConfig;
