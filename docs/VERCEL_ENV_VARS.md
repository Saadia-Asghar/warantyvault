# Vercel environment variables

Copy values from **`.env.example`** in the project root (`warrantyvault-pk/.env.example`).

**Vercel → Project → Settings → Environment Variables** → add for **Production** (and **Preview** if needed).

---

## Required (app will not work without these)

| Vercel variable | Copy from `.env.example` | Purpose |
|-----------------|--------------------------|---------|
| `DATABASE_URL` | Lines 8–8 | PostgreSQL **pooled** URL (Supabase port **6543**, `?pgbouncer=true`) |
| `DIRECT_URL` | Lines 11–11 | PostgreSQL **direct** URL (port **5432**) — used by `prisma migrate deploy` on build |
| `AUTH_SECRET` | Lines 14–14 | JWT session signing — min **32 characters** |
| `NEXT_PUBLIC_APP_URL` | Lines 17–17 | Live URL e.g. `https://warantyvault.vercel.app` — **no trailing slash** |

**Read in code:** `src/lib/auth.ts`, `src/middleware.ts`, `prisma/schema.prisma` (via `DATABASE_URL` / `DIRECT_URL`)

---

## Recommended (production polish)

| Vercel variable | Copy from `.env.example` | Purpose |
|-----------------|--------------------------|---------|
| `NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS` | Lines 20–20 | Set **`false`** on production (hides demo passwords on auth pages) |
| `RESEND_API_KEY` | Lines 29–29 | Transactional email ([resend.com](https://resend.com)) |
| `EMAIL_FROM` | Lines 30–30 | Verified sender e.g. `ShopSeal PK <noreply@yourdomain.com>` |
| `ADMIN_EMAIL` | Lines 31–31 | Receives complaint form notifications |
| `CRON_SECRET` | Lines 40–40 | Secures `/api/cron/reminders` (see `vercel.json` cron) |

**Read in code:** `src/lib/email.ts`, `src/lib/demo.ts`, `src/app/api/cron/reminders/route.ts`

---

## Optional — SMS (shop notified on resale + warranty issue)

| Vercel variable | Copy from `.env.example` | Purpose |
|-----------------|--------------------------|---------|
| `TWILIO_ACCOUNT_SID` | Lines 34–34 | Twilio console |
| `TWILIO_AUTH_TOKEN` | Lines 35–35 | Twilio console |
| `TWILIO_PHONE_NUMBER` | Lines 36–36 | E.164 sender number |

**Read in code:** `src/lib/sms.ts`

Without Twilio, SMS is logged to the server console only.

---

## Optional — Web push notifications

| Vercel variable | Copy from `.env.example` | Purpose |
|-----------------|--------------------------|---------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Lines 23–23 | Generate: `npm run vapid:generate` |
| `VAPID_PRIVATE_KEY` | Lines 24–24 | Pair of above |
| `VAPID_SUBJECT` | Lines 25–25 | e.g. `mailto:admin@yourdomain.com` |

**Read in code:** `src/lib/push-notifications.ts`, `src/app/api/push/subscribe/route.ts`

---

## Optional — Polygon blockchain (demo / testnet)

| Vercel variable | Copy from `.env.example` | Purpose |
|-----------------|--------------------------|---------|
| `POLYGON_RPC_URL` | Line 47 | Amoy RPC |
| `POLYGON_PRIVATE_KEY` | Line 48 | Wallet with test MATIC |
| `WARRANTY_REGISTRY_CONTRACT` | Line 49 | Deployed contract |
| `NEXT_PUBLIC_WARRANTY_REGISTRY_CONTRACT` | Line 50 | Same address (client) |
| `NEXT_PUBLIC_CHAIN_ID` | Line 51 | `80002` for Amoy |
| `NEXT_PUBLIC_POLYGON_EXPLORER` | Line 52 | Polygonscan Amoy URL |

**Read in code:** `src/lib/polygon-chain.ts`, `src/lib/blockchain.ts`

If unset, app uses local SHA-256 audit registry (still works for pitch).

---

## Supabase URLs (project `gdmciybkdiuomowvpjyn`)

```
DATABASE_URL=postgresql://postgres.gdmciybkdiuomowvpjyn:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_URL=postgresql://postgres.gdmciybkdiuomowvpjyn:[PASSWORD]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres
```

Or run locally: `.\scripts\setup-supabase.ps1 -Password "your-password"` — writes `.env`.

---

## Deploy checklist

1. Add **all 4 required** vars in Vercel **before** deploy  
2. Push to GitHub → Vercel builds (`vercel.json` runs `prisma migrate deploy`)  
3. Seed demo data once (from your PC with `DATABASE_URL` / `DIRECT_URL` set):

```powershell
cd warrantyvault-pk
npm run db:seed
```

4. Set `NEXT_PUBLIC_APP_URL` to your real Vercel URL → **Redeploy**

---

## Local dev: unstyled / broken pages?

Stale `.next` cache. Run:

```powershell
npm run dev:fresh
```

Then open **http://localhost:3000** (not an old tab).
