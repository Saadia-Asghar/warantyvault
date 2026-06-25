# Troubleshooting — localhost 404 & module errors

## Symptom: 404 on localhost OR `Cannot find module './8948.js'`

**Root cause:** An **old Next.js process** is still running on **port 3000** with a broken `.next` cache. When you run `npm run dev` again, Next.js moves to **port 3001** — but your browser keeps opening **3000**, which shows 404 or module errors.

This is **not** a missing npm package or database connectivity issue.

---

## Fix (one command)

```powershell
cd d:\ubl\warrantyvault-pk
npm run dev:fresh
```

Open the URL printed in the terminal (usually **http://localhost:3000**).

---

## Manual fix

```powershell
cd d:\ubl\warrantyvault-pk
powershell -File scripts/kill-dev-ports.ps1
npm run clean
npm run dev
```

---

## If it still fails

```powershell
Remove-Item -Recurse -Force .next, node_modules
npm install
npm run build
npm run dev
```

---

## Rules

1. Only **one** `npm run dev` at a time — stop with Ctrl+C before restarting.
2. Never run `npm run build` while `npm run dev` is running.
3. Always open the **port shown in the terminal** (3000 or 3001).
4. Run commands from `d:\ubl\warrantyvault-pk` — not the parent `d:\ubl` folder.

---

## Wrong folder?

The app lives in **`warrantyvault-pk`**. If you open `d:\ubl` in the browser, you will get nothing useful.

Correct path: `d:\ubl\warrantyvault-pk` → `npm run dev` → http://localhost:3000
