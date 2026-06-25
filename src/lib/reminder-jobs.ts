import { prisma } from "@/lib/prisma";
import { sendEventEmail } from "@/lib/email";
import { sendSms, expiryReminderSms } from "@/lib/sms";
import { getPreference } from "@/lib/preferences";
import { daysUntil } from "@/lib/utils";

type ReminderType = "EXPIRING_30" | "EXPIRING_7" | "EXPIRED";

function reminderTypeForDays(days: number): ReminderType | null {
  if (days === 30) return "EXPIRING_30";
  if (days === 7) return "EXPIRING_7";
  if (days <= 0) return "EXPIRED";
  return null;
}

export async function runExpiryReminderJob(): Promise<{ sent: number; skipped: number }> {
  let sent = 0;
  let skipped = 0;

  const warranties = await prisma.warranty.findMany({
    where: { status: "ACTIVE", buyerId: { not: null } },
    include: { buyer: { select: { id: true, email: true, phone: true } } },
  });

  for (const w of warranties) {
    if (!w.buyer) continue;

    const days = daysUntil(w.endDate);
    const type = reminderTypeForDays(days);
    if (!type) continue;

    const emailsOn = await getPreference(w.buyer.id, "buyer", "reminderEmails");
    if (emailsOn === "false") {
      skipped++;
      continue;
    }

    const existing = await prisma.reminderLog.findFirst({
      where: { warrantyId: w.id, reminderType: type },
    });
    if (existing) {
      skipped++;
      continue;
    }

    const title =
      type === "EXPIRED"
        ? "Warranty expired"
        : `Warranty expiring in ${days} days`;
    const body = `Your warranty for ${w.productName} ${type === "EXPIRED" ? "has expired" : `expires on ${w.endDate.toLocaleDateString("en-PK")}`}.`;

    if (w.buyer.email) {
      await sendEventEmail(w.buyer.email, title, body, `/buyer/warranty/${w.id}`);
    }

    await sendSms(w.buyer.phone, expiryReminderSms(w.productName, days));

    await prisma.reminderLog.create({
      data: { warrantyId: w.id, reminderType: type },
    });
    sent++;
  }

  return { sent, skipped };
}
