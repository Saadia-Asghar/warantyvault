# Vercel environment variables — copy this checklist

Open **Vercel → your project → Settings → Environment Variables**.  
Add each variable for **Production** (and **Preview** if you want preview deploys to work).

---

## Required (3)

| Variable | What to paste | Notes |
|----------|---------------|--------|
| `DATABASE_URL` | Pooled PostgreSQL URL | Supabase: **Transaction** pooler, port **6543**, add `?pgbouncer=true` at the end |
| `DIRECT_URL` | Direct PostgreSQL URL | Supabase: **Session** mode, port **5432** (no `pgbouncer` param). Used only at build time for migrations |
| `AUTH_SECRET` | Random 32+ character string | Generate: `openssl rand -base64 32` or any long random password |
| `NEXT_PUBLIC_APP_URL` | `https://YOUR-APP.vercel.app` | Your live Vercel URL, **no trailing slash** |

---

## Recommended for email (3)

| Variable | What to paste | Notes |
|----------|---------------|--------|
| `RESEND_API_KEY` | `re_xxxxxxxx` | From [resend.com](https://resend.com) → API Keys |
| `EMAIL_FROM` | `WarrantyVault PK <noreply@yourdomain.com>` | Must be a verified sender/domain in Resend |
| `ADMIN_EMAIL` | `you@email.com` | Receives complaint notifications |

---

## Where to get database URLs

### Supabase (you have project `gdmciybkdiuomowvpjyn`)

1. [supabase.com/dashboard](https://supabase.com/dashboard) → your project  
2. **Project Settings** → **Database** → **Connection string**  
3. Copy **URI** twice:
   - **Transaction pooler** → `DATABASE_URL` (port 6543, add `?pgbouncer=true`)
   - **Session pooler** or **Direct** → `DIRECT_URL` (port 5432)

Replace `[YOUR-PASSWORD]` with your database password from the same page.

**Direct connection (works for local dev — use for both vars):**
```
postgresql://postgres:[YOUR-PASSWORD]@db.gdmciybkdiuomowvpjyn.supabase.co:5432/postgres
```

**On Vercel (recommended):**
- `DATABASE_URL` → **Transaction pooler** (port 6543, `?pgbouncer=true`)
- `DIRECT_URL` → **Session** or direct (port 5432)

### Neon

1. [neon.tech](https://neon.tech) → project → **Connect**  
2. **Pooled** → `DATABASE_URL`  
3. **Direct** → `DIRECT_URL`

### Vercel Postgres

Vercel may auto-add `POSTGRES_URL` — map it to `DATABASE_URL` and `POSTGRES_URL_NON_POOLING` to `DIRECT_URL`.

---

## Deploy order

1. Add all **required** env vars in Vercel **before** first deploy  
2. Deploy (build runs `prisma migrate deploy` automatically)  
3. Seed demo data once from your PC:

```powershell
cd warrantyvault-pk
$env:DATABASE_URL="your-direct-postgres-url"
$env:DIRECT_URL="your-direct-postgres-url"
npm run db:seed
```

4. Set `NEXT_PUBLIC_APP_URL` to your real Vercel URL → **Redeploy**

---

## Demo logins (after seed)

| Role | Login | Password |
|------|-------|----------|
| Brand | dollarsmobile@demo.pk | demo1234 |
| Shop G-6 | g6@dollars.demo.pk | demo1234 |
| Buyer | 03001234567 | demo1234 |
| Admin | admin@warrantyvault.pk | admin1234 |
