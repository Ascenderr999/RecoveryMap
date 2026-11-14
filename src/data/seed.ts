import type { DemoState, Metric, Profile } from "../types";
export const profiles: Profile[] = [
  {
    id: "morgan",
    name: "Alex Morgan",
    rank: "Commander",
    initials: "AM",
    mission: "Lunar Surface Mission",
    code: "LUNA-07",
    destination: "Moon",
    phase: "Post-landing recovery",
    focus: "Balance and mobility",
    landing: "2026-10-31",
    day: 14,
    author: "Dr. Elise Ward (fictional specialist)",
  },
  {
    id: "chen",
    name: "Maya Chen",
    rank: "Specialist",
    initials: "MC",
    mission: "Mars Surface Mission",
    code: "ARES-03",
    destination: "Mars",
    phase: "Post-landing recovery",
    focus: "Strength and functional performance",
    landing: "2026-11-04",
    day: 10,
    author: "Dr. Noor Patel (fictional specialist)",
  },
  {
    id: "rivera",
    name: "Daniel Rivera",
    rank: "Engineer",
    initials: "DR",
    mission: "Earth Return Mission",
    code: "TERRA-12",
    destination: "Earth",
    phase: "Post-flight reconditioning",
    focus: "Coordination and recovery adherence",
    landing: "2026-10-27",
    day: 18,
    author: "Dr. Sam Ellis (fictional specialist)",
  },
];
export function dateFor(p: Profile, day: number) {
  const d = new Date(p.landing + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + day);
  return d.toISOString().slice(0, 10);
}
export const metricInfo: Record<
  Metric,
  {
    label: string;
    unit: string;
    direction: string;
    max: number;
    higher: boolean;
  }
> = {
  strength: {
    label: "Measured force",
    unit: "N",
    direction: "Higher = greater force",
    max: 10000,
    higher: true,
  },
  mobility: {
    label: "Timed mobility",
    unit: "s",
    direction: "Lower = faster completion",
    max: 3600,
    higher: false,
  },
  balance: {
    label: "Balance hold",
    unit: "s",
    direction: "Higher = longer maintained balance",
    max: 3600,
    higher: true,
  },
  coordination: {
    label: "Coordination task",
    unit: "s",
    direction: "Lower = faster completion",
    max: 3600,
    higher: false,
  },
};
export function createSeed(): DemoState {
  const assessments: DemoState["assessments"] = [],
    sessions: DemoState["sessions"] = [];
  profiles.forEach((p, i) => {
    const baseline = {
      strength: 500 + i * 60,
      mobility: 10 + i,
      balance: 60 - i * 5,
      coordination: 20 + i * 2,
    };
    (Object.keys(baseline) as Metric[]).forEach((metric) => {
      assessments.push({
        id: `${p.id}-${metric}-baseline`,
        profileId: p.id,
        date: dateFor(p, -30),
        metric,
        value: baseline[metric],
        baseline: true,
      });
      [0, 3, 7, p.day].forEach((day, j) => {
        const ratio =
          metric === "strength"
            ? [0.61, 0.72, 0.83, 0.94 - i * 0.03][j]
            : metric === "mobility"
              ? [0.46, 0.55, 0.64, 0.74 + i * 0.025][j]
              : metric === "balance"
                ? [0.4, 0.53, 0.67, 0.79 - i * 0.02][j]
                : [0.55, 0.66, 0.75, 0.86 - i * 0.02][j];
        assessments.push({
          id: `${p.id}-${metric}-${day}`,
          profileId: p.id,
          date: dateFor(p, day),
          metric,
          value:
            Math.round(
              (metricInfo[metric].higher
                ? baseline[metric] * ratio
                : baseline[metric] / ratio) * 10,
            ) / 10,
        });
      });
    });
    const activities =
      i === 1
        ? [
            [
              "Seated resistance sequence",
              "Assigned demonstration resistance movement.",
              "3 × 8 repetitions",
              "Strength",
            ],
            [
              "Controlled step sequence",
              "A fixed synthetic sequence of supported step transitions.",
              "2 × 6 repetitions",
              "Mobility",
            ],
            [
              "Supported balance practice",
              "Static balance practice with fixed support.",
              "3 × 20 seconds",
              "Balance",
            ],
          ]
        : i === 2
          ? [
              [
                "Seated coordination sequence",
                "Follow the assigned hand-to-target sequence in a seated position.",
                "3 × 40 seconds",
                "Coordination",
              ],
              [
                "Supported movement circuit",
                "A fixed demonstration of controlled reaching and transitions.",
                "2 × 5 repetitions",
                "Mobility",
              ],
              [
                "Supported balance practice",
                "Static balance practice with fixed support.",
                "2 × 30 seconds",
                "Balance",
              ],
            ]
          : [
              [
                "Supported balance practice",
                "Static balance practice with a fixed support in the synthetic scenario.",
                "3 × 30 seconds",
                "Balance",
              ],
              [
                "Sit-to-stand sequence",
                "Controlled transitions from a stable seated position.",
                "2 × 8 repetitions",
                "Mobility",
              ],
              [
                "Seated resistance sequence",
                "Assigned demonstration resistance movement.",
                "2 × 10 repetitions",
                "Strength",
              ],
            ];
    for (let day = 1; day <= p.day + 3; day++)
      activities.forEach(([exercise, description, dose, category], k) =>
        sessions.push({
          id: `${p.id}-${day}-${k}`,
          profileId: p.id,
          day,
          exercise,
          description,
          dose,
          category,
          status:
            day < p.day
              ? (day + k + i) % 9 === 0
                ? "skipped"
                : "completed"
              : "scheduled",
          notes:
            day === p.day - 1 && k === 0
              ? "Completed the assigned sequence. Mild fatigue recorded."
              : "",
          fatigue: day < p.day ? 2 : 0,
          discomfort: 0,
        }),
      );
  });
  return {
    version: 1,
    selectedProfile: profiles[0].id,
    assessments,
    sessions,
    compact: false,
  };
}
