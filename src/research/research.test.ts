import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import Papa from "papaparse";
import { adaptDataset, type ResearchObservation } from "./model";
import {
  baselineBC,
  compareResearch,
  researchTrajectory,
} from "./calculations";
import { restoreSelection } from "./ResearchContext";
import { researchCSV } from "./ResearchViews";
const dataset = adaptDataset(
    JSON.parse(readFileSync("public/data/cft70/cft70.normalized.json", "utf8")),
  ),
  rows = dataset.observations;
describe("CFT70 original files and row traceability", () => {
  it.each([
    [
      "force.csv",
      238,
      "Force_N",
      "296da01c055f15dd4410ddb8ae3ecd78ff515a26d4cb09ff6d81dbd17c2db947",
    ],
    [
      "slalom.csv",
      243,
      "Time_sec",
      "39fee8f94ebe647926ab3b4ab4a2113f8921674be7b152718c15d85442a0346b",
    ],
  ])(
    "verifies %s bytes, schema, missing dates and normalized values",
    (file, count, valueColumn, hash) => {
      const bytes = readFileSync(`public/data/cft70/raw/${file}`);
      expect(createHash("sha256").update(bytes).digest("hex")).toBe(hash);
      const raw = Papa.parse<Record<string, string>>(bytes.toString("utf8"), {
        header: true,
        skipEmptyLines: true,
      });
      expect(raw.meta.fields).toHaveLength(9);
      expect(raw.data).toHaveLength(Number(count));
      expect(new Set(raw.data.map((r) => r.Subject)).size).toBe(35);
      expect(raw.data.filter((r) => !r.Date || r.Date === "NA")).toHaveLength(
        14,
      );
      const indexed = new Map(raw.data.map((r) => [r.ID, r]));
      for (const r of rows.filter((r) => r.sourceFile === file)) {
        const original = indexed.get(r.sourceRowId)!;
        expect(r.value).toBe(Number(original[String(valueColumn)]));
        expect(r.participantId).toBe(original.Subject);
        expect(r.group).toBe(original.GroupName);
        expect(r.session).toBe(original.Session);
        expect(r.phase).toBe(original.Test_Phase);
        expect(r.brDay).toBe(Number(original.BR_Day));
        expect(r.sourceDate).toBe(
          !original.Date || original.Date === "NA" ? null : original.Date,
        );
        expect(r.readOnly).toBe(true);
      }
      expect([...new Set(raw.data.map((r) => r.GroupName))].sort()).toEqual([
        "Control",
        "Ex",
        "Ex&T",
        "Flywheel",
      ]);
    },
  );
  it("retains 35 IDs and 33 complete baseline/first POST pairs", () => {
    expect(dataset.participantIds).toHaveLength(35);
    expect(rows).toHaveLength(481);
    expect(
      dataset.participantIds.filter((id) => compareResearch(rows, id, "D").ok),
    ).toHaveLength(33);
    expect(Object.isFrozen(rows)).toBe(true);
    expect(Object.isFrozen(rows[0])).toBe(true);
  });
});
describe("9023 full-precision research fixtures", () => {
  it("requires arithmetic means of both PRE B/C and excludes A", () => {
    const f = baselineBC(rows, "9023", "leg_force"),
      t = baselineBC(rows, "9023", "slalom_time");
    expect(f.ok && f.value).toBeCloseTo(3342.69424, 9);
    expect(t.ok && t.value).toBeCloseTo(8.548, 12);
    if (f.ok) expect(f.rows.map((r) => r.session).sort()).toEqual(["B", "C"]);
  });
  it.each([
    ["D", 0, 3319.67584, 10.955],
    ["E", 1, 3209.0096, 8.616],
    ["F", 6, 3473.13184, 8.026],
    ["G", 11, 3372.20672, 8.276],
  ] as const)(
    "matches POST %s units and original values",
    (session, day, force, time) => {
      const c = compareResearch(rows, "9023", session);
      expect(c.ok).toBe(true);
      if (c.ok) {
        expect(c.brDay).toBe(day);
        expect(c.force.value).toBe(force);
        expect(c.time.value).toBe(time);
        expect(c.force.unit).toBe("N");
        expect(c.time.unit).toBe("s");
      }
    },
  );
  it("separates raw time change from inverse-time performance and the gap", () => {
    const c = compareResearch(rows, "9023", "D");
    expect(c.ok).toBe(true);
    if (c.ok) {
      expect(c.forceChangePct).toBeCloseTo(-0.6886181728664509, 10);
      expect(c.timeChangePct).toBeCloseTo(28.15863359850257, 10);
      expect(c.mobilityPerformanceChangePct).toBeCloseTo(
        -21.97170241898676,
        10,
      );
      expect(c.gapPercentagePoints).toBeCloseTo(21.283084246120307, 10);
      expect(c.forceRatioPct).toBeCloseTo(99.31138182713355, 10);
      expect(c.inverseTimeRatioPct).toBeCloseTo(78.02829758101324, 10);
      expect(c.gapPercentagePoints).not.toBeCloseTo(
        c.forceChangePct - c.timeChangePct,
      );
    }
  });
  it("uses session/phase/day pairing even when both dates are absent", () => {
    const noDates = rows.map((r) => ({ ...r, sourceDate: null }));
    const c = compareResearch(noDates, "9023", "D");
    expect(c.ok && c.gapPercentagePoints).toBeCloseTo(21.283084246120307, 10);
    expect(researchTrajectory(noDates, "9023").map((r) => r.label)).toEqual([
      "D · 0",
      "E · 1",
      "F · 6",
      "G · 11",
    ]);
  });
});
describe("unavailable comparisons never impute or borrow records", () => {
  it.each(["B", "C"] as const)(
    "does not fall back when baseline %s is missing",
    (session) => {
      const partial = rows.filter(
        (r) =>
          !(
            r.participantId === "9023" &&
            r.metric === "leg_force" &&
            r.session === session
          ),
      );
      expect(compareResearch(partial, "9023", "D").ok).toBe(false);
    },
  );
  it("rejects a missing paired session and a same-session observation from another participant", () => {
    const missing = rows.filter(
      (r) =>
        !(
          r.participantId === "9023" &&
          r.metric === "slalom_time" &&
          r.session === "D"
        ),
    );
    expect(compareResearch(missing, "9023", "D").ok).toBe(false);
    expect(researchTrajectory(missing, "9023")[0].gap).toBeNull();
  });
  it.each([
    { protocol: "another-test" },
    { unit: "s" },
    { environment: "Mars surface" },
    { participantId: "other" },
    { brDay: 1 },
    { phase: "PRE_TEST" },
    { value: 0 },
  ])("rejects incompatible observation %o", (patch) => {
    const incompatible = rows.map((r) =>
      r.participantId === "9023" &&
      r.metric === "leg_force" &&
      r.session === "D"
        ? ({ ...r, ...patch } as ResearchObservation)
        : r,
    );
    expect(compareResearch(incompatible, "9023", "D").ok).toBe(false);
  });
  it("rejects incompatible B/C baseline protocols", () => {
    const incompatible = rows.map((r) =>
      r.participantId === "9023" &&
      r.metric === "leg_force" &&
      r.session === "B"
        ? { ...r, protocol: "different-device" }
        : r,
    );
    expect(compareResearch(incompatible, "9023", "D").ok).toBe(false);
  });
});
describe("selection and research-only export", () => {
  it("defaults to Personal Demo with research 9023 D; restores selection without a profile mutation", () => {
    expect(restoreSelection(null)).toEqual({
      mode: "personal",
      participantId: "9023",
      session: "D",
    });
    expect(restoreSelection("{bad")).toEqual(restoreSelection(null));
    expect(
      restoreSelection(
        JSON.stringify({
          mode: "research",
          participantId: "9023",
          session: "G",
        }),
      ),
    ).toEqual({ mode: "research", participantId: "9023", session: "G" });
  });
  it("exports only research observations with source, units, methods and full-precision calculations", () => {
    const csv = researchCSV(
      rows.filter((r) => r.participantId === "9023"),
      dataset.sources,
      "D",
    );
    const parsed = Papa.parse<Record<string, string>>(csv, {
      header: true,
    }).data;
    expect(
      parsed.every(
        (r) => r.sourceType === "NASA_CFT70" && r.participantId === "9023",
      ),
    ).toBe(true);
    const d = parsed.find(
      (r) => r.metric === "leg_force" && r.session === "D",
    )!;
    expect(Number(d.forceChangePct)).toBeCloseTo(-0.6886181728664509, 10);
    expect(Number(d.rawTimeChangePct)).toBeCloseTo(28.15863359850257, 10);
    expect(Number(d.gapPercentagePoints)).toBeCloseTo(21.283084246120307, 10);
    expect(d.sourceRowId).toBeTruthy();
    expect(d.sha256).toHaveLength(64);
    expect(d.baselineMethod).toContain("B and C");
    expect(csv).not.toContain("fatigue");
    expect(csv).not.toContain("morgan");
  });
});
