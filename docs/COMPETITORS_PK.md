# Competitors & market gap — Pakistan (2026)

## Direct answer: is WarrantyVault needed?

**Yes.** Nothing in Pakistan today does what WarrantyVault does: **dealer-network shop warranties** with buyer wallet, cross-outlet claims, QR verify, and brand outlet approval.

Existing tools solve **different** problems.

---

## What exists today

### 1. Brand OEM warranty portals (not shop warranties)

| Product | What it does | Gap vs WarrantyVault |
|---------|--------------|----------------------|
| [Samsung myproducts PK](https://www.samsung.com/pk/mypage/myproducts/) | Register Samsung devices, check OEM warranty | Official brand only; no Saddar/G-6 shop layer |
| [realme phone check](https://www.realme.com/pk/support/phonecheck) | IMEI → OEM warranty status | Brand-only; no dealer network |
| [Huawei warranty query](https://consumer.huawei.com/pk/support/warranty-query/) | SN + captcha → OEM period | Brand-only |
| [Carlcare (Infinix/TECNO/itel)](https://www.carlcare.com/pk/warranty-check/) | IMEI warranty check | Brand service centers only |
| [SalamTec warranty checker](https://salamtec.pk/warranty-checker/) | Links to brand IMEI portals | Aggregator links, not a wallet |

**Verdict:** These are **manufacturer warranty**, not **shop-issued dealer warranties** on patch/JV/refurb phones sold in markets.

### 2. PTA / government (IMEI legality, not warranty)

| Product | What it does |
|---------|--------------|
| PTA DIRBS / DVS app | Is this IMEI registered/legal on Pakistani networks? |
| complaint.pta.gov.pk | Report blocked/cloned IMEI |

**Verdict:** Complementary — WarrantyVault should **link** PTA check, not compete with it.

### 3. Generic warranty tracker apps (global)

| Product | What it does | Gap |
|---------|--------------|-----|
| DigiWarranty, MyWrntee (Play Store) | Manual receipt upload, expiry reminders | No shop issuance, no QR verify, no brand network |
| Warranty Keeper–style apps | Personal product list | No Pakistan dealer context |

**Verdict:** Personal organizers — **not** B2B2C shop → buyer → network claims.

### 4. Paper + WhatsApp (real competitor)

| “Product” | Share in Pakistan mobile markets |
|-----------|----------------------------------|
| Handwritten warranty card | Very high |
| Shop stamp on box | High |
| WhatsApp screenshot of receipt | Medium |

**Verdict:** This is the **main competitor**. WarrantyVault wins on: locked terms, audit trail, cross-city network, fraud flags.

---

## Market positioning

```
                    OEM brand portals
                           │
                           │  (Samsung, realme…)
                           ▼
              ┌────────────────────────┐
              │   PTA / IMEI check     │
              └────────────────────────┘
                           │
    Paper / WhatsApp ◄─────┼─────► WarrantyVault PK
    (status quo)           │         (dealer network layer)
                           │
              ┌────────────────────────┐
              │  Generic receipt apps   │
              └────────────────────────┘
```

**Unique value:** Brand approves outlets → shop issues digital warranty → buyer claims at **any** approved outlet → QR/hash verify.

---

## Features competitors don’t have (build these)

| Priority | Feature | Why |
|----------|---------|-----|
| P0 | Urdu UI | 60%+ buyers prefer Urdu for legal terms |
| P0 | Warranty PDF export | Consumer court evidence (paper competitor) |
| P1 | PTA IMEI deeplink on buyer wallet | Anxiety reducer; DIRBS already exists |
| P1 | WhatsApp share card (PNG + QR) | Matches how Pakistanis share proof |
| P1 | Public outlet badge `/outlet/{code}` | Trust at shop counter |
| P2 | Warranty transfer on resale | OLX / second-hand phones |
| P2 | Push notifications (FCM) | Chat + expiry when app closed |

---

## Should you still build WarrantyVault?

| Question | Answer |
|----------|--------|
| Is there an identical app in PK? | **No** |
| Do people need it? | **Yes** — lost paper, fake warranties, cross-city claims are documented pain points |
| Is the OEM portal enough? | **No** for dealer/JV/patch market warranties |
| Is PWA/APK enough for launch? | **Yes** for beta; Play Store later for trust |

---

## Sources

- [SalamTec warranty checker](https://salamtec.pk/warranty-checker/)
- [Carlcare PK](https://www.carlcare.com/pk/warranty-check/)
- [Samsung myproducts PK](https://www.samsung.com/pk/mypage/myproducts/)
- [realme PK support](https://www.realme.com/pk/support/phonecheck)
- See also `docs/MARKET_RESEARCH_PK.md`
