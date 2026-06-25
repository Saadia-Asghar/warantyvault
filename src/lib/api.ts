import { NextResponse } from "next/server";
import { ZodError } from "zod";

type FieldErrors = Record<string, string>;

export function jsonOk<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function jsonError(message: string, status = 400, fieldErrors?: FieldErrors) {
  return NextResponse.json({ success: false, error: message, fieldErrors }, { status });
}

export function handleApiError(error: unknown) {
  if (error instanceof ZodError) {
    const fieldErrors: FieldErrors = {};
    for (const issue of error.issues) {
      const key = issue.path[0]?.toString() ?? "_form";
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    const msg = Object.entries(fieldErrors)
      .map(([k, v]) => (k === "_form" ? v : `${k}: ${v}`))
      .join("; ");
    return jsonError(msg, 422, fieldErrors);
  }
  if (error instanceof Error) {
    console.error("[API]", error.message);
    return jsonError(error.message, 500);
  }
  return jsonError("Internal server error", 500);
}
