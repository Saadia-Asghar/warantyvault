/**
 * One-time Polygon Amoy setup:
 * 1. Generates deployer wallet if POLYGON_PRIVATE_KEY missing
 * 2. Writes POLYGON_RPC_URL + keys to .env
 * 3. Deploys WarrantyRegistry when wallet has MATIC
 *
 * Fund wallet at https://faucet.polygon.technology/ then re-run.
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { ethers } from "ethers";
import solc from "solc";

const root = resolve(process.cwd());
const envPath = resolve(root, ".env");

function loadEnv() {
  if (!existsSync(envPath)) return {};
  const env = {};
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
    env[key] = value;
  }
  return env;
}

function upsertEnv(updates) {
  let content = existsSync(envPath) ? readFileSync(envPath, "utf8") : "";
  for (const [key, value] of Object.entries(updates)) {
    const line = `${key}="${value}"`;
    const re = new RegExp(`^${key}=.*$`, "m");
    if (re.test(content)) content = content.replace(re, line);
    else content += (content.endsWith("\n") ? "" : "\n") + line + "\n";
  }
  writeFileSync(envPath, content, "utf8");
}

const env = loadEnv();
const rpc = env.POLYGON_RPC_URL || "https://rpc-amoy.polygon.technology";

let privateKey = env.POLYGON_PRIVATE_KEY;
if (!privateKey) {
  const wallet = ethers.Wallet.createRandom();
  privateKey = wallet.privateKey;
  console.log("\nGenerated new Polygon deployer wallet:");
  console.log("  Address:", wallet.address);
  console.log("  Fund with Amoy MATIC: https://faucet.polygon.technology/\n");
  upsertEnv({
    POLYGON_RPC_URL: rpc,
    POLYGON_PRIVATE_KEY: privateKey,
    NEXT_PUBLIC_POLYGON_EXPLORER: "https://amoy.polygonscan.com",
    NEXT_PUBLIC_CHAIN_ID: "80002",
  });
} else if (!env.POLYGON_RPC_URL) {
  upsertEnv({ POLYGON_RPC_URL: rpc });
}

if (env.WARRANTY_REGISTRY_CONTRACT) {
  console.log("WARRANTY_REGISTRY_CONTRACT already set:", env.WARRANTY_REGISTRY_CONTRACT);
  upsertEnv({
    NEXT_PUBLIC_WARRANTY_REGISTRY_CONTRACT: env.WARRANTY_REGISTRY_CONTRACT,
  });
  process.exit(0);
}

const provider = new ethers.JsonRpcProvider(rpc);
const wallet = new ethers.Wallet(privateKey, provider);
const balance = await provider.getBalance(wallet.address);
console.log("Deployer:", wallet.address);
console.log("Balance:", ethers.formatEther(balance), "MATIC");

if (balance === 0n) {
  console.log("\nWallet needs Amoy test MATIC before deploy.");
  console.log("1. Open https://faucet.polygon.technology/");
  console.log("2. Send MATIC to:", wallet.address);
  console.log("3. Re-run: npm run setup:polygon\n");
  process.exit(0);
}

const source = readFileSync(resolve(root, "contracts/WarrantyRegistry.sol"), "utf8");
const input = {
  language: "Solidity",
  sources: { "WarrantyRegistry.sol": { content: source } },
  settings: { outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } } },
};
const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (output.errors ?? []).filter((e) => e.severity === "error");
if (errors.length) {
  console.error(errors);
  process.exit(1);
}

const artifact = output.contracts["WarrantyRegistry.sol"]["WarrantyRegistry"];
const factory = new ethers.ContractFactory(
  artifact.abi,
  `0x${artifact.evm.bytecode.object}`,
  wallet
);
const deployed = await factory.deploy();
await deployed.waitForDeployment();
const address = await deployed.getAddress();

upsertEnv({
  WARRANTY_REGISTRY_CONTRACT: address,
  NEXT_PUBLIC_WARRANTY_REGISTRY_CONTRACT: address,
});

console.log("\nDeployed WarrantyRegistry:", address);
console.log("Explorer:", `https://amoy.polygonscan.com/address/${address}`);
console.log("\nPolygon is live. Restart dev server and issue a warranty to anchor on-chain.\n");
