# Open Dev Through Vercel

This runbook describes how to set up and operate a development (dev) deployment for the RepairTheTrucks app using Vercel. It covers prerequisites, branching, environment configuration, deployment flow, and how to promote changes to production.

Prerequisites
- Access to the Vercel account that owns the project and connected Git provider (GitHub/GitLab/Bitbucket).
- Node.js and npm installed locally (for vercel CLI if you wish to run locally).
- The repository is connected to a Vercel project (existing or to be created).
- Domain awareness: whether you’ll use a dedicated dev domain (e.g., dev.yourapp.com) or rely on Vercel Preview Deployments.

1) Branch Strategy
- Create a dedicated dev branch to route development work to a dev environment: 
  - Command: `git checkout -b dev/vercel` 
  - Push: `git push -u origin dev/vercel`
- For feature work, continue to create feature branches off `dev/vercel` or directly off `dev/vercel` as projects require.

2) Vercel Project Setup (one-time)
- In Vercel, ensure the project is connected to the repository and that Preview Deployments are enabled.
- If you want a separate dev domain, add it in Vercel (Settings > Domains) and configure DNS as needed (e.g., `dev.yourapp.com`).
- In Project Settings > Git, point the Dev/Preview branches to trigger preview deployments for every push to `dev/vercel` or feature branches.

3) Environment Variables (Per Environment)
- Production: NEXTAUTH_URL should point to your prod domain (e.g., `https://www.serepairs.com.au`).
- Development/Dev: Add a DEV/DEV-ENV domain (or use a Vercel Preview URL) for testing, and set NEXTAUTH_URL accordingly (e.g., `https://dev.yourapp.com` or the Preview URL like `https://your-project.vercel.app`).
- Secret management: Use Vercel Secrets or your existing secret store; map required secrets to each environment.

4) Deployment Flow
- Dev/Preview Deployments:
  - Push to `dev/vercel` (or open a PR against the dev branch) to create a development/preview deployment.
  - Access the preview URL provided by Vercel (per-branch URL like `https://your-project.vercel.app` or a domain you configured).
- Promote to Production:
  - Once changes pass QA, merge the dev branch into main/master or run a production deployment via the Vercel CLI (e.g., `vercel --prod` if pushing directly from CLI).

5) Local Dev with Vercel CLI
- Install: `npm i -g vercel` or use `npx vercel`.
- Run local dev: `vercel dev` (emulates serverless functions locally and serves the app).
- Access local dev on the port shown by the CLI, typically http://localhost:3000.

6) Observability and Security (Dev)
- Enable error monitoring in dev (Sentry, etc.) if used in code; avoid leaking secrets in logs.
- Validate access controls and ensure there’s no cross-environment data leakage.

7) Runbook Summary
- Create dev branch and push to trigger Vercel Preview Deployments.
- Configure a dev domain or rely on Vercel Preview URL for testing.
- Set environment variables per environment (dev vs prod).
- Use vercel dev for local testing; use vercel --prod to push to prod.

Next Steps
- If you want, I can tailor this runbook to your exact stack (Next.js version, auth setup, domain names) and add concrete config templates and a small automation script to bootstrap the dev environment from scratch.

Appendix: Dev Domain Reference
- Added domain: dev.yourapp.com
- See DEV_VERCEL_DEV_DOMAIN.md for domain setup details.
