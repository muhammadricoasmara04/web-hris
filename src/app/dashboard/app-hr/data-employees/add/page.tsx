"use client";

import { useState } from "react";
import { UserPlus, Loader2, ArrowLeft } from "lucide-react";
import { buildApiUrl } from "@/api/api";
import { authFetch } from "@/services/authClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

export default function AddEmployeePage() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await authFetch(buildApiUrl("/api/departments"));
      if (!res.ok) return [];
      const json = await res.json();
      return (Array.isArray(json) ? json : json.data || []) as any[];
    }
  });

  const { data: employees = [] } = useQuery({
    queryKey: ["employees", "all"],
    queryFn: async () => {
      const res = await authFetch(buildApiUrl("/api/auth/users"));
      if (!res.ok) return [];
      const json = await res.json();
      return (Array.isArray(json) ? json : json.data || []) as any[];
    }
  });

  const { data: positions = [] } = useQuery({
    queryKey: ["positions"],
    queryFn: async () => {
      const res = await authFetch(buildApiUrl("/api/positions"));
      if (!res.ok) return [];
      const json = await res.json();
      return (Array.isArray(json) ? json : json.data || []) as any[];
    }
  });
  
  const [isNikEditable, setIsNikEditable] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    nik: "",
    department: "",
    role: "EMPLOYEE",
    salary: "",
    bankName: "",
    bankAccountNumber: "",
    phone: "",
    joinDate: "",
    ktpNumber: "",
    birthPlace: "",
    birthDate: "",
    gender: "",
    religion: "",
    maritalStatus: "",
    bloodType: "",
    addressKtp: "",
    addressDomisili: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
    emergencyContactRelation: "",
    employmentStatus: "",
    contractEndDate: "",
    position: "",
    managerId: "",
    npwpNumber: "",
    bpjsKesehatan: "",
    bpjsKetenagakerjaan: "",
  });
  const [error, setError] = useState("");

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      try {
        const url = buildApiUrl("/api/auth/register");
        const payload = {
          ...data,
          departmentId: data.department || undefined,
          positionId: data.position || undefined
        };
        const response = await authFetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorMsg = `Gagal mendaftarkan karyawan (Error ${response.status})`;
          try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
              errorMsg = errorData.message;
            }
          } catch (e) {
            // Abaikan jika response bukan JSON (misal HTML 500 Error)
          }
          throw new Error(errorMsg);
        }

        return await response.json();
      } catch (err: any) {
        // Tangkap semua error, baik dari response.ok maupun dari authFetch/network error
        throw new Error(err.message || "Terjadi kesalahan internal pada server (500).");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", "all"] });
      Swal.fire({
        title: 'Berhasil!',
        text: 'Karyawan baru berhasil didaftarkan.',
        icon: 'success',
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#0ea5e9'
      }).then(() => {
        router.push("/dashboard/app-hr/data-employees");
      });
    },
    onError: (err: any) => {
      setError(err.message);
      Swal.fire({
        title: 'Gagal Mendaftar!',
        text: err.message,
        icon: 'error',
        background: '#18181b',
        color: '#fff',
        confirmButtonColor: '#ef4444'
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      if (name === "department") {
        newData.position = "";
        const selectedDept = departments.find((d: any) => d.name === value || d.id === value);
        if (selectedDept && selectedDept.code) {
          const deptCode = selectedDept.code;
          let maxNum = 0;
          employees.forEach((emp: any) => {
             if (emp.nik && emp.nik.startsWith(`${deptCode}-`)) {
               const numPart = emp.nik.split('-')[1];
               const num = parseInt(numPart, 10);
               if (!isNaN(num) && num > maxNum) {
                 maxNum = num;
               }
             }
          });
          const nextNum = maxNum + 1;
          newData.nik = `${deptCode}-${nextNum.toString().padStart(4, '0')}`;
        }
      }
      
      return newData;
    });
  };

  const filteredPositions = positions.filter((pos: any) => pos.departmentId === formData.department);

  return (
    <div className="space-y-6 pb-20 pt-20 max-w-4xl mx-auto">
      <header className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        <Link 
          href="/dashboard/app-hr/data-employees" 
          className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Data Karyawan
        </Link>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-sky-500/10 p-3 text-sky-400">
            <UserPlus className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Tambah Data Karyawan</h1>
            <p className="mt-1 text-sm text-zinc-300">Lengkapi formulir di bawah ini untuk mendaftarkan karyawan baru.</p>
          </div>
        </div>
      </header>

      <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
        {error && (
          <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Akun & Kredensial */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">1. Informasi Akun & Kredensial</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Nama Lengkap</label>
                <input type="text" name="name" required value={formData.name} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Email</label>
                <input type="email" name="email" required value={formData.email} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Password</label>
                <input type="password" name="password" required value={formData.password} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="••••••••" />
              </div>
            </div>
          </div>

          {/* Data Pekerjaan */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">2. Data Pekerjaan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">NIK (Nomor Induk Karyawan)</label>
                <input 
                  type="text" 
                  name="nik" 
                  required 
                  disabled={!isNikEditable}
                  value={formData.nik} 
                  onChange={handleChange} 
                  className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 disabled:opacity-50 disabled:cursor-not-allowed [color-scheme:dark]" 
                  placeholder="Pilih departemen untuk otomatisasi NIK" 
                />
                {!isNikEditable && (
                  <button 
                    type="button" 
                    onClick={() => {
                      Swal.fire({
                        title: 'Yakin ingin edit manual?',
                        text: "Pastikan format NIK sesuai dengan aturan HRD perusahaan.",
                        icon: 'warning',
                        showCancelButton: true,
                        background: '#18181b',
                        color: '#fff',
                        confirmButtonColor: '#0ea5e9',
                        cancelButtonColor: '#ef4444',
                        confirmButtonText: 'Ya, Edit',
                        cancelButtonText: 'Batal'
                      }).then((result) => {
                        if (result.isConfirmed) {
                          setIsNikEditable(true);
                        }
                      });
                    }} 
                    className="text-xs text-sky-400 hover:text-sky-300 hover:underline transition-all"
                  >
                    Edit secara manual
                  </button>
                )}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Departemen</label>
                <select name="department" value={formData.department} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]">
                  <option value="">-- Pilih Departemen --</option>
                  {departments.map((dept: any) => (
                    <option key={dept.id} value={dept.id}>{dept.name} ({dept.code})</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Posisi (Jabatan)</label>
                <select 
                  name="position" 
                  value={formData.position} 
                  onChange={handleChange} 
                  className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"
                  disabled={!formData.department}
                >
                  <option value="">{formData.department ? "-- Pilih Posisi --" : "Pilih departemen dahulu"}</option>
                  {filteredPositions.map((pos: any) => (
                    <option key={pos.id} value={pos.id}>
                      {pos.name} {pos.level ? `(${pos.level})` : ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Status Karyawan</label><select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"><option value="">-- Pilih Status --</option><option value="PERMANENT">Tetap</option><option value="CONTRACT">Kontrak</option><option value="INTERNSHIP">Probation/Internship</option><option value="FREELANCE">Freelance</option></select></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Tanggal Bergabung</label><input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" /></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Akhir Kontrak (Opsional)</label><input type="date" name="contractEndDate" value={formData.contractEndDate} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" /></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">ID Manajer (Opsional)</label><input type="text" name="managerId" value={formData.managerId} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="Kosongkan jika tidak ada" /></div>
            </div>
          </div>

          {/* Data Pribadi */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">3. Data Pribadi</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Nomor HP</label><input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="081234567890" /></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Nomor KTP (NIK Kependudukan)</label><input type="text" name="ktpNumber" value={formData.ktpNumber} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="16 Digit Angka" /></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Tempat Lahir</label><input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="Jakarta" /></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Tanggal Lahir</label><input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" /></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Jenis Kelamin</label><select name="gender" value={formData.gender} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"><option value="">-- Pilih --</option><option value="MALE">Laki-laki</option><option value="FEMALE">Perempuan</option></select></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Agama</label><select name="religion" value={formData.religion} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"><option value="">-- Pilih --</option><option value="Islam">Islam</option><option value="Kristen">Kristen</option><option value="Katolik">Katolik</option><option value="Hindu">Hindu</option><option value="Buddha">Buddha</option><option value="Konghucu">Konghucu</option></select></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Status Pernikahan</label><select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"><option value="">-- Pilih --</option><option value="SINGLE">Belum Menikah</option><option value="MARRIED">Menikah</option><option value="DIVORCED">Cerai</option><option value="WIDOWED">Janda/Duda</option></select></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Golongan Darah</label><select name="bloodType" value={formData.bloodType} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]"><option value="">-- Pilih --</option><option value="A">A</option><option value="B">B</option><option value="AB">AB</option><option value="O">O</option></select></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Alamat KTP</label><textarea name="addressKtp" rows={3} value={formData.addressKtp} onChange={(e) => setFormData(p => ({...p, addressKtp: e.target.value}))} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="Sesuai KTP"></textarea></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Alamat Domisili</label><textarea name="addressDomisili" rows={3} value={formData.addressDomisili} onChange={(e) => setFormData(p => ({...p, addressDomisili: e.target.value}))} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="Tempat tinggal saat ini"></textarea></div>
            </div>
          </div>

          {/* Kontak Darurat */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">4. Kontak Darurat</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Nama Kontak</label><input type="text" name="emergencyContactName" value={formData.emergencyContactName} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="Nama" /></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">No. HP Kontak</label><input type="tel" name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="0812..." /></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Hubungan</label><input type="text" name="emergencyContactRelation" value={formData.emergencyContactRelation} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="Orang Tua, Pasangan, dll" /></div>
            </div>
          </div>

          {/* Data Finansial & Legal */}
          <div>
            <h2 className="text-lg font-semibold text-white mb-4 border-b border-white/10 pb-2">5. Data Keuangan & Legal</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Gaji Pokok (Rp)</label><input type="number" name="salary" value={formData.salary} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="5000000" /></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Nama Bank</label><input type="text" name="bankName" value={formData.bankName} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="BCA, Mandiri, BRI, dll" /></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Nomor Rekening</label><input type="text" name="bankAccountNumber" value={formData.bankAccountNumber} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="1234567890" /></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">No. NPWP</label><input type="text" name="npwpNumber" value={formData.npwpNumber} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="Nomor NPWP" /></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">No. BPJS Kesehatan</label><input type="text" name="bpjsKesehatan" value={formData.bpjsKesehatan} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="No. BPJS Kesehatan" /></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">No. BPJS Ketenagakerjaan</label><input type="text" name="bpjsKetenagakerjaan" value={formData.bpjsKetenagakerjaan} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="No. BPJS TK" /></div>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-3 pt-6 border-t border-white/10">
            <Link
              href="/dashboard/app-hr/data-employees"
              className="rounded-xl border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-zinc-300 hover:bg-white/10 transition-colors"
            >
              Batal
            </Link>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {mutation.isPending ? "Menyimpan..." : "Simpan Karyawan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
