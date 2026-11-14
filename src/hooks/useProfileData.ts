import { useRecovery } from "./useRecovery";
import { profiles } from "../data/seed";
import {
  adherence,
  baselineFor,
  latestFor,
  matchedTrend,
} from "../lib/calculations";
export function useProfileData() {
  const ctx = useRecovery();
  const p = profiles.find((p) => p.id === ctx.state.selectedProfile)!;
  const rows = ctx.state.assessments.filter((a) => a.profileId === p.id);
  const sessions = ctx.state.sessions.filter((s) => s.profileId === p.id);
  return {
    ...ctx,
    p,
    rows,
    sessions,
    stats: adherence(sessions, p.day),
    baseline: (metric: Parameters<typeof baselineFor>[1]) =>
      baselineFor(rows, metric),
    latest: (metric: Parameters<typeof latestFor>[1]) =>
      latestFor(rows, metric),
    trend: matchedTrend(rows),
  };
}
