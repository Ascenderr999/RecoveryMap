import { describe, it, expect } from "vitest";
import {
  performance,
  recoveryGap,
  matchedTrend,
  adherence,
  validateAssessment,
} from "./calculations";
import { createSeed, profiles } from "../data/seed";
describe("descriptive baseline calculations", () => {
  it("excludes observations that use a different protocol from their baseline", () => {
    const rows = createSeed()
      .assessments.filter((a) => a.profileId === "morgan")
      .map((a) =>
        a.metric === "strength" && !a.baseline
          ? { ...a, protocol: "other-device" }
          : a,
      );
    expect(matchedTrend(rows)).toEqual([]);
  });
  it("uses the correct direction and percentage point difference", () => {
    expect(performance(450, 500, true)).toBe(90);
    expect(performance(20, 10, false)).toBe(50);
    expect(recoveryGap(450, 500, 20, 10)).toBe(40);
  });
  it("rejects nonpositive denominators and preserves above-baseline ratios", () => {
    expect(performance(0, 10, false)).toBeNull();
    expect(recoveryGap(1, 0, 2, 1)).toBeNull();
    expect(performance(600, 500, true)).toBe(120);
  });
  it("only pairs exact dates and never mixes profiles at the call site", () => {
    const rows = createSeed().assessments.filter(
      (a) => a.profileId === "morgan",
    );
    expect(matchedTrend(rows)).toHaveLength(4);
    const unpaired = rows.filter(
      (a) => !(a.metric === "mobility" && a.date === "2026-11-14"),
    );
    expect(matchedTrend(unpaired)).toHaveLength(3);
  });
  it("counts due activities including pending and skipped", () => {
    const s = createSeed().sessions.filter((s) => s.profileId === "morgan");
    const a = adherence(s, 14);
    expect(a.total).toBe(42);
    expect(a.percent).toBe((a.completed / 42) * 100);
    expect(adherence([], 14).percent).toBe(0);
  });
  it("rejects invalid values, impossible dates and duplicate metric dates", () => {
    expect(validateAssessment(NaN, "2026-11-15", "strength", [])).toBeTruthy();
    expect(validateAssessment(-1, "2026-11-15", "strength", [])).toBeTruthy();
    expect(
      validateAssessment(10001, "2026-11-15", "strength", []),
    ).toBeTruthy();
    expect(validateAssessment(400, "2026-02-30", "strength", [])).toBeTruthy();
    expect(validateAssessment(400, "2026-11-15", "strength", [])).toBe("");
    const rows = createSeed().assessments.filter(
      (a) => a.profileId === "morgan",
    );
    expect(validateAssessment(400, "2026-11-14", "strength", rows)).toContain(
      "already exists",
    );
  });
  it("generates unique seeded IDs and distinct profile timelines", () => {
    const s = createSeed();
    expect(new Set(s.assessments.map((a) => a.id)).size).toBe(
      s.assessments.length,
    );
    expect(new Set(s.sessions.map((a) => a.id)).size).toBe(s.sessions.length);
    expect(profiles.map((p) => p.day)).toEqual([14, 10, 18]);
  });
});
