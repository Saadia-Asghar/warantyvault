import { ethers } from "ethers";
import type { ChainTxType } from "@/lib/blockchain";
import { WARRANTY_REGISTRY_ABI } from "@/lib/contracts/warranty-registry-abi";

const TX_TYPE_UINT: Record<ChainTxType, number> = {
  REGISTER: 0,
  TRANSFER: 1,
  CLAIM: 2,
  REVOKE: 3,
};

export type ChainMode = "polygon_amoy" | "local";

export function isPolygonEnabled(): boolean {
  return Boolean(
    process.env.POLYGON_RPC_URL &&
      process.env.POLYGON_PRIVATE_KEY &&
      process.env.WARRANTY_REGISTRY_CONTRACT
  );
}

export function getChainMode(): ChainMode {
  return isPolygonEnabled() ? "polygon_amoy" : "local";
}

export function getPolygonExplorerTxUrl(txHash: string): string {
  const base =
    process.env.NEXT_PUBLIC_POLYGON_EXPLORER ?? "https://amoy.polygonscan.com";
  return `${base}/tx/${txHash}`;
}

function getContract(signerOrProvider: ethers.Signer | ethers.Provider) {
  const address = process.env.WARRANTY_REGISTRY_CONTRACT;
  if (!address) throw new Error("WARRANTY_REGISTRY_CONTRACT not configured");
  return new ethers.Contract(address, WARRANTY_REGISTRY_ABI, signerOrProvider);
}

function toBytes32(hexHash: string): string {
  const clean = hexHash.startsWith("0x") ? hexHash.slice(2) : hexHash;
  if (clean.length !== 64) throw new Error("Warranty hash must be 32 bytes (64 hex chars)");
  return `0x${clean}`;
}

export async function submitToPolygon(
  warrantyHash: string,
  txType: ChainTxType,
  payload: Record<string, unknown>
): Promise<string> {
  const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL!);
  const wallet = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY!, provider);
  const contract = getContract(wallet);
  const payloadHash = ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(payload)));
  const tx = await contract.recordWarranty(
    toBytes32(warrantyHash),
    TX_TYPE_UINT[txType],
    payloadHash
  );
  const receipt = await tx.wait();
  if (!receipt?.hash) throw new Error("Polygon transaction failed — no receipt");
  return receipt.hash;
}

export async function verifyOnPolygon(warrantyHash: string): Promise<boolean> {
  if (!isPolygonEnabled()) return false;
  try {
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL!);
    const contract = getContract(provider);
    return Boolean(await contract.checkRegistered(toBytes32(warrantyHash)));
  } catch {
    return false;
  }
}

export async function getPolygonWalletBalance(): Promise<string | null> {
  if (!process.env.POLYGON_RPC_URL || !process.env.POLYGON_PRIVATE_KEY) return null;
  try {
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
    const wallet = new ethers.Wallet(process.env.POLYGON_PRIVATE_KEY, provider);
    const balance = await provider.getBalance(wallet.address);
    return ethers.formatEther(balance);
  } catch {
    return null;
  }
}
