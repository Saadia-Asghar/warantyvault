import { randomBytes } from "crypto";
import { ethers } from "ethers";
import { SiweMessage, generateNonce } from "siwe";
import { prisma } from "@/lib/prisma";
import type { SessionPayload } from "@/lib/auth";
import { POLYGON_AMOY } from "@/lib/polygon-config";

export const RESALE_WALLET_SIGN_THRESHOLD_PKR = 50_000;

const NONCE_TTL_MS = 10 * 60 * 1000;

export type WalletRole = "buyer" | "shop";

export function normalizeWalletAddress(address: string): string {
  return ethers.getAddress(address);
}

export async function getWalletForUser(userId: string, role: WalletRole) {
  if (role === "buyer") {
    return prisma.buyer.findUnique({
      where: { id: userId },
      select: { walletAddress: true, walletLinkedAt: true },
    });
  }
  return prisma.shop.findUnique({
    where: { id: userId },
    select: { walletAddress: true, walletLinkedAt: true },
  });
}

async function createNonce(input: {
  userId: string;
  userRole: WalletRole;
  purpose: string;
  metadata?: Record<string, unknown>;
}) {
  const nonce = generateNonce();
  const expiresAt = new Date(Date.now() + NONCE_TTL_MS);
  await prisma.walletNonce.deleteMany({
    where: { userId: input.userId, userRole: input.userRole, purpose: input.purpose },
  });
  await prisma.walletNonce.create({
    data: {
      userId: input.userId,
      userRole: input.userRole,
      purpose: input.purpose,
      nonce,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
      expiresAt,
    },
  });
  return { nonce, expiresAt };
}

async function consumeNonce(input: {
  userId: string;
  userRole: WalletRole;
  purpose: string;
  nonce: string;
}) {
  const row = await prisma.walletNonce.findUnique({ where: { nonce: input.nonce } });
  if (!row) throw new Error("Signature expired — request a new sign-in message");
  if (row.userId !== input.userId || row.userRole !== input.userRole || row.purpose !== input.purpose) {
    throw new Error("Invalid signature nonce");
  }
  if (row.expiresAt < new Date()) {
    await prisma.walletNonce.delete({ where: { id: row.id } });
    throw new Error("Signature expired — try again");
  }
  await prisma.walletNonce.delete({ where: { id: row.id } });
  return row;
}

export function appOrigin(): string {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function createSiweLinkMessage(input: {
  session: SessionPayload;
  address: string;
}) {
  const role = input.session.role as WalletRole;
  if (role !== "buyer" && role !== "shop") {
    throw new Error("Only buyers and shops can link a wallet");
  }

  const address = normalizeWalletAddress(input.address);
  const { nonce } = await createNonce({
    userId: input.session.sub,
    userRole: role,
    purpose: "link",
  });

  const origin = appOrigin();
  const siwe = new SiweMessage({
    domain: new URL(origin).host,
    address,
    statement: `Link this wallet to your ShopSeal PK ${role} account.`,
    uri: origin,
    version: "1",
    chainId: POLYGON_AMOY.chainId,
    nonce,
  });

  return { message: siwe.prepareMessage(), nonce, address };
}

export async function verifyAndLinkWallet(input: {
  session: SessionPayload;
  message: string;
  signature: string;
}) {
  const role = input.session.role as WalletRole;
  if (role !== "buyer" && role !== "shop") {
    throw new Error("Only buyers and shops can link a wallet");
  }

  const siwe = new SiweMessage(input.message);
  const { data } = await siwe.verify({ signature: input.signature });
  const address = normalizeWalletAddress(data.address);

  await consumeNonce({
    userId: input.session.sub,
    userRole: role,
    purpose: "link",
    nonce: data.nonce,
  });

  const takenBuyer = await prisma.buyer.findFirst({
    where: { walletAddress: address, id: { not: input.session.sub } },
    select: { id: true },
  });
  const takenShop = await prisma.shop.findFirst({
    where: { walletAddress: address, id: { not: input.session.sub } },
    select: { id: true },
  });
  if (takenBuyer || takenShop) {
    throw new Error("This wallet is already linked to another account");
  }

  const now = new Date();
  if (role === "buyer") {
    await prisma.buyer.update({
      where: { id: input.session.sub },
      data: { walletAddress: address, walletLinkedAt: now },
    });
  } else {
    await prisma.shop.update({
      where: { id: input.session.sub },
      data: { walletAddress: address, walletLinkedAt: now },
    });
  }

  await recordWalletAudit(role, input.session.sub, "WALLET_LINK", { address });

  return { walletAddress: address, walletLinkedAt: now };
}

export async function unlinkWallet(session: SessionPayload) {
  const role = session.role as WalletRole;
  if (role !== "buyer" && role !== "shop") {
    throw new Error("Only buyers and shops can unlink a wallet");
  }

  if (role === "buyer") {
    await prisma.buyer.update({
      where: { id: session.sub },
      data: { walletAddress: null, walletLinkedAt: null },
    });
  } else {
    await prisma.shop.update({
      where: { id: session.sub },
      data: { walletAddress: null, walletLinkedAt: null },
    });
  }
}

export function buildResaleActionMessage(input: {
  walletAddress: string;
  warrantyCode: string;
  warrantyHash: string;
  newBuyerPhone: string;
  newBuyerName: string;
  resaleAmount?: number | null;
  nonce: string;
}): string {
  const lines = [
    "ShopSeal PK — Authorize warranty resale transfer",
    `Warranty: ${input.warrantyCode}`,
    `Hash: ${input.warrantyHash}`,
    `New owner: ${input.newBuyerName} (${input.newBuyerPhone})`,
  ];
  if (input.resaleAmount != null && input.resaleAmount > 0) {
    lines.push(`Resale amount: PKR ${input.resaleAmount.toLocaleString("en-PK")}`);
  }
  lines.push(`Wallet: ${input.walletAddress}`, `Nonce: ${input.nonce}`);
  return lines.join("\n");
}

export async function createResaleActionChallenge(input: {
  session: SessionPayload;
  warrantyId: string;
  newBuyerPhone: string;
  newBuyerName: string;
  resaleAmount?: number | null;
}) {
  const buyer = await prisma.buyer.findUnique({ where: { id: input.session.sub } });
  if (!buyer?.walletAddress) {
    throw new Error("Link MetaMask in Profile before signing resale transfers");
  }

  const warranty = await prisma.warranty.findUnique({
    where: { id: input.warrantyId },
    select: { id: true, warrantyCode: true, warrantyHash: true, buyerId: true },
  });
  if (!warranty || warranty.buyerId !== input.session.sub) {
    throw new Error("Warranty not found");
  }

  const { nonce } = await createNonce({
    userId: input.session.sub,
    userRole: "buyer",
    purpose: "resale",
    metadata: { warrantyId: input.warrantyId },
  });

  const message = buildResaleActionMessage({
    walletAddress: buyer.walletAddress,
    warrantyCode: warranty.warrantyCode,
    warrantyHash: warranty.warrantyHash,
    newBuyerPhone: input.newBuyerPhone,
    newBuyerName: input.newBuyerName,
    resaleAmount: input.resaleAmount,
    nonce,
  });

  return { message, nonce, walletAddress: buyer.walletAddress };
}

export function resaleRequiresWalletSignature(input: {
  walletAddress: string | null | undefined;
  resaleAmount?: number | null;
}): boolean {
  if (input.walletAddress) return true;
  return (input.resaleAmount ?? 0) >= RESALE_WALLET_SIGN_THRESHOLD_PKR;
}

export async function verifyResaleWalletSignature(input: {
  session: SessionPayload;
  warrantyId: string;
  newBuyerPhone: string;
  newBuyerName: string;
  resaleAmount?: number | null;
  walletSignature: string;
  actionNonce: string;
}) {
  const buyer = await prisma.buyer.findUnique({ where: { id: input.session.sub } });
  if (!buyer?.walletAddress) {
    throw new Error("Link MetaMask in Profile to complete this transfer");
  }

  const warranty = await prisma.warranty.findUnique({
    where: { id: input.warrantyId },
    select: { warrantyCode: true, warrantyHash: true, buyerId: true },
  });
  if (!warranty || warranty.buyerId !== input.session.sub) {
    throw new Error("Warranty not found");
  }

  await consumeNonce({
    userId: input.session.sub,
    userRole: "buyer",
    purpose: "resale",
    nonce: input.actionNonce,
  });

  const message = buildResaleActionMessage({
    walletAddress: buyer.walletAddress,
    warrantyCode: warranty.warrantyCode,
    warrantyHash: warranty.warrantyHash,
    newBuyerPhone: input.newBuyerPhone,
    newBuyerName: input.newBuyerName,
    resaleAmount: input.resaleAmount,
    nonce: input.actionNonce,
  });

  const recovered = ethers.verifyMessage(message, input.walletSignature);
  if (normalizeWalletAddress(recovered) !== normalizeWalletAddress(buyer.walletAddress)) {
    throw new Error("Wallet signature does not match your linked account");
  }

  return { walletAddress: buyer.walletAddress };
}

async function recordWalletAudit(
  role: WalletRole,
  userId: string,
  eventType: "WALLET_LINK" | "WALLET_UNLINK",
  payload: Record<string, unknown>
) {
  const { recordAuditEvent } = await import("@/lib/audit");
  await recordAuditEvent({
    eventType,
    actorId: userId,
    actorRole: role,
    entityType: role,
    entityId: userId,
    payload,
  }).catch(() => undefined);
}

export function randomActionNonce(): string {
  return randomBytes(16).toString("hex");
}
