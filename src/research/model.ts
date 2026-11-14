export type ResearchMetric = "leg_force" | "slalom_time";
export type ResearchSession = "A" | "B" | "C" | "D" | "E" | "F" | "G";
export interface ResearchObservation {
  readonly source: "NASA_CFT70";
  readonly sourceFile: string;
  readonly sourceRowId: string;
  readonly participantId: string;
  readonly group: string;
  readonly session: ResearchSession;
  readonly phase: "PRE_TEST" | "POST_TEST";
  readonly brDay: number;
  readonly sourceDate: string | null;
  readonly metric: ResearchMetric;
  readonly unit: "N" | "s";
  readonly value: number;
  readonly environment: string;
  readonly protocol: string;
  readonly readOnly: true;
}
export interface ResearchSource {
  file: string;
  url: string;
  sha256: string;
  rows: number;
  participants: number;
}
export interface ResearchDataset {
  readonly observations: readonly ResearchObservation[];
  readonly participantIds: readonly string[];
  readonly sources: readonly ResearchSource[];
  readonly baselineMethod: string;
  readonly datasetId: string;
}
export const BASELINE_METHOD =
  "Arithmetic mean of PRE B and C; both required; A excluded; no imputation";
export const POST_SESSIONS = ["D", "E", "F", "G"] as const;
export const POST_DAYS = { D: 0, E: 1, F: 6, G: 11 } as const;
export const DATASET_URL =
  "https://nlsp.nasa.gov/explore/data/details/933d244c-5967-54ee-90c6-ce560da2108d?dataType=DATASETS";
export const METADATA_URL =
  "https://nlsp.nasa.gov/api/v1/data/datasets/933d244c-5967-54ee-90c6-ce560da2108d/full";
export function adaptDataset(raw: unknown): ResearchDataset {
  const data = raw as {
    datasetId: string;
    baselineMethod: string;
    sources: ResearchSource[];
    participants: {
      participantId: string;
      metrics: Record<
        ResearchMetric,
        { observations: Omit<ResearchObservation, "protocol">[] }
      >;
    }[];
  };
  if (
    !data ||
    data.datasetId !== "933d244c-5967-54ee-90c6-ce560da2108d" ||
    !Array.isArray(data.participants) ||
    !Array.isArray(data.sources)
  )
    throw Error("Invalid bundled research dataset.");
  const observations: ResearchObservation[] = [];
  for (const p of data.participants)
    for (const metric of ["leg_force", "slalom_time"] as const)
      for (const r of p.metrics[metric].observations) {
        if (
          r.participantId !== p.participantId ||
          r.metric !== metric ||
          r.source !== "NASA_CFT70" ||
          !Number.isFinite(r.value) ||
          r.value <= 0 ||
          r.unit !== (metric === "leg_force" ? "N" : "s") ||
          !["A", "B", "C", "D", "E", "F", "G"].includes(r.session) ||
          !["PRE_TEST", "POST_TEST"].includes(r.phase) ||
          !Number.isInteger(r.brDay) ||
          !(r.sourceDate === null || typeof r.sourceDate === "string") ||
          r.environment !== "Earth head-down bed-rest analog" ||
          r.readOnly !== true
        )
          throw Error("Invalid bundled research observation.");
        const sourceDate =
          r.sourceDate === null ||
          r.sourceDate.trim() === "" ||
          r.sourceDate === "NA"
            ? null
            : r.sourceDate;
        if (
          sourceDate !== null &&
          !/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(sourceDate)
        )
          throw Error("Invalid source date format.");
        if (
          r.sourceFile !== (metric === "leg_force" ? "force.csv" : "slalom.csv")
        )
          throw Error("Invalid source file for metric.");
        observations.push(
          Object.freeze({ ...r, sourceDate, protocol: `CFT70:${metric}` }),
        );
      }
  return Object.freeze({
    observations: Object.freeze(observations),
    participantIds: Object.freeze(
      [...new Set(observations.map((r) => r.participantId))].sort(),
    ),
    sources: Object.freeze(data.sources.map((s) => Object.freeze({ ...s }))),
    baselineMethod: BASELINE_METHOD,
    datasetId: data.datasetId,
  });
}
