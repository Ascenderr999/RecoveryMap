export type Metric = "strength" | "mobility" | "balance" | "coordination";
export interface Assessment {
  id: string;
  profileId: string;
  date: string;
  metric: Metric;
  value: number;
  baseline?: boolean;
  notes?: string;
  protocol?: string;
  environment?: string;
  supersededAt?: string;
  sourceName?: string;
  changeHistory?: {
    changedAt: string;
    previousValue: number;
    previousDate: string;
    previousProtocol?: string;
    previousEnvironment?: string;
  }[];
}
export interface Profile {
  id: string;
  name: string;
  rank: string;
  initials: string;
  mission: string;
  code: string;
  destination: string;
  phase: string;
  focus: string;
  landing: string;
  day: number;
  author: string;
}
export interface Session {
  id: string;
  profileId: string;
  day: number;
  exercise: string;
  description: string;
  dose: string;
  category: string;
  status: "scheduled" | "completed" | "skipped";
  notes: string;
  fatigue: number;
  discomfort: number;
  planId?: string;
  archivedAt?: string;
  recordedAt?: string;
  fatigueRecorded?: boolean;
  discomfortRecorded?: boolean;
}
export interface PlanActivity {
  id: string;
  exercise: string;
  instructions: string;
  sets: string;
  repetitions: string;
  duration: string;
  frequency: string;
  schedule: string;
  notes: string;
  category?: string;
  sourceReference?: string;
}
export interface RecoveryPlan {
  id: string;
  profileId: string;
  title: string;
  author: string;
  sourceName: string;
  importedAt: string;
  activities: PlanActivity[];
  version?: number;
  reviewedAt?: string;
  previousVersionId?: string;
  activatedAt?: string;
  archivedAt?: string;
  authorization?: {
    confirmedAt: string;
    kind: "user-demo-confirmation";
    specialistVerified: false;
  };
}
export interface DemoState {
  version: number;
  selectedProfile: string;
  assessments: Assessment[];
  sessions: Session[];
  compact: boolean;
  plans?: RecoveryPlan[];
}
