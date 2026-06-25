import { ZodError, type ZodType } from "zod";

export type FieldErrors = Record<string, string>;

export function zodToFieldErrors(error: ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "_form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

export function validateForm<T>(
  schema: ZodType<T>,
  data: unknown
): { ok: true; data: T } | { ok: false; fieldErrors: FieldErrors } {
  const result = schema.safeParse(data);
  if (result.success) return { ok: true, data: result.data };
  return { ok: false, fieldErrors: zodToFieldErrors(result.error) };
}

/** Merge structured API fieldErrors or parse `field: message` strings. */
export function parseApiFieldErrors(
  message: string,
  fieldErrors?: FieldErrors | null
): FieldErrors {
  if (fieldErrors && Object.keys(fieldErrors).length > 0) return fieldErrors;

  const out: FieldErrors = {};
  for (const part of message.split("; ")) {
    const idx = part.indexOf(": ");
    if (idx > 0) {
      const field = part.slice(0, idx).trim();
      const msg = part.slice(idx + 2).trim();
      if (field && msg && !out[field]) out[field] = msg;
    }
  }
  if (!Object.keys(out).length && message) out._form = message;
  return out;
}

export function firstFormError(fieldErrors: FieldErrors): string {
  return fieldErrors._form ?? Object.values(fieldErrors)[0] ?? "Please fix the highlighted fields";
}
