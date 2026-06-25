# WarrantyVault PK

Digital shop warranty platform for Pakistani retail — immutable hashes, buyer wallet, shop portal.

## Quick start

```bash
cd warrantyvault-pk
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo accounts

| Role | Login | Password |
|------|-------|----------|
| Shop | cityelectronics@demo.pk | demo1234 |
| Buyer | 03001234567 | demo1234 |
| Admin | admin@warrantyvault.pk | admin1234 |

## Flows

1. **Shop** → Issue warranty → registered on chain ledger
2. **Buyer** → Accept transfer → QR + hash in wallet
3. **Shop** → Verify hash → Open claim → Complete
4. **Public** → `/verify?hash=...` — no login

## Stack

- Next.js 14, TypeScript, Tailwind
- Prisma + SQLite
- JWT (httpOnly) + bcrypt
- SHA-256 warranty hashes + chain registry
- Zod API validation

## Scripts

- `npm run dev` — development server
- `npm run build` — production build
- `npm run db:seed` — reset demo data
- `npm run db:reset` — wipe + seed

## Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` — SQLite path
- `AUTH_SECRET` — min 32 characters
- `NEXT_PUBLIC_APP_URL` — app URL for QR links

## Hackathon

UBL National Innovation Hackathon 2026 — Form 2

Disclaimer: Shop warranty platform. Not official OEM or PTA warranty.
