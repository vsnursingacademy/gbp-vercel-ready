# GBP AI - Vercel-ready Repo (Edge Functions converted to Vercel API routes)

This repository is prepared so you can deploy everything to **Vercel** and **Supabase** without using any CLI locally.
- Next.js admin app
- Vercel Serverless API routes (converted from Supabase Edge Functions)
- Supabase SQL schema (use Supabase SQL editor)

Deploy steps:
1. Create Supabase project; run `supabase/schema.sql` and RPC SQL via Supabase SQL editor.
2. Create GitHub repo and upload this project (use GitHub web UI 'Upload files').
3. Import project in Vercel (connect GitHub) and set environment variables (see .env.example).
4. Deploy. API routes will be available at https://<your-vercel-domain>/api/<route>
5. Configure Google OAuth credentials (redirect URI -> https://<your-vercel-domain>/api/oauth-callback).
6. Add GitHub Actions secrets: PUBLISH_ENDPOINT (https://<your-vercel-domain>/api/publish_scheduled) and SCHEDULER_TOKEN.

Important: set SUPABASE_SERVICE_ROLE_KEY only in Vercel server environment variables (do not expose publicly).
