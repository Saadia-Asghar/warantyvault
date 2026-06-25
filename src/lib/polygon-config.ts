/** Polygon Amoy testnet — used for MetaMask + public client reads */
export const POLYGON_AMOY = {
  chainId: 80002,
  chainIdHex: "0x13882" as const,
  chainName: "Polygon Amoy Testnet",
  nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
  rpcUrls: ["https://rpc-amoy.polygon.technology"],
  blockExplorerUrls: ["https://amoy.polygonscan.com"],
} as const;

export function getRegistryAddress(): string | null {
  return (
    process.env.NEXT_PUBLIC_WARRANTY_REGISTRY_CONTRACT ??
    process.env.WARRANTY_REGISTRY_CONTRACT ??
    null
  );
}
