# Admin role — what it handles

**Login:** `admin@warrantyvault.pk` / `admin1234`  
**URL:** `/admin` (after `/admin/auth`)

Admin is **platform oversight** — not for shopkeepers or customers day-to-day.

---

## What admin does

| Section | Purpose |
|---------|---------|
| **Platform overview** | Total warranties, shops, claims on the system |
| **Warranty search & revoke** | Find any warranty (active, **expired**, revoked) by customer name, product, brand, phone, or code. Revoke fraud. |
| **Complaints inbox** | Messages submitted at `/complaints` from the public |
| **Audit log** | Blockchain/registry events — export CSV |
| **Email log** | Outbound notification delivery status |
| **Fraud flags** | Duplicate IMEI / suspicious issuance alerts |
| **All metrics** | Counts: active, expired, pending, chain records, etc. |

---

## What admin does NOT do

| Task | Who handles it |
|------|----------------|
| Issue warranty to customer | **Shop** (`/shop/issue`) |
| Accept warranty in wallet | **Buyer** (`/buyer`) |
| Approve outlets | **Brand** (`/company`) |
| Verify QR at counter | **Shop** (`/shop/verify`) |
| Search own shop records | **Shop** (`/shop/records`) |
| Search network warranties | **Brand** (`/company/warranties`) |
| Chat with shop | **Buyer** (`/buyer/messages`) |

---

## Expired warranties

Expired warranties are **never deleted**. Status changes to `EXPIRED` automatically.

| Role | Where to find expired records |
|------|------------------------------|
| Buyer | Wallet → **Expired** tab |
| Shop | **Warranty records** (`/shop/records`) — filter Expired |
| Brand | **Warranties** (`/company/warranties`) — filter Expired |
| Admin | Search with status **Expired** |

Shop scenario: customer says “I have warranty” → shop searches name/phone → shows **issue and expiry dates** as proof.

---

## Friend testing guide

Share your Vercel URL and these logins:

| Friend plays | Login | Password |
|--------------|-------|----------|
| Customer | `03001234567` | `demo1234` |
| Shopkeeper | `g6@dollars.demo.pk` | `demo1234` |
| Brand HQ (optional) | `dollarsmobile@demo.pk` | `demo1234` |

**Test flow:**

1. Shop issues warranty to phone `03001234567`
2. Buyer logs in → Pending → Accept
3. Shop searches `/shop/records` by buyer name
4. Wait or manually set old `endDate` in DB to test expired search
5. Shop uses Verify to show expired status to “customer”

---

## Search tips

Search supports:

- Customer name (e.g. `Ahmed`)
- Product (e.g. `Samsung A54`)
- Brand (e.g. `Dollars Mobile`)
- Phone (`03001234567`)
- Warranty code (`WV-PK-…`)
- Month filter: `2024-06`, `06/2024`, `June 2024`
