function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function normalizePkPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("92")) return `+${digits}`;
  if (digits.startsWith("0")) return `+92${digits.slice(1)}`;
  return `+92${digits}`;
}

/** Send SMS via Twilio when configured; otherwise log in dev. */
export async function sendSms(to: string, body: string): Promise<{ ok: boolean; dev?: boolean }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from) {
    console.log("\n--- SMS (dev — set TWILIO_* to send) ---");
    console.log("To:", to);
    console.log(body);
    console.log("---\n");
    return { ok: true, dev: true };
  }

  const url = `https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`;
  const params = new URLSearchParams({
    To: normalizePkPhone(to),
    From: from,
    Body: body,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${sid}:${token}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  if (!res.ok) {
    console.error("Twilio SMS failed:", await res.text());
    return { ok: false };
  }
  return { ok: true };
}

export function warrantyIssuedSms(shopName: string, productName: string): string {
  return `WarrantyVault PK: ${shopName} issued a warranty for ${productName}. Open your wallet: ${appUrl()}/buyer`;
}

export function expiryReminderSms(productName: string, days: number): string {
  if (days <= 0) {
    return `WarrantyVault PK: Your warranty for ${productName} has expired.`;
  }
  return `WarrantyVault PK: Your warranty for ${productName} expires in ${days} day(s). View: ${appUrl()}/buyer`;
}
