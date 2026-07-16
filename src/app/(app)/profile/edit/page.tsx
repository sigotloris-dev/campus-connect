import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/dal";
import { EditProfileForm } from "./edit-form";

export default async function EditProfilePage() {
  const user = await requireUser();
  const dorms = await prisma.dorm.findMany({ orderBy: { name: "asc" } });

  const initial = {
    birthDate: user.birthDate.toISOString().slice(0, 10),
    nationality: user.nationality,
    englishLevel: user.englishLevel,
    dormId: user.dormId ?? "",
    bio: user.bio ?? "",
    photos: user.photos.map((p) => p.url),
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-[var(--border)] bg-white/90 px-3 py-2.5 backdrop-blur">
        <Link href="/profile" className="p-1 text-[var(--muted)]">
          <ChevronLeft size={24} />
        </Link>
        <span className="font-semibold">Edit profile</span>
      </header>

      <div className="px-5 py-5">
        <EditProfileForm dorms={dorms} initial={initial} />
      </div>
    </div>
  );
}
