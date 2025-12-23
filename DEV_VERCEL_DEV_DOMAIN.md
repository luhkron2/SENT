# Add dev.yourapp.com to Vercel and Manual Deployment

This guide covers adding a development domain and performing a manual deployment for the dev environment.

Prerequisites
- Access to the Vercel account with permission to modify the project (senationaltruckrepair) and DNS control for dev.yourapp.com
- A Vercel project linked to the repository (the dev/vercel branch should be wired to preview deployments)

1) Add the domain in Vercel
- In Vercel, open the target project settings (the dev project or the main project if you’re using a single project).
- Go to Domains -> Add
- Enter `dev.yourapp.com` and continue.
- Note the DNS target provided by Vercel (e.g., a CNAME value like `<project>.vercel.app` or the vercel-dns alias).

2) Configure DNS
- Create a DNS record for `dev.yourapp.com`:
  - Type: CNAME
  - Value/Target: the value shown by Vercel during domain setup (e.g., `your-project.vercel.app`).
- If you’re using a root/apex domain instead of a subdomain, you may need A records per Vercel guidance; for a subdomain, a CNAME is typical.
- DNS propagation can take up to 24-48 hours, but often much faster.

3) Dev Environment Variables
- In Project Settings -> Environment Variables, ensure dev values are set:
  - `NEXTAUTH_URL` = `https://dev.yourapp.com`
  - `DATABASE_URL` (dev/test DB) and any other secrets should point to non-prod resources.
- If you rely on per-environment secrets, use Vercel Secrets or a separate secret store.

4) Manual Deployment (dev)
- From Vercel UI:
  - Go to Deployments
  - Click New Deployment
  - Choose the branch to deploy (select the `dev/vercel` branch or the branch configured for dev previews)
  - Deploy
- From CLI (optional):
  - Ensure you’re on the dev/vercel branch: `git checkout dev/vercel` and pull latest
  - Run `vercel` to create a preview deployment for that branch, or `vercel --prod` to push a production deployment (if you intend prod, which is likely not desired for dev)

5) Validation
- Open https://dev.yourapp.com in a browser and verify the app loads.
- Confirm admin/login flows work with dev NEXTAUTH_URL.
- Confirm that dev data is isolated from prod data.

6) Handoff and maintenance
- Document changes in the runbook and update any environment variable references.
- Regularly review domain DNS status and renewals as needed.
