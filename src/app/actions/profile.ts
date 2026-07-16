"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { del } from "@vercel/blob";
import { verifySession } from "@/lib/dal";
import { prisma } from "@/lib/prisma";
import { EditProfileSchema, type FormState } from "@/lib/validation";
import { isValidPhoto, savePhoto } from "@/lib/uploads";
import { MAX_PHOTOS } from "@/lib/constants";

export async function updateProfile(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const session = await verifySession();
  if (!session) throw new Error("Not authenticated");
  const me = session.userId;

  const parsed = EditProfileSchema.safeParse({
    nationality: String(formData.get("nationality") ?? ""),
    englishLevel: String(formData.get("englishLevel") ?? ""),
    dormId: String(formData.get("dormId") ?? ""),
    bio: String(formData.get("bio") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };
  }
  const data = parsed.data;

  const fieldErrors: Record<string, string[]> = {};

  // Foto: quelle da tenere + eventuali nuove (compresse lato client)
  const keep = formData.getAll("keepPhotos").map((v) => String(v));
  const files = formData
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0);
  const total = keep.length + files.length;
  if (total === 0) {
    fieldErrors.photos = ["Keep at least one photo"];
  } else if (total > MAX_PHOTOS) {
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

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, fieldErrors };
  }

  // Foto attuali → determina quelle rimosse
  const current = await prisma.photo.findMany({
    where: { userId: me },
    select: { url: true },
  });
  const keepSet = new Set(keep);
  const removed = current.filter((p) => !keepSet.has(p.url)).map((p) => p.url);

  // Salva le nuove foto
  const newUrls: string[] = [];
  try {
    for (const f of files) newUrls.push(await savePhoto(f));
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown error";
    return { ok: false, fieldErrors: { photos: [`Upload failed: ${msg}`] } };
  }

  // Elimina i blob rimossi (best effort; solo URL remoti)
  for (const url of removed) {
    if (url.startsWith("http")) {
      try {
        await del(url);
      } catch {
        /* ignora fallimenti di cleanup */
      }
    }
  }

  const finalUrls = [...keep, ...newUrls];

  await prisma.$transaction([
    prisma.photo.deleteMany({ where: { userId: me } }),
    prisma.photo.createMany({
      data: finalUrls.map((url, i) => ({ userId: me, url, order: i })),
    }),
    prisma.user.update({
      where: { id: me },
      data: {
        nationality: data.nationality,
        englishLevel: data.englishLevel,
        dormId: data.dormId,
        bio: data.bio ? data.bio : null,
      },
    }),
  ]);

  revalidatePath("/profile");
  redirect("/profile");
}
