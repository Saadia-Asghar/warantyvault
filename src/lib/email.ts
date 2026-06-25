import { prisma } from "@/lib/prisma";

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

function fromAddress() {
  return process.env.EMAIL_FROM ?? "WarrantyVault PK <onboarding@resend.dev>";
}

function adminEmail() {
  return process.env.ADMIN_EMAIL ?? process.env.EMAIL_FROM?.match(/<([^>]+)>/)?.[1] ?? "admin@warrantyvault.pk";
}

export function getAdminEmail() {
  return adminEmail();
}

export async function sendEmail(payload: EmailPayload): Promise<{ ok: boolean; dev?: boolean }> {
  const log = await prisma.emailLog.create({
    data: {
      to: payload.to,
      subject: payload.subject,
      body: payload.html,
      status: "pending",
    },
  });

  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.log("\n--- EMAIL (dev — set RESEND_API_KEY to send) ---");
    console.log("To:", payload.to);
    console.log("Subject:", payload.subject);
    console.log(payload.text ?? payload.html.replace(/<[^>]+>/g, " "));
    console.log("---\n");
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: "logged_dev" },
    });
    return { ok: true, dev: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromAddress(),
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      await prisma.emailLog.update({
        where: { id: log.id },
        data: { status: "failed", error: err },
      });
      return { ok: false };
    }

    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: "sent" },
    });
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    await prisma.emailLog.update({
      where: { id: log.id },
      data: { status: "failed", error: message },
    });
    return { ok: false };
  }
}

export function emailLayout(title: string, body: string, cta?: { label: string; href: string }) {
  const ctaBlock = cta
    ? `<p style="margin-top:24px"><a href="${cta.href}" style="background:#059669;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600">${cta.label}</a></p>`
    : "";
  return `
    <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
      <p style="color:#059669;font-weight:700;font-size:14px">WarrantyVault PK</p>
      <h1 style="font-size:20px;margin:16px 0">${title}</h1>
      <div style="color:#444;line-height:1.6">${body}</div>
      ${ctaBlock}
      <p style="margin-top:32px;font-size:12px;color:#888">Paper gets lost. Your warranty shouldn't.</p>
    </div>
  `;
}

export async function sendWelcomeEmail(to: string, name: string, role: string) {
  return sendEmail({
    to,
    subject: `Welcome to WarrantyVault PK — ${role} account created`,
    html: emailLayout(
      `Welcome, ${name}`,
      `<p>Your <strong>${role}</strong> account is ready on WarrantyVault PK.</p>
       <p>You will receive email alerts whenever warranties are issued, accepted, claimed, or when you submit a complaint.</p>`,
      { label: "Open app", href: appUrl() }
    ),
    text: `Welcome ${name}. Your ${role} account is ready at ${appUrl()}`,
  });
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const link = `${appUrl()}/reset-password?token=${token}`;
  return sendEmail({
    to,
    subject: "Reset your WarrantyVault PK password",
    html: emailLayout(
      "Password reset",
      `<p>We received a request to reset your password. This link expires in 1 hour.</p>
       <p>If you did not request this, you can ignore this email.</p>`,
      { label: "Reset password", href: link }
    ),
    text: `Reset your password: ${link}`,
  });
}

export async function sendEventEmail(
  to: string,
  title: string,
  message: string,
  linkPath?: string
) {
  return sendEmail({
    to,
    subject: `WarrantyVault PK — ${title}`,
    html: emailLayout(title, `<p>${message}</p>`, linkPath ? { label: "View in app", href: `${appUrl()}${linkPath}` } : undefined),
    text: `${title}: ${message}`,
  });
}

export async function sendAdminAlert(subject: string, message: string) {
  return sendEmail({
    to: adminEmail(),
    subject: `[Admin] WarrantyVault PK — ${subject}`,
    html: emailLayout(subject, `<p>${message}</p>`, { label: "Admin dashboard", href: `${appUrl()}/admin` }),
    text: `${subject}: ${message}`,
  });
}

export async function sendComplaintEmails(input: {
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  complaintId: string;
}) {
  await sendAdminAlert(
    `New complaint: ${input.subject}`,
    `<strong>From:</strong> ${input.userName} (${input.userEmail})<br/><br/>
     <strong>Message:</strong><br/>${input.message.replace(/\n/g, "<br/>")}<br/><br/>
     <em>Complaint ID: ${input.complaintId}</em>`
  );

  await sendEmail({
    to: input.userEmail,
    subject: "We received your complaint — WarrantyVault PK",
    html: emailLayout(
      "Complaint received",
      `<p>Hi ${input.userName},</p>
       <p>We received your complaint <strong>"${input.subject}"</strong> and our team will review it shortly.</p>
       <p>Reference: <code>${input.complaintId}</code></p>`,
      { label: "Open app", href: appUrl() }
    ),
  });
}
