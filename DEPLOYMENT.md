# Deployment

The app deploys as two pieces: the **API on Render** and the **frontend on Vercel**.
The Vercel site proxies `/api/*` and `/uploads/*` to the Render service
([frontend/vercel.json](frontend/vercel.json)), so the auth cookie stays
first-party and no extra CORS or cookie configuration is needed in the browser.

Deploy the API first — the frontend rewrites point at its URL.

## 1. API on Render

1. In Render, choose **New → Blueprint** and select this repository.
   [render.yaml](render.yaml) provisions the `obkmedia-api` web service
   (Node, root `backend/`, `npm ci && npm run build`, `npm start`,
   health check `/api/health`).
2. Fill in the prompted environment variables:
   - `MONGODB_URI` — a MongoDB Atlas connection string.
   - `CLIENT_ORIGIN` — the Vercel URL(s), comma-separated
     (e.g. `https://obkmedia.vercel.app`). You can set a placeholder now and
     update it after the Vercel deploy.
   - `ADMIN_EMAIL` / `ADMIN_PASSWORD` — bootstrap admin sign-in. Use a strong
     password; the first login forces a reset.
   - `CLOUDINARY_*` — strongly recommended. Without it, uploads fall back to
     Render's local disk, which is **ephemeral** — images disappear on every
     deploy or restart.
   - `RESEND_API_KEY`, `CONTACT_NOTIFY_EMAIL`, `CONTACT_FROM_EMAIL` — optional;
     without a key, emails are logged to the console instead of sent.
   - `JWT_SECRET` is generated automatically by the blueprint.
3. After the first deploy, confirm `https://obkmedia-api.onrender.com/api/health`
   responds.

If you rename the service, the URL changes — update both rewrite destinations
in [frontend/vercel.json](frontend/vercel.json) to match.

## 2. Frontend on Vercel

1. In Vercel, **Add New → Project**, import this repository.
2. Set **Root Directory** to `frontend`. Framework preset: **Vite**
   (auto-detected; build `npm run build`, output `dist`). No environment
   variables are needed — the API is reached through the rewrites.
3. Deploy, then set the Render `CLIENT_ORIGIN` env var to the deployed Vercel
   URL (and any custom domains) and let the API redeploy.

## 3. Smoke test

- Public site loads; portfolio grid and detail pages render.
- `/admin` sign-in works with the bootstrap credentials (a password reset is
  forced on first login), and the session survives a page refresh.
- Submit the contact form; the message appears under Admin → Messages.
- Upload a portfolio image and confirm it renders from Cloudinary.

## Notes

- Render's free tier spins the service down when idle — the first request
  after a quiet period takes ~30–60s while it cold-starts.
- The local-disk upload fallback (`backend/uploads/`) exists for development;
  production should always run with Cloudinary configured.
