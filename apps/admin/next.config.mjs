/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Admin is intentionally NOT a PWA (ARD §3.2.2).
  transpilePackages: ['@neviso/ui', '@neviso/errors', '@neviso/jalali'],
};

export default nextConfig;
