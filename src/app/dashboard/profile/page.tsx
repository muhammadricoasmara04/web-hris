"use client";

import { getMe } from "@/services/authService";
import { clearAuthSession } from "@/utils/auth-storage";
import { useQuery } from "@tanstack/react-query";
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Building2, 
  LogOut, 
  Settings, 
  ChevronRight,
  MapPin,
  Briefcase
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { modal } from "@/constants/modal";

type MePayload = {
  name?: string;
  fullname?: string;
  fullName?: string;
  username?: string;
  email?: string;
  role?: string;
  department?: string;
  division?: string;
  position?: string;
  location?: string;
  data?: MePayload;
  user?: MePayload;
  profile?: MePayload;
};

const pickValue = (source: MePayload | undefined, keys: (keyof MePayload)[]): string | undefined => {
  if (!source) return undefined;
  for (const key of keys) {
    if (source[key]) return String(source[key]);
  }
  return undefined;
};

const extractProfileData = (payload: unknown) => {
  if (!payload || typeof payload !== "object") return null;

  const source = payload as MePayload;
  const data = source.data || source.user || source.profile || source;

  let roleString = pickValue(data, ["role"]);
  if (data.role && typeof data.role === "object") {
    roleString = (data.role as any).name || roleString;
  }

  return {
    name: pickValue(data, ["name", "fullname", "fullName", "username"]) ?? "Karyawan HRIS",
    email: pickValue(data, ["email"]) ?? "user@perusahaan.com",
    role: roleString ?? "Karyawan",
    department: pickValue(data, ["department", "division"]) ?? "Operasional",
    position: pickValue(data, ["position"]) ?? "Staff",
    location: pickValue(data, ["location"]) ?? "Kantor Pusat",
  };
};

export default function ProfilePage() {
  const router = useRouter();

  const { data: rawData, isLoading } = useQuery({
    queryKey: ["profile-me"],
    queryFn: getMe,
  });

  const profile = extractProfileData(rawData);

  const handleLogout = async () => {
    const confirmed = await modal.confirm(
      "Konfirmasi Logout",
      "Apakah Anda yakin ingin keluar dari aplikasi?"
    );

    if (confirmed) {
      clearAuthSession();
      router.replace("/login");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#04070F] text-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#16203A_0%,#070C18_45%,#04070F_100%)] px-4 pb-32 pt-12 md:px-8">
      <div className="mx-auto max-w-2xl">
        {/* Profile Card Header */}
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl shadow-2xl">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-sky-500/10 blur-[80px]" />
          
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border-4 border-white/20 bg-white/10 shadow-lg">
              <User className="absolute inset-0 m-auto h-12 w-12 text-sky-300/50" />
              {/* Image would go here once we have a real source */}
            </div>
            
            <h1 className="text-2xl font-bold tracking-tight text-white">{profile?.name}</h1>
            <p className="mt-1 text-sm font-semibold uppercase tracking-widest text-sky-400/80">
              {profile?.position} • {profile?.department}
            </p>
            
            <div className="mt-6 flex gap-2">
              <button className="flex items-center gap-2 rounded-full bg-sky-500 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-sky-400 active:scale-95 shadow-lg shadow-sky-500/20">
                <Settings className="h-4 w-4" />
                Edit Profil
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Info Section */}
        <div className="mt-6 grid gap-4">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="mb-4 text-xs font-bold uppercase tracking-[0.2em] text-white/40">Informasi Pribadi</h2>
            
            <div className="grid gap-5">
              <InfoRow icon={<Mail className="h-5 w-5 text-sky-300" />} label="Alamat Email" value={profile?.email} />
              <InfoRow icon={<Briefcase className="h-5 w-5 text-sky-300" />} label="Jabatan" value={profile?.position} />
              <InfoRow icon={<Building2 className="h-5 w-5 text-sky-300" />} label="Departemen" value={profile?.department} />
              <InfoRow icon={<MapPin className="h-5 w-5 text-sky-300" />} label="Lokasi Kerja" value={profile?.location} />
              <InfoRow icon={<ShieldCheck className="h-5 w-5 text-sky-300" />} label="Status Akun" value="Aktif / Terverifikasi" isStatus />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
             <button 
                onClick={handleLogout}
                className="flex w-full items-center justify-between rounded-2xl px-4 py-4 text-rose-400 transition hover:bg-rose-500/10 active:scale-[0.98]"
             >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/20">
                    <LogOut className="h-5 w-5" />
                  </div>
                  <span className="font-bold">Keluar Aplikasi</span>
                </div>
                <ChevronRight className="h-5 w-5 opacity-40" />
             </button>
          </div>
        </div>

        <p className="mt-12 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/20">
          WEB-HRIS V1.0 • 2026
        </p>
      </div>
    </main>
  );
}

function InfoRow({ 
  icon, 
  label, 
  value, 
  isStatus = false 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value?: string;
  isStatus?: boolean;
}) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 shadow-inner">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">{label}</span>
        <span className={`text-sm font-semibold ${isStatus ? "text-emerald-400" : "text-white"}`}>
          {value || "-"}
        </span>
      </div>
    </div>
  );
}
