import Papa from "papaparse";
import type { Assessment, Metric } from "../types";
import { metricInfo } from "../data/seed";
import { validateAssessment } from "./calculations";
export function parseAssessmentCSV(
  text: string,
  profileId: string,
  existing: Assessment[],
  sourceName: string,
): Assessment[] {
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });
  if (parsed.errors.length)
    throw Error("Invalid assessment CSV. Check columns and quoted values.");
  if (!parsed.data.length || parsed.data.length > 500)
    throw Error("Import requires 1–500 observations.");
  const result: Assessment[] = [];
  for (const [i, row] of parsed.data.entries()) {
    const metric = row.metric as Metric;
    if (!Object.keys(metricInfo).includes(metric))
      throw Error(`Row ${i + 2}: unsupported metric.`);
    if (row.unit !== metricInfo[metric].unit)
      throw Error(`Row ${i + 2}: incompatible unit.`);
    if (
      !row.protocol?.trim() ||
      row.protocol === "standard" ||
      row.protocol === "PROTOCOL UNSPECIFIED" ||
      !row.environment?.trim()
    )
      throw Error(
        `Row ${i + 2}: explicit protocol and environment are required.`,
      );
    if (["true", "1"].includes(row.isBaseline || row.baseline))
      throw Error(
        "Baseline imports require individual review. Use the confirmed baseline form instead.",
      );
    const value = Number(row.value),
      date = row.date,
      err = validateAssessment(value, date, metric, [...existing, ...result]);
    if (err) throw Error(`Row ${i + 2}: ${err}`);
    result.push({
      id: `${profileId}-manual-${crypto.randomUUID()}`,
      profileId,
      metric,
      value,
      date,
      protocol: row.protocol.trim(),
      environment: row.environment.trim(),
      sourceName,
      notes: row.notes || "",
    });
  }
  return result;
}
