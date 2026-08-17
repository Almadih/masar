import type { NextConfig } from 'next';
import dns from 'node:dns';

// Fix fetch ETIMEDOUT when Node.js attempts IPv6 resolution first on systems with inactive IPv6 routing
if (typeof dns !== 'undefined' && typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
