import { describe, it, expect } from "vitest";
import { readFile } from "node:fs/promises";
import { createSeed, profiles } from "../data/seed";
import {
  activatePlan,
  savePlanVersion,
  scheduleDays,
  validatePlan,
} from "./planWorkflow";
import { recordAssessment, protocolLabel } from "./assessmentWorkflow";
import {
  baselineFor,
  matchedTrend,
  performance,
  recoveryGap,
} from "./calculations";
import { parseBackup } from "./backup";
import { parseAssessmentCSV } from "./assessmentImport";
import { personalReport, reportCSV, reportLines } from "./reportModel";
import { makeReportPDF } from "./pdfReport";
import type { RecoveryPlan } from "../types";
const plan = (): RecoveryPlan => ({
  id: crypto.randomUUID(),
  profileId: "chen",
  title: "Demo plan",
  author: "Fictional source",
  sourceName: "test.csv",
  importedAt: "2026-11-14T17:00:00Z",
  activities: [
    {
      id: "a",
      exercise: "Authored activity",
      instructions: "Original text, no invented prescription",
      sets: "",
      repetitions: "",
      duration: "",
      frequency: "",
      schedule: "1-45",
      notes: "source note",
      category: "Authored category",
      sourceReference: "Original row 2",
    },
  ],
});
describe("final workflow integrity", () => {
  it("preserves scenario B and balance numerical examples", () => {
    const s = createSeed().assessments.filter((a) => a.profileId === "chen");
    const p = matchedTrend(s).at(-1)!;
    expect(p.forceValue).toBe(509.6);
    expect(p.timeValue).toBe(14.4);
    expect(p.gap).toBeCloseTo(14.611111111111, 8);
    expect(performance(42.4, 55, true)).toBeCloseTo(77.09090909, 6);
    expect(recoveryGap(509.6, 560, 14.4, 11)).toBeCloseTo(14.61111111, 6);
  });
  it("expands exactly 45 assigned days without off-by-one or silent inferred frequency", () => {
    expect(scheduleDays("1-45")).toEqual(
      Array.from({ length: 45 }, (_, i) => i + 1),
    );
    expect(scheduleDays("1,1,45")).toEqual([1, 45]);
    for (const bad of ["", "0", "46-45", "1-366", "daily", "NaN", "1.5"])
      expect(() => scheduleDays(bad)).toThrow();
  });
  it("blocks blank names and duplicate authored activity rows", () => {
    const p = plan();
    p.activities.push({ ...p.activities[0], id: "b" });
    expect(validatePlan(p).join(" ")).toContain("duplicate");
    p.activities[0].exercise = " ";
    expect(validatePlan(p).join(" ")).toContain("name");
  });
  it("requires explicit activation and records user authorization without inventing specialist approval", () => {
    const s = savePlanVersion(createSeed(), plan());
    const p = s.plans![0];
    expect(() => activatePlan(s, p.id, 10, false)).toThrow();
    const next = activatePlan(s, p.id, 10, true);
    expect(next.plans![0].authorization?.specialistVerified).toBe(false);
    expect(next.plans![0].activatedAt).toBeTruthy();
    expect(next.sessions.filter((r) => r.planId === p.id)).toHaveLength(36);
    expect(next.sessions.find((r) => r.planId === p.id)?.dose).toBe("");
  });
  it("keeps completed/skipped sessions, archives pending replacement schedules, and isolates profiles", () => {
    let s = savePlanVersion(createSeed(), plan());
    const p = s.plans![0];
    const completed = s.sessions.filter(
      (r) => r.profileId === "chen" && r.status !== "scheduled",
    );
    s = activatePlan(s, p.id, 10, true);
    for (const row of completed)
      expect(s.sessions.find((r) => r.id === row.id)).toEqual(row);
    expect(s.sessions.filter((r) => r.profileId === "morgan")).toEqual(
      createSeed().sessions.filter((r) => r.profileId === "morgan"),
    );
    expect(
      s.sessions.filter((r) => r.profileId === "chen" && r.archivedAt).length,
    ).toBeGreaterThan(0);
    expect(activatePlan(s, p.id, 10, true)).toBe(s);
  });
  it("preserves immutable plan versions and original source on edit", () => {
    let s = savePlanVersion(createSeed(), plan());
    const old = s.plans![0];
    s = activatePlan(s, old.id, 10, true);
    s = savePlanVersion(s, { ...old, title: "Edited demo" });
    expect(s.plans).toHaveLength(2);
    expect(s.plans![0].title).toBe("Demo plan");
    expect(s.plans![1].previousVersionId).toBe(old.id);
    expect(s.plans![1].version).toBe(2);
    expect(s.plans![1].sourceName).toBe(old.sourceName);
  });
  it("requires baseline confirmation and preserves dated history and backup round-trip", () => {
    const seed = createSeed();
    const old = baselineFor(
      seed.assessments.filter((a) => a.profileId === "chen"),
      "strength",
    )!;
    const entry = {
      ...old,
      id: "chen-manual-new-baseline",
      date: "2026-11-20",
      value: 550,
    };
    expect(() => recordAssessment(seed.assessments, entry)).toThrow();
    const assessments = recordAssessment(seed.assessments, entry, true);
    expect(assessments).toHaveLength(seed.assessments.length + 1);
    expect(
      baselineFor(
        assessments.filter((a) => a.profileId === "chen"),
        "strength",
      )?.id,
    ).toBe(entry.id);
    expect(
      baselineFor(
        assessments.filter((a) => a.profileId === "chen"),
        "strength",
        "2026-11-14",
      )?.id,
    ).toBe(old.id);
    expect(
      matchedTrend(assessments.filter((a) => a.profileId === "chen")),
    ).toEqual(
      matchedTrend(seed.assessments.filter((a) => a.profileId === "chen")),
    );
    expect(
      parseBackup(JSON.stringify({ ...seed, assessments })).assessments,
    ).toEqual(assessments);
  });
  it("labels unspecified protocols without inventing a task", () => {
    expect(protocolLabel()).toBe("PROTOCOL UNSPECIFIED");
    expect(protocolLabel("standard")).toBe("PROTOCOL UNSPECIFIED");
    expect(protocolLabel("device-X")).toBe("device-X");
  });
  it("rejects mismatched/duplicate CSV observations and preserves escaped notes/source metadata", () => {
    const csv =
      'metric,value,unit,date,protocol,environment,notes\nmobility,14.4,s,2026-11-18,walk-A,Earth,"quoted, note"';
    const r = parseAssessmentCSV(csv, "chen", [], "observations.csv");
    expect(r[0].notes).toBe("quoted, note");
    expect(r[0].sourceName).toBe("observations.csv");
    expect(() => parseAssessmentCSV(csv, "chen", r, "x")).toThrow("exists");
    expect(() =>
      parseAssessmentCSV(csv.replace(",s,", ",N,"), "chen", [], "x"),
    ).toThrow("unit");
    expect(() =>
      parseAssessmentCSV(csv.replace("walk-A", ""), "chen", [], "x"),
    ).toThrow("protocol");
  });
  it("applies one report range to sessions, assessment exports and date-specific gap", () => {
    const s = createSeed(),
      p = profiles[1],
      r = personalReport(s, p, "2026-11-14", "2026-11-14");
    expect(r.sessions).toHaveLength(3);
    expect(r.stats.pending).toBe(3);
    expect(r.stats.total).toBe(3);
    expect(r.stats.future).toBe(0);
    expect(r.assessments.every((a) => a.date === "2026-11-14")).toBe(true);
    expect(reportCSV(r)).not.toContain("morgan");
    expect(r.latestPair?.gap).toBeCloseTo(14.61111111);
    expect(reportLines(r).join("\n")).toContain("14.6111 pp");
  });
  it("does not call future sessions skipped or include them in adherence", () => {
    const r = personalReport(
      createSeed(),
      profiles[1],
      "2026-11-15",
      "2026-11-17",
    );
    expect(r.stats.total).toBe(0);
    expect(r.stats.skipped).toBe(0);
    expect(r.stats.future).toBe(9);
    expect(r.latestPair).toBeNull();
  });
  it("generates a real multipage PDF with embedded EN/AZ font", async () => {
    const font = new Uint8Array(
      await readFile("public/assets/dm-sans-report.ttf"),
    );
    const pdf = await makeReportPDF(
      [
        "Azərbaycan / qüvvə / ölçmə",
        ...reportLines(personalReport(createSeed(), profiles[1])),
      ],
      font,
    );
    const output = pdf.output();
    expect(output.startsWith("%PDF-")).toBe(true);
    expect(output).toContain("/FontFile2");
    expect(output).toContain("startxref");
    expect(pdf.getNumberOfPages()).toBeGreaterThan(1);
    expect(pdf.getTextWidth("Azərbaycan")).toBeGreaterThan(0);
  });
});

it("does not schedule a duplicate of a completed activity when activating a revised plan", () => {
  let s = savePlanVersion(createSeed(), plan());
  const first = s.plans![0];
  s = activatePlan(s, first.id, 10, true);
  const done = s.sessions.find((r) => r.planId === first.id && r.day === 10)!;
  s = {
    ...s,
    sessions: s.sessions.map((r) =>
      r.id === done.id ? { ...r, status: "completed" } : r,
    ),
  };
  s = savePlanVersion(s, { ...first, title: "Revised demo" });
  const revision = s.plans!.at(-1)!;
  s = activatePlan(s, revision.id, 10, true);
  expect(s.sessions.find((r) => r.id === done.id)?.status).toBe("completed");
  expect(s.sessions.some((r) => r.planId === revision.id && r.day === 10)).toBe(
    false,
  );
  expect(s.sessions.filter((r) => r.planId === revision.id)).toHaveLength(35);
});
