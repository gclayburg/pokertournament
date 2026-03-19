export function formatClock(timeRemainingMs: number): string {
  const safeMs = Math.max(0, timeRemainingMs);
  const totalSeconds = Math.ceil(safeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(Math.round(value));
}

export function formatEstimatedDuration(minutes: number): string {
  const safeMinutes = Math.max(0, Math.ceil(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;

  if (hours === 0) {
    return `~${remainingMinutes}m`;
  }

  if (remainingMinutes === 0) {
    return `~${hours}h`;
  }

  return `~${hours}h ${remainingMinutes}m`;
}
