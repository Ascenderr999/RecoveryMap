import type { Assessment, Metric, Session } from "../types";
import { metricInfo } from "../data/seed";
export function performance(
  current: number,
  baseline: number,
  higher: boolean,
) {
  return Number.isFinite(current) &&
    Number.isFinite(baseline) &&
    current > 0 &&
    baseline > 0
    ? (higher ? current / baseline : baseline / current) * 100
    : null;
}
export function recoveryGap(
  strength: number,
  baseStrength: number,
  mobility: number,
  baseMobility: number,
) {
  const s = performance(strength, baseStrength, true),
    m = performance(mobility, baseMobility, false);
  return s === null || m === null ? null : s - m;
}
export function baselineFor(rows: Assessment[], metric: Metric) {
  return rows.find((a) => a.metric === metric && a.baseline);
}
export function personalCompatible(a: Assessment, b: Assessment | undefined) {
  return Boolean(
    b &&
    a.profileId === b.profileId &&
    a.metric === b.metric &&
    (a.protocol ?? "standard") === (b.protocol ?? "standard") &&
    (a.environment ?? "Personal demo / unspecified gravity") ===
      (b.environment ?? "Personal demo / unspecified gravity"),
  );
}
export function latestFor(rows: Assessment[], metric: Metric) {
  const baseline = baselineFor(rows, metric);
  return rows
    .filter(
      (a) =>
        a.metric === metric && !a.baseline && personalCompatible(a, baseline),
    )
    .sort(
      (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
    )[0];
}
export function adherence(sessions: Session[], day: number) {
  const due = sessions.filter((s) => s.day <= day);
  const completed = due.filter((s) => s.status === "completed").length;
  return {
    completed,
    total: due.length,
    percent: due.length ? (completed / due.length) * 100 : 0,
    skipped: due.filter((s) => s.status === "skipped").length,
  };
}
export function matchedTrend(rows: Assessment[]) {
  const bs = baselineFor(rows, "strength"),
    bm = baselineFor(rows, "mobility");
  if (!bs || !bm) return [];
  return [...new Set(rows.filter((a) => !a.baseline).map((a) => a.date))]
    .sort()
    .flatMap((date) => {
      const s = rows.find(
          (a) =>
            a.date === date &&
            a.metric === "strength" &&
            !a.baseline &&
            personalCompatible(a, bs),
        ),
        m = rows.find(
          (a) =>
            a.date === date &&
            a.metric === "mobility" &&
            !a.baseline &&
            personalCompatible(a, bm),
        );
      return s && m
        ? [
            {
              date,
              strength: performance(s.value, bs.value, true)!,
              mobility: performance(m.value, bm.value, false)!,
              gap: recoveryGap(s.value, bs.value, m.value, bm.value)!,
            },
          ]
        : [];
    });
}
export function validateAssessment(
  value: number,
  date: string,
  metric: Metric,
  existing: Assessment[],
) {
  if (!Number.isFinite(value) || value <= 0 || value > metricInfo[metric].max)
    return `Enter a value greater than 0 and at most ${metricInfo[metric].max} ${metricInfo[metric].unit}.`;
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    Number.isNaN(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date
  )
    return "Select a valid date.";
  if (existing.some((a) => a.metric === metric && a.date === date))
    return "This measurement already exists on that date. Choose another date.";
  return "";
}
