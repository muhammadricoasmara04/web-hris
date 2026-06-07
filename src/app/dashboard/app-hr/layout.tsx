"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { getMe } from "@/services/authService";

export default function HrLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const { data: userData, isLoading } = useQuery({
    queryKey: ["profile-me"],
    queryFn: getMe,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!isLoading && userData) {
      const rawUser = (userData?.data || userData?.user || userData) as any;
      let apiRole = "";
      
      if (typeof rawUser?.role === "string") apiRole = rawUser.role.toLowerCase();
      else if (rawUser?.role?.name) apiRole = String(rawUser.role.name).toLowerCase();
      
      const isSuperAdmin = apiRole === "superadmin";

      let userPermissions: string[] = [];
      if (Array.isArray(rawUser?.permissions)) {
        userPermissions = rawUser.permissions;
      } else if (rawUser?.role?.permissions && Array.isArray(rawUser.role.permissions)) {
        userPermissions = rawUser.role.permissions.map((p: any) => p.action);
      }

      // 1. Cek apakah user berhak masuk ke zona HRIS
      const isUserHrOrAdmin = apiRole !== "employee" && (isSuperAdmin || userPermissions.some(p => p.startsWith("MANAGE_") || p === "VIEW_DASHBOARD_HR"));

      if (!isUserHrOrAdmin) {
        // Jika bukan HR/Admin, tendang kembali ke dashboard employee
        router.replace("/dashboard/employee");
        return;
      }

      // 2. Proteksi Halaman Spesifik Berdasarkan Permission Matrix (Granular)
      if (!isSuperAdmin) {
        if (pathname.includes("/data-employees") && !userPermissions.includes("MANAGE_EMPLOYEE")) {
          router.replace("/dashboard/app-hr");
        } else if (pathname.includes("/data-departements") && !userPermissions.includes("MANAGE_DEPARTMENT")) {
          router.replace("/dashboard/app-hr");
        } else if (pathname.includes("/data-position") && !userPermissions.includes("MANAGE_POSITION")) {
          router.replace("/dashboard/app-hr");
        } else if (pathname.includes("/data-roles") && !userPermissions.includes("MANAGE_ROLE")) {
          router.replace("/dashboard/app-hr");
        } else if (pathname.includes("/data-attendance") && !userPermissions.includes("MANAGE_ATTENDANCE")) {
          router.replace("/dashboard/app-hr");
        }
      }
    }
  }, [isLoading, userData, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}
