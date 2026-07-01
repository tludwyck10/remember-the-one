// Parse a due date string as LOCAL midnight to avoid UTC timezone shift.
// "2026-07-02" → new Date("2026-07-02") is UTC midnight, which is July 1 evening in US timezones.
// Parsing the parts directly gives local midnight with no shift.
export function localMidnight(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function todayMidnight() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return t;
}

export function diffDaysFromToday(dateStr) {
  const due = localMidnight(dateStr);
  const today = todayMidnight();
  return Math.round((due - today) / 86400000);
}
