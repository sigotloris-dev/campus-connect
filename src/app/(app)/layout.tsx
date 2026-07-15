import { requireUser } from "@/lib/dal";
import { BottomNav } from "@/components/bottom-nav";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Protegge tutte le rotte dell'area app
  await requireUser();

  return (
    <div className="app-shell">
      <main className="flex flex-1 flex-col">{children}</main>
      <BottomNav />
    </div>
  );
}
