import { describe, it, expect } from "vitest";
import { parsePlanText, parseDocxHtml } from "./planImport";
import { readFile } from "node:fs/promises";
import mammoth from "mammoth";
import { parseBackup } from "./backup";
import { createSeed } from "../data/seed";
describe("authored plan extraction", () => {
  it("extracts DOCX soft breaks without merging or inventing fields", async () => {
    const buffer = await readFile("docs/samples/synthetic-plan.docx");
    const html = await mammoth.convertToHtml({ buffer });
    const rows = parseDocxHtml(html.value);
    expect(rows).toHaveLength(1);
    expect(rows[0].exercise).toBe("Synthetic test activity");
    expect(rows[0].instructions).toBe("Source instructions retained exactly.");
    expect(rows[0].schedule).toBe("14,15");
  });
  it("keeps quoted CSV instructions and authored doses", () => {
    const result = parsePlanText(
      'exercise,instructions,sets,repetitions,duration,frequency,schedule,notes\n"Supported balance","Hold, with support\nUse the assigned protocol",3,,30 seconds,daily,"14,15",original',
      true,
    );
    expect(result).toHaveLength(1);
    expect(result[0].instructions).toBe(
      "Hold, with support\nUse the assigned protocol",
    );
    expect(result[0].schedule).toBe("14,15");
    expect(result[0].repetitions).toBe("");
  });
  it("preserves unstructured text without generating prescriptions", () => {
    const result = parsePlanText("Exact specialist wording. No dose supplied.");
    expect(result[0].exercise).toBe("");
    expect(result[0].instructions).toBe(
      "Exact specialist wording. No dose supplied.",
    );
    expect(result[0].sets).toBe("");
  });
  it("retains unrecognized authored lines in instructions", () => {
    const result = parsePlanText(
      "Exercise: Balance\nInstructions: Original text\nCaution: Original caution",
    );
    expect(result[0].exercise).toBe("Balance");
    expect(result[0].instructions).toContain("Caution: Original caution");
  });
  it("rejects empty scanned text and unrecognized CSV headers", () => {
    expect(() => parsePlanText("  ")).toThrow("OCR");
    expect(() => parsePlanText("foo,bar\nx,y", true)).toThrow("recognized");
  });
});
describe("backup validation", () => {
  it("roundtrips isolated records and plans", () => {
    const state = createSeed();
    expect(parseBackup(JSON.stringify({ state }))).toMatchObject(state);
  });
  it("rejects missing baselines, invalid profiles, and duplicate records", () => {
    const s = createSeed();
    expect(() =>
      parseBackup(JSON.stringify({ ...s, selectedProfile: "unknown" })),
    ).toThrow();
    expect(() =>
      parseBackup(
        JSON.stringify({
          ...s,
          assessments: s.assessments.filter((a) => !a.baseline),
        }),
      ),
    ).toThrow("baseline");
    expect(() =>
      parseBackup(
        JSON.stringify({ ...s, sessions: [...s.sessions, s.sessions[0]] }),
      ),
    ).toThrow("Duplicate");
  });
});
