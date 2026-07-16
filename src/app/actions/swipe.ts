"use server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export type SwipeResult = {
  matched: boolean;
  matchId?: string;
  name?: string;
};

export async function swipe(
  toUserId: string,
  liked: boolean,
): Promise<SwipeResult> {
  const session = await verifySession();
  if (!session) throw new Error("Not authenticated");
  const me = session.userId;
  if (toUserId === me) return { matched: false };

  // Registra lo swipe (idempotente)
  await prisma.swipe.upsert({
    where: { fromUserId_toUserId: { fromUserId: me, toUserId } },
    update: { liked },
    create: { fromUserId: me, toUserId, liked },
  });

  if (!liked) return { matched: false };

  // Verifica il like reciproco
  const reciprocal = await prisma.swipe.findUnique({
    where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: me } },
    select: { liked: true },
  });
  if (!reciprocal?.liked) return { matched: false };

  // Coppia ordinata per garantire unicità indipendentemente da chi swipa
  const [userAId, userBId] = [me, toUserId].sort();
  let match = await prisma.match.findUnique({
    where: { userAId_userBId: { userAId, userBId } },
    select: { id: true },
  });
  if (!match) {
    match = await prisma.match.create({
      data: { userAId, userBId },
      select: { id: true },
    });
  }

  const other = await prisma.user.findUnique({
    where: { id: toUserId },
    select: { firstName: true },
  });

  return { matched: true, matchId: match.id, name: other?.firstName };
}
