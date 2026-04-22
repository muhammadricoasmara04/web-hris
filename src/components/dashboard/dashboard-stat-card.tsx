import { LucideIcon } from "lucide-react";

type DashboardStatCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  accent: string;
};

export function DashboardStatCard({
  label,
  value,
  detail,
  icon: Icon,
  accent,
}: DashboardStatCardProps) {
  return (
    <article
      className={`rounded-[28px] border border-white/10 bg-gradient-to-br ${accent} p-5 shadow-lg backdrop-blur-xl`}
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white">
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-xs uppercase tracking-[0.24em] text-zinc-300">Live</span>
      </div>
      <p className="text-sm text-zinc-300">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-zinc-400">{detail}</p>
    </article>
  );
}
