import { NextRequest } from "next/server";
import { resetPasswordSchema } from "@/lib/validators";
import { handleApiError, jsonOk } from "@/lib/api";
import { resetPasswordWithToken } from "@/lib/password-reset";
import { sendAdminAlert } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const data = resetPasswordSchema.parse(await req.json());
    await resetPasswordWithToken(data.token, data.password);

    await sendAdminAlert("Password reset completed", "A user successfully reset their password.");

    return jsonOk({ message: "Password updated. You can sign in now." });
  } catch (error) {
    return handleApiError(error);
  }
}
