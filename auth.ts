import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { prisma } from '@/lib/db';
import { secureCompare } from '@/lib/utils';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { z } from 'zod';

const credentialsSchema = z.object({
  email: z.string().email().optional(),
  username: z.string().optional(),
  password: z.string().min(6),
});

const ACCESS_PASSWORDS: Record<Role, string> = {
  OPERATIONS: process.env.OPERATIONS_PASSWORD || 'SENATIONAL07',
  WORKSHOP: process.env.WORKSHOP_PASSWORD || 'SENATIONAL04',
  DRIVER: 'unused',
  ADMIN: process.env.ADMIN_PASSWORD || 'admin123',
};

async function getUserByRole(role: Role) {
  return prisma.user.findFirst({
    where: { role },
  });
}

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

        // Fast path: role-based shared passwords without needing email
        if (secureCompare(password, ACCESS_PASSWORDS.OPERATIONS)) {
          const user = await getUserByRole('OPERATIONS');
          if (user) {
            return {
              id: user.id,
              email: user.email ?? 'operations@serepairs.local',
              name: user.name ?? 'Operations',
              role: user.role,
            };
          }
        }

        if (secureCompare(password, ACCESS_PASSWORDS.WORKSHOP)) {
          const user = await getUserByRole('WORKSHOP');
          if (user) {
            return {
              id: user.id,
              email: user.email ?? 'workshop@serepairs.local',
              name: user.name ?? 'Workshop',
              role: user.role,
            };
          }
        }

        if (secureCompare(password, ACCESS_PASSWORDS.ADMIN)) {
          const user = await getUserByRole('ADMIN');
          if (user) {
            return {
              id: user.id,
              email: user.email ?? 'admin@serepairs.local',
              name: user.name ?? 'Admin',
              role: user.role,
            };
          }
        }

        // Find user by email or username
        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: email || '' },
              { username: username || '' },
            ],
          },
        });

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

