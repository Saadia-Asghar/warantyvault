import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { complaintSchema } from "@/lib/validators";
import { handleApiError, jsonOk } from "@/lib/api";
import { sendComplaintEmails } from "@/lib/email";
import { createNotification } from "@/lib/notifications";

export async function POST(req: NextRequest) {
  try {
    const data = complaintSchema.parse(await req.json());
    const session = await getSession();

    const complaint = await prisma.complaint.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        subject: data.subject,
        message: data.message,
        userId: session?.sub,
        userRole: session?.role,
      },
    });

    await sendComplaintEmails({
      userEmail: complaint.email,
      userName: complaint.name,
      subject: complaint.subject,
      message: complaint.message,
      complaintId: complaint.id,
    });

    if (session?.sub && session.role && session.role !== "admin") {
      await createNotification({
        userId: session.sub,
        userRole: session.role,
        title: "Complaint submitted",
        body: `We received your complaint: "${complaint.subject}". Our team will respond by email.`,
        type: "COMPLAINT_SUBMITTED",
        linkUrl: "/complaints",
      });
    }

    return jsonOk({ id: complaint.id, message: "Complaint submitted. Check your email for confirmation." }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
