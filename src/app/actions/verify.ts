"use server";

import { randomBytes } from "crypto";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";

const CODE_TTL_MS = 60 * 1000; // il QR è valido 60 secondi

async function member(matchId: string, userId: string) {
  const m = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      userAId: true,
      userBId: true,
      metAt: true,
      verifyCode: true,
      verifyCodeBy: true,
      verifyCodeExp: true,
    },
  });
  if (!m || (m.userAId !== userId && m.userBId !== userId)) return null;
  return m;
}

// Attiva un codice QR effimero (chi lo mostra all'altra persona)
export async function startVerification(
  matchId: string,
): Promise<{ ok: boolean; code?: string; expiresAt?: string; error?: string }> {
  const s = await verifySession();
  if (!s) throw new Error("Not authenticated");
  const m = await member(matchId, s.userId);
  if (!m) throw new Error("Match not found");
  if (m.metAt) return { ok: false, error: "Already verified" };

  const code = randomBytes(16).toString("hex");
  const expiresAt = new Date(Date.now() + CODE_TTL_MS);
  await prisma.match.update({
    where: { id: matchId },
    data: { verifyCode: code, verifyCodeBy: s.userId, verifyCodeExp: expiresAt },
  });
  return { ok: true, code, expiresAt: expiresAt.toISOString() };
}

// Riscatta il codice scansionato (chi inquadra il QR dell'altra persona)
export async function redeemVerification(
  matchId: string,
  code: string,
): Promise<{ ok: boolean; error?: string }> {
  const s = await verifySession();
  if (!s) throw new Error("Not authenticated");
  const m = await member(matchId, s.userId);
  if (!m) throw new Error("Match not found");
  if (m.metAt) return { ok: true }; // già verificato

  const clean = code.trim();
  if (!m.verifyCode || m.verifyCode !== clean) {
    return { ok: false, error: "Invalid code" };
  }
  if (!m.verifyCodeExp || m.verifyCodeExp.getTime() < Date.now()) {
    return { ok: false, error: "Code expired — ask them to activate it again" };
  }
  if (m.verifyCodeBy === s.userId) {
    return { ok: false, error: "Scan the other person's code, not your own" };
  }

  await prisma.match.update({
    where: { id: matchId },
    data: {
      metAt: new Date(),
      verifyCode: null,
      verifyCodeBy: null,
      verifyCodeExp: null,
    },
  });
  return { ok: true };
}

// Stato dell'incontro (usato in polling da chi mostra il QR)
export async function getMetStatus(matchId: string): Promise<{ met: boolean }> {
  const s = await verifySession();
  if (!s) throw new Error("Not authenticated");
  const m = await member(matchId, s.userId);
  if (!m) throw new Error("Match not found");
  return { met: !!m.metAt };
}
