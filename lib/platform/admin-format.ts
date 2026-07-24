export function formatAdminDate(value: string | null | undefined) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  }).format(date);
}
export function formatAdminCurrency(
  amountKobo: number | null | undefined,
  currency = "NGN",
) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format((amountKobo ?? 0) / 100);
}

export function daysUntil(value: string | null | undefined) {
  if (!value) return null;
  const difference = new Date(value).getTime() - Date.now();
  return Math.ceil(difference / 86_400_000);
}

export function safePage(value: string | undefined) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}
