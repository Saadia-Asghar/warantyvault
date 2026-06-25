# Public launch readiness — WarrantyVault PK

Senior review as of June 2026. Use this before pushing to production or demoing to judges/investors.

---

## Brand & copy (fixed in this pass)

| Element | Value |
|--------|--------|
| **Product name** | WarrantyVault PK |
| **Tagline** | Digital shop warranties for Pakistan |
| **Headline** | Your warranty card, on your phone. |
| **Subhead** | Buy at one outlet. Claim at any approved shop in the same brand network. Verify with QR — no paper to lose. |
| **Disclaimer** | Shop warranty registry — not official OEM or PTA device warranty. |
| **Theme** | Paper Trust — warm cream `#fdf9f5`, navy text `#2d3142`, terracotta accent `#d4715a` |

### Logo

- **Before:** `Logo` referenced `/logo.png` which did not exist (broken image).
- **Now:** Inline SVG shield + check (`LogoMark`) and matching `public/logo.svg` / `public/icon.svg` using theme colors.

---

## Role-based UX (what each user should see)

| Feature | Buyer | Shop | Brand | Admin | Public (logged out) |
|---------|:-----:|:----:|:-----:|:-----:|:-------------------:|
| Warranty wallet | ✓ | — | — | — | — |
| Nearby outlets map | ✓ | **✗** | **✗** | **✗** | ✓ |
| Issue warranty | — | ✓ | — | — | — |
| Verify QR | ✓ | ✓ | — | — | ✓ |
| Claims inbox | — | ✓ | — | — | — |
| Chat with shop/buyer | ✓ | ✓ | — | — | — |
| Approve outlets | — | — | ✓ | — | — |
| Network policies / fraud | — | — | ✓ | — | — |
| Complaints / revoke | — | — | — | ✓ | ✓ submit |

**Enforced:** `/nearby` redirects shop, brand, and admin to their dashboards (middleware + server page guard).

**Bottom nav:**

- Buyer: Wallet · Chat · **Map** · Scan · Profile
- Shop: Home · Chat · Issue · Claims · Verify (no Map)
- Brand: Outlets · Warranties · Policies · Insights

---

## Demo accounts (`npm run db:seed`)

| Role | Login | Password |
|------|-------|----------|
| Buyer | `03001234567` | `demo1234` |
| Shop G-6 | `g6@dollars.demo.pk` | `demo1234` |
| Shop I-8 | `i8@dollars.demo.pk` | `demo1234` |
| Shop Lahore | `lhr@dollars.demo.pk` | `demo1234` |
| Brand | `dollarsmobile@demo.pk` | `demo1234` |
| Admin | `admin@warrantyvault.pk` | `admin1234` |

Demo banner appears when logged in as any of the above.

**Suggested demo flow for judges:**

1. **Brand** — approve a pending outlet (if any).
2. **Shop G-6** — issue warranty to buyer phone `03001234567`.
3. **Buyer** — accept pending warranty, show QR, open Map, send chat message.
4. **Shop I-8** — verify QR, process a claim.
5. **Public** — `/verify` scan without login.

---

## What works today (beta-ready)

- Full warranty lifecycle: issue → accept → verify → claim → revoke
- Email (Resend), SMS/cron (Twilio + `CRON_SECRET` when configured)
- Brand: outlet approval, policies, fraud view, analytics
- Buyer wallet, reminders, profile, password reset
- Shop: issue, verify, claims, policy edit, messages
- Admin: complaints, warranty search/revoke
- GPS nearby map (Leaflet), shop geo in DB
- Real QR camera on `/verify`
- Buyer ↔ shop chat (polling)
- PWA manifest + service worker
- Rate limits, API caching, DB indexes

---

## Not integrated / before true public launch

### Must-do for production

- [ ] Set all Vercel env vars (`docs/VERCEL_ENV_VARS.md`): `DATABASE_URL`, `AUTH_SECRET`, `RESEND_API_KEY`, etc.
- [ ] Run `prisma migrate deploy` on production DB (Vercel build does this)
- [ ] Seed production **once** or use a separate prod seed policy
- [ ] Remove or gate demo credentials on landing if exposing to real users
- [ ] Custom domain + HTTPS (Vercel default is fine)
- [ ] Error monitoring (Sentry) — not wired

### Blockchain (optional for hackathon)

- [ ] Fund Polygon Amoy wallet, run `npm run setup:polygon`
- [ ] Set `POLYGON_RPC_URL`, `POLYGON_PRIVATE_KEY`, `WARRANTY_REGISTRY_ADDRESS` on Vercel
- Without these, hashes use DB audit registry (works for demo)

### Product gaps (market research backlog)

| Feature | Priority | Notes |
|---------|----------|-------|
| Urdu UI toggle | High for PK market | Not started |
| Warranty PDF export | High | Consumer court evidence |
| WhatsApp share card | Medium | Viral / shop marketing |
| Shop public badge `/outlet/{code}` | Medium | Trust at storefront |
| Firebase push notifications | Medium | Chat when app closed |
| WebSocket chat | Low | Currently 5–8s poll |
| PTA IMEI deeplink on buyer side | Low | Exists on shop issue only |
| 15-day legal notice PDF | Low | Compliance story |

### UX polish still open

- [ ] Onboarding copy could be role-aware (currently generic)
- [ ] `/about` still links nearby for everyone (OK for public)
- [ ] No admin mobile bottom nav (desktop-first is fine)
- [ ] Capacitor APK build is documented but not CI-built

---

## Security checklist

- [x] Role middleware on `/shop`, `/buyer`, `/company`, `/admin`
- [x] `/nearby` blocked for non-buyer sessions
- [x] JWT httpOnly cookies, bcrypt passwords
- [ ] Rotate `AUTH_SECRET` per environment
- [ ] Do not commit `.env` or Polygon private key
- [ ] Rate limits on auth APIs (verify in `src/lib/rate-limit.ts`)

---

## Deploy steps

```bash
git push origin master
# Vercel auto-deploys from vercel.json:
# prisma generate && prisma migrate deploy && next build
```

Post-deploy:

1. Hit `/api/health` (if exposed) or open home page
2. Log in as each demo role and confirm nav matches table above
3. Test issue → accept → verify on production URL

---

## Verdict

**Ready for hackathon / beta demo:** Yes, after Vercel env + DB seed.

**Ready for unrestricted public launch:** Not yet — add Urdu, PDF export, hide demo passwords, monitoring, and decide on Polygon mainnet vs registry-only.
