import { prisma } from "@/lib/prisma";

export async function getPreference(
  userId: string,
  userRole: string,
  key: string
): Promise<string | null> {
  const row = await prisma.userPreference.findUnique({
    where: { userId_userRole_key: { userId, userRole, key } },
  });
  return row?.value ?? null;
}

export async function setPreference(
  userId: string,
  userRole: string,
  key: string,
  value: string
) {
  return prisma.userPreference.upsert({
    where: { userId_userRole_key: { userId, userRole, key } },
    create: { userId, userRole, key, value },
    update: { value },
  });
}

export async function getPreferences(userId: string, userRole: string) {
  const rows = await prisma.userPreference.findMany({
    where: { userId, userRole },
  });
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
