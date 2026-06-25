import { z } from "zod";

export const shopRegisterSchema = z
  .object({
    email: z.string().email("Valid email required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    shopName: z.string().min(2, "Shop name is too short").max(100),
    ownerName: z.string().min(2, "Owner name is too short").max(100),
    phone: z.string().min(10, "Enter a valid Pakistani phone (10+ digits)").max(15),
    city: z.string().min(2, "City is required").max(50),
    sector: z.string().max(50).optional(),
    address: z.string().min(2, "Address is too short — add plot/street or sector (e.g. G-6 Markaz)").max(200),
    category: z.enum(["MOBILE", "APPLIANCE", "GENERAL"]).default("GENERAL"),
    companyId: z.string().optional(),
    joinNetwork: z.boolean().optional(),
  })
  .refine((d) => !d.joinNetwork || Boolean(d.companyId?.trim()), {
    message: "Select a brand to join the dealer network",
    path: ["companyId"],
  });

export const companyRegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  legalName: z.string().min(2).max(150),
  brandName: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  ntn: z.string().max(20).optional(),
});

export const companyLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const shopLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const buyerRegisterSchema = z.object({
  phone: z.string().min(10).max(15),
  email: z.string().email("Valid email required for notifications"),
  password: z.string().min(8),
  name: z.string().min(2).max(100),
});

export const buyerLoginSchema = z.object({
  phone: z.string().min(10),
  password: z.string().min(1),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const issueWarrantySchema = z.object({
  productName: z.string().min(2).max(200),
  category: z.enum(["MOBILE", "APPLIANCE", "GENERAL"]),
  serialImei: z.string().max(50).optional(),
  purchaseAmount: z.number().positive("Sale amount is required"),
  paymentMethod: z.enum(["CASH", "RAAST", "CARD", "OTHER"]),
  paymentReference: z.string().max(100).optional(),
  paperPhotoHash: z.string().length(64).optional(),
  stockItemId: z.string().optional(),
  policyType: z.enum(["REPAIR_ONLY", "REPAIR_PARTS", "EXCHANGE", "SHOP_CREDIT"]),
  durationMonths: z.number().int().min(1).max(60),
  exclusions: z.string().max(500).optional(),
  termsEn: z.string().min(10).max(2000),
  termsUr: z.string().min(10).max(2000),
  buyerPhone: z.string().min(10).max(15),
  buyerName: z.string().min(2).max(100),
});

export const stockDispatchSchema = z.object({
  shopId: z.string().min(1),
  reference: z.string().max(50).optional(),
  items: z
    .array(
      z.object({
        productName: z.string().min(2).max(200),
        category: z.enum(["MOBILE", "APPLIANCE", "GENERAL"]),
        serialImei: z.string().max(50).optional(),
        sku: z.string().max(50).optional(),
      })
    )
    .min(1)
    .max(100),
});

export const stockReceiveSchema = z.object({
  dispatchId: z.string().min(1),
});

export const resaleTransferSchema = z.object({
  newBuyerPhone: z.string().min(10).max(15),
  newBuyerName: z.string().min(2).max(100),
  resaleAmount: z.number().positive().optional(),
  walletSignature: z.string().min(1).optional(),
  actionNonce: z.string().min(1).optional(),
});

export const claimOpenSchema = z.object({
  warrantyHash: z.string().length(64),
  issueDescription: z.string().min(5).max(1000),
});

export const claimUpdateSchema = z.object({
  status: z.enum(["IN_REPAIR", "COMPLETED", "EXCHANGED", "REJECTED"]),
  rejectionReason: z.string().max(500).optional(),
});

export const verifyHashSchema = z.object({
  hash: z.string().length(64),
});

export const verifyInputSchema = z
  .object({
    hash: z.string().length(64).optional(),
    warrantyCode: z.string().min(8).max(40).optional(),
  })
  .refine((d) => Boolean(d.hash || d.warrantyCode), {
    message: "Provide a warranty code or scan QR",
  });

export const policyTemplateSchema = z.object({
  name: z.string().min(2).max(100),
  category: z.enum(["MOBILE", "APPLIANCE", "GENERAL"]),
  policyType: z.enum(["REPAIR_ONLY", "REPAIR_PARTS", "EXCHANGE", "SHOP_CREDIT"]),
  durationMonths: z.number().int().min(1).max(60),
  exclusions: z.string().max(500).optional(),
  termsEn: z.string().min(10),
  termsUr: z.string().min(10),
  isDefault: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({
  role: z.enum(["buyer", "shop", "company", "admin"]),
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

export const complaintSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(15).optional(),
  subject: z.string().min(3).max(120),
  message: z.string().min(10).max(2000),
});

export const createThreadSchema = z.object({
  shopId: z.string().min(1),
  warrantyId: z.string().optional(),
  subject: z.string().min(3).max(120),
  message: z.string().min(5).max(2000),
});

export const sendMessageSchema = z.object({
  body: z.string().min(1).max(2000),
});
