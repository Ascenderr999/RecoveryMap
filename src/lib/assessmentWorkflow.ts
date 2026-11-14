import type { Assessment } from "../types";
export function protocolLabel(protocol?: string) {
  return !protocol || protocol === "standard"
    ? "PROTOCOL UNSPECIFIED"
    : protocol;
}
export function recordAssessment(
  rows: Assessment[],
  entry: Assessment,
  confirmed = false,
  now = new Date().toISOString(),
): Assessment[] {
  if (
    rows.some(
      (a) =>
        a.profileId === entry.profileId &&
        a.metric === entry.metric &&
        a.date === entry.date,
    )
  )
    throw Error(
      "This measurement already exists on that date. Choose another date.",
    );
  const old = rows.filter(
    (a) =>
      a.profileId === entry.profileId &&
      a.metric === entry.metric &&
      a.baseline &&
      !a.supersededAt,
  );
  if (entry.baseline && old.length && !confirmed)
    throw Error(
      "Confirm the baseline change. Previous measurements will be retained.",
    );
  if (entry.baseline && old.some((a) => a.date >= entry.date))
    throw Error("The new baseline must be dated after the current baseline.");
  return [
    ...rows.map((a) =>
      entry.baseline && old.some((b) => b.id === a.id)
        ? { ...a, supersededAt: now }
        : a,
    ),
    entry,
  ];
}
