# WarrantyVault PK

Digital shop warranty platform for Pakistani retail — immutable hashes, buyer wallet, shop portal, brand dealer networks.

**Live repo:** [github.com/Saadia-Asghar/warantyvault](https://github.com/Saadia-Asghar/warantyvault)

## Quick start (local)

1. Create a free [Neon](https://neon.tech) PostgreSQL database and copy the connection string.
2. Copy env file and set secrets:

```bash
cd warrantyvault-pk
cp .env.example .env
# Edit .env: DATABASE_URL, AUTH_SECRET (32+ chars)
```

3. Install and run:

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy on Vercel

See **[docs/VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md)** for step-by-step instructions.

**Required Vercel env vars:**

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | JWT signing secret (32+ characters) |
| `NEXT_PUBLIC_APP_URL` | `https://your-app.vercel.app` |
| `RESEND_API_KEY` | Email notifications (optional but recommended) |
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
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run db:push` | Sync schema to database |
| `npm run db:seed` | Load demo franchise data |
| `npm run db:reset` | Wipe + seed (destructive) |

## Hackathon

UBL National Innovation Hackathon 2026

> Paper gets lost. Your warranty shouldn't. Buy in G-6, claim in I-8 or Karachi — one brand, one proof.

Disclaimer: Shop warranty platform. Not official OEM or PTA warranty.
