# Mobile app (APK) + free deployment

WarrantyVault PK ships as a **PWA** (install from browser) and a **native Android APK** (Capacitor WebView → your live Vercel URL + Supabase database).

---

## How the Android app works

The APK does **not** bundle a separate backend. It opens your deployed site:

```
https://warantyvault.vercel.app
```

All logins, warranties, chat, and map data use **your Supabase PostgreSQL** — same as the website.

To point at a different URL (e.g. custom domain), edit `capacitor.config.json` → `server.url` and rebuild.

---

## Option 1 — Install without building (fastest)

### Android Chrome

1. Open your live URL
2. Tap **Install** banner or ⋮ menu → **Install app** / **Add to Home screen**

### Download page

Users can visit **`/download`** on your site for instructions.

---

## Option 2 — Build APK (Capacitor)

### Prerequisites (one-time)

1. Install **[Android Studio](https://developer.android.com/studio)** (includes JDK 17)
2. Open Android Studio → **SDK Manager** → install:
   - Android SDK 34+
   - Android SDK Build-Tools
   - Android SDK Platform-Tools
3. Add to Windows environment (optional but helps CLI builds):
   - `JAVA_HOME` = `C:\Program Files\Android\Android Studio\jbr`
   - `ANDROID_HOME` = `C:\Users\YOUR_USER\AppData\Local\Android\Sdk`

### Build commands

```powershell
cd d:\ubl\warrantyvault-pk

# Sync web shell + plugins into android/
npm run cap:sync

# Build APK + copy to public/downloads/warrantyvault-pk.apk
npm run android:build
```

Or open in Android Studio:

```powershell
npm run android:open
# Build → Build Bundle(s) / APK(s) → Build APK(s)
```

APK output:

- Debug: `android/app/build/outputs/apk/debug/app-debug.apk`
- After `npm run android:build`: `public/downloads/warrantyvault-pk.apk` (served at `/download`)

### Release (Play Store)

In Android Studio: **Build → Generate Signed Bundle / APK** → choose **AAB** for Google Play.

---

## Option 3 — PWABuilder (no Android Studio)

1. Deploy to Vercel first
2. Go to [pwabuilder.com](https://www.pwabuilder.com)
3. Enter your URL → **Package for stores** → **Android**
4. Download APK/AAB

---

## Free hosting stack

| Service | Purpose |
|---------|---------|
| Vercel | Next.js app, HTTPS |
| Supabase | PostgreSQL |
| Resend | Email (optional) |

Set `NEXT_PUBLIC_APP_URL` to your Vercel URL before deploy.

---

## Troubleshooting Next.js dev errors

If you see `Cannot find module './8948.js'`:

```powershell
npm run clean
npm run dev
```

See **`docs/TROUBLESHOOTING.md`**.

---

## Features to add next

See `docs/MARKET_RESEARCH_PK.md` and `docs/COMPETITORS_PK.md`.
