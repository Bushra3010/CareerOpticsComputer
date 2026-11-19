/**
 * The academic year a date falls in, April to March, as the institute writes
 * it: 10 Aug 2024 → "2024-25", 15 Feb 2025 → "2024-25". For an admission dated
 * where no session has been set up, so a back-dated admission gets its own year.
 */
export function academicYearOf(day: string): string {
  const date = String(day ?? "").slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "";
  const [y, m] = date.split("-").map(Number);
  const start = m >= 4 ? y : y - 1;
  return `${start}-${String((start + 1) % 100).padStart(2, "0")}`;
}

/** A few years either side of today's, newest first, for the session picker. */
export function recentAcademicYears(today = new Date().toISOString().slice(0, 10), back = 5, ahead = 1): string[] {
  const start = Number(academicYearOf(today).slice(0, 4));
  const years: string[] = [];
  for (let y = start + ahead; y >= start - back; y--) years.push(`${y}-${String((y + 1) % 100).padStart(2, "0")}`);
  return years;
}
