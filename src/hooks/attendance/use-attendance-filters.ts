import { useState, useCallback } from "react";

const toInputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function useAttendanceFilters() {
  const [period, setPeriod] = useState<"today" | "week" | "month" | "year" | "custom">("today");
  const [startDate, setStartDate] = useState<string>(toInputDate(new Date()));
  const [endDate, setEndDate] = useState<string>(toInputDate(new Date()));
  const [searchTerm, setSearchTerm] = useState<string>("");

  const handlePeriodChange = useCallback((newPeriod: "today" | "week" | "month" | "year" | "custom") => {
    setPeriod(newPeriod);

    if (newPeriod === "custom") return;

    const now = new Date();
    const today = toInputDate(now);

    if (newPeriod === "today") {
      setStartDate(today);
      setEndDate(today);
    } else if (newPeriod === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(weekAgo.getDate() - 7);
      setStartDate(toInputDate(weekAgo));
      setEndDate(today);
    } else if (newPeriod === "month") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      setStartDate(toInputDate(monthAgo));
      setEndDate(today);
    } else if (newPeriod === "year") {
      const yearAgo = new Date(now);
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      setStartDate(toInputDate(yearAgo));
      setEndDate(today);
    }
  }, []);

  const handleStartDateChange = useCallback((date: string) => {
    setStartDate(date);
    setPeriod("custom");
  }, []);

  const handleEndDateChange = useCallback((date: string) => {
    setEndDate(date);
    setPeriod("custom");
  }, []);

  return {
    period,
    startDate,
    endDate,
    searchTerm,
    handlePeriodChange,
    handleStartDateChange,
    handleEndDateChange,
    setSearchTerm,
  };
}
