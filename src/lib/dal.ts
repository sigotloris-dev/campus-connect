import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { decrypt, getSessionCookie } from "@/lib/session";

// Verifica la sessione dal cookie. Memoizzata per la durata del render.
export const verifySession = cache(async () => {
  const cookie = await getSessionCookie();
  const session = await decrypt(cookie);
  if (!session?.userId) return null;
  return { userId: session.userId };
});

// Restituisce l'utente corrente completo (con foto e dorm) oppure null.
export const getCurrentUser = cache(async () => {
  const session = await verifySession();
  if (!session) return null;
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: { photos: { orderBy: { order: "asc" } }, dorm: true },
  });
  return user;
});

// Da usare nelle pagine protette: reindirizza al login se non autenticato.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
