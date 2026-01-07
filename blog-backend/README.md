# Blog Backend

Deployment options and instructions for Vercel (serverless) or external hosts.

Required environment variables (set these in Vercel project settings or your host):

- `DB_HOST`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `PORT` (not required on Vercel; set if deploying elsewhere)

Serverless on Vercel
- This folder contains serverless functions under `api/`:
  - `api/posts/index.js` — GET/POST for posts
  - `api/posts/[id].js` — GET/PUT/DELETE for a single post
  - `api/health.js` — health check

- The functions use a pooled `mysql2/promise` connection (`api/_db.js`) that reuses a pool across invocations to reduce connection overhead. For best results use a serverless-friendly MySQL provider (PlanetScale, RDS Proxy, etc.).

Recommended: Set env vars in Vercel Dashboard (Project → Settings → Environment Variables) and deploy. If you need persistent connections or a long-running server, deploy the original `server.js` to Render/Heroku and point the frontend to that URL.
