/** Shared display formatting for society event date ranges. */
export function formatEventDates(start: Date, end: Date | null) {
  const sameDay =
    end &&
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();
  if (end && !sameDay) {
    const a = start.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    const b = end.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    return `${a}–${b}`;
  }
  return start.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}
