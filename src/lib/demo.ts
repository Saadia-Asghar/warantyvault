/** Seeded demo accounts — show demo banner when logged in as these */
const DEMO_BUYER_PHONES = new Set(["03001234567"]);
const DEMO_EMAILS = new Set([
  "g6@dollars.demo.pk",
  "i8@dollars.demo.pk",
  "khi@dollars.demo.pk",
  "lhr@dollars.demo.pk",
  "dollarsmobile@demo.pk",
  "admin@warrantyvault.pk",
  "ahmed@demo.pk",
]);

export function isDemoSession(session: {
  role: string;
  email?: string;
  phone?: string;
} | null): boolean {
  if (!session) return false;
  if (session.role === "buyer" && session.phone && DEMO_BUYER_PHONES.has(session.phone)) {
    return true;
  }
  if (session.email && DEMO_EMAILS.has(session.email.toLowerCase())) {
    return true;
  }
  return false;
}

export const DEMO_LOGINS = [
  { role: "Buyer", login: "03001234567", password: "demo1234" },
  { role: "Shop G-6", login: "g6@dollars.demo.pk", password: "demo1234" },
  { role: "Shop I-8", login: "i8@dollars.demo.pk", password: "demo1234" },
  { role: "Brand", login: "dollarsmobile@demo.pk", password: "demo1234" },
  { role: "Admin", login: "admin@warrantyvault.pk", password: "admin1234" },
] as const;

/** Show demo logins on landing/auth — off in production unless explicitly enabled */
export function showDemoCredentials(): boolean {
  const flag = process.env.NEXT_PUBLIC_SHOW_DEMO_CREDENTIALS;
  if (flag === "true") return true;
  if (flag === "false") return false;
  return process.env.NODE_ENV === "development";
}
