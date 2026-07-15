import "server-only";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const MAX_BYTES = 6 * 1024 * 1024; // 6 MB
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export function isValidPhoto(file: File): string | null {
  if (!ALLOWED.has(file.type)) return "Invalid format (use JPG, PNG or WEBP)";
  if (file.size > MAX_BYTES) return "Image too large (max 6 MB)";
  return null;
}

function extOf(file: File): string {
  return file.type === "image/png"
    ? "png"
    : file.type === "image/webp"
      ? "webp"
      : "jpg";
}

// Salva un file immagine e restituisce l'URL pubblico.
// In produzione usa Vercel Blob; in locale (senza token) salva su disco.
export async function savePhoto(file: File): Promise<string> {
  const name = `${randomUUID()}.${extOf(file)}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(`photos/${name}`, file, {
      access: "public",
      contentType: file.type,
    });
    return blob.url;
  }

  // Fallback per lo sviluppo locale
  await mkdir(UPLOAD_DIR, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(UPLOAD_DIR, name), bytes);
  return `/uploads/${name}`;
}
