import dns from 'node:dns';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { anonymous } from 'better-auth/plugins';
import { prisma } from './prisma';

// Ensure IPv4 is prioritized to avoid Google OAuth / external fetch ETIMEDOUT errors on systems with unresponsive IPv6
if (typeof dns !== 'undefined' && typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const baseURL = process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BETTER_AUTH_URL || 'http://localhost:3000';

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET || 'masar_secret_key_2026_super_secure',
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  plugins: [
    anonymous(),
  ],
  trustedOrigins: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  socialProviders: {
    google: {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'USER',
      },
    },
  },
  advanced: {
    useSecureCookies: false, // Allows OAuth cookies in local development over http://
  },
});
