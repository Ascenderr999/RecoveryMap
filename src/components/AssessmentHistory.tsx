import type { Assessment } from "../types";
import { metricInfo } from "../data/seed";
import { baselineFor, performance } from "../lib/calculations";
import { fmt } from "./ui";
export function AssessmentHistory({ rows }: { rows: Assessment[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Measurement</th>
            <th>Value</th>
            <th>Baseline comparison</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          {[...rows]
            .sort((a, b) => b.date.localeCompare(a.date))
            .map((a) => {
              const base = baselineFor(rows, a.metric);
              return (
                <tr key={a.id}>
                  <td>{a.date}</td>
                  <td>
                    {metricInfo[a.metric].label}
                    <small className="table-detail">
                      {metricInfo[a.metric].direction}
                    </small>
                  </td>
                  <td className="numeric">
                    {a.value} {metricInfo[a.metric].unit}
                  </td>
                  <td>
                    {a.baseline ? (
                      <span className="pill">Baseline</span>
                    ) : base ? (
                      `${fmt(performance(a.value, base.value, metricInfo[a.metric].higher) ?? undefined)}% of baseline`
                    ) : (
                      "No baseline"
                    )}
                  </td>
                  <td>
                    {a.id.includes("-manual-")
                      ? "Manual entry"
                      : "Synthetic seed"}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );
}
