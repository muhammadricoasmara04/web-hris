"use client";

import { useState, useEffect, Suspense } from "react";
import { UserCog, Loader2, ArrowLeft } from "lucide-react";
import { buildApiUrl } from "@/api/api";
import { authFetch } from "@/services/authClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";

function EditEmployeeForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const employeeId = searchParams.get("id");

  const { data: departments = [] } = useQuery({
    queryKey: ["departments"],
    queryFn: async () => {
      const res = await authFetch(buildApiUrl("/api/departments"));
      if (!res.ok) return [];
      const json = await res.json();
      return (Array.isArray(json) ? json : json.data || []) as any[];
    }
  });

  const { data: roles = [] } = useQuery({
    queryKey: ["roles"],
    queryFn: async () => {
      const res = await authFetch(buildApiUrl("/api/roles"));
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

  const { data: existingEmployee, isLoading: isEmployeeLoading, isError: isEmployeeError } = useQuery({
    queryKey: ["employee", employeeId],
    queryFn: async () => {
      if (!employeeId) throw new Error("ID Karyawan tidak ditemukan");
      const res = await authFetch(buildApiUrl(`/api/auth/users/${employeeId}`));
      if (!res.ok) throw new Error("Gagal mengambil data karyawan");
      const json = await res.json();
      return json.data || null;
    },
    enabled: !!employeeId,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // Password dikosongkan secara default
    nik: "",
    department: "",
    role: "",
    status: "",
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

  // Helper untuk mengubah tanggal dari API menjadi format YYYY-MM-DD
  const formatDateForInput = (dateString: string | null) => {
    if (!dateString) return "";
    
    // Jika formatnya sudah YYYY-MM-DD, biarkan
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
    
    try {
      const d = new Date(dateString);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
    } catch (e) {
      // Abaikan error konversi tanggal
    }
    
    return "";
  };

  useEffect(() => {
    if (existingEmployee) {
      setFormData({
        name: existingEmployee.name || "",
        email: existingEmployee.email || "",
        password: "", // Jangan tampilkan password lama
        nik: existingEmployee.nik || "",
        department: existingEmployee.department?.id || "",
        role: existingEmployee.role?.name || "",
        status: existingEmployee.status || "ACTIVE",
        salary: existingEmployee.salary ? String(existingEmployee.salary) : "",
        bankName: existingEmployee.bankName || "",
        bankAccountNumber: existingEmployee.bankAccountNumber || "",
        phone: existingEmployee.phone || "",
        joinDate: formatDateForInput(existingEmployee.joinDate),
        ktpNumber: existingEmployee.ktpNumber || "",
        birthPlace: existingEmployee.birthPlace || "",
        birthDate: formatDateForInput(existingEmployee.birthDate),
        gender: existingEmployee.gender || "",
        religion: existingEmployee.religion || "",
        maritalStatus: existingEmployee.maritalStatus || "",
        bloodType: existingEmployee.bloodType || "",
        addressKtp: existingEmployee.addressKtp || "",
        addressDomisili: existingEmployee.addressDomisili || "",
        emergencyContactName: existingEmployee.emergencyContactName || "",
        emergencyContactPhone: existingEmployee.emergencyContactPhone || "",
        emergencyContactRelation: existingEmployee.emergencyContactRelation || "",
        employmentStatus: existingEmployee.employmentStatus || "",
        contractEndDate: formatDateForInput(existingEmployee.contractEndDate),
        position: existingEmployee.position?.id || "",
        managerId: existingEmployee.managerId || "",
        npwpNumber: existingEmployee.npwpNumber || "",
        bpjsKesehatan: existingEmployee.bpjsKesehatan || "",
        bpjsKetenagakerjaan: existingEmployee.bpjsKetenagakerjaan || "",
      });
    }
  }, [existingEmployee]);

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      try {
        const url = buildApiUrl(`/api/auth/users/${employeeId}`);
        const payload = {
          ...data,
          departmentId: data.department || undefined,
          positionId: data.position || undefined,
          managerId: data.managerId || undefined,
        };

        // Hapus property password jika kosong (agar tidak di-update)
        if (!payload.password) {
          delete (payload as any).password;
        }
        
        // Hapus property relation yang berpotensi menyebabkan error prisma jika dikirim sebagai string
        delete (payload as any).department;
        delete (payload as any).position;

        // BERSERHKAN DATA: Hapus string kosong "" dari payload
        // Karena API production belum menangani string kosong, mengirim "" ke field Enum/Date akan membuat Prisma Error 500.
        // Jika kita kirim null, beberapa field relasi (seperti role) bisa ikut crash. Solusi paling aman adalah TIDAK mengirim field yang kosong.
        Object.keys(payload).forEach((key) => {
          if ((payload as any)[key] === "") {
            delete (payload as any)[key];
          }
        });

        const response = await authFetch(url, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          let errorMsg = `Gagal memperbarui karyawan (Error ${response.status})`;
          try {
            const errorData = await response.json();
            if (errorData && errorData.message) {
              errorMsg = errorData.message;
            }
          } catch (e) {
            // Abaikan
          }
          throw new Error(errorMsg);
        }

        return await response.json();
      } catch (err: any) {
        throw new Error(err.message || "Terjadi kesalahan internal pada server (500).");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employees", "all"] });
      queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      Swal.fire({
        title: 'Berhasil!',
        text: 'Data karyawan berhasil diperbarui.',
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
      Swal.fire({
        title: 'Gagal Memperbarui!',
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      
      // Jika departemen berubah dan belum ada NIK, kita otomatiskan seperti di add
      if (name === "department" && !newData.nik) {
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

  if (!employeeId) {
    return (
      <div className="space-y-6 pb-20 pt-20 max-w-4xl mx-auto text-center">
        <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-6 text-rose-200">
          ID Karyawan tidak ditemukan.
        </div>
      </div>
    );
  }

  if (isEmployeeLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center pt-20">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
          <p className="text-sm text-zinc-400">Memuat data karyawan...</p>
        </div>
      </div>
    );
  }

  if (isEmployeeError || !existingEmployee) {
    return (
      <div className="space-y-6 pb-20 pt-20 max-w-4xl mx-auto text-center">
        <div className="rounded-2xl border border-rose-300/30 bg-rose-500/10 p-6 text-rose-200">
          Gagal memuat data karyawan.
        </div>
      </div>
    );
  }

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
          <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
            <UserCog className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Edit Data Karyawan</h1>
            <p className="mt-1 text-sm text-zinc-300">Perbarui data informasi karyawan {existingEmployee.name}.</p>
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
                <label className="block text-sm font-medium text-zinc-300">Password Baru <span className="text-zinc-500 text-xs">(Kosongkan jika tidak diubah)</span></label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Role Akses Sistem</label>
                <select name="role" value={formData.role} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]">
                  <option value="">-- Pilih Role --</option>
                  {roles.map((r: any) => (
                    <option key={r.id} value={r.name}>{r.name}</option>
                  ))}
                  {/* Fallbacks in case roles fetch fails */}
                  {roles.length === 0 && (
                    <>
                      <option value="SUPERADMIN">SUPERADMIN</option>
                      <option value="HR">HR</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="EMPLOYEE">EMPLOYEE</option>
                    </>
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-300">Status Akun</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]">
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="INACTIVE">INACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                </select>
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
                  value={formData.nik} 
                  onChange={handleChange} 
                  className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" 
                  placeholder="NIK Karyawan" 
                />
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
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Alamat KTP</label><textarea name="addressKtp" rows={3} value={formData.addressKtp} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="Sesuai KTP"></textarea></div>
              <div className="space-y-2"><label className="block text-sm font-medium text-zinc-300">Alamat Domisili</label><textarea name="addressDomisili" rows={3} value={formData.addressDomisili} onChange={handleChange} className="w-full rounded-xl border border-white/10 bg-black/20 p-3 text-sm text-white outline-none focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/50 [color-scheme:dark]" placeholder="Tempat tinggal saat ini"></textarea></div>
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
              className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {mutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function EditEmployeePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center pt-20">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
            <p className="text-sm text-zinc-400">Memuat halaman edit...</p>
          </div>
        </div>
      }
    >
      <EditEmployeeForm />
    </Suspense>
  );
}
