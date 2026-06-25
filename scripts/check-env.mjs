import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function loadEnvFile() {
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return;
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();

const errors = [];
const databaseUrl = process.env.DATABASE_URL ?? "";
const directUrl = process.env.DIRECT_URL ?? "";

if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
  errors.push(
    "DATABASE_URL must be a PostgreSQL URL (postgresql://...). SQLite file:./dev.db no longer works."
  );
}

if (!directUrl.startsWith("postgresql://") && !directUrl.startsWith("postgres://")) {
  errors.push(
    "DIRECT_URL must be a PostgreSQL URL. For Supabase: use Session mode (port 5432). For Neon: copy the unpooled URL."
  );
}

if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
  errors.push("AUTH_SECRET must be at least 32 characters.");
}

if (errors.length) {
  console.error("\nEnvironment check failed:\n");
  for (const err of errors) console.error(`  • ${err}`);
  console.error("\nCopy .env.example → .env and fill in your database credentials.");
  console.error("Supabase: Project Settings → Database → Connection string (URI).\n");
  process.exit(1);
}
