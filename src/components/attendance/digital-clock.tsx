"use client";

import { useEffect, useState } from "react";

export function DigitalClock({ className = "" }: { className?: string }) {
  const [time, setTime] = useState<Date | null>(null);

  useEffect(() => {
    const tick = () => setTime(new Date());
    tick(); // Initial call
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) {
    return <div className={`font-sans tracking-tight ${className}`}>--:--</div>;
  }

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");

  return (
    <div className={`font-sans tracking-tight ${className}`}>
      {hours}:{minutes}
    </div>
  );
}

export function CurrentDate({ className = "" }: { className?: string }) {
  const [date, setDate] = useState<string>("");

  useEffect(() => {
    const d = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    const dateString = `Jakarta, ${d.toLocaleDateString("id-ID", options)}`;
    
    // Using Promise to avoid synchronous setState warning
    Promise.resolve().then(() => setDate(dateString));
  }, []);

  return <p className={className}>{date}</p>;
}
