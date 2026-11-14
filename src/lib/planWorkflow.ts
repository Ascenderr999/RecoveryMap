import type { DemoState, RecoveryPlan, Session } from "../types";
export function scheduleDays(text: string): number[] {
  const days = text
    .trim()
    .split(/[,;\s]+/)
    .filter(Boolean)
    .flatMap((token) => {
      if (/^\d+-\d+$/.test(token)) {
        const [a, b] = token.split("-").map(Number);
        if (a < 1 || b > 365 || a > b)
          throw Error("Invalid mission day range.");
        return Array.from({ length: b - a + 1 }, (_, i) => a + i);
      }
      return [Number(token)];
    });
  if (
    !days.length ||
    days.some((d) => !Number.isInteger(d) || d < 1 || d > 365)
  )
    throw Error("Enter explicit mission days 1–365 for every activity.");
  return [...new Set(days)].sort((a, b) => a - b);
}
export function validatePlan(plan: RecoveryPlan): string[] {
  const warnings: string[] = [];
  if (!plan.title.trim() || !plan.author.trim() || !plan.activities.length)
    warnings.push(
      "A title, source author and at least one activity are required.",
    );
  const seen = new Set<string>();
  plan.activities.forEach((a, i) => {
    if (!a.exercise.trim() || !a.instructions.trim())
      warnings.push(
        `Activity ${i + 1}: name and original instructions are required.`,
      );
    const key = [
      a.exercise.trim().toLowerCase(),
      a.instructions.trim(),
      a.schedule.trim(),
    ].join("|");
    if (seen.has(key))
      warnings.push(
        `Activity ${i + 1}: duplicate activity and schedule. Review or remove it.`,
      );
    seen.add(key);
  });
  return warnings;
}
export function savePlanVersion(
  state: DemoState,
  draft: RecoveryPlan,
  now = new Date().toISOString(),
): DemoState {
  const errors = validatePlan(draft);
  if (errors.length) throw Error(errors.join(" "));
  const previous = state.plans?.find((p) => p.id === draft.id);
  const saved: RecoveryPlan = {
    ...structuredClone(draft),
    id: previous ? crypto.randomUUID() : draft.id,
    reviewedAt: now,
    version: previous ? (previous.version ?? 1) + 1 : 1,
    previousVersionId: previous?.id,
    importedAt: previous?.importedAt ?? draft.importedAt,
    activatedAt: undefined,
    archivedAt: undefined,
    authorization: undefined,
  };
  return { ...state, plans: [...(state.plans ?? []), saved] };
}
export function activatePlan(
  state: DemoState,
  planId: string,
  currentDay: number,
  confirmed: boolean,
  now = new Date().toISOString(),
): DemoState {
  if (!confirmed)
    throw Error("Explicit demo activation confirmation is required.");
  const plan = state.plans?.find((p) => p.id === planId);
  if (!plan) throw Error("Plan not found.");
  const errors = validatePlan(plan);
  if (errors.length) throw Error(errors.join(" "));
  if (plan.archivedAt)
    throw Error("Review a new version before reactivating an archived plan.");
  if (plan.activatedAt) return state;
  const scheduled = plan.activities.map((a) => ({
    a,
    days: scheduleDays(a.schedule),
  }));
  const future = scheduled.flatMap(({ a, days }) =>
    days
      .filter(
        (day) =>
          day >= currentDay &&
          !state.sessions.some(
            (s) =>
              s.profileId === plan.profileId &&
              s.day === day &&
              !s.archivedAt &&
              s.status !== "scheduled" &&
              s.exercise.trim().toLowerCase() ===
                a.exercise.trim().toLowerCase(),
          ),
      )
      .map(
        (day) =>
          ({
            id: `${plan.id}-${a.id}-${day}`,
            planId: plan.id,
            profileId: plan.profileId,
            day,
            exercise: a.exercise.trim(),
            description: a.instructions,
            dose: [
              a.sets && `${a.sets} sets`,
              a.repetitions && `${a.repetitions} repetitions`,
              a.duration,
            ]
              .filter(Boolean)
              .join(" · "),
            category: a.category || "Imported plan",
            status: "scheduled",
            notes: a.notes,
            fatigue: 0,
            discomfort: 0,
          }) as Session,
      ),
  );
  if (!future.length)
    throw Error(
      "No activities occur on or after the current demo day. Review the explicit schedule.",
    );
  return {
    ...state,
    plans: state.plans!.map((p) =>
      p.id === plan.id
        ? {
            ...p,
            activatedAt: now,
            authorization: {
              confirmedAt: now,
              kind: "user-demo-confirmation",
              specialistVerified: false,
            },
          }
        : p.profileId === plan.profileId && p.activatedAt && !p.archivedAt
          ? { ...p, archivedAt: now }
          : p,
    ),
    sessions: [
      ...state.sessions.map((s) =>
        s.profileId === plan.profileId &&
        s.day >= currentDay &&
        s.status === "scheduled" &&
        !s.archivedAt
          ? { ...s, archivedAt: now }
          : s,
      ),
      ...future,
    ],
  };
}
