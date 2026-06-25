import { NextResponse } from "next/server";
import { ZodError } from "zod";

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    const msg = error.issues
      .map((i) => {
        const field = i.path.length ? `${String(i.path.join("."))}: ` : "";
        return `${field}${i.message}`;
      })
      .join("; ");
    return jsonError(msg, 422);
  }
  if (error instanceof Error) {
    console.error("[API]", error.message);
    return jsonError(error.message, 500);
  }
  return jsonError("Internal server error", 500);
}
