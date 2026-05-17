import { CalendarDays, Search } from "lucide-react";

type AttendanceFiltersProps = {
  period: "today" | "week" | "month" | "year" | "custom";
  startDate: string;
  endDate: string;
  searchTerm: string;
  onPeriodChange: (period: "today" | "week" | "month" | "year" | "custom") => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onSearchChange: (search: string) => void;
};

export function AttendanceFilters({
  period,
  startDate,
  endDate,
  searchTerm,
  onPeriodChange,
  onStartDateChange,
  onEndDateChange,
  onSearchChange,
}: AttendanceFiltersProps) {
  return (
    <div className="mb-6 grid gap-4 lg:grid-cols-4">
      <div className="space-y-2">
        <label htmlFor="attendance-period-filter" className="text-sm font-medium text-zinc-300">
          Periode
        </label>
        <select
          id="attendance-period-filter"
          value={period}
          onChange={(event) => onPeriodChange(event.target.value as any)}
          className="w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-500/50"
        >
          <option value="today">Hari Ini</option>
          <option value="week">Minggu Ini</option>
          <option value="month">Bulan Ini</option>
          <option value="year">Tahun Ini</option>
          <option value="custom">Kustom (Pilih Tanggal)</option>
        </select>
      </div>

      {period === "custom" && (
        <div className="lg:col-span-2">
          <label className="mb-2 block text-sm font-medium text-zinc-300">Search by Date Range</label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-300" />
              <input
                id="attendance-date-start"
                type="date"
                value={startDate}
                onChange={(event) => onStartDateChange(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-sky-500/50 [color-scheme:dark]"
              />
            </div>
            <span className="text-xs font-medium text-zinc-500">s/d</span>
            <div className="relative flex-1">
              <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sky-300" />
              <input
                id="attendance-date-end"
                type="date"
                value={endDate}
                onChange={(event) => onEndDateChange(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-3 text-sm text-white outline-none focus:border-sky-500/50 [color-scheme:dark]"
              />
            </div>
          </div>
        </div>
      )}

      <div className={period === "custom" ? "space-y-2" : "space-y-2 lg:col-span-3"}>
        <label htmlFor="attendance-text-search" className="text-sm font-medium text-zinc-300">
          Pencarian
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            id="attendance-text-search"
            type="text"
            placeholder="NIK, Nama, Departemen..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-10 pr-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-sky-500/50"
          />
        </div>
      </div>
    </div>
  );
}
