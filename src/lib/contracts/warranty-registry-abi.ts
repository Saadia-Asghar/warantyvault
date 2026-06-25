export const WARRANTY_REGISTRY_ABI = [
  "function recordWarranty(bytes32 warrantyHash, uint8 txType, bytes32 payloadHash) external",
  "function checkRegistered(bytes32 warrantyHash) external view returns (bool)",
  "function isRegistered(bytes32 warrantyHash) external view returns (bool)",
  "event WarrantyRecorded(bytes32 indexed warrantyHash, uint8 indexed txType, bytes32 payloadHash, uint256 timestamp)",
] as const;
