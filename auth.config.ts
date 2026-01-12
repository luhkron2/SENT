import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/access',
  },
  callbacks: {
    authorized() {
      // Always return true - we handle authorization in middleware.ts
      // This prevents NextAuth from redirecting to signIn page
      return true;
    },
  },
  providers: [], // Add providers in auth.ts
} satisfies NextAuthConfig;

