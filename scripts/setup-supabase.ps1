# Supabase connection setup for WarrantyVault PK
# Usage: .\scripts\setup-supabase.ps1 -Password "your-db-password"

param(
    [Parameter(Mandatory = $true)]
    [string]$Password
)

$ErrorActionPreference = "Stop"
$ProjectRef = "gdmciybkdiuomowvpjyn"
$Region = "ap-southeast-2"

# URL-encode password for connection strings
Add-Type -AssemblyName System.Web
$EncodedPassword = [System.Web.HttpUtility]::UrlEncode($Password)

$DatabaseUrl = "postgresql://postgres.${ProjectRef}:${EncodedPassword}@aws-1-${Region}.pooler.supabase.com:6543/postgres?pgbouncer=true"
$DirectUrl = "postgresql://postgres.${ProjectRef}:${EncodedPassword}@aws-1-${Region}.pooler.supabase.com:5432/postgres"

$envContent = @"
# Supabase project: $ProjectRef ($Region)
DATABASE_URL="$DatabaseUrl"
DIRECT_URL="$DirectUrl"

AUTH_SECRET="warrantyvault-dev-secret-change-in-production-min-32-chars"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
"@

$envPath = Join-Path (Split-Path $PSScriptRoot -Parent) ".env"

Set-Content -Path $envPath -Value $envContent.TrimEnd() -Encoding UTF8
Write-Host "Wrote $envPath"

$env:DATABASE_URL = $DatabaseUrl
$env:DIRECT_URL = $DirectUrl

Push-Location (Split-Path $PSScriptRoot -Parent)
try {
    Write-Host "Testing connection..."
    npx prisma migrate status
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Applying migrations..."
        npx prisma migrate deploy
    }
    Write-Host "Seeding demo data..."
    npm run db:seed
    Write-Host "Done. Run: npm run dev"
} finally {
    Pop-Location
}
