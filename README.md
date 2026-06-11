# OBK MEDIA — Photography Website

*The Master's Touch You Need*

Luxury photography marketing website with a public portfolio, booking/contact form, and a
separate admin dashboard for managing portfolio items, gallery images, categories, and
contact messages.

Built from `photography_website_specification.md` and the client information request PDF.
Feature checklist: see [agent_plan.md](agent_plan.md).

## Stack

| Layer | Tech |
|---|---|
| Frontend | Vite · React 19 · TypeScript · MUI v9 · React Router 7 |
| Backend | Express 5 · TypeScript · Mongoose 9 (MongoDB) |
| Auth | JWT in httpOnly cookie · bcrypt password hashing |
| Images | Cloudinary (when configured) with local-disk dev fallback |
| Email | Resend (when configured) with console dev fallback |

The marketing site and the admin dashboard are fully separated: distinct route trees,
layouts, and component folders, with the admin app lazy-loaded as its own JS chunk so
public visitors never download dashboard code.

## Getting started

Prerequisites: Node 20+, MongoDB running locally (`brew services start mongodb-community`).

```bash
# 1. Backend
cd backend
cp .env.example .env          # adjust if needed
npm install
npm run seed                  # creates admin user, categories, demo portfolios
npm run dev                   # API on http://localhost:5174

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                   # site on http://localhost:5173
```

- Public site: <http://localhost:5173>
- Admin dashboard: <http://localhost:5173/admin>
- Seeded accounts (change via `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env`, then re-run `npm run seed`):
  - Owner: `Obkmedia30@gmail.com` / `obkmedia-admin`
  - Demo editor (restricted role — remove in production): `editor@obkmedia.com` / `obkmedia-editor`

## Multi-user RBAC

The dashboard supports multiple admin users with role-based access control:

- **Built-in roles** (non-editable): Owner (everything), Manager (content + inbox + view users/roles),
  Editor (prepare content, no publishing), Viewer (read-only). Custom roles can be created with any
  combination of the 11 granular permissions (`portfolio.view/manage/publish`, `categories.view/manage`,
  `messages.view/manage`, `users.view/manage`, `roles.view/manage`).
- **User management** (`/admin/users`): create users, assign roles, activate/deactivate, reset
  passwords, delete. Safety rails: you can't deactivate/delete yourself, and the last active Owner
  can't be demoted, deactivated, or deleted.
- **Role management** (`/admin/roles`): create/edit/delete custom roles with a grouped permission
  matrix; roles in use can't be deleted.
- **My profile** (`/admin/profile`): update name/email, change password (requires current password),
  and preferences — opt into email copies of new inquiries, choose your after-login landing page.
- Permissions are enforced on every API route (`requirePermission`) and mirrored in the UI: nav
  items, pages, and action buttons appear only for users whose role grants them.

## Environment variables (`backend/.env`)

| Variable | Purpose | Default |
|---|---|---|
| `PORT` | API port | `5174` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/obkmedia` |
| `JWT_SECRET` | Token signing secret — **change in production** | dev fallback |
| `CLIENT_ORIGIN` | Allowed CORS origins (comma-separated) | `http://localhost:5173` |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | Image hosting (optional) | local `uploads/` fallback |
| `RESEND_API_KEY` | Email notifications (optional) | console fallback |
| `CONTACT_NOTIFY_EMAIL` | Where inquiries are sent | `Obkmedia30@gmail.com` |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Seeded admin credentials | see above |

## API overview

Public: `GET /api/public/portfolio` (`?category=&search=`), `GET /api/public/portfolio/featured`,
`GET /api/public/portfolio/:slug`, `GET /api/public/categories`, `POST /api/public/contact`.

Admin (cookie auth, permission-guarded): auth (`login/logout/me` + self-service
`PATCH profile/password/preferences`), portfolio CRUD + `publish`/`feature` toggles,
gallery image upload/reorder/update/delete, category CRUD, contact-message inbox, `stats`,
`POST /api/admin/uploads/image` for cover uploads, user management
(`/api/admin/users` CRUD + per-user password reset), and role management
(`/api/admin/roles` CRUD + permission catalog).

Security: helmet, CORS allowlist, global + per-route rate limits, zod validation,
honeypot spam trap on the contact form, hashed passwords, sanitized production errors.

## Production build

```bash
cd backend && npm run build && npm start     # serves API from dist/
cd frontend && npm run build                 # static site in frontend/dist
```

Deploy the frontend `dist/` to any static host (Vercel, Netlify) with `/api` and
`/uploads` proxied/rewritten to the backend, or serve both behind one domain with nginx.

## Content still needed from the client

Real brand assets replace the placeholder imagery (currently picsum.photos seeds):

- Logo files (the favicon is a temporary lens mark)
- Hero image (`frontend/src/components/public/HeroSection.tsx`)
- About/profile image (`frontend/src/components/public/AboutSection.tsx`)
- Real portfolio projects + galleries (upload via the admin dashboard)
- Facebook profile URL (placeholder in `frontend/src/content.ts` — profile name "Onboard Onboard")
- Production domain — update `frontend/public/sitemap.xml`, `robots.txt`, and the JSON-LD in `frontend/index.html`
- Google Analytics measurement ID
