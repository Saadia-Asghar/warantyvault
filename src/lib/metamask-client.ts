import { ethers } from "ethers";
import { POLYGON_AMOY } from "@/lib/polygon-config";

export async function getBrowserProvider(): Promise<ethers.BrowserProvider> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("Install MetaMask to link your wallet");
  }
  return new ethers.BrowserProvider(window.ethereum);
}

export async function ensureAmoyNetwork(provider: ethers.BrowserProvider): Promise<void> {
  const chainId = await provider.send("eth_chainId", []);
  if (chainId === POLYGON_AMOY.chainIdHex) return;
  try {
    await provider.send("wallet_switchEthereumChain", [{ chainId: POLYGON_AMOY.chainIdHex }]);
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code === 4902) {
      await provider.send("wallet_addEthereumChain", [POLYGON_AMOY]);
    } else {
      throw err;
    }
  }
}

export async function connectWalletAddress(): Promise<string> {
  const provider = await getBrowserProvider();
  await ensureAmoyNetwork(provider);
  const accounts = (await provider.send("eth_requestAccounts", [])) as string[];
  if (!accounts[0]) throw new Error("No MetaMask account selected");
  return ethers.getAddress(accounts[0]);
}

export async function signWalletMessage(message: string): Promise<string> {
  const provider = await getBrowserProvider();
  await ensureAmoyNetwork(provider);
  const signer = await provider.getSigner();
  return signer.signMessage(message);
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

declare global {
  interface Window {
    ethereum?: import("ethers").Eip1193Provider;
  }
}
