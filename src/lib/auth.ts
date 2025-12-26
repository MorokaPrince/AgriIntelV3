// Simplified auth configuration for AgriIntel V3
// This is a demo implementation for development purposes

import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [
    {
      id: 'credentials',
      name: 'Credentials',
      type: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials: { email?: string; password?: string } | undefined) {
        // Demo authentication - accepts any credentials for now
        if (credentials?.email && credentials?.password) {
          return {
            id: '1',
            email: credentials.email,
            name: 'Demo User',
            role: 'admin',
            tenantId: 'demo-farm',
            country: 'ZA',
            farmName: 'Demo Farm'
          };
        }
        return null;
      }
    }
  ],
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.country = user.country;
        token.farmName = user.farmName;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub || '';
        session.user.role = token.role || 'viewer';
        session.user.tenantId = token.tenantId || 'demo-farm';
        session.user.country = token.country || 'ZA';
        session.user.farmName = token.farmName || 'Demo Farm';
      }
      return session;
    },
  },
};

// Export NextAuth handlers
export const { handlers, auth, signIn, signOut } = NextAuth(authOptions);

// Extended user type for NextAuth
declare module 'next-auth' {
  interface User {
    role: string;
    tenantId: string;
    country: string;
    farmName: string;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      tenantId: string;
      country: string;
      farmName: string;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: string;
    tenantId: string;
    country: string;
    farmName: string;
  }
}