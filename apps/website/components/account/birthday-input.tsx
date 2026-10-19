"use client";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function daysIn(month: string): number {
  return (month && DAYS_IN_MONTH[Number(month) - 1]) || 31;
}

// Month + day only — ExiusCart keeps "MM-DD" for its once-a-year birthday
// code, so no year is asked for. value/onChange are "MM-DD" or "" (unset).
export function BirthdayInput({
  id,
  value,
  onChange,
  className,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  className: string;
}) {
  const [month = "", day = ""] = value ? value.split("-") : [];

  function update(nextMonth: string, nextDay: string) {
    if (!nextMonth && !nextDay) return onChange("");
    // Keep a half-picked date as-is until both parts are chosen; clamp the
    // day when the month changes to a shorter one (31 → Apr).
    const max = daysIn(nextMonth);
    const clampedDay = nextDay && Number(nextDay) > max ? String(max).padStart(2, "0") : nextDay;
    onChange(`${nextMonth}-${clampedDay}`);
  }

  const maxDay = daysIn(month);

  return (
    <div className="flex gap-2">
      <select
        id={id}
        aria-label="Birthday month"
        value={month}
        onChange={(e) => update(e.target.value, day)}
        className={className}
      >
        <option value="">Month</option>
        {MONTHS.map((label, i) => (
          <option key={label} value={String(i + 1).padStart(2, "0")}>
            {label}
          </option>
        ))}
      </select>
      <select aria-label="Birthday day" value={day} onChange={(e) => update(month, e.target.value)} className={className}>
        <option value="">Day</option>
        {Array.from({ length: maxDay }, (_, i) => String(i + 1).padStart(2, "0")).map((d) => (
          <option key={d} value={d}>
            {Number(d)}
          </option>
        ))}
      </select>
    </div>
  );
}

// Only a fully picked "MM-DD" is sent; a half-picked one counts as unset.
export function completeBirthday(value: string): string {
  return /^\d{2}-\d{2}$/.test(value) ? value : "";
}
