"use client";

import { CalendarPlus2, History, Home, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    label: "Home",
    icon: Home,
    href: "/dashboard/employee",
  },
  {
    label: "Cuti",
    icon: CalendarPlus2,
    href: "/dashboard/leave",
  },
  {
    label: "History",
    icon: History,
    href: "/dashboard/historyattendance",
  },
  {
    label: "Profil",
    icon: User,
    href: "/dashboard/profile",
  },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 z-[600] w-full border-t border-white/10 bg-[#050816]/80 px-6 pb-safe-area-inset-bottom pt-3 backdrop-blur-xl lg:hidden">
      <div className="mx-auto flex max-w-lg items-center justify-between">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          if (item.soon) {
            return (
              <button
                key={item.label}
                type="button"
                disabled
                className="flex flex-col items-center gap-1 opacity-40 transition"
              >
                <div className="relative">
                  <Icon className="h-5 w-5" />
                  <span className="absolute -right-1 -top-1 block h-1.5 w-1.5 rounded-full bg-fuchsia-400" />
                </div>
                <span className="text-[10px] font-medium tracking-wide">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 transition ${
                isActive ? "text-sky-400" : "text-zinc-400 hover:text-white"
              }`}
            >
              <div
                className={`flex items-center justify-center transition ${
                  isActive ? "scale-110" : ""
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium tracking-wide">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
