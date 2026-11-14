import type { Assessment, DemoState, Profile } from "../types";
import { adherence, matchedTrend, baselineFor } from "./calculations";
import { dateFor } from "../data/seed";
import { personalAssessmentCSV } from "./personalExport";
export function personalReport(
  state: DemoState,
  p: Profile,
  from = "",
  to = "",
  planId = "all",
) {
  const inRange = (date: string) =>
    (!from || date >= from) && (!to || date <= to);
  const all = state.assessments.filter((a) => a.profileId === p.id);
  const assessments = all.filter((a) => inRange(a.date));
  const sessions = state.sessions.filter(
    (s) =>
      s.profileId === p.id &&
      !s.archivedAt &&
      inRange(dateFor(p, s.day)) &&
      (planId === "all" || (s.planId ?? "seed") === planId),
  );
  const plans = (state.plans ?? []).filter((v) => v.profileId === p.id);
  const pairs = matchedTrend(all).filter((r) => inRange(r.date));
  const stats = adherence(sessions, p.day);
  return {
    sourceType: "personal_demo",
    profile: p,
    from,
    to,
    planId,
    generatedAt: new Date().toISOString(),
    assessments,
    baselineReferences: [
      ...new Map(
        assessments
          .map((a) => baselineFor(all, a.metric, a.date))
          .filter((a): a is Assessment => Boolean(a))
          .map((a) => [a.id, a]),
      ).values(),
    ],
    sessions,
    plans,
    stats,
    pairs,
    latestPair: pairs.at(-1) ?? null,
    missingData: pairs.length
      ? ""
      : "No compatible same-date force/mobility pair in this range.",
    method:
      "Signed gap = 100*(force/baselineForce-1) - 100*(baselineTime/time-1), in percentage points; not a clinical score.",
    provenance:
      "Fictional scenario and manually entered records. No NASA observations. Protocol unspecified means unverified task setup.",
    allAssessments: all,
  };
}
export type PersonalReport = ReturnType<typeof personalReport>;
export function reportCSV(report: PersonalReport) {
  return personalAssessmentCSV(
    report.allAssessments,
    report.profile.id,
    report.assessments.map((a) => a.id),
  );
}
export function reportLines(r: PersonalReport): string[] {
  const pair = r.latestPair;
  return [
    "RecoveryMap / RANGERS",
    "Personal Demo - synthetic scenario / user records",
    `${r.profile.rank} ${r.profile.name} / ${r.profile.code}`,
    `${r.profile.mission} / ${r.profile.phase}`,
    `Day ${r.profile.day}; day 0 = ${r.profile.landing}; current scenario date ${dateFor(r.profile, r.profile.day)}`,
    `Date range: ${r.from || "All"} to ${r.to || "All"}; plan filter: ${r.planId}`,
    `Exported: ${r.generatedAt}`,
    `Adherence: ${r.stats.completed}/${r.stats.total} due activities (${r.stats.percent.toFixed(2)}%)`,
    `Completed ${r.stats.completed}; skipped ${r.stats.skipped}; pending ${r.stats.pending}; future ${r.stats.future}`,
    r.method,
    pair
      ? `Pair ${pair.date}: force ${pair.forceValue} N / baseline ${pair.baselineForce} N; time ${pair.timeValue} s / baseline ${pair.baselineTime} s; force change ${(pair.strength - 100).toFixed(4)}%; inverse-time change ${(pair.mobility - 100).toFixed(4)}%; gap ${pair.gap.toFixed(4)} pp`
      : r.missingData,
    r.provenance,
    "PLAN VERSIONS",
    ...r.plans.map(
      (p) =>
        `${p.title} / version ${p.version ?? 1} / ID ${p.id} / previous ${p.previousVersionId ?? "none"} / source ${p.sourceName} / imported ${p.importedAt} / activated ${p.activatedAt ?? "never"} / specialist approval NOT VERIFIED`,
    ),
    "SESSIONS",
    ...r.sessions.map(
      (s) =>
        `${dateFor(r.profile, s.day)} / day ${s.day} / ${s.exercise} / ${s.status === "scheduled" ? (s.day > r.profile.day ? "future" : "pending") : s.status} / plan ${s.planId ?? "synthetic seed"} / dose ${s.dose || "not specified"}${s.recordedAt ? ` / fatigue ${s.fatigueRecorded ? s.fatigue + "/10" : "not recorded"} / discomfort ${s.discomfortRecorded ? s.discomfort + "/10" : "not recorded"}` : ""} / notes ${s.notes || "not recorded"}`,
    ),
    "BASELINE REFERENCES (context, may precede the filtered date range)",
    ...r.baselineReferences.map(
      (a) =>
        `${a.date} / ${a.metric} / ${a.value} ${a.metric === "strength" ? "N" : "s"} / row ${a.id} / ${a.sourceName ?? "Synthetic reference"}`,
    ),
    "ASSESSMENTS",
    ...r.assessments.map(
      (a) =>
        `${a.date} / ${a.metric} / ${a.value} ${a.metric === "strength" ? "N" : "s"} / ${a.baseline ? "baseline" : "observation"} / protocol ${a.protocol && a.protocol !== "standard" ? a.protocol : "PROTOCOL UNSPECIFIED"} / environment ${a.environment ?? "Personal demo / unspecified gravity"} / source ${a.sourceName ?? (a.id.includes("-manual-") ? "Manual entry" : "Synthetic seed")} / row ${a.id} / notes ${a.notes || "not recorded"}`,
    ),
  ];
}
