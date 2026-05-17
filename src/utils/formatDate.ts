export function formatDate(value: string | number | Date, includeTime: boolean = false): string {
  if (!value) return "-";
  
  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Invalid Date";
  }

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Jakarta",
  };

  if (includeTime) {
    options.hour = "2-digit";
    options.minute = "2-digit";
  }

  const formattedDate = new Intl.DateTimeFormat("id-ID", options).format(date);
  
  if (includeTime) {
    return `${formattedDate} WIB`;
  }
  
  return formattedDate;
}
