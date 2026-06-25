import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import solc from "solc";
import { ethers } from "ethers";

function loadEnv() {
  const envPath = resolve(process.cwd(), ".env");
  try {
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
  } catch {
    /* no .env */
  }
}

loadEnv();

const rpc = process.env.POLYGON_RPC_URL;
const key = process.env.POLYGON_PRIVATE_KEY;

if (!rpc || !key) {
  console.error("Set POLYGON_RPC_URL and POLYGON_PRIVATE_KEY in .env");
  process.exit(1);
}

const source = readFileSync(
  resolve(process.cwd(), "contracts/WarrantyRegistry.sol"),
  "utf8"
);

const input = {
  language: "Solidity",
  sources: { "WarrantyRegistry.sol": { content: source } },
  settings: {
    outputSelection: { "*": { "*": ["abi", "evm.bytecode"] } },
  },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const errors = (output.errors ?? []).filter((e) => e.severity === "error");
if (errors.length) {
  console.error(errors);
  process.exit(1);
}

const contract = output.contracts["WarrantyRegistry.sol"]["WarrantyRegistry"];
const abi = contract.abi;
const bytecode = contract.evm.bytecode.object;

async function main() {
  const provider = new ethers.JsonRpcProvider(rpc);
  const wallet = new ethers.Wallet(key, provider);
  console.log("Deploying from:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "MATIC");
  if (balance === 0n) {
    console.error("\nFund wallet with Amoy test MATIC: https://faucet.polygon.technology/");
    process.exit(1);
  }

  const factory = new ethers.ContractFactory(abi, `0x${bytecode}`, wallet);
  const deployed = await factory.deploy();
  await deployed.waitForDeployment();
  const address = await deployed.getAddress();
  console.log("\nWarrantyRegistry deployed:");
  console.log("  WARRANTY_REGISTRY_CONTRACT=" + address);
  console.log("\nAdd to .env and Vercel, then redeploy.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
