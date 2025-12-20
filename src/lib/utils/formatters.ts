import { format } from "date-fns";

export function formatDate(date: Date | string | number, dateFormat: string = "MMM d, yyyy") {
  const d = new Date(date);
  return format(d, dateFormat);
}

export function formatBytes(bytes: number | string | bigint | undefined | null, decimals = 1) {
  if (bytes === undefined || bytes === null) return "0 Bytes";
  
  const numBytes = typeof bytes === 'bigint' ? Number(bytes) : Number(bytes);
  if (isNaN(numBytes) || numBytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(numBytes) / Math.log(k));

  return parseFloat((numBytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}