"use server";

import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

export type ChatMessage = {
  id: string;
  body: string;
  senderId: string;
  createdAt: string;
};

async function assertMember(matchId: string, userId: string) {
  const m = await prisma.match.findUnique({
    where: { id: matchId },
    select: { userAId: true, userBId: true, variant: true },
  });
  if (!m || (m.userAId !== userId && m.userBId !== userId)) return null;
  return m;
}

export async function sendMessage(
  matchId: string,
  body: string,
): Promise<{ ok: boolean; message?: ChatMessage }> {
  const s = await verifySession();
  if (!s) throw new Error("Not authenticated");
  const text = body.trim();
  if (!text) return { ok: false };

  const m = await assertMember(matchId, s.userId);
  if (!m) throw new Error("Match not found");
  if (m.variant !== "CHAT") throw new Error("Chat not available for this match");

  const msg = await prisma.message.create({
    data: { matchId, senderId: s.userId, body: text.slice(0, 1000) },
    select: { id: true, body: true, senderId: true, createdAt: true },
  });
  return {
    ok: true,
    message: { ...msg, createdAt: msg.createdAt.toISOString() },
  };
}

export async function getMessages(matchId: string): Promise<ChatMessage[]> {
  const s = await verifySession();
  if (!s) throw new Error("Not authenticated");
  const m = await assertMember(matchId, s.userId);
  if (!m) throw new Error("Match not found");

  const msgs = await prisma.message.findMany({
    where: { matchId },
    orderBy: { createdAt: "asc" },
    select: { id: true, body: true, senderId: true, createdAt: true },
  });
  return msgs.map((x) => ({ ...x, createdAt: x.createdAt.toISOString() }));
}
