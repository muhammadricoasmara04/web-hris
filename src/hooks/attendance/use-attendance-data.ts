import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { AttendanceHistoryItem, getAttendanceRecords } from "@/services/attendanceService";
import { dateFormater } from "@/utils/dateFormater";
import type { AttendanceRow } from "@/components/dashboard/app-hr/attendance-table";

const formatTime = (value?: string) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  return parsed.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const normalizeStatus = (value?: string, hasCheckOut?: boolean) => {
  if (!hasCheckOut) return "Belum Checkout";
  if (!value) return "Hadir";
  const lower = value.toLowerCase();
  if (lower.includes("telat") || lower.includes("lambat")) return "Terlambat";
  if (lower.includes("izin") || lower.includes("sakit") || lower.includes("cuti")) return "Izin";
  return "Hadir";
};

const getDisplayName = (item: AttendanceHistoryItem) => {
  const emp = item.employee as { name?: string } | undefined;
  const raw =
    emp?.name ??
    item.employeeName ??
    item.name ??
    item.fullname ??
    item.fullName ??
    item.userName ??
    item.username;

  return typeof raw === "string" ? raw : "-";
};

const getDepartment = (item: AttendanceHistoryItem) => {
  const emp = item.employee as { department?: string | { name?: string } } | undefined;
  const dept = item.department as { name?: string } | undefined;
  
  let raw = "";
  if (emp?.department) {
    if (typeof emp.department === "object") {
      raw = emp.department.name || "";
    } else {
      raw = emp.department;
    }
  }

  const fallback =
    raw ||
    dept?.name ||
    item.departmentName ||
    item.department ||
    item.division ||
    item.team;

  return typeof fallback === "string" ? fallback : "-";
};

const getNik = (item: AttendanceHistoryItem) => {
  const emp = item.employee as { nik?: string } | undefined;
  const raw = item.nik || emp?.nik || item.employeeNIK || item.employeeNik;
  return typeof raw === "string" ? raw : "-";
};

const getDateField = (item: AttendanceHistoryItem) =>
  item.createdAt || item.checkInTime || item.checkOutTime || item.time;

const getMapsUrl = (
  checkInLatitude?: number,
  checkInLongitude?: number,
  checkOutLatitude?: number,
  checkOutLongitude?: number,
) => {
  const params = new URLSearchParams();

  if (Number.isFinite(checkInLatitude) && Number.isFinite(checkInLongitude)) {
    params.set("inLat", String(checkInLatitude));
    params.set("inLng", String(checkInLongitude));
  }

  if (Number.isFinite(checkOutLatitude) && Number.isFinite(checkOutLongitude)) {
    params.set("outLat", String(checkOutLatitude));
    params.set("outLng", String(checkOutLongitude));
  }

  if (!params.toString()) {
    return null;
  }

  return `/dashboard/app-hr/data-attendance/data-mapping?${params.toString()}`;
};

type UseAttendanceDataParams = {
  period: "today" | "week" | "month" | "year" | "custom";
  startDate: string;
  endDate: string;
  searchTerm: string;
};

export function useAttendanceData({ period, startDate, endDate, searchTerm }: UseAttendanceDataParams) {
  const attendanceQuery = useQuery({
    queryKey: ["attendance", "all", { period, startDate, endDate, searchTerm }],
    queryFn: () =>
      getAttendanceRecords({
        period: period === "year" ? "custom" : period,
        date: startDate,
        endDate: endDate !== startDate ? endDate : undefined,
      }),
    staleTime: 60 * 1000,
  });

  const rows = useMemo(() => {
    if (!attendanceQuery.data) return [];

    let filteredData = attendanceQuery.data;

    filteredData = filteredData.filter((item) => {
      const itemDateRaw = getDateField(item);
      if (!itemDateRaw) return false;

      const itemDate = new Date(itemDateRaw);
      itemDate.setHours(0, 0, 0, 0);

      const filterStart = new Date(startDate);
      filterStart.setHours(0, 0, 0, 0);
      const filterEnd = new Date(endDate);
      filterEnd.setHours(23, 59, 59, 999);

      if (itemDate < filterStart || itemDate > filterEnd) return false;

      return true;
    });

    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filteredData = filteredData.filter((item) => {
        const name = getDisplayName(item).toLowerCase();
        const nik = getNik(item).toLowerCase();
        const dept = getDepartment(item).toLowerCase();
        return name.includes(lowerSearch) || nik.includes(lowerSearch) || dept.includes(lowerSearch);
      });
    }

    return filteredData.map((item, index) => {
      const recordId = String(item.id ?? `ATT-${index + 1}`);
      const mapsUrl = getMapsUrl(
        item.checkInLatitude as number | undefined,
        item.checkInLongitude as number | undefined,
        item.checkOutLatitude as number | undefined,
        item.checkOutLongitude as number | undefined,
      );

      return {
        rowKey: `${recordId}-${index}`,
        recordId,
        nik: getNik(item),
        name: getDisplayName(item),
        dept: getDepartment(item),
        date: getDateField(item) ? dateFormater(getDateField(item)!) : "-",
        checkIn: formatTime(item.checkInTime || item.time),
        checkOut: formatTime(item.checkOutTime),
        status: normalizeStatus(item.status, !!item.checkOutTime),
        mapsUrl,
      } as AttendanceRow;
    });
  }, [attendanceQuery.data, startDate, endDate, searchTerm]);

  const stats = useMemo(() => {
    const totalEmployees = rows.length;
    const hadirCount = rows.filter((row) => row.status === "Hadir").length;
    const terlambatCount = rows.filter((row) => row.status === "Terlambat").length;
    const belumCheckoutCount = rows.filter((row) => row.status === "Belum Checkout").length;

    return { totalEmployees, hadirCount, terlambatCount, belumCheckoutCount };
  }, [rows]);

  return {
    attendanceQuery,
    rows,
    stats,
  };
}
