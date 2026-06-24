# OBK MEDIA — Website Testing & Improvement Toolkit

Live site: **https://obkmedia.vercel.app/**
(When `obkmedia.com` is connected, swap it into the links below.)

Most links are pre-filled with the site URL — just click and run. All tools are free.

> Tip: after **every deploy** that changes title/description/image, re-scrape the
> social tools below (Facebook + LinkedIn), or the old preview stays cached.

---

## ⭐ Run these first (highest impact)

- [ ] **opengraph.xyz** (all social previews at once incl. WhatsApp) → https://www.opengraph.xyz/url/https%3A%2F%2Fobkmedia.vercel.app
- [ ] **Facebook Sharing Debugger** (refreshes WhatsApp cache too) → https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Fobkmedia.vercel.app%2F
- [ ] **PageSpeed Insights** (performance + Core Web Vitals) → https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fobkmedia.vercel.app%2F
- [ ] **Google Rich Results Test** (validates your LocalBusiness structured data) → https://search.google.com/test/rich-results?url=https%3A%2F%2Fobkmedia.vercel.app%2F
- [ ] **Google Search Console** (verify site + submit sitemap) → https://search.google.com/search-console

---

## Social / link previews

| Tool | Link | What it checks |
|---|---|---|
| opengraph.xyz | https://www.opengraph.xyz/url/https%3A%2F%2Fobkmedia.vercel.app | FB, X, LinkedIn, Discord, Slack, WhatsApp — all at once |
| Facebook Sharing Debugger | https://developers.facebook.com/tools/debug/?q=https%3A%2F%2Fobkmedia.vercel.app%2F | OG tags; "Scrape Again" refreshes FB + WhatsApp cache |
| LinkedIn Post Inspector | https://www.linkedin.com/post-inspector/inspect/https://obkmedia.vercel.app/ | LinkedIn preview + cache refresh |
| metatags.io | https://metatags.io/ | Live preview; experiment with tag changes |
| Telegram | message **@WebpageBot** the URL | Refreshes Telegram's preview cache |
| Discord / Slack | paste the link in a DM / private channel | See the unfurl |

Notes: X (Twitter) retired its Card Validator — use opengraph.xyz for the X view.
WhatsApp has no official debugger; the Facebook one covers it.

---

## SEO

| Tool | Link | What it checks |
|---|---|---|
| Google Rich Results Test | https://search.google.com/test/rich-results?url=https%3A%2F%2Fobkmedia.vercel.app%2F | Structured data (JSON-LD) |
| Schema Markup Validator | https://validator.schema.org/ | Schema.org validity |
| Google Search Console | https://search.google.com/search-console | Indexing, sitemap, coverage, queries |
| Bing Webmaster Tools | https://www.bing.com/webmasters | Bing indexing + free SEO reports |
| Ahrefs Free Webmaster Tools | https://ahrefs.com/webmaster-tools | Site audit, backlinks (free tier) |

---

## Performance / Core Web Vitals

| Tool | Link | What it checks |
|---|---|---|
| PageSpeed Insights | https://pagespeed.web.dev/analysis?url=https%3A%2F%2Fobkmedia.vercel.app%2F | Lab + real-user CWV, mobile + desktop |
| WebPageTest | https://www.webpagetest.org/ | Detailed waterfall, multi-location |
| GTmetrix | https://gtmetrix.com/ | Performance grade + waterfall |
| Lighthouse | Chrome DevTools (F12 → Lighthouse) | Perf + SEO + a11y + best practices |
| Vercel Speed Insights / Analytics | Vercel dashboard → your project | Real-user performance (enable it, free) |

---

## Accessibility

| Tool | Link | What it checks |
|---|---|---|
| WAVE | https://wave.webaim.org/report#/https://obkmedia.vercel.app/ | Contrast, alt text, ARIA, structure |
| axe DevTools | browser extension (Chrome/Firefox) | Automated a11y issues |

---

## Security / HTTPS / headers

| Tool | Link | What it checks |
|---|---|---|
| securityheaders.com | https://securityheaders.com/?q=https%3A%2F%2Fobkmedia.vercel.app%2F&followRedirects=on | HTTP security headers grade |
| Mozilla Observatory | https://developer.mozilla.org/en-US/observatory/analyze?host=obkmedia.vercel.app | Security best-practices score |
| SSL Labs | https://www.ssllabs.com/ssltest/analyze.html?d=obkmedia.vercel.app | TLS/HTTPS configuration |

---

## Uptime / monitoring

| Tool | Link | Why |
|---|---|---|
| UptimeRobot | https://uptimerobot.com/ | Free uptime monitoring. The Render backend sleeps on the free tier (~30–60s cold start) — a monitor ping keeps it warmer and alerts you to outages. |

---

## Site-specific punch-list (OBK MEDIA)

- [ ] **Dead-domain references**: `sitemap.xml`, `robots.txt`, and `og:url`/canonical all point at `obkmedia.com` (not yet live). SEO tools + Search Console will flag these as unreachable until the domain is connected. Either connect `obkmedia.com` in Vercel, or temporarily switch these to `obkmedia.vercel.app`.
- [ ] **Connect the custom domain** in Vercel (Project → Settings → Domains) so you're not on `*.vercel.app`. Then flip the references above back to `obkmedia.com`.
- [ ] **Bundle size**: main JS chunk is ~740 KB — PageSpeed will flag it. Code-splitting the admin app would lift the public-site score.
- [ ] **Cold starts**: run perf tests twice (first hit wakes the Render API). UptimeRobot mitigates this.
- [ ] **Enable Vercel Web Analytics + Speed Insights** (free, real-user data).
- [ ] After connecting the domain, **submit the sitemap** in Google Search Console and request indexing.

---

## Audit results — 2026-06-24 (obkmedia.vercel.app)

**Working well**
- Homepage 200, ~1.0s, served from Vercel edge cache (HIT).
- HSTS security header present; HTTPS fine.
- `LocalBusiness` JSON-LD structured data present.
- OG share image (Cloudinary card) reachable; `/og-cover.jpg` + `/favicon.svg` serve 200.
- **Production data path works**: `/api/public/portfolio` via the Vercel→Render proxy returns all 4 collections.

**🔴 High — SEO blockers (dead domain)**
- `canonical` and `og:url` → `https://obkmedia.com/` (not live).
- `robots.txt` Sitemap line → `https://obkmedia.com/sitemap.xml` (not live).
- `sitemap.xml` → all 4 URLs are `obkmedia.com` (not live) — Google can't crawl them.
- Fix: connect `obkmedia.com` in Vercel, OR temporarily point all of these at `obkmedia.vercel.app`.

**🟠 Medium**
- Missing security headers: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy` (and no CSP). Add via `vercel.json` `headers` — quick win, raises securityheaders.com grade.
- Render backend **cold start ~22s** on first hit (free tier sleeps). Hurts first-load + risks crawler timeouts. Mitigate with UptimeRobot pings or a paid Render instance.

**🟡 Low / polish**
- `favicon.svg` is still the old generated mark — could swap to the real logo.
- Main JS bundle ~740 KB — code-split the admin app to lift the public score.

---

## Re-scrape reminder

Whenever you change page title / description / share image and redeploy:
1. Facebook Debugger → **Scrape Again**
2. LinkedIn Post Inspector → **Inspect**
3. Telegram → message **@WebpageBot**

Then social/WhatsApp previews everywhere pick up the new version.
