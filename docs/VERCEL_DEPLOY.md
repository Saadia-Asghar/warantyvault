# Deploy WarrantyVault PK on Vercel

## 1. Create a PostgreSQL database

Vercel **cannot** use SQLite. Pick one:

| Provider | Free tier | Notes |
|----------|-----------|--------|
| [Neon](https://neon.tech) | Yes | Easy, copy connection string |
| [Supabase](https://supabase.com) | Yes | Project → Settings → Database → URI |
| [Vercel Postgres](https://vercel.com/storage/postgres) | Yes | Auto-injects `DATABASE_URL` in Vercel |

Use the **pooled** connection string if offered (better for serverless).

## 2. Import repo on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import **https://github.com/Saadia-Asghar/warantyvault**
3. Framework: **Next.js** (auto-detected)
4. Root directory: `.` (repo root)

## 3. Environment variables

**Full copy-paste checklist:** [docs/VERCEL_ENV_VARS.md](VERCEL_ENV_VARS.md)

In **Project → Settings → Environment Variables**, add for **Production** (and Preview if needed):

| Name | Example | Required |
|------|---------|----------|
| `DATABASE_URL` | Pooled `postgresql://...?pgbouncer=true` (Supabase port 6543) | Yes |
| `DIRECT_URL` | Direct `postgresql://...` (Supabase port 5432) | Yes |
| `AUTH_SECRET` | output of `openssl rand -base64 32` | Yes |
| `NEXT_PUBLIC_APP_URL` | `https://warantyvault.vercel.app` | Yes |
| `RESEND_API_KEY` | `re_...` from Resend | Recommended |
| `EMAIL_FROM` | `WarrantyVault PK <noreply@yourdomain.com>` | Recommended |
| `ADMIN_EMAIL` | `you@email.com` | Recommended |

**Do not** commit `.env` to GitHub.

## 4. Deploy

Push to `master` or click **Deploy** on Vercel.

The build runs:

```bash
prisma generate && prisma migrate deploy && next build
```

This applies the database schema automatically on each deploy.

## 5. Seed demo data (once)

After the first successful deploy, from your machine:

```bash
# Set production DATABASE_URL locally (or use Neon SQL editor)
export DATABASE_URL="postgresql://..."
npm run db:seed
```

Or on Windows PowerShell:

```powershell
$env:DATABASE_URL="postgresql://..."
$env:DIRECT_URL="postgresql://..."
npm run db:seed
```

## 6. Update app URL after deploy

1. Copy your live URL from Vercel (e.g. `https://warantyvault.vercel.app`)
2. Set `NEXT_PUBLIC_APP_URL` to that exact URL
3. **Redeploy** so QR codes and password-reset emails use the correct domain

## 7. Custom domain (optional)

Vercel → Project → Domains → add your domain, then update `NEXT_PUBLIC_APP_URL` and redeploy.

## Demo logins (after seed)

| Role | Login | Password |
|------|-------|----------|
| Brand | dollarsmobile@demo.pk | demo1234 |
| Shop G-6 | g6@dollars.demo.pk | demo1234 |
| Buyer | 03001234567 | demo1234 |
| Admin | admin@warrantyvault.pk | admin1234 |

## Troubleshooting

- **Build fails on `migrate deploy`**: Ensure `DATABASE_URL` is set in Vercel before build.
- **Prisma client error**: `postinstall` runs `prisma generate`; check build logs.
- **Emails not sending**: Add `RESEND_API_KEY` and verify domain in Resend.
- **Login works locally but not on Vercel**: Re-run seed against production `DATABASE_URL`.
