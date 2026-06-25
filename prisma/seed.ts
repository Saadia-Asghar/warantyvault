import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { computeWarrantyHash } from "../src/lib/hash";
import { recordAuditEvent } from "../src/lib/audit";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding franchise network demo…");

  await prisma.pendingWarrantyAlert.deleteMany();
  await prisma.userPreference.deleteMany();
  await prisma.auditEvent.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.reminderLog.deleteMany();
  await prisma.fraudFlag.deleteMany();
  await prisma.chainRecord.deleteMany();
  await prisma.warranty.deleteMany();
  await prisma.policyTemplate.deleteMany();
  await prisma.companyPolicyTemplate.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.buyer.deleteMany();
  await prisma.company.deleteMany();
  await prisma.admin.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 12);
  const adminHash = await bcrypt.hash("admin1234", 12);

  await prisma.admin.create({
    data: { email: "admin@warrantyvault.pk", passwordHash: adminHash },
  });

  const termsEn =
    "Valid at any Dollar's Mobile approved outlet in Pakistan. 6 months repair warranty.";

  const company = await prisma.company.create({
    data: {
      email: "dollarsmobile@demo.pk",
      passwordHash,
      legalName: "Dollar's Mobile Pakistan (Pvt) Ltd",
      brandName: "Dollar's Mobile",
      phone: "0511234567",
      policies: {
        create: [{
          name: "Network Standard",
          category: "MOBILE",
          policyType: "REPAIR_ONLY",
          durationMonths: 6,
          exclusions: "Water damage, physical damage",
          termsEn,
          termsUr: "Pakistan ke kisi bhi Dollar's Mobile outlet par valid. 6 mahine ki repair warranty.",
          isDefault: true,
        }],
      },
    },
  });

  const outlets = [
    {
      email: "g6@dollars.demo.pk",
      shopName: "Dollar's Mobile G-6",
      sector: "G-6",
      city: "Islamabad",
      address: "Main Boulevard, Sector G-6, Islamabad",
      outletCode: "ISB-G6-001",
      latitude: 33.7067,
      longitude: 73.0893,
    },
    {
      email: "i8@dollars.demo.pk",
      shopName: "Dollar's Mobile I-8",
      sector: "I-8",
      city: "Islamabad",
      address: "Service Road, Sector I-8, Islamabad",
      outletCode: "ISB-I8-001",
      latitude: 33.6844,
      longitude: 73.0479,
    },
    {
      email: "khi@dollars.demo.pk",
      shopName: "Dollar's Mobile Saddar",
      sector: "Saddar",
      city: "Karachi",
      address: "Preedy Street, Saddar, Karachi",
      outletCode: "KHI-SADDAR-001",
      latitude: 24.8567,
      longitude: 67.0011,
    },
    {
      email: "lhr@dollars.demo.pk",
      shopName: "Dollar's Mobile Gulberg",
      sector: "Gulberg",
      city: "Lahore",
      address: "Main Boulevard, Gulberg III, Lahore",
      outletCode: "LHR-GUL-001",
      latitude: 31.5204,
      longitude: 74.3587,
    },
  ];

  const shops = [];
  for (const o of outlets) {
    const shop = await prisma.shop.create({
      data: {
        email: o.email,
        passwordHash,
        shopName: o.shopName,
        ownerName: "Outlet Manager",
        phone: "03001111111",
        city: o.city,
        sector: o.sector,
        address: o.address,
        latitude: o.latitude,
        longitude: o.longitude,
        category: "MOBILE",
        companyId: company.id,
        approvalStatus: "APPROVED",
        outletCode: o.outletCode,
      },
    });
    shops.push(shop);
  }

  const buyer = await prisma.buyer.create({
    data: {
      phone: "03001234567",
      email: "ahmed@demo.pk",
      passwordHash,
      name: "Ahmed Khan",
    },
  });

  const issuingShop = shops[0];
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + 6);

  const warrantyCode = "WV-PK-2026-1001";
  const startUnix = Math.floor(startDate.getTime() / 1000);
  const endUnix = Math.floor(endDate.getTime() / 1000);
  const warrantyTermsEn = "Valid at any Dollar's Mobile approved outlet in Pakistan.";

  const warrantyHash = computeWarrantyHash({
    companyId: company.id,
    shopId: issuingShop.id,
    serialImei: "356789012345678",
    buyerPhone: buyer.phone,
    productName: "Samsung Galaxy A54",
    startUnix,
    endUnix,
    policyType: "REPAIR_ONLY",
    warrantyCode,
    termsEn: warrantyTermsEn,
  });

  const warranty = await prisma.warranty.create({
    data: {
      warrantyCode,
      companyId: company.id,
      shopId: issuingShop.id,
      buyerId: buyer.id,
      productName: "Samsung Galaxy A54",
      category: "MOBILE",
      serialImei: "356789012345678",
      purchaseAmount: 85000,
      policyType: "REPAIR_ONLY",
      durationMonths: 6,
      exclusions: "Water damage, physical damage",
      termsEn: warrantyTermsEn,
      termsUr: "Pakistan ke kisi bhi Dollar's Mobile outlet par valid.",
      startDate,
      endDate,
      status: "ACTIVE",
      warrantyHash,
      buyerPhone: buyer.phone,
      buyerName: buyer.name,
      purchaseCity: "Islamabad",
      purchaseSector: "G-6",
      registeredAt: new Date(),
    },
  });

  const { txHash: regTx } = await recordAuditEvent({
    eventType: "WARRANTY_REGISTER",
    actorId: issuingShop.id,
    actorRole: "shop",
    entityType: "warranty",
    entityId: warranty.id,
    warrantyId: warranty.id,
    warrantyHash,
    payload: { warrantyCode, companyId: company.id },
  });

  const { txHash: transferTx } = await recordAuditEvent({
    eventType: "WARRANTY_TRANSFER",
    actorId: buyer.id,
    actorRole: "buyer",
    entityType: "warranty",
    entityId: warranty.id,
    warrantyId: warranty.id,
    warrantyHash,
    payload: { buyerId: buyer.id },
  });

  await prisma.warranty.update({
    where: { id: warranty.id },
    data: { chainTxRegister: regTx, chainTxTransfer: transferTx },
  });

  console.log("Done!");
  console.log("Brand:", "dollarsmobile@demo.pk / demo1234");
  console.log("Shop G-6:", "g6@dollars.demo.pk / demo1234");
  console.log("Shop I-8:", "i8@dollars.demo.pk / demo1234 (can process claims!)");
  console.log("Shop Lahore:", "lhr@dollars.demo.pk / demo1234");
  console.log("Buyer:", "03001234567 / demo1234");
}

main().catch(console.error).finally(() => prisma.$disconnect());
