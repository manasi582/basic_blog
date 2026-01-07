# Deploying to Vercel (monorepo)

This repository contains two parts:
- `my-blog` — frontend (React)
- `blog-backend` — serverless backend functions under `blog-backend/api/`

The provided `vercel.json` config maps `/api/*` to the backend functions and builds the frontend from `my-blog`.

Quick summary
- `vercel.json` builds all JS under `blog-backend/api/` with `@vercel/node` (serverless functions).
- `my-blog` is built using `@vercel/static-build`; the output directory is `build` (Create React App default).

Environment variables
1. In the Vercel dashboard, open your project and go to Settings → Environment Variables.
2. Add the following variables (exact names):
   - `DB_HOST`
   - `DB_USER`
   - `DB_PASSWORD`
   - `DB_NAME`
   - `PORT` (not required on Vercel; backend will use Vercel-assigned runtime port)
3. Add values for each environment (Preview and Production as needed).

Notes about MySQL on Vercel
- Serverless functions are short-lived. Use a serverless-friendly MySQL offering (PlanetScale, Amazon RDS with RDS Proxy, etc.) or a managed MySQL with a connection proxy to avoid exhausting connections.
- The code in `blog-backend/api/_db.js` uses a pooled `mysql2/promise` pool and reuses the pool across invocations to reduce overhead — still prefer a serverless-ready DB.

Deploy steps
1. Connect your GitHub repo in Vercel (New Project → Import Git Repository → select `manasi582/basic_blog`).
2. Vercel should detect the `vercel.json`. If it asks for Root Directory, leave it blank (root project). The `vercel.json` controls builds.
3. Add Environment Variables (see above).
4. Click Deploy. After the deploy completes, `/api/posts` will be served by the serverless functions and your frontend will be served at the project root.

Testing locally
- Install Vercel CLI: `npm i -g vercel`
- From repo root run: `vercel dev` (it will run both static build and serverless functions locally).
- For local env vars, create a `.env` at repo root or set them in your shell. The `.env` in `blog-backend/` is ignored by git — keep secrets local.

Troubleshooting
- If you see DB connection errors on deployment, check that your DB allows connections from Vercel or that you're using a serverless-friendly provider.
- If functions fail with too many connections, reduce `connectionLimit` in `api/_db.js` and/or switch to PlanetScale/RDS Proxy.
