# Mobile app (APK) + free deployment

WarrantyVault PK is a **Progressive Web App (PWA)** — installable on Android/iOS without an app store. You can also wrap it as an **APK** for sideloading or Play Store internal testing.

---

## Free hosting stack (recommended)

| Service | Free tier | Purpose |
|---------|-----------|---------|
| **[Vercel](https://vercel.com)** | Hobby | Next.js app, HTTPS, cron |
| **[Supabase](https://supabase.com)** | 500 MB DB | PostgreSQL |
| **[Resend](https://resend.com)** | 3k emails/mo | Notifications |
| **[Polygon Amoy](https://faucet.polygon.technology/)** | Testnet MATIC | Blockchain (optional) |

**Total cost for beta:** $0

### Deploy steps

1. Push repo to GitHub (done)
2. Vercel → Import project → set env vars from `docs/VERCEL_ENV_VARS.md`
3. Supabase → run migrations (`npm run db:migrate` locally with `DIRECT_URL`)
4. Seed once: `npm run db:seed`
5. Set `NEXT_PUBLIC_APP_URL` to your Vercel URL → redeploy

---

## Install as mobile app (no APK build)

### Android (Chrome)

1. Open your Vercel URL
2. Tap **Install** banner or menu → **Add to Home screen**
3. App opens full-screen like a native app

### iPhone (Safari)

Share → **Add to Home Screen**

The app includes `manifest.webmanifest`, service worker, and safe-area padding for notched phones.

---

## Build Android APK (optional)

### Option A — PWABuilder (easiest, free)

1. Deploy to Vercel first
2. Go to [pwabuilder.com](https://www.pwabuilder.com)
3. Enter your URL → **Package for stores** → **Android**
4. Download APK or AAB for Google Play

### Option B — Capacitor (developer)

```bash
cd warrantyvault-pk
npm install @capacitor/core @capacitor/cli @capacitor/android

# Edit capacitor.config.json — set server.url to your Vercel URL
npx cap init "WarrantyVault PK" pk.warrantyvault.app --web-dir=out
npx cap add android
npx cap open android
```

In Android Studio: **Build → Build APK(s)**

The WebView loads your live Vercel site — API, chat, and map all work without rebuilding for backend changes.

---

## New: buyer ↔ shop chat

| Role | Path |
|------|------|
| Buyer | `/buyer/messages` — start chat, shop replies |
| Shop | `/shop/messages` — inbox & reply |

- Real-time via **5s polling** (handles 200+ users on Supabase pooler)
- Push-style **in-app notifications** + email on new messages
- Link warranty to thread when messaging issuing shop

Public complaints (`/complaints`) still email admin; use **Chat** for shopkeeper dialogue.

---

## Accessibility features added

- 44px minimum tap targets on chat send
- `aria-live` on message list
- Screen reader labels on inputs
- Bottom nav with safe-area insets (iPhone home bar)
- Short warranty codes instead of 64-char hashes
- QR scan + image upload on `/verify`

---

## Features to add next (market-driven)

See `docs/MARKET_RESEARCH_PK.md`:

1. Urdu UI toggle
2. Warranty PDF for consumer court
3. PTA IMEI check integration
4. WhatsApp share card
5. Push notifications (Firebase) for chat when app closed

---

## Scale notes (200 beta users)

- Supabase **transaction pooler** on `DATABASE_URL`
- API rate limits on verify, nearby, chat
- 45s cache on nearby shops
- DB indexes on chat threads

Monitor: `GET /api/health`
