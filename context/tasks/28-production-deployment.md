# Prepare Production Deployment

## Goal

Deploy the Carbon Compass application to a production environment such as Vercel or another hosting provider. Configure environment variables, build pipelines, and databases to ensure the app runs reliably and securely in production.

## Implementation

1. **Select a Hosting Platform:** Use Vercel for a seamless Next.js deployment. Alternatively, configure a custom deployment pipeline with Docker on your preferred platform. This specification assumes Vercel.

2. **Set Environment Variables:** Configure production environment variables in the deployment dashboard (e.g., Vercel’s Settings > Environment Variables). Include:
   - `DATABASE_URL` pointing to a production PostgreSQL database.
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` for production keys.
   - `OPENAI_API_KEY` or `GEMINI_API_KEY`.
   - Any other secrets (e.g., Trigger.dev API keys, email service credentials).

3. **Prepare Database:** Provision a managed PostgreSQL database (e.g., Vercel Postgres, Supabase, Neon). Set up connection pooling if necessary. Run migrations and seed data using the following commands on the production database:

   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

   Use `prisma migrate deploy` instead of `dev` to apply migrations in production safely.

4. **Update `next.config.js`:** Configure the Next.js build for production, including enabling experimental features (if used), customizing image domains, and setting base paths if deploying to a subdirectory.

5. **Set Up Edge Middleware (Optional):** For advanced authentication or caching scenarios, implement Next.js Middleware functions (e.g., JWT validation) and test them locally before deploying.

6. **CI/CD Pipeline:** Connect your GitHub repository to Vercel. Set up automatic deployments on push to main. Enable preview deployments for pull requests. Use Vercel’s environment protection rules for stable releases.

7. **Monitoring and Logging:** Configure monitoring tools (e.g., Vercel Analytics, Sentry) to capture performance metrics, errors, and usage statistics. Set up alerts for critical failures.

8. **Domain and SSL:** If using a custom domain, add it to Vercel and configure DNS settings. Vercel will automatically provision SSL certificates.

## Check When Done

- The application is deployed to a production environment accessible via a custom or default domain.
- Environment variables are securely set in the hosting dashboard and not hard-coded in the repo.
- Database migrations and seeds have been applied to the production database.
- The build passes and the site renders correctly, with authentication, carbon calculations, and AI features working as expected.
- Monitoring and logging tools are in place, and deployment steps are documented in `progress-tracker.md` and `architecture-context.md`.
