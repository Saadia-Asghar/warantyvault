param(
  [string]$AppUrl = "https://warantyvault.vercel.app"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "WarrantyVault PK — Android APK setup" -ForegroundColor Cyan
Write-Host ""

# Update Capacitor server URL
$configPath = Join-Path $root "capacitor.config.json"
$config = Get-Content $configPath -Raw | ConvertFrom-Json
$config.server.url = $AppUrl
$config | ConvertTo-Json -Depth 6 | Set-Content $configPath -Encoding UTF8
Write-Host "Set Capacitor server.url -> $AppUrl"

# Ensure web shell exists
$outIndex = Join-Path $root "out\index.html"
if (-not (Test-Path $outIndex)) {
  New-Item -ItemType Directory -Force -Path (Join-Path $root "out") | Out-Null
  @"
<!DOCTYPE html><html><body style="font-family:system-ui;background:#fdf9f5;display:flex;min-height:100vh;align-items:center;justify-content:center"><p>Loading WarrantyVault PK…</p></body></html>
"@ | Set-Content $outIndex
}

npx cap sync android

Write-Host ""
Write-Host "Prerequisites to BUILD the APK:" -ForegroundColor Yellow
Write-Host "  1. Install Android Studio: https://developer.android.com/studio"
Write-Host "  2. In Studio: SDK Manager -> Android SDK 34+, Build-Tools, Platform-Tools"
Write-Host "  3. Set JAVA_HOME (Studio bundles JDK 17, usually at):"
Write-Host "     C:\Program Files\Android\Android Studio\jbr"
Write-Host ""

$java = Get-Command java -ErrorAction SilentlyContinue
if (-not $java) {
  Write-Host "Java not found. Open Android Studio first, or set JAVA_HOME." -ForegroundColor Red
  Write-Host "Then run: npm run android:build" -ForegroundColor Yellow
  exit 0
}

Write-Host "Java found. Building debug APK..." -ForegroundColor Green
Set-Location (Join-Path $root "android")
.\gradlew.bat assembleDebug

$apk = Join-Path $root "android\app\build\outputs\apk\debug\app-debug.apk"
$destDir = Join-Path $root "public\downloads"
$dest = Join-Path $destDir "warrantyvault-pk.apk"

if (Test-Path $apk) {
  New-Item -ItemType Directory -Force -Path $destDir | Out-Null
  Copy-Item $apk $dest -Force
  Write-Host ""
  Write-Host "SUCCESS — APK copied to public/downloads/warrantyvault-pk.apk" -ForegroundColor Green
  Write-Host "Users can download at: /download on your site"
} else {
  Write-Host "Build finished but APK not found at expected path." -ForegroundColor Red
}
