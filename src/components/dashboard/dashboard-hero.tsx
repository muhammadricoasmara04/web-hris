import { LucideIcon } from "lucide-react";
import Link from "next/link";

export type DashboardHeroAction = {
  id: string;
  href: string;
  label: string;
  icon: LucideIcon;
  variant?: "primary" | "secondary";
};

type DashboardHeroProps = {
  badge: string;
  title: string;
  description: string;
  actions: DashboardHeroAction[];
};

export function DashboardHero({
  badge,
  title,
  description,
  actions,
}: DashboardHeroProps) {
  return (
    <header className="overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_0_80px_rgba(59,130,246,0.08)] backdrop-blur-xl">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-medium text-sky-200">
            {badge}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-300 sm:text-base">
            {description}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon;
            const isPrimary = action.variant !== "secondary";

            return (
              <Link
                key={action.id}
                id={action.id}
                href={action.href}
                className={
                  isPrimary
                    ? "inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:scale-[1.02] hover:bg-zinc-100"
                    : "inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:border-sky-400/40 hover:bg-white/10"
                }
              >
                {action.label}
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
