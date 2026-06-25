import { NextRequest } from "next/server";
import { forgotPasswordSchema } from "@/lib/validators";
import { handleApiError, jsonOk } from "@/lib/api";
import { requestPasswordReset } from "@/lib/password-reset";
import { sendAdminAlert } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const data = forgotPasswordSchema.parse(await req.json());
    await requestPasswordReset(data.role, data.email);

    await sendAdminAlert(
      "Password reset requested",
      `${data.role} account — ${data.email.toLowerCase()}`
    );

    return jsonOk({
      message:
        "If an account exists with that email, we sent a password reset link. Check your inbox.",
    });
  } catch (error) {
    return handleApiError(error);
  }
}
