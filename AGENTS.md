<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Web-HRIS Agent Guardrails

Dokumen ini adalah aturan wajib untuk semua AI agent yang mengubah codebase ini.
Tujuan: memastikan perubahan **tidak keluar batas** dari struktur proyek, logic bisnis, dan standar implementasi TanStack Query.

## 1) Scope & Batas Perubahan

- Hanya ubah file yang relevan dengan task user.
- Jangan lakukan refactor besar tanpa diminta.
- Jangan mengubah environment, dependency utama, atau konfigurasi inti tanpa persetujuan user.
- Pertahankan naming, style, dan pola existing bila tidak ada instruksi berbeda.

## 2) Struktur Folder (Wajib Dipatuhi)

Gunakan struktur ini secara konsisten:

- `src/app/*` → routing, page/layout, server/client composition.
- `src/components/*` → komponen UI reusable (presentational).
- `src/hooks/*` → custom hooks reusable (`useXxx`).
- `src/services/*` → akses API/fetcher/business service layer.
- `src/utils/*` → helper murni (formatting, utility function).
- `src/constants/*` → konstanta statis (warna, role enum, dsb).
- `src/storage/*` → helper terkait storage/session lokal.

Aturan:
- Jangan taruh logic API langsung di komponen page jika sudah ada pattern service.
- Hindari duplikasi function lintas folder; gunakan helper/hook yang ada.
- Jika menambah file baru, letakkan di folder paling sesuai tanggung jawabnya.

## 3) Aturan Logic & Arsitektur

- Pisahkan **UI**, **state/data fetching**, dan **business logic**.
- Jangan campurkan validasi kompleks langsung di JSX; ekstrak ke helper/hook.
- Gunakan early return dan error handling yang jelas.
- Jangan menghapus logic existing yang masih dipakai tanpa analisis dampak.
- Untuk perubahan auth/role, pastikan kompatibel dengan alur `useAuth` dan proteksi dashboard.

## 4) Standar TanStack Query (Wajib)

### 4.1 Query Key
- Gunakan query key berbentuk array dan terstruktur.
- Gunakan factory/konstanta key bila sudah ada pola.
- Contoh: `['attendance', 'history', userId, params]`.

### 4.2 Query Function
- Query function harus berada di `services` (atau modul fetcher terpusat), bukan inline panjang di komponen.
- Selalu lempar error yang jelas jika response tidak valid.

### 4.3 Mutations
- Untuk create/update/delete gunakan `useMutation`.
- Setelah mutation sukses, lakukan `invalidateQueries` pada key terkait.
- Gunakan optimistic update hanya jika benar-benar diperlukan dan aman.

### 4.4 Loading/Error State
- Setiap query/mutation wajib punya UI state untuk:
  - loading,
  - error,
  - empty state (jika relevan),
  - success/data state.

### 4.5 Caching & Re-fetch
- Atur `staleTime`/`gcTime` secara rasional sesuai kebutuhan data.
- Hindari re-fetch berlebihan yang tidak perlu.

## 5) API & Data Contract

- Hormati contract response API yang ada.
- Jangan mengubah bentuk payload/request tanpa kebutuhan jelas.
- Jika butuh transformasi data, lakukan di layer service/helper agar UI tetap bersih.

## 6) UI/UX Dashboard Rules

- Pertahankan konsistensi dengan design system existing (`globals.css`, constants warna, komponen dashboard).
- Jangan membuat style inline berlebihan jika bisa gunakan pola existing.
- Pastikan responsive behavior tetap aman (mobile nav, header, content layout).

## 7) Quality Gates Sebelum Selesai

Sebelum menyelesaikan task, agent wajib memastikan:
- TypeScript tidak menambah error baru.
- Import tidak ada yang unused.
- Tidak ada dead code baru.
- Tidak ada perubahan file di luar scope task.
- Untuk fitur data: query + mutation + invalidation + state UI sudah konsisten.

## 8) Larangan

- Jangan membuat file duplikat untuk logic yang sama.
- Jangan hardcode endpoint di banyak tempat.
- Jangan bypass hook/service yang sudah menjadi jalur standar.
- Jangan ubah struktur folder inti tanpa instruksi eksplisit user.

## 9) Jika Instruksi User Tidak Jelas

- Jangan berasumsi berlebihan.
- Tanyakan klarifikasi singkat.
- Berikan opsi implementasi paling minim risiko terhadap codebase existing.
