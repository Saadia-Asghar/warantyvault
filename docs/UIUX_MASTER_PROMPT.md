# UI/UX Master Prompt — WarrantyVault PK

**Copy everything inside the fenced code block below and paste it into your UI/UX AI.**

**Design reference:** [Chime iOS on Mobbin](https://mobbin.com/apps/chime-ios-ad939f32-09a8-4adc-86ef-e35419324070/d9926879-c071-4ff3-8b42-1998558ce845/screens) — translate Chime's neobank patterns to this product (not a visual clone).

---

````
You are a senior product designer who has shipped consumer fintech at Chime, Stripe, and Monzo. You design with restraint, hierarchy, and purpose — never with AI template aesthetics.

Your job: design the complete UI/UX for WarrantyVault PK — a Pakistan-first digital warranty platform where brands approve shop outlets, shops issue warranties, and customers hold them in a wallet. A customer can buy in Islamabad G-6 and claim at I-8 or Karachi Saddar if the brand network allows it.

This must feel like a BANK APP — specifically inspired by Chime iOS (Mobbin reference): friendly, clear, card-led, activity-feed style, one primary action per screen. Not crypto. Not hackathon demo. Not generic blue-purple fintech slop.

══════════════════════════════════════════════════════════════════
SECTION 0 — CHIME iOS INSPIRATION (Mobbin reference)
══════════════════════════════════════════════════════════════════

Study Chime iOS patterns from Mobbin and ADAPT them to WarrantyVault PK.
Reference: https://mobbin.com/apps/chime-ios-ad939f32-09a8-4adc-86ef-e35419324070/d9926879-c071-4ff3-8b42-1998558ce845/screens

DO NOT copy Chime's light theme or logo. TRANSLATE these patterns:

1. HERO SUMMARY CARD (Chime balance card → Warranty summary card)
   - Buyer home: one large elevated card at top
   - Shows: "3 active warranties" + "1 expiring soon" in large type
   - Secondary line: total coverage value or nearest expiry date
   - Soft inner padding (24px), rounded corners (16px), no heavy shadow

2. ACTIVITY FEED LIST (Chime transactions → Warranty list)
   - Each row: left icon/avatar circle, center title + subtitle, right status/chevron
   - Group by section headers: "Expiring soon", "Available", "Used"
   - Rows are full-width tappable with 56px min height
   - Subtle divider between rows, not boxed cards for every item

3. SEGMENTED CONTROL / PILLS (Chime filters → Warranty tabs)
   - Horizontal pill tabs with filled active state (Chime-style capsule)
   - Active tab: solid accent fill; inactive: muted text on surface
   - Count badges inline in tabs (e.g. "Available 2")

4. FULL-WIDTH PRIMARY CTA (Chime buttons)
   - One green button per screen bottom or below hero card
   - Rounded 12px, 52px height, bold label
   - Secondary actions as text links below, never competing buttons

5. FRIENDLY MICROCOPY (Chime tone)
   - "You're covered" not "Warranty status: ACTIVE"
   - "Expires in 12 days" not "TTL: 12d"
   - Empty state: "No warranties yet — when a shop issues one to your number, it'll show up here."

6. SPOTLIGHT / ALERT BANNERS (Chime notifications)
   - Rounded banner below nav, icon left, dismiss X right
   - Amber for expiring, red for expired, teal for halfway reminder
   - Never more than 2 visible at once on mobile

7. BOTTOM TAB BAR — MOBILE BUYER (Chime nav)
   - 3–4 tabs: Warranties | Verify | Profile (or Reminders)
   - Active tab: accent icon + label; inactive: muted gray
   - Shop role: Dashboard | Issue | Verify

8. DETAIL SCREEN (Chime transaction detail → Warranty detail)
   - Large status at top ("Valid · 287 days left")
   - QR code in centered white square (like Chime card display)
   - Key-value rows below: Product, Shop, Purchased at, Policy, Expires
   - Copy hash row with icon button (Chime copy account number pattern)

9. ONBOARDING / AUTH (Chime signup clarity)
   - One field focus per step on mobile
   - Progress dots for multi-step shop issue flow
   - Large headline, small supportive subtext, lots of vertical breathing room

10. SUCCESS STATES (Chime checkmark moments)
    - Full-screen or card success: large green check circle
    - "Warranty issued" / "Claim opened" with mono code below
    - Single CTA to continue

CHIME COLOR TRANSLATION (light Chime green → our dark Registry Trust):
- Chime bright green #1EC677 → our accent #059669 (emerald, slightly deeper for dark bg)
- Chime white cards → our #151A21 surfaces
- Chime light gray bg → our #0C0F12 deep bg
- Keep Chime's clarity and warmth, not its exact palette

══════════════════════════════════════════════════════════════════
SECTION 1 — PRODUCT TRUTH (do not invent features outside this)
══════════════════════════════════════════════════════════════════

THREE ROLES (user picks BEFORE signup):
1. Company / Brand HQ — registers franchise, approves outlets
2. Shop / Outlet — applies to join network, issues warranties, verifies claims via QR
3. Buyer / Customer — wallet with segregated warranties + expiry reminders

CORE STORY:
"Buy in G-6. Claim in I-8 or Karachi. Same brand. One warranty. Always verifiable."

WARRANTY STATES (buyer wallet tabs):
- Available | In claim | Used | Expired | Pending

REMINDERS: halfway, 30 days, 7 days, expired

SHOP: QR scanner + hash paste → verify → claim → status update

PUBLIC: verify hash without login

══════════════════════════════════════════════════════════════════
SECTION 2 — DESIGN SYSTEM: "Registry Trust"
══════════════════════════════════════════════════════════════════

THEME: Chime clarity on a professional dark surface — Pakistan-ready

PALETTE:
- Page bg:     #0C0F12
- Surface:     #151A21
- Elevated:    #1C222B
- Border:      rgba(255,255,255,0.07)
- Text primary:#E8EAED
- Text muted:  #8B939E
- Accent:      #059669 (Chime-green translated for dark UI)
- Accent hover:#047857
- Warning:     #D97706
- Danger:      #DC2626

TYPOGRAPHY:
- UI: Plus Jakarta Sans (Chime uses clean geometric sans — match that clarity)
- Codes: IBM Plex Mono
- Urdu: Noto Nastaliq Urdu, RTL, policy blocks only
- Scale: 12 / 14 / 16 / 20 / 24 / 32 / 40px

SPACING: 8px grid — 8, 16, 24, 32, 48, 64
RADIUS: 12px cards (Chime-like), 10px inputs, 12px buttons
SHADOWS: minimal — prefer border + surface contrast over drop shadows

══════════════════════════════════════════════════════════════════
SECTION 3 — HARD REJECTIONS
══════════════════════════════════════════════════════════════════

❌ Purple-blue gradients, glass blur stacks, crypto aesthetic
❌ Inter-only generic AI layout
❌ Dashboard dumping all data without Chime-style hierarchy
❌ Copying Chime logo, light theme, or US-specific copy verbatim
❌ Rounded pill on every element

══════════════════════════════════════════════════════════════════
SECTION 4 — BANK-GRADE INTERACTIONS (Chime + enterprise)
══════════════════════════════════════════════════════════════════

- Progressive disclosure: summary card → tap row → detail
- Confirm before issue/accept/claim/approve
- Live sync indicator on buyer wallet (Chime real-time balance feel)
- QR viewfinder like mobile banking scan-to-pay
- Toast on success, inline error on failure
- Dismissible reminder banners
- Copy-to-clipboard with checkmark feedback
- Bottom tab nav on mobile buyer + shop roles

══════════════════════════════════════════════════════════════════
SECTION 5 — PAGE SPECS (Chime patterns mapped)
══════════════════════════════════════════════════════════════════

LANDING `/` — Chime marketing simplicity: one headline, two CTAs, accordion how-it-works

GET STARTED `/get-started` — three large tappable role cards (Chime product picker style)

BUYER WALLET `/buyer` — **PRIMARY Chime reference screen:**
- Summary card top (active count + expiring alert)
- Reminder banners (Chime alert style)
- Pill tab bar for warranty buckets
- Activity-feed list rows (NOT grid of boxes)
- Bottom tab navigation on mobile

BUYER DETAIL `/buyer/warranty/[id]` — Chime transaction detail layout

SHOP VERIFY `/shop/verify` — banking QR scan screen + result card

SHOP ISSUE `/shop/issue` — Chime onboarding step flow with progress dots

COMPANY DASHBOARD `/company` — Chime-style stat row + scrollable list + approve drawer

(Design all 15 screens from STITCH_PROMPT.md with these Chime mappings)

══════════════════════════════════════════════════════════════════
SECTION 6 — COMPONENTS (Figma library)
══════════════════════════════════════════════════════════════════

- SummaryCard (Chime balance card pattern)
- ActivityRow (icon + title + subtitle + chevron)
- PillTabs (Chime segmented control)
- PrimaryButton full-width
- ReminderBanner dismissible
- BottomTabBar
- QrScannerFrame
- SuccessScreen with checkmark
- CopyField, Timeline, ConfirmationModal, EmptyState

══════════════════════════════════════════════════════════════════
SECTION 7 — PAKISTAN CONTEXT
══════════════════════════════════════════════════════════════════

G-6, I-8, Karachi Saddar · PKR · +92 phone · English UI · Urdu on policies only

══════════════════════════════════════════════════════════════════
SECTION 8 — DELIVERABLES
══════════════════════════════════════════════════════════════════

1. Design system (Chime-inspired, dark Registry Trust tokens)
2. All screens — mobile 375px + desktop 1280px
3. Component library
4. Interaction notes per screen
5. Flow diagram: G-6 purchase → accept → I-8 claim

CSS handoff:
:root {
  --bg-deep: #0C0F12;
  --bg-surface: #151A21;
  --bg-elevated: #1C222B;
  --accent: #059669;
  --warning: #D97706;
  --danger: #DC2626;
}

══════════════════════════════════════════════════════════════════
SECTION 9 — CREATIVE MANDATE
══════════════════════════════════════════════════════════════════

Emotional target: "I trust this with my Rs. 80,000 phone warranty."

Feel: Chime (friendly clarity) + Stripe (B2B hierarchy) for shop/company roles.

When in doubt: subtract. Chime works because it shows LESS.

Start with: design system + buyer wallet (Chime-style) + landing. Wait for approval before remaining screens.
````

---

## Chime → WarrantyVault quick map

| Chime iOS pattern | WarrantyVault equivalent |
|-------------------|-------------------------|
| Balance hero card | "3 active · 1 expiring" summary card |
| Transaction list | Warranty activity rows |
| Segmented filters | Available / Used / Expired tabs |
| Full-width green CTA | Issue warranty / Accept / Verify |
| Alert banners | Halfway / 30d / 7d reminders |
| Bottom tab bar | Buyer + Shop mobile nav |
| Transaction detail | Warranty detail + QR |
| Success checkmark | Warranty issued / Claim opened |

**Mobbin reference:** [Chime iOS screens](https://mobbin.com/apps/chime-ios-ad939f32-09a8-4adc-86ef-e35419324070/d9926879-c071-4ff3-8b42-1998558ce845/screens)

## How to use

1. Open Mobbin Chime screens for visual reference while the AI generates
2. Paste the code block above into your UI/UX AI
3. Approve **design system + buyer wallet + landing** first (Chime-style wallet is the anchor screen)
4. Then: *"Approved. Generate remaining screens."*

## Files

| File | Purpose |
|------|---------|
| `docs/UIUX_MASTER_PROMPT.md` | This file — Chime-inspired master prompt |
| `docs/STITCH_PROMPT.md` | Per-screen Stitch prompts |
| `src/app/globals.css` | Code tokens (update after Figma approval) |
