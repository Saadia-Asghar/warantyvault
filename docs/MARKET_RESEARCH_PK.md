# Pakistan market research — WarrantyVault PK roadmap

Research compiled from PTA advisories, consumer court cases, mobile dealer association statements, Samsung community forums, and consumer protection guidelines (Punjab/KPK). Sources linked inline.

---

## What Pakistanis actually complain about

### 1. Lost or missing warranty proof
- Samsung Pakistan buyers report **no physical warranty card** in box and **no local warranty lookup page** ([Samsung Members PK thread](https://r2.community.samsung.com/t5/Galaxy-A/Is-Samsung-warranty-not-available-in-Pakistan/td-p/21314293)).
- Consumer courts require **invoice + warranty card** as evidence; without them, claims fail ([Punjab consumer guidelines](https://pcpc.punjab.gov.pk/guidelines), [Kakakhel Law](https://www.kakakhellaw.com/what-are-your-rights-if-you-buy-a-defective-product)).
- **WarrantyVault fit:** Digital wallet, immutable hash, PDF/QR export, email/SMS on issue — **already built**.

### 2. Fake / refurbished phones sold as new
- **Patch phones**, smuggled kits, repacked boxes with **fake warranty stickers** ([HUM News](https://humenglish.com/latest/how-fake-smartphones-being-sold-in-pakistans-mobile-markets/), [Leading Reporter](https://leadingreporter.com/refurbished-mobiles-repacked-as-brand-new-pakistan)).
- Buyers discover PTA block within **10–20 days**; official brand warranty denied.
- **WarrantyVault fit:** IMEI duplicate detection + fraud flags — **partially built**. **Gap:** PTA DIRBS IMEI check integration, pre-purchase “verify before you buy” flow.

### 3. PTA / IMEI compliance anxiety
- PTA warns: match box IMEI, dial `*#06#`, check via **8484** or DVS app ([Bol News PTA advisory](https://www.bolnews.com/business/pta-issues-fresh-warning-regarding-jv-phones-imei-patch-devices/), [Daily Times](https://dailytimes.com.pk/1212302/smartphone-buyers-beware-pta-issues-warning/)).
- Cloned IMEI → network block; complaint portal: **complaint.pta.gov.pk**.
- **WarrantyVault fit:** Store serial/IMEI at issue — **built**. **Gap:** One-tap “Check PTA status” link/API, block issuance if IMEI flagged duplicate in network DB.

### 4. Shop denies warranty / demands cash for repair
- Documented consumer court case: Samsung Note 8 warranty refused, shop demanded **Rs 29,000** for repair ([PSSR consumer protection study — Waseem v. Green Tech Mobile, 2019](https://pssr.org.pk/issues/v4/2/consumer-protection-in-punjab-public-understanding-and-awareness.pdf)).
- **WarrantyVault fit:** Locked terms at purchase, audit trail, cross-outlet claims — **built**. **Gap:** Auto-generated **15-day legal notice** PDF (Punjab s.28 template) for consumer court.

### 5. No trust in paper shop stamps
- Mobile market association proposed **registered shopkeepers linked to online warranty portal** ([HUM News — Minhaj Gulfam quote](https://humenglish.com/latest/how-fake-smartphones-being-sold-in-pakistans-mobile-markets/)).
- **WarrantyVault fit:** Brand-approved outlet network — **core product**. **Gap:** Public shop verification badge page (`/shop/verify-id/{outletCode}`).

### 6. Cross-city mobility
- Buyers move (Islamabad → Karachi); paper warranty from one shop useless elsewhere.
- **WarrantyVault fit:** Network warranty + nearby shops GPS — **built**.

### 7. Language & literacy
- Terms in English only; Urdu terms field exists but UI is mostly English.
- **Gap:** Urdu UI toggle, WhatsApp-friendly warranty summary image (share to family).

### 8. Online / OLX purchases
- No receipt, no warranty, no escrow → no consumer court leverage.
- **Gap:** “Transfer warranty” when reselling phone; buyer accepts transferred digital warranty.

---

## Priority feature roadmap (beta → v1)

### P0 — Ship for beta (high impact, fits hackathon)
| Feature | Why | Effort |
|---------|-----|--------|
| **Polygon Amoy live anchoring** | “Real blockchain” demo credibility | Done — run `npm run setup:polygon` |
| **MetaMask read verify** | Public trust, no login | Done — `/verify` |
| **Back navigation all pages** | UX polish | Done — global back bar |
| **PTA IMEI check deeplink** | #1 buyer anxiety | Low — link `https://dirbs.pta.gov.pk/` + store IMEI |
| **Warranty PDF export** | Court evidence | Medium |
| **Urdu UI toggle** | Market fit | Medium |

### P1 — v1 production (3–6 weeks)
| Feature | Why |
|---------|-----|
| **Pre-purchase verify** | Scan QR at shop before paying |
| **15-day legal notice generator** | Punjab/KPK consumer act workflow |
| **WhatsApp share card** | PNG with QR + hash + expiry |
| **PTA/DVS status cache** | Warn if IMEI duplicate in our network |
| **Shop public profile** | `/outlet/{code}` — approved badge |
| **Warranty transfer on resale** | OLX / second-hand market |
| **Push notifications (PWA)** | Expiry reminders without email |
| **Jazz/SMS Urdu reminders** | Low smartphone literacy users |

### P2 — Scale & monetization
| Feature | Why |
|---------|-----|
| **Brand OEM API** | Haier/Samsung dealer networks |
| **FBR invoice NTN field** | Tax-compliant receipts |
| **Insurance tie-in** | Extended warranty upsell |
| **Consumer court case export** | Full evidence bundle ZIP |
| **Mainnet Polygon** | After legal review (not testnet) |
| **Arbitration workflow** | Brand mediates shop vs buyer |

---

## Competitive positioning (Pakistan)

| Alternative | Weakness | WarrantyVault advantage |
|-------------|----------|-------------------------|
| Paper card | Lost, forged | SHA-256 + optional chain |
| Brand-only OEM portal | Not for shop warranties | Dealer network layer |
| WhatsApp screenshot | No proof | Signed hash + audit |
| Consumer court alone | Slow, needs docs | Pre-built evidence trail |

**Tagline for market:** *“Paper gets lost. PTA blocks fakes. Your shop warranty shouldn’t disappear.”*

---

## Recommended next sprint (implement after this doc)

1. Add **“Check PTA IMEI”** button on issue + buyer warranty detail.
2. Add **PDF warranty certificate** download (`/api/warranties/[id]/pdf`).
3. Add **Urdu** strings for buyer wallet + verify page.
4. Add **shop public page** with approval badge.
5. Promote **nearby shops** on landing for walk-in discovery.

---

## Sources

- [HUM News — fake smartphones Pakistan](https://humenglish.com/latest/how-fake-smartphones-being-sold-in-pakistans-mobile-markets/)
- [Leading Reporter — refurbished repacked as new](https://leadingreporter.com/refurbished-mobiles-repacked-as-brand-new-pakistan)
- [PTA JV/patch phone warning](https://www.bolnews.com/business/pta-issues-fresh-warning-regarding-jv-phones-imei-patch-devices/)
- [Punjab Consumer Protection guidelines](https://pcpc.punjab.gov.pk/guidelines)
- [Samsung PK warranty confusion](https://r2.community.samsung.com/t5/Galaxy-A/Is-Samsung-warranty-not-available-in-Pakistan/td-p/21314293)
- [Consumer court mobile case study (PDF)](https://pssr.org.pk/issues/v4/2/consumer-protection-in-punjab-public-understanding-and-awareness.pdf)
