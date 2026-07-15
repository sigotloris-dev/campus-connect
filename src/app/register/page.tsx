import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { RegisterForm } from "./register-form";

export default async function RegisterPage() {
  if (await verifySession()) redirect("/swipe");
  const dorms = await prisma.dorm.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="app-shell px-6 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Create your profile
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          It only takes two minutes
        </p>
      </div>

      <RegisterForm dorms={dorms} />

      <p className="mt-6 text-center text-sm text-[var(--muted)]">
        Already have a profile?{" "}
        <Link href="/login" className="font-semibold text-[var(--primary)]">
          Log in
        </Link>
      </p>
    </div>
  );
}
