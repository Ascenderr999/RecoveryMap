import type { DemoState } from "../types";
import { profiles, metricInfo } from "../data/seed";
export function download(
  name: string,
  content: string,
  type = "application/json",
) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function parseBackup(text: string): DemoState {
  const raw = JSON.parse(text);
  const s = raw.state ?? raw;
  const ids = profiles.map((p) => p.id);
  const str = (x: unknown, max = 10000) =>
    typeof x === "string" && x.length <= max;
  const stamp = (x: unknown) =>
    x === undefined || (str(x, 40) && !Number.isNaN(Date.parse(String(x))));
  const validDay = (d: unknown) =>
    Number.isInteger(d) && Number(d) >= 1 && Number(d) <= 365;
  const date = (x: unknown) =>
    str(x, 10) &&
    /^\d{4}-\d{2}-\d{2}$/.test(String(x)) &&
    !Number.isNaN(Date.parse(String(x))) &&
    new Date(String(x)).toISOString().slice(0, 10) === x;
  if (
    s?.version !== 1 ||
    !ids.includes(s.selectedProfile) ||
    typeof s.compact !== "boolean" ||
    !Array.isArray(s.assessments) ||
    !Array.isArray(s.sessions) ||
    s.assessments.length > 50000 ||
    s.sessions.length > 50000
  )
    throw Error("Invalid RecoveryMap backup.");
  if (
    s.assessments.some(
      (a: Record<string, unknown>) =>
        !a ||
        !str(a.id, 200) ||
        !ids.includes(String(a.profileId)) ||
        !Object.keys(metricInfo).includes(String(a.metric)) ||
        !Number.isFinite(a.value) ||
        Number(a.value) <= 0 ||
        Number(a.value) > metricInfo[a.metric as keyof typeof metricInfo].max ||
        !date(a.date) ||
        !stamp(a.supersededAt) ||
        (a.sourceName !== undefined && !str(a.sourceName, 300)) ||
        (a.changeHistory !== undefined &&
          (!Array.isArray(a.changeHistory) ||
            a.changeHistory.some(
              (h: Record<string, unknown>) =>
                !h ||
                !stamp(h.changedAt) ||
                !Number.isFinite(h.previousValue) ||
                Number(h.previousValue) <= 0 ||
                !date(h.previousDate),
            ))) ||
        (a.baseline !== undefined && typeof a.baseline !== "boolean") ||
        (a.notes !== undefined && !str(a.notes)) ||
        (a.environment !== undefined &&
          (!str(a.environment, 200) || !String(a.environment).trim())) ||
        (a.protocol !== undefined &&
          (!str(a.protocol, 200) || !String(a.protocol).trim())),
    )
  )
    throw Error("Invalid assessment records in backup.");
  if (
    s.sessions.some(
      (r: Record<string, unknown>) =>
        !r ||
        !str(r.id, 300) ||
        !ids.includes(String(r.profileId)) ||
        !validDay(r.day) ||
        !stamp(r.archivedAt) ||
        !stamp(r.recordedAt) ||
        (r.fatigueRecorded !== undefined &&
          typeof r.fatigueRecorded !== "boolean") ||
        (r.discomfortRecorded !== undefined &&
          typeof r.discomfortRecorded !== "boolean") ||
        !["scheduled", "completed", "skipped"].includes(String(r.status)) ||
        !["exercise", "description", "dose", "category", "notes"].every((k) =>
          str(r[k]),
        ) ||
        ![r.fatigue, r.discomfort].every(
          (n) => Number.isFinite(n) && Number(n) >= 0 && Number(n) <= 10,
        ),
    )
  )
    throw Error("Invalid session records in backup.");
  if (
    new Set(s.assessments.map((a: { id: string }) => a.id)).size !==
      s.assessments.length ||
    new Set(s.sessions.map((r: { id: string }) => r.id)).size !==
      s.sessions.length
  )
    throw Error("Duplicate records in backup.");
  const keys = s.assessments.map(
    (a: { profileId: string; metric: string; date: string }) =>
      `${a.profileId}/${a.metric}/${a.date}`,
  );
  if (new Set(keys).size !== keys.length)
    throw Error("Duplicate records in backup.");
  for (const p of profiles)
    for (const metric of Object.keys(metricInfo))
      if (
        s.assessments.filter(
          (a: {
            profileId: string;
            metric: string;
            baseline?: boolean;
            supersededAt?: string;
          }) =>
            a.profileId === p.id &&
            a.metric === metric &&
            a.baseline &&
            !a.supersededAt,
        ).length !== 1
      )
        throw Error("Each profile requires one baseline for every metric.");
  if (
    s.plans !== undefined &&
    (!Array.isArray(s.plans) ||
      s.plans.some(
        (p: Record<string, unknown>) =>
          !p ||
          !str(p.id, 200) ||
          !ids.includes(String(p.profileId)) ||
          !stamp(p.activatedAt) ||
          !stamp(p.archivedAt) ||
          !stamp(p.reviewedAt) ||
          (p.version !== undefined &&
            (!Number.isInteger(p.version) || Number(p.version) < 1)) ||
          (p.authorization !== undefined &&
            (!(p.authorization as Record<string, unknown>) ||
              (p.authorization as Record<string, unknown>).kind !==
                "user-demo-confirmation" ||
              (p.authorization as Record<string, unknown>)
                .specialistVerified !== false ||
              !stamp(
                (p.authorization as Record<string, unknown>).confirmedAt,
              ))) ||
          !["title", "author", "sourceName", "importedAt"].every((k) =>
            str(p[k]),
          ) ||
          !Array.isArray(p.activities) ||
          p.activities.length > 200 ||
          p.activities.some(
            (a: Record<string, unknown>) =>
              !a ||
              ![
                "id",
                "exercise",
                "instructions",
                "sets",
                "repetitions",
                "duration",
                "frequency",
                "schedule",
                "notes",
              ].every((k) => str(a[k])),
          ),
      ))
  )
    throw Error("Invalid plan records in backup.");
  if (
    new Set((s.plans ?? []).map((p: { id: string }) => p.id)).size !==
    (s.plans ?? []).length
  )
    throw Error("Duplicate plan IDs in backup.");
  return {
    version: 1,
    selectedProfile: s.selectedProfile,
    compact: s.compact,
    assessments: s.assessments,
    sessions: s.sessions,
    plans: s.plans || [],
  };
}
