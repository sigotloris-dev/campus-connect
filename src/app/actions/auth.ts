"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/session";
import { RegisterSchema, LoginSchema, type FormState } from "@/lib/validation";
import { isValidPhoto, savePhoto } from "@/lib/uploads";
import { MAX_PHOTOS } from "@/lib/constants";

// Normalizza il codice studente per garantire unicità coerente
function normalizeCode(code: string): string {
  return code.trim().toUpperCase();
}

export async function register(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = {
    studentCode: String(formData.get("studentCode") ?? ""),
    firstName: String(formData.get("firstName") ?? ""),
    lastName: String(formData.get("lastName") ?? ""),
    email: String(formData.get("email") ?? ""),
    pin: String(formData.get("pin") ?? ""),
    birthDate: String(formData.get("birthDate") ?? ""),
    nationality: String(formData.get("nationality") ?? ""),
    englishLevel: String(formData.get("englishLevel") ?? ""),
    dormId: String(formData.get("dormId") ?? ""),
    departureDate: String(formData.get("departureDate") ?? ""),
    bio: String(formData.get("bio") ?? ""),
  };

  const parsed = RegisterSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  // Controlli semantici sulle date
  const fieldErrors: Record<string, string[]> = {};
  const birth = new Date(data.birthDate);
  const age = ageFrom(birth);
  if (Number.isNaN(birth.getTime()) || age < 16 || age > 99) {
    fieldErrors.birthDate = ["You must be at least 16"];
  }
  const departure = new Date(data.departureDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (Number.isNaN(departure.getTime()) || departure < today) {
    fieldErrors.departureDate = ["The date must be in the future"];
  }

  // Foto: almeno 1, massimo 4
  const files = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    fieldErrors.photos = ["Upload at least one photo"];
  } else if (files.length > MAX_PHOTOS) {
    fieldErrors.photos = [`${MAX_PHOTOS} photos max`];
  } else {
    for (const f of files) {
      const err = isValidPhoto(f);
      if (err) {
        fieldErrors.photos = [err];
        break;
      }
    }
  }

  // Accettazione delle policy (obbligatoria)
  if (String(formData.get("acceptedPolicies") ?? "") !== "1") {
    fieldErrors.acceptedPolicies = ["You must accept the policies"];
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  const studentCode = normalizeCode(data.studentCode);

  // Unicità codice studente ed email
  const existing = await prisma.user.findFirst({
    where: { OR: [{ studentCode }, { email: data.email }] },
    select: { studentCode: true, email: true },
  });
  if (existing) {
    if (existing.studentCode === studentCode) {
      return {
        ok: false,
        fieldErrors: { studentCode: ["This student ID is already registered"] },
      };
    }
    return { ok: false, fieldErrors: { email: ["This email is already registered"] } };
  }

  // Salva le foto (Vercel Blob in produzione). Se fallisce, mostra il motivo
  // invece di far crashare la pagina.
  const photoUrls: string[] = [];
  try {
    for (const f of files) {
      photoUrls.push(await savePhoto(f));
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : "errore sconosciuto";
    console.error("[register] savePhoto failed:", msg);
    return {
      ok: false,
      fieldErrors: { photos: [`Caricamento foto non riuscito: ${msg}`] },
    };
  }

  const pinHash = await bcrypt.hash(data.pin, 10);

  await prisma.user.create({
    data: {
      studentCode,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      pinHash,
      birthDate: birth,
      nationality: data.nationality,
      englishLevel: data.englishLevel,
      dormId: data.dormId,
      departureDate: departure,
      bio: data.bio ? data.bio : null,
      acceptedPoliciesAt: new Date(),
      photos: {
        create: photoUrls.map((url, i) => ({ url, order: i })),
      },
    },
    select: { id: true },
  }).then((u) => createSession(u.id));

  redirect("/swipe");
}

export async function login(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = LoginSchema.safeParse({
    studentCode: String(formData.get("studentCode") ?? ""),
    pin: String(formData.get("pin") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const studentCode = normalizeCode(parsed.data.studentCode);
  const user = await prisma.user.findUnique({
    where: { studentCode },
    select: { id: true, pinHash: true },
  });

  const valid = user && (await bcrypt.compare(parsed.data.pin, user.pinHash));
  if (!user || !valid) {
    return { ok: false, error: "Incorrect student ID or PIN" };
  }

  await createSession(user.id);
  redirect("/swipe");
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}

function ageFrom(birth: Date): number {
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}
