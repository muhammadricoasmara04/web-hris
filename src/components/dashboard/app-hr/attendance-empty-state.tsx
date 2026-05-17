import { Activity, Search } from "lucide-react";

type AttendanceEmptyStateProps = {
  isLoading: boolean;
  isError: boolean;
  isEmpty: boolean;
  searchTerm: string;
  onRetry: () => void;
};

export function AttendanceEmptyState({
  isLoading,
  isError,
  isEmpty,
  searchTerm,
  onRetry,
}: AttendanceEmptyStateProps) {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-12 text-center">
        <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-sky-500 border-t-transparent"></div>
        <p className="text-zinc-400">Memuat data absensi...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-12 text-center text-rose-200">
        <Activity className="mx-auto mb-4 h-10 w-10 opacity-50" />
        <p>Gagal memuat data absensi.</p>
        <button
          onClick={onRetry}
          className="mt-4 text-xs font-semibold text-rose-300 underline underline-offset-4"
        >
          Coba lagi
        </button>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/20 p-12 text-center text-zinc-300">
        <Search className="mx-auto mb-4 h-10 w-10 opacity-20" />
        <p>Data absensi tidak ditemukan.</p>
        {searchTerm && (
          <p className="mt-1 text-center text-xs text-zinc-500">
            Tidak ada hasil untuk &quot;{searchTerm}&quot;
          </p>
        )}
      </div>
    );
  }

  return null;
}
