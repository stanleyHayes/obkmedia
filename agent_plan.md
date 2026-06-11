# OBK MEDIA — Build Plan

Photography marketing website with portfolio, contact form, admin dashboard, and backend API.
Source documents: `photography_website_specification.md` + `photography_website_client_information_request.pdf`.

## Brand Inputs (from client PDF)

- **Name**: OBK MEDIA — *The Master's Touch You Need*
- **Colors**: Wine `#5f053a`, Black `#000000` (avoid bright red, neon green, bright purple, pure yellow backgrounds)
- **Mood**: Luxury typography, emotional, premium
- **Location**: Abuakwa-Nkawie, Ghana — serving nationwide (SEO target: "Wedding Photography Kumasi")
- **Categories**: Wedding, Studio Portrait (extensible: Events, Funeral Coverage, Fashion, Real Estate)
- **Services**: Portrait Photography, Event Photography, Documentary Photography, Wedding Videography, Corporate Media Production, Social Media Photography
- **Pricing**: hidden behind enquiry; 50% non-refundable deposit policy
- **Contact**: Obkmedia30@gmail.com · 0546175921 (WhatsApp click-to-chat) · 24 hours
- **Socials**: TikTok @obkmedia, Facebook (Onboard Onboard), YouTube
- **Awards**: Best Video Director Award (Ghana Impact Makers & Professionals Awards), Youth Photographer Award (Ghana Youth Leaders Excellence Professionals Awards)
- **Testimonial**: Sarah & Michael — wedding clients, 5 stars
- **Portfolio layout**: carousel-forward, images watermarked, no downloads, no captions required

## Architecture

```
obkmedia/
├── frontend/   Vite + React 18 + TypeScript + MUI + React Router  (public site + admin SPA)
└── backend/    Express + TypeScript + Mongoose (MongoDB) + JWT + Cloudinary + Resend
```

- Frontend dev server proxies `/api` → backend (`http://localhost:5174`).
- Images: Cloudinary when configured, local `uploads/` disk fallback for dev.
- Email: Resend when configured, console-log fallback for dev.
- Seed script provisions admin user, categories, demo portfolios.

## Design Direction

Dark cinematic luxury: near-black canvas with a wine-tinted undertone, ivory text,
wine `#5f053a` accent (lifted to a rose tone for small text on dark), generous negative
space, editorial asymmetry. Display serif **Cormorant Garamond** + UI sans **Jost**.
Letter-spaced uppercase eyebrow labels, hairline rules, film-grain texture, slow
staggered reveals on scroll, hover states that feel like a lens pulling focus.

---

## Feature Checklist

### Phase 1 — Scaffolding
- [x] Frontend scaffold (Vite React-TS, MUI, router, fonts)
- [x] Backend scaffold (Express TS, Mongoose, env config)
- [x] Shared API types
- [x] Custom MUI theme (dark luxury, wine accent, typography scale)

### Phase 2 — Backend API
- [x] Models: Admin, PortfolioCategory, Portfolio, PortfolioImage, ContactMessage
- [x] Auth: login / logout / me (JWT httpOnly cookie, bcrypt hashing)
- [x] Public endpoints: portfolio list (filter/search), featured, by-slug (+related), categories, contact submit
- [x] Admin endpoints: portfolio CRUD, publish/feature toggles, image upload/reorder/update/delete, category CRUD, message inbox (list/read/status/delete), stats
- [x] Image uploads: multer → Cloudinary or local disk; type/size validation
- [x] Contact: validation, honeypot spam trap, rate limiting, email notification (Resend), DB persistence
- [x] Security: helmet, CORS allowlist, rate limits, sanitized errors, env secrets
- [x] Seed script: admin + categories + demo portfolios/images

### Phase 3 — Public Website
- [x] Navbar: transparent-over-hero → solid on scroll, mobile drawer
- [x] Hero: full-bleed image, headline "Capturing Moments That Live Beyond Time", CTAs (Book a Shoot / View Portfolio)
- [x] About: brand story, mission & vision, stats (4 years, nationwide), location
- [x] Services: 6 service cards, prices hidden behind enquiry CTA
- [x] Featured portfolio carousel (scroll-snap, wine progress rule)
- [x] Awards strip: two trophies + recognition quote
- [x] Testimonials: Sarah & Michael, 5-star
- [x] Contact section: full booking form + WhatsApp button + email/phone/socials
- [x] Footer: nav, contact, socials, copyright, legal links
- [x] Portfolio listing page: responsive grid, category filter, search, empty state
- [x] Portfolio detail page: cover, meta (date/location/client), gallery with lightbox (next/prev, keyboard), related projects, "Book a similar shoot" CTA
- [x] Contact form: validation, success/error states, honeypot
- [x] WhatsApp floating click-to-chat (233 54 617 5921)
- [x] Privacy Policy, Terms & Conditions, image copyright notice pages
- [x] Loading / empty / error states everywhere
- [x] Lazy-loaded images, watermark overlay on gallery images
- [x] SEO: per-page titles/meta/OG/Twitter via Seo component, robots.txt, sitemap.xml, LocalBusiness JSON-LD

### Phase 4 — Admin Dashboard
- [x] Login page (email + password)
- [x] Protected routes + auth context (session via /me)
- [x] Dashboard overview: counts (portfolios, published, messages, unread), recent messages
- [x] Portfolio list: status chips, feature/publish toggles, delete
- [x] Portfolio create/edit form: all fields, slug auto-generation, category select, cover upload
- [x] Gallery manager: multi-upload, reorder (up/down), alt text/caption edit, delete
- [x] Category management: CRUD, in-use protection
- [x] Message inbox: list w/ unread badges, detail view, mark read/unread, delete, search
- [x] Logout

### Phase 5 — QA & Delivery
- [x] TypeScript builds clean (frontend + backend)
- [x] Production build passes
- [x] Dev servers verified in browser
- [x] README with setup, env vars, seed instructions

### Phase 6 — Multi-user RBAC (added on request)
- [x] Permission catalog (11 granular permissions across portfolio/categories/messages/users/roles)
- [x] Role model + system roles: Owner, Manager, Editor, Viewer (Owner implicitly gets all permissions)
- [x] Custom role CRUD with permission matrix; system roles locked; in-use roles undeletable
- [x] Admin model: roleId, preferences (notifyOnContact, defaultLandingPage), lastLoginAt
- [x] requirePermission middleware; every admin API route guarded
- [x] User management: create/edit/deactivate/delete users, assign roles, admin password reset
- [x] Safety rails: no self-deactivate/self-delete; last active Owner protected from demotion/deactivation/deletion
- [x] Self-service: update profile (name/email), change password (verifies current), preferences
- [x] Preferences wired to behavior: inquiry email opt-in (email service), after-login landing page
- [x] Frontend: AuthContext.can(), RequirePermission route guard, permission-filtered nav,
      Users/Roles/Profile pages, action gating on portfolio/categories/messages/dashboard
- [x] Seed: system roles + Owner + demo Editor account
- [x] Multi-agent review (security / correctness / completeness) + browser verification

### Phase 7 — RBAC hardening (from multi-agent review) + UI polish
- [x] Privilege tiering: you can only assign roles / grant permissions you hold yourself
- [x] Owner-role assignment, self-role-change, and minting Owners blocked for non-Owners
- [x] Portfolio publish/feature stripped from generic create/update (requires portfolio.publish)
- [x] Stats endpoint gated per-permission; contact-message PII only for messages.view
- [x] Password reset blocked against higher-privileged users; tokenVersion invalidates old JWTs
- [x] Last-active-owner protected against concurrent demotion/deactivation/delete (post-write revalidation)
- [x] roles.view OR users.manage may list roles (fixes user-create for delegated admins)
- [x] Frontend: self-edit refreshes AuthContext; dialog state resets; landing-page permission fallback; field-aware duplicate errors
- [x] Admin sidebar: collapsible icon-rail ⇄ grouped nav with threaded sub-items (persisted), RBAC-filtered
- [x] Body font switched to Outfit (display titles stay Cormorant Garamond)
- [x] Footer redesigned (closing CTA, structured columns, oversized wordmark, back-to-top)

## Environment Variables (backend/.env)

| Var | Purpose | Default |
|---|---|---|
| `PORT` | API port | 5174 |
| `MONGODB_URI` | Mongo connection | mongodb://127.0.0.1:27017/obkmedia |
| `JWT_SECRET` | auth token signing | dev fallback |
| `CLIENT_ORIGIN` | CORS allowlist | http://localhost:5173 |
| `CLOUDINARY_*` | image hosting (optional) | local disk fallback |
| `RESEND_API_KEY` | email notifications (optional) | console fallback |
| `CONTACT_NOTIFY_EMAIL` | owner inbox | Obkmedia30@gmail.com |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | seeded admin login | set at seed time |
