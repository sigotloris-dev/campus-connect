"use client";

import {
  startTransition,
  useActionState,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Plus, X } from "lucide-react";
import { updateProfile } from "@/app/actions/profile";
import {
  COUNTRIES,
  ENGLISH_LEVELS,
  ENGLISH_LEVEL_LABEL,
  MAX_PHOTOS,
  flagEmoji,
} from "@/lib/constants";

type Dorm = { id: string; name: string };
type Initial = {
  nationality: string;
  englishLevel: string;
  dormId: string;
  bio: string;
  photos: string[];
};

const inputClass =
  "w-full rounded-xl border border-[var(--border)] bg-white px-4 py-3 text-base outline-none focus:border-[var(--primary)]";

// Ridimensiona e comprime una foto nel browser (come in registrazione)
async function compressImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });
    const maxDim = 1080;
    const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    const width = Math.round(bitmap.width * scale);
    const height = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/jpeg", 0.75),
    );
    if (!blob) return file;
    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg" });
  } catch {
    return file;
  }
}

export function EditProfileForm({
  dorms,
  initial,
}: {
  dorms: Dorm[];
  initial: Initial;
}) {
  const [state, action, pending] = useActionState(updateProfile, undefined);
  const [compressing, setCompressing] = useState(false);
  const busy = pending || compressing;
  const [localError, setLocalError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nationality: initial.nationality,
    englishLevel: initial.englishLevel,
    dormId: initial.dormId,
    bio: initial.bio,
  });
  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const [keptPhotos, setKeptPhotos] = useState<string[]>(initial.photos);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  const fe = (state && !state.ok && state.fieldErrors) || {};

  const previews = useMemo(
    () =>
      newFiles.map((f) => ({
        key: `${f.name}-${f.size}-${f.lastModified}`,
        url: URL.createObjectURL(f),
      })),
    [newFiles],
  );
  useEffect(() => {
    return () => previews.forEach((p) => URL.revokeObjectURL(p.url));
  }, [previews]);

  const total = keptPhotos.length + newFiles.length;

  function onAddFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const list = e.target.files ? Array.from(e.target.files) : [];
    const room = Math.max(0, MAX_PHOTOS - total);
    if (room > 0) setNewFiles((prev) => [...prev, ...list.slice(0, room)]);
    e.target.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalError(null);
    if (total === 0) {
      setLocalError("Keep at least one photo");
      return;
    }
    if (!form.nationality || !form.englishLevel || !form.dormId) {
      setLocalError("Fill in all fields");
      return;
    }

    setCompressing(true);
    let compressed: File[];
    try {
      compressed = await Promise.all(newFiles.map(compressImage));
    } finally {
      setCompressing(false);
    }

    const fd = new FormData();
    fd.set("nationality", form.nationality);
    fd.set("englishLevel", form.englishLevel);
    fd.set("dormId", form.dormId);
    fd.set("bio", form.bio);
    for (const url of keptPhotos) fd.append("keepPhotos", url);
    for (const f of compressed) fd.append("photos", f, f.name);

    startTransition(() => action(fd));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Photos */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Photos <span className="text-[var(--muted)]">({total}/{MAX_PHOTOS})</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {keptPhotos.map((url) => (
            <div key={url} className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt="Photo"
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() => setKeptPhotos((p) => p.filter((u) => u !== url))}
                aria-label="Remove photo"
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {previews.map((p, i) => (
            <div key={p.key} className="relative aspect-square">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.url}
                alt="New photo"
                className="h-full w-full rounded-lg object-cover"
              />
              <button
                type="button"
                onClick={() =>
                  setNewFiles((prev) => prev.filter((_, idx) => idx !== i))
                }
                aria-label="Remove photo"
                className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white"
              >
                <X size={14} />
              </button>
            </div>
          ))}
          {total < MAX_PHOTOS && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-[var(--border)] bg-white text-[var(--muted)]"
              aria-label="Add photo"
            >
              <Plus size={22} />
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={onAddFiles}
          className="hidden"
        />
        {fe.photos && (
          <p className="mt-1 text-sm text-[var(--primary-600)]">{fe.photos[0]}</p>
        )}
      </div>

      {/* Nationality */}
      <div>
        <label className="mb-1 block text-sm font-medium">Nationality</label>
        <select
          value={form.nationality}
          onChange={(e) => set("nationality", e.target.value)}
          className={inputClass}
        >
          <option value="">Select…</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {flagEmoji(c.code)} {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* English level */}
      <div>
        <label className="mb-1 block text-sm font-medium">English level</label>
        <select
          value={form.englishLevel}
          onChange={(e) => set("englishLevel", e.target.value)}
          className={inputClass}
        >
          <option value="">Select…</option>
          {ENGLISH_LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {ENGLISH_LEVEL_LABEL[lvl]}
            </option>
          ))}
        </select>
      </div>

      {/* Dorm */}
      <div>
        <label className="mb-1 block text-sm font-medium">Dorm</label>
        <select
          value={form.dormId}
          onChange={(e) => set("dormId", e.target.value)}
          className={inputClass}
        >
          <option value="">Select…</option>
          {dorms.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>

      {/* Bio */}
      <div>
        <label className="mb-1 block text-sm font-medium">
          Bio <span className="text-[var(--muted)]">(optional)</span>
        </label>
        <textarea
          value={form.bio}
          onChange={(e) => set("bio", e.target.value)}
          rows={3}
          maxLength={300}
          className={inputClass + " resize-none"}
        />
      </div>

      {localError && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--primary-600)]">
          {localError}
        </p>
      )}
      {state && !state.ok && state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-[var(--primary-600)]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="brand-gradient mt-2 w-full rounded-xl py-3.5 font-semibold text-white shadow-md active:scale-[0.99] disabled:opacity-60"
      >
        {compressing ? "Optimizing photos…" : pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
