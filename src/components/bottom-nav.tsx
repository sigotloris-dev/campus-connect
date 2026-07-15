"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, MessageCircleHeart, User } from "lucide-react";

const items = [
  { href: "/swipe", label: "Discover", Icon: Flame },
  { href: "/matches", label: "Matches", Icon: MessageCircleHeart },
  { href: "/profile", label: "Profile", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-20 border-t border-[var(--border)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-[30rem] items-stretch">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-1 flex-col items-center gap-0.5 py-2.5"
            >
              <Icon
                size={24}
                className={active ? "text-[var(--primary)]" : "text-[var(--muted)]"}
                strokeWidth={active ? 2.4 : 2}
              />
              <span
                className={`text-[11px] font-medium ${
                  active ? "text-[var(--primary)]" : "text-[var(--muted)]"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
