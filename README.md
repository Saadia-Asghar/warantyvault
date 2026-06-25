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
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `RESEND_API_KEY` | Email notifications (optional) |
| `EMAIL_FROM` | Verified sender in Resend |
| `ADMIN_EMAIL` | Admin / complaint notifications |

## Demo accounts (after seed)

| Role | Login | Password |
|------|-------|----------|
| Brand | dollarsmobile@demo.pk | demo1234 |
| Shop G-6 | g6@dollars.demo.pk | demo1234 |
| Shop I-8 | i8@dollars.demo.pk | demo1234 |
| Buyer | 03001234567 / ahmed@demo.pk | demo1234 |
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
| `npm run build` | Production build |
| `npm run db:setup` | Migrate + seed (first-time setup) |
| `npm run db:migrate` | Apply migrations |
| `npm run db:seed` | Load demo franchise data |
| `npm run db:reset` | Wipe + seed (destructive) |

## Hackathon

UBL National Innovation Hackathon 2026

> Paper gets lost. Your warranty shouldn't. Buy in G-6, claim in I-8 or Karachi — one brand, one proof.

Disclaimer: Shop warranty platform. Not official OEM or PTA warranty.
