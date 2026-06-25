# WarrantyVault PK — Complete Google Stitch / Figma Design Brief

Use this document in **Google Stitch** to generate every screen. Generate **Screen 0 (Design System)** first, then each page referencing it.

---

## PART A — Master design system (paste FIRST into Stitch)

```
PROJECT: WarrantyVault PK
TYPE: B2B2C warranty registry for Pakistan — brands, shop outlets, customers
PLATFORM: Responsive web app (mobile-first, desktop 1280px max content)
QUALITY BAR: FAANG / Stripe / Linear level — NOT a generic AI fintech template

═══════════════════════════════════════════════════════════
AVOID (reject these patterns):
═══════════════════════════════════════════════════════════
- Purple-to-blue gradients on white (typical crypto/e-wallet slop)
- Generic "Inter + rounded cards + hero blob" AI aesthetic
- Glassmorphism overload, heavy backdrop blur (slow, dated)
- Neon gradients, crypto wallet vibes
- Stock illustration people, handshake clipart
- More than 2 accent colors fighting for attention

═══════════════════════════════════════════════════════════
USE (design language):
═══════════════════════════════════════════════════════════
THEME NAME: "Slate Trust" — calm, authoritative, Pakistan-ready

COLOR THEORY (60-30-10 rule):
- 60% neutrals: warm charcoal surfaces (not pure black)
- 30% content hierarchy: off-white text, muted labels
- 10% accent: ONE primary (emerald trust green), ONE semantic (amber warnings)

PALETTE:
- bg-deep:        #0C0F12   (page background)
- bg-surface:     #151A21   (cards, panels)
- bg-elevated:    #1C222B   (inputs, nested panels)
- border:         rgba(255,255,255,0.07)
- text-primary:   #E8EAED
- text-secondary: #8B939E
- text-tertiary:  #5C6570
- accent-primary: #059669   (emerald-600 — valid, trust, CTA)
- accent-hover:   #047857
- accent-muted:   rgba(5,150,105,0.12)
- warning:        #D97706   (amber — expiring, pending)
- danger:         #DC2626
- info:           #0E7490   (teal — links, secondary actions only)

TYPOGRAPHY (8px grid, modular scale 1.25):
- Display/UI: "Plus Jakarta Sans" — weights 400, 500, 600, 700
- Codes/hashes: "IBM Plex Mono" — 13px, letter-spacing 0.02em
- Scale: 12 / 14 / 16 / 20 / 24 / 32 / 40 px
- Line height: 1.5 body, 1.2 headings
- Urdu policy text: "Noto Nastaliq Urdu", RTL block, 14px

SPACING: 4, 8, 12, 16, 24, 32, 48, 64px only

RADIUS: sm 6px, md 10px, lg 14px — consistent, not pill-everything

ELEVATION: borders + subtle 1px inner highlight, NOT drop shadows everywhere
- Card: 1px border border-color, bg-surface, no blur

BUTTONS:
- Primary: solid emerald #059669, white text, hover #047857, min-height 44px
- Secondary: transparent, border border-color, text-primary
- Ghost: text only, hover bg-elevated
- NO gradient buttons

INPUTS:
- bg-elevated, border border-color, focus ring 2px emerald/40%
- Labels: 12px uppercase tracking 0.04em, text-secondary

BADGES (semantic, not decorative):
- Active/Available: emerald bg-muted + emerald text
- Pending: amber
- Expired: slate/gray
- Used/Fulfilled: blue-gray
- Revoked: red
- In claim: amber pulse dot optional

ICONS: Lucide-style, 20px default, stroke 1.5px, text-secondary unless semantic

NAVIGATION:
- Sticky top bar, bg-deep, border-bottom, height 56px
- Logo: shield icon in emerald square + "WarrantyVault PK"
- Role-based tabs center, logout right

ACCESSIBILITY:
- WCAG AA contrast on all text
- Touch targets min 44×44px mobile
- Focus visible on all interactive elements
- Status never color-only — always text label too

MOTION (subtle):
- Transitions 150ms ease
- Tab switch: fade 200ms
- No parallax, no floating animations

PAKISTAN CONTEXT:
- Cities: Islamabad sectors (G-6, I-8), Karachi Saddar, Lahore
- PKR currency, +92 phone format
- English UI primary; Urdu on policy/legal blocks only
```

---

## PART B — Screen-by-screen prompts

Copy each block into Stitch. Always end with: **"Use exact Slate Trust design system from Screen 0. Mobile-first. Export as Figma components."**

---

### Screen 1 — Landing `/`

```
[WarrantyVault PK — Landing — Slate Trust design system]

Hero:
- Eyebrow: "Nationwide dealer network warranties"
- H1: "Buy in G-6. Claim in I-8 or Karachi." — emphasize city names in emerald, not gradient
- Sub: Brands register outlets. One digital warranty. Valid at any approved store. No lost paper.
- CTAs: "Get started" (primary emerald), "Verify warranty" (secondary)

Three feature cards (horizontal on desktop):
1. "Brand approves outlets" — network icon
2. "Cross-city claims" — map pin icon
3. "Hash on registry" — QR icon

Demo credentials panel (mono font, subtle elevated card):
- Brand, Shop G-6, Shop I-8, Buyer logins

Footer: minimal, link Verify + About
No login in hero — "Get started" goes to role picker
```

---

### Screen 2 — Role picker `/get-started`

```
[Get started — Who are you? — Slate Trust]

Header: logo only
H1: "Who are you?"
Sub: Choose role before creating account — keeps permissions correct

Three equal cards (stack mobile, 3-col desktop):
1. BRAND / COMPANY — building icon
   "Register franchise network. Approve outlets nationwide."
   → Company auth

2. SHOP / OUTLET — store icon
   "Join a brand (G-6, I-8, Saddar). Issue network warranties."
   → Shop auth

3. CUSTOMER / BUYER — user icon
   "Wallet for all warranties. Claim at any approved outlet."
   → Buyer auth

Each card: subtle emerald border on hover, arrow icon bottom-right
Link back to home
```

---

### Screen 3 — Company auth `/company/auth`

```
[Company / Brand login & register — Slate Trust]

Centered auth card max-w-md
Tabs: Sign in | Register company

Register fields:
- Legal company name
- Brand name (customer-facing)
- Email, Password
- Phone, NTN (optional)

Login fields: Email, Password

Copy: "Register your dealer network. You approve every outlet before they can issue warranties."

Link: "← Back to role selection"
```

---

### Screen 4 — Company dashboard `/company`

```
[Brand HQ — Outlet network dashboard — Slate Trust]

Nav: Network | Logout

Header: Brand name e.g. "Dollar's Mobile Pakistan"
Stats row: Total outlets | Approved | Pending approval

Outlet list table/cards:
- Outlet name, city, sector (G-6, I-8), address
- Status badge: PENDING / APPROVED / REJECTED
- Outlet code mono e.g. ISB-G6-001
- Actions for pending: Approve (emerald) | Reject (ghost red)

Empty pending state: "All outlets reviewed"

Policy section hint: "Network policy templates apply to all approved outlets"
```

---

### Screen 5 — Shop auth `/shop/auth`

```
[Shop outlet auth — Slate Trust]

Same auth card pattern as company

Register fields:
- Email, Password
- Shop name, Owner name, Phone
- City, Sector (e.g. G-6), Full address
- Category dropdown
- Checkbox: "Apply to join a brand network"
- If checked: Brand dropdown (searchable list of companies)

Login: Email, Password

Copy: "Standalone shops keep local warranties. Network shops need brand approval."

Links: Back to roles | Buyer wallet
```

---

### Screen 6 — Shop dashboard `/shop`

```
[Shop dashboard — Slate Trust]

Nav: Dashboard | Issue | Verify | Logout

Header:
- Shop name
- Sub: "Dollar's Mobile · G-6, Islamabad"
- Badge: "Network outlet ISB-G6-001" if approved
- Or amber banner if PENDING: "Awaiting brand approval — cannot issue yet"

Primary CTA: "+ Issue warranty" (emerald, prominent)

Stats: Active | Pending transfer | Total issued

Recent warranties table:
Columns: Code (mono) | Product | Buyer | Expires | Status badge
Row tap → detail

Real-time indicator: small "Live" dot near header (optional)
```

---

### Screen 7 — Issue warranty `/shop/issue`

```
[Issue warranty form — Slate Trust]

Single column form, max-w-lg centered

Title: "Issue new warranty"
Note: "Terms lock at registration — cannot edit after"

Quick policy chips from templates

Fields:
- Product name, Category, Serial/IMEI
- Purchase amount PKR
- Duration: 3/6/12/24 months
- Policy type, Terms EN, Terms UR (RTL block)
- Buyer phone (+92), Buyer name

Submit: "Register & send to buyer"

Success state:
- Green check panel
- Warranty code WV-PK-2026-XXXX mono
- Hash truncated + copy button
- Buttons: Issue another | View dashboard

Blocked state if PENDING approval: red banner
```

---

### Screen 8 — Shop verify & claim `/shop/verify`

```
[Verify & claim — Slate Trust — CRITICAL SHOP FLOW]

Title: "Verify & claim"
Sub: "Scan buyer QR or paste hash. Network warranties valid at any approved outlet."

TOP: Camera QR scanner area
- Dashed frame when idle, live camera view when active
- Button: "Open camera scanner" / "Stop scanner"
- Fallback note if no camera

Hash input: monospace 64-char field + paste
Button: "Verify warranty"

Result states:
VALID (emerald panel):
- Product, code, policy, expiry
- Brand network name + "Cross-outlet claim OK" if network
- "Purchased at: G-6" if applicable

EXPIRED (amber), INVALID (red)

If valid → Issue description textarea → "Open claim"
Claim opened → status chips: In repair | Completed | Exchanged

Mobile: scanner full width above input
```

---

### Screen 9 — Buyer auth `/buyer/auth`

```
[Buyer wallet auth — Slate Trust — consumer-friendly tone]

Warmer copy than B2B screens but same visual system

Tabs: Sign in | Create account
Fields: Phone (+92), Name (register), Password

CTA: "Open my wallet"
Link: Back to roles

Sub: "All your warranties in one place — even if you move cities"
```

---

### Screen 10 — Buyer wallet `/buyer`

```
[Buyer wallet — Slate Trust — TAB-BASED SEGREGATION]

Header: "My Warranties" + Hello, {name}
Live refresh button top-right (sync icon)

REMINDER BANNERS (stack, max 4 visible):
- Red: expired
- Amber: expires in 7 days / 30 days
- Teal: past halfway point of warranty period
Each banner: bell icon + message + tap to warranty detail

TAB BAR (scrollable mobile):
[Available] [In claim] [Used] [Expired] [Pending]
Each tab shows count badge

Warranty cards per tab:
- Product name bold
- Shop · City · Expiry date
- Days remaining (emerald) if available
- Status badge: Available | Used | Expired | In claim
- Chevron right

Empty state per tab: shield icon + contextual message

Available = active, not expired, no fulfilled claim
Used = repair/exchange completed
In claim = open claim in progress
```

---

### Screen 11 — Buyer warranty detail `/buyer/warranty/[id]`

```
[Warranty detail card — Slate Trust]

Header: Product name, mono code, status badge

Network banner if brand warranty:
"Dollar's Mobile network — claim at any approved outlet"
Purchased at: G-6, Islamabad

If PENDING: amber accept panel + "Accept warranty" button

If ACTIVE:
- QR code (large, scannable, dark bg white modules)
- Policy type, start/end dates, days remaining progress bar
- Halfway marker on progress bar (visual reminder)
- Hash field + copy button (mono)
- Link: View on public registry

Policy block: English + Urdu RTL

Claim history timeline if any

Reminder chips at top if expiring soon
```

---

### Screen 12 — Public verify `/verify`

```
[Public warranty verification — no login — Slate Trust]

Minimal header, logo + home link

H1: "Verify warranty"
Hash input + Verify button (no camera — public page)

Result card:
- Large status icon: Valid / Expired / Invalid
- Product, code, policy, dates
- Shop name, purchase sector
- Brand name if network warranty
- "Registered on registry" badge with chain tx snippet

Neutral, trust-focused — like checking a certificate
```

---

### Screen 13 — Chain verify `/verify/chain`

```
[On-chain registry view — Slate Trust]

Technical but clean
Shows: warranty hash, tx history list (REGISTER, TRANSFER, CLAIM)
Mono font for hashes
Timeline layout
Back to verify link
```

---

### Screen 14 — Admin `/admin` + auth

```
[Platform admin — Slate Trust]

Stats grid: Shops, Warranties, Claims, Fraud flags, Chain records
Breakdown: Active, Expired, Pending

Fraud flags list: serial, reason, shop, date

Restricted feel — same theme, denser data tables
```

---

### Screen 15 — About `/about`

```
[Architecture & trust — Slate Trust]

Documentation style within app shell
Sections: How it works, Security, Three roles, Network model
Numbered flows
Stack badges: Next.js, Prisma, SHA-256, JWT
Back button
```

---

## PART C — Component library to export from Figma

Ask Stitch to also generate these as **reusable components**:

| Component | Variants |
|-----------|----------|
| Button | primary, secondary, ghost, loading, disabled |
| Input | text, password, phone, mono hash |
| Card | default, elevated, alert-success/warning/danger |
| Badge | active, pending, expired, used, revoked |
| NavBar | guest, shop, buyer, company, admin |
| WarrantyCard | available, used, expired, in-claim, pending |
| ReminderBanner | expired, 7-day, 30-day, halfway |
| QrScannerFrame | idle, scanning |
| StatCard | with icon + number + label |
| AuthCard | login/register tabs |
| EmptyState | icon + title + description |
| TabBar | with count badges |

---

## PART D — Stitch workflow

1. Paste **Part A** → generate design system board + tokens
2. Generate Screen 1 (Landing) → approve look
3. Generate Screens 2–15 saying: *"Same Slate Trust system as approved landing"*
4. Export color variables + text styles to Figma
5. Hand components to developer — code lives in `warrantyvault-pk/`

---

## PART E — Developer handoff tokens (CSS)

```css
:root {
  --bg-deep: #0C0F12;
  --bg-surface: #151A21;
  --bg-elevated: #1C222B;
  --border: rgba(255,255,255,0.07);
  --text-primary: #E8EAED;
  --text-muted: #8B939E;
  --accent: #059669;
  --accent-hover: #047857;
  --warning: #D97706;
  --danger: #DC2626;
}
```

Font import: `Plus Jakarta Sans`, `IBM Plex Mono`, `Noto Nastaliq Urdu`
