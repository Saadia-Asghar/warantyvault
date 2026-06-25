import { z } from "zod";

export const shopRegisterSchema = z.object({
  email: z.string().email("Valid email required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  shopName: z.string().min(2).max(100),
  ownerName: z.string().min(2).max(100),
  phone: z.string().min(10).max(15),
  city: z.string().min(2).max(50),
  sector: z.string().max(50).optional(),
  address: z.string().min(5).max(200),
  category: z.enum(["MOBILE", "APPLIANCE", "GENERAL"]).default("GENERAL"),
  companyId: z.string().optional(),
  joinNetwork: z.boolean().optional(),
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
  purchaseAmount: z.number().positive().optional(),
  policyType: z.enum(["REPAIR_ONLY", "REPAIR_PARTS", "EXCHANGE", "SHOP_CREDIT"]),
  durationMonths: z.number().int().min(1).max(60),
  exclusions: z.string().max(500).optional(),
  termsEn: z.string().min(10).max(2000),
  termsUr: z.string().min(10).max(2000),
  buyerPhone: z.string().min(10).max(15),
  buyerName: z.string().min(2).max(100),
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
  phone: z.string().min(10).max(15).optional(),
  subject: z.string().min(3).max(120),
  message: z.string().min(10).max(2000),
});
