import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import connectDB from './mongodb';
import User from '@/models/User';

// Debug function to log authentication issues
function debugAuth(message: string, data?: unknown) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Auth Debug] ${message}`, data || '');
  }
}

// Enhanced error logging for debugging
function logAuthError(message: string, error: unknown, context?: string) {
  console.error(`[Auth Error] ${message}`, {
    error: error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error,
    context,
    timestamp: new Date().toISOString(),
    nextauthVersion: process.env.NEXTAUTH_VERSION || '4.24.11',
    nodeEnv: process.env.NODE_ENV,
    nextauthUrl: process.env.NEXTAUTH_URL,
  });
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        debugAuth('Authorize function called', {
          hasCredentials: !!credentials,
          hasEmail: !!credentials?.email,
          hasPassword: !!credentials?.password
        });

        if (!credentials?.email || !credentials?.password) {
          logAuthError('Missing credentials in authorize function', { email: !!credentials?.email, password: !!credentials?.password }, 'authorize-missing-credentials');
          throw new Error('Invalid credentials');
        }

        try {
          debugAuth('Connecting to database');
          await connectDB();

          debugAuth('Searching for user', { email: credentials.email.toLowerCase() });
          const user = await User.findOne({
            email: credentials.email.toLowerCase(),
            isActive: true,
          }).select('+password');

          if (!user) {
            logAuthError('User not found', { email: credentials.email }, 'authorize-user-not-found');
            throw new Error('Invalid credentials');
          }

          debugAuth('User found, validating password', { userId: user._id, email: user.email });
          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            logAuthError('Invalid password', { email: credentials.email }, 'authorize-invalid-password');
            throw new Error('Invalid credentials');
          }

          // Update last login
          user.lastLogin = new Date();
          await user.save();

          const userObject = {
            id: user._id.toString(),
            email: user.email,
            name: `${user.firstName} ${user.lastName}`,
            role: user.role,
            tenantId: user.tenantId,
            country: user.country,
            farmName: user.farmName,
          };

          debugAuth('Authentication successful, returning user object', {
            id: userObject.id,
            role: userObject.role,
            tenantId: userObject.tenantId
          });

          return userObject;
        } catch (error) {
          logAuthError('Authentication error in authorize function', error, 'authorize-catch');
          throw new Error('Authentication failed');
        }
      },
    }),
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
    signOut: '/auth/signout',
    error: '/auth/error',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      debugAuth('JWT callback called', {
        hasToken: !!token,
        hasUser: !!user,
        tokenType: typeof token,
        userType: typeof user
      });

      // Ensure token exists and has proper structure
      if (!token) {
        console.error('JWT callback: token is undefined');
        debugAuth('Creating fallback token due to undefined token');
        return {
          sub: '',
          role: 'viewer',
          tenantId: 'demo-farm',
          country: 'ZA',
          farmName: 'Demo Farm'
        };
      }

      // Log token structure before modification
      debugAuth('Token structure before modification', {
        keys: Object.keys(token || {}),
        hasCustom: !!token && 'custom' in token,
        tokenString: typeof token === 'string' ? token : 'not a string'
      });

      if (user) {
        debugAuth('Adding user properties to token', {
         role: user.role,
         tenantId: user.tenantId,
         userKeys: Object.keys(user || {})
       });
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.country = user.country;
        token.farmName = user.farmName;
      }

      // Log token structure after modification
      debugAuth('Token structure after modification', {
        keys: Object.keys(token || {}),
        hasCustom: !!token && 'custom' in token,
        tokenType: typeof token
      });

      return token;
    },
    async session({ session, token }) {
      debugAuth('Session callback called', {
        hasSession: !!session,
        hasToken: !!token,
        tokenType: typeof token,
        sessionType: typeof session
      });

      // Ensure token exists before accessing properties
      if (!token) {
        console.error('Session callback: token is undefined');
        logAuthError('Session callback received undefined token', token, 'session-callback');
        return session;
      }

      // Log token structure in session callback
      debugAuth('Session callback token structure', {
        keys: Object.keys(token || {}),
        hasSub: !!token.sub,
        hasCustom: !!token && 'custom' in token,
        tokenString: typeof token === 'string' ? token : 'not a string'
      });

      if (token && token.sub) {
        debugAuth('Setting session user properties', {
          sub: token.sub,
          role: token.role,
          tenantId: token.tenantId
        });

        session.user.id = token.sub;
        session.user.role = (token.role as string) || 'viewer';
        session.user.tenantId = (token.tenantId as string) || 'demo-farm';
        session.user.country = (token.country as string) || 'ZA';
        session.user.farmName = (token.farmName as string) || 'Demo Farm';
      } else {
        logAuthError('Session callback: token missing sub property', token, 'session-callback-missing-sub');
      }
      return session;
    },
  },
  events: {
    async signOut({ token }) {
      // Log sign out event
      console.log(`User ${token?.sub} signed out`);
    },
  },
};

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