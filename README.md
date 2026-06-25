# WarrantyVault PK

Digital shop warranty platform for Pakistani retail — immutable hashes, buyer wallet, shop portal, brand dealer networks.

**Live repo:** [github.com/Saadia-Asghar/warantyvault](https://github.com/Saadia-Asghar/warantyvault)

## Quick start (local)

1. Create a PostgreSQL database ([Neon](https://neon.tech) or [Supabase](https://supabase.com) free tier).
2. Copy env file and set credentials:

```bash
cd warrantyvault-pk
cp .env.example .env
# Edit .env: DATABASE_URL, DIRECT_URL, AUTH_SECRET (32+ chars)
```

**Supabase:** Project Settings → Database → copy **Transaction** URL → `DATABASE_URL`, **Session** URL → `DIRECT_URL`.

3. Install, migrate, and seed:

```bash
npm install
npm run db:setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy on Vercel

- Step-by-step: **[docs/VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md)**
- **Env var checklist:** **[docs/VERCEL_ENV_VARS.md](docs/VERCEL_ENV_VARS.md)** ← what to paste in Vercel

**Required Vercel env vars:**

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Pooled PostgreSQL (app queries) |
| `DIRECT_URL` | Direct PostgreSQL (migrations at build) |
| `AUTH_SECRET` | JWT signing secret (32+ characters) |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` | Web push for chat (run `npm run vapid:generate`) |
| `RESEND_API_KEY` | Email notifications (optional) |
| `EMAIL_FROM` | Verified sender in Resend |
| `ADMIN_EMAIL` | Admin / complaint notifications |
| `CRON_SECRET` | Secures `/api/cron/reminders` (Vercel daily job) |
| `TWILIO_*` | SMS on issue + expiry reminders (optional) |

## Brand & admin features

| Route | Purpose |
|-------|---------|
| `/company/warranties` | Browse network warranties, search, revoke, CSV export |
| `/company/fraud` | Fraud flags + open claims across outlets |
| `/nearby` | **Live map** — GPS, brand/city filters, OpenStreetMap |
| `/verify` | **QR scanner** (camera + image upload) or short code `WV-PK-…` |
| `/buyer/messages` | **Chat** with shopkeepers (complaints & support) |
| `/shop/records` | Search all warranties incl. expired · PDF proof |
| `/buyer/warranty/[id]` | Download PDF · WhatsApp share · PTA check |

**Mobile app:** Install from browser (PWA), download page **`/download`**, or build APK — see **[docs/MOBILE_APK_DEPLOY.md](docs/MOBILE_APK_DEPLOY.md)**

**Dev server error `Cannot find module './8948.js'`?** Run `npm run dev:clean` — see **[docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)**

**Competitors & market gap:** **[docs/COMPETITORS_PK.md](docs/COMPETITORS_PK.md)**
| `/company` | Reinstate suspended outlets |
| `/admin` | Complaint details, warranty search & revoke |

Shop: claim reject with reason, policy edit. Buyer: change password in profile. Daily expiry reminders (email + SMS) via Vercel cron.

## Beta launch checklist

1. **Database** — Supabase connected (`DATABASE_URL` + `DIRECT_URL`)
2. **Health** — `GET /api/health` returns `status: ok` and shop counts
3. **Polygon (real chain)** — fund wallet with [Amoy MATIC](https://faucet.polygon.technology/), run `npm run deploy:registry`, set `WARRANTY_REGISTRY_CONTRACT` in Vercel
4. **Nearby shops** — `/nearby` uses GPS + approved outlet coordinates
5. **Seed demo** — `npm run db:seed` on production DB once

Without Polygon env vars, warranties still work end-to-end using the local audit registry (clearly labeled in verify UI).

### Enable real Polygon (3 steps)

```bash
npm run setup:polygon   # generates wallet in .env if needed
# Fund deployer at https://faucet.polygon.technology/
npm run setup:polygon   # deploys contract when wallet has MATIC
```

Add the same vars to **Vercel**: `POLYGON_RPC_URL`, `POLYGON_PRIVATE_KEY`, `WARRANTY_REGISTRY_CONTRACT`, `NEXT_PUBLIC_WARRANTY_REGISTRY_CONTRACT`.

On `/verify`, users can **Connect MetaMask** (Polygon Amoy) to read the public contract.

**Market research & feature roadmap:** [docs/MARKET_RESEARCH_PK.md](docs/MARKET_RESEARCH_PK.md)

| Role | Login | Password |
|------|-------|----------|
| Brand | dollarsmobile@demo.pk | demo1234 |
| Shop G-6 | g6@dollars.demo.pk | demo1234 |
| Shop I-8 | i8@dollars.demo.pk | demo1234 |
| Buyer | ahmed@demo.pk | demo1234 |
| Admin | admin@warrantyvault.pk | admin1234 |

## Flows

1. **Brand** → Approve outlets (G-6, I-8, Karachi)
2. **Shop** → Issue warranty → buyer accepts in wallet
3. **Buyer** → QR + hash in wallet; claim at any approved outlet
4. **Shop** → Scan QR / verify hash → open & complete claim
5. **Public** → `/verify?hash=...` — no login

## Stack

- Next.js 14, TypeScript, Tailwind, Framer Motion
- Prisma + **PostgreSQL**
- JWT (httpOnly) + bcrypt
- SHA-256 warranty hashes + audit trail
- Resend email notifications
- Zod API validation

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Development server (checks env first) |
| `npm run dev:fresh` | Kill stale ports, clear cache, start dev (fixes 404) |
| `npm run dev:clean` | Clear `.next` cache then start dev (fixes module errors) |
| `npm run clean` | Delete stale `.next` build cache |
| `npm run build` | Production build |
| `npm run android:build` | Build APK (needs Android Studio + Java) |
| `npm run android:open` | Open project in Android Studio |
| `npm run db:setup` | Migrate + seed (first-time setup) |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Load demo franchise data |
| `npm run db:reset` | Wipe + seed (destructive) |

## Hackathon

UBL National Innovation Hackathon 2026

> Paper gets lost. Your warranty shouldn't. Buy in G-6, claim in I-8 or Karachi — one brand, one proof.

Disclaimer: Shop warranty platform. Not official OEM or PTA warranty.
