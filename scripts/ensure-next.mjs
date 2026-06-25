/**
 * Remove broken .next cache before dev (fixes unstyled pages / missing CSS chunks).
 */
import { existsSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";

const nextDir = join(process.cwd(), ".next");
if (!existsSync(nextDir)) process.exit(0);

const buildId = join(nextDir, "BUILD_ID");
if (!existsSync(buildId)) {
  console.log("Broken .next cache (no BUILD_ID) — cleaning…");
  rmSync(nextDir, { recursive: true, force: true });
  process.exit(0);
}

const runtime = join(nextDir, "server", "webpack-runtime.js");
if (existsSync(runtime)) {
  try {
    const src = readFileSync(runtime, "utf8");
    if (src.length < 50) {
      console.log("Corrupt webpack runtime — cleaning .next…");
      rmSync(nextDir, { recursive: true, force: true });
    }
  } catch {
    // ignore
  }
}
