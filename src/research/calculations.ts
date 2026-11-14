import {
  BASELINE_METHOD,
  POST_DAYS,
  type ResearchObservation,
  type ResearchMetric,
  type ResearchSession,
} from "./model";
type Rows = readonly ResearchObservation[];
export type Unavailable = { ok: false; reason: string };
export interface ResearchComparison {
  ok: true;
  participantId: string;
  session: ResearchSession;
  brDay: number;
  force: ResearchObservation;
  time: ResearchObservation;
  baselineForce: number;
  baselineTime: number;
  baselineRows: readonly ResearchObservation[];
  baselineMethod: string;
  forceRatioPct: number;
  inverseTimeRatioPct: number;
  forceChangePct: number;
  timeChangePct: number;
  mobilityPerformanceChangePct: number;
  gapPercentagePoints: number;
}
function unavailable(reason: string): Unavailable {
  return { ok: false, reason };
}
function compatible(a: ResearchObservation, b: ResearchObservation) {
  return (
    a.participantId === b.participantId &&
    a.metric === b.metric &&
    a.protocol === b.protocol &&
    a.unit === b.unit &&
    a.environment === b.environment &&
    a.source === b.source
  );
}
export function baselineBC(
  rows: Rows,
  participantId: string,
  metric: ResearchMetric,
):
  | { ok: true; value: number; rows: readonly ResearchObservation[] }
  | Unavailable {
  const candidates = rows.filter(
    (r) =>
      r.participantId === participantId &&
      r.metric === metric &&
      r.phase === "PRE_TEST" &&
      (r.session === "B" || r.session === "C"),
  );
  const b = candidates.filter((r) => r.session === "B"),
    c = candidates.filter((r) => r.session === "C");
  if (b.length !== 1 || c.length !== 1)
    return unavailable(
      "Both unique PRE B and C observations are required; no baseline fallback.",
    );
  if (
    !compatible(b[0], c[0]) ||
    !candidates.every((r) => Number.isFinite(r.value) && r.value > 0)
  )
    return unavailable(
      "Baseline protocol, units, participant, or environment are incompatible.",
    );
  return { ok: true, value: (b[0].value + c[0].value) / 2, rows: candidates };
}
export function compareResearch(
  rows: Rows,
  participantId: string,
  session: ResearchSession,
): ResearchComparison | Unavailable {
  if (!["D", "E", "F", "G"].includes(session))
    return unavailable("Select a recorded POST session D, E, F, or G.");
  const f = rows.filter(
    (r) =>
      r.participantId === participantId &&
      r.metric === "leg_force" &&
      r.session === session &&
      r.phase === "POST_TEST",
  );
  const t = rows.filter(
    (r) =>
      r.participantId === participantId &&
      r.metric === "slalom_time" &&
      r.session === session &&
      r.phase === "POST_TEST",
  );
  if (f.length !== 1 || t.length !== 1)
    return unavailable(
      "A unique paired force and slalom observation is missing for this participant/session.",
    );
  const force = f[0],
    time = t[0],
    bf = baselineBC(rows, participantId, "leg_force"),
    bt = baselineBC(rows, participantId, "slalom_time");
  if (!bf.ok) return bf;
  if (!bt.ok) return bt;
  if (
    force.brDay !== time.brDay ||
    force.brDay !== POST_DAYS[session as keyof typeof POST_DAYS] ||
    force.environment !== time.environment ||
    force.source !== time.source ||
    force.unit !== "N" ||
    time.unit !== "s" ||
    !bf.rows.every((b) => compatible(b, force)) ||
    !bt.rows.every((b) => compatible(b, time)) ||
    ![force.value, time.value, bf.value, bt.value].every(
      (v) => Number.isFinite(v) && v > 0,
    )
  )
    return unavailable(
      "Participant, session/day, protocol, units, or environment do not match the required observations.",
    );
  const forceChangePct = 100 * (force.value / bf.value - 1),
    timeChangePct = 100 * (time.value / bt.value - 1),
    mobilityPerformanceChangePct = 100 * (bt.value / time.value - 1);
  return {
    ok: true,
    participantId,
    session,
    brDay: force.brDay,
    force,
    time,
    baselineForce: bf.value,
    baselineTime: bt.value,
    baselineRows: [...bf.rows, ...bt.rows],
    baselineMethod: BASELINE_METHOD,
    forceRatioPct: (100 * force.value) / bf.value,
    inverseTimeRatioPct: (100 * bt.value) / time.value,
    forceChangePct,
    timeChangePct,
    mobilityPerformanceChangePct,
    gapPercentagePoints: forceChangePct - mobilityPerformanceChangePct,
  };
}
export function researchTrajectory(rows: Rows, participantId: string) {
  return (["D", "E", "F", "G"] as const).map((session) => {
    const c = compareResearch(rows, participantId, session);
    const raw=(metric:ResearchMetric)=>{const rr=rows.filter(r=>r.participantId===participantId&&r.session===session&&r.phase==='POST_TEST'&&r.brDay===POST_DAYS[session]&&r.metric===metric&&r.protocol===`CFT70:${metric}`&&r.unit===(metric==='leg_force'?'N':'s')&&r.environment==='Earth head-down bed-rest analog');return rr.length===1?rr[0].value:null;};
    return {
      session,
      label: `${session} · ${POST_DAYS[session]}`,
      force: raw('leg_force'),
      time: raw('slalom_time'),
      gap: c.ok ? c.gapPercentagePoints : null,
      reason: c.ok ? "" : c.reason,
    };
  });
}
