import { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type DashboardSectionCardProps = {
  eyebrow: string;
  title: string;
  icon: LucideIcon;
  iconColorClass?: string;
  children: ReactNode;
};

export function DashboardSectionCard({
  eyebrow,
  title,
  icon: Icon,
  iconColorClass = "text-sky-200",
  children,
}: DashboardSectionCardProps) {
  return (
    <article className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className={`text-sm ${iconColorClass}`}>{eyebrow}</p>
          <h2 className="mt-1 text-2xl font-semibold text-white">{title}</h2>
        </div>
        <div className={`rounded-2xl border border-white/10 bg-black/20 p-3 ${iconColorClass}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      {children}
    </article>
  );
}
