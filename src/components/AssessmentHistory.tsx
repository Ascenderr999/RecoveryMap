import { localize } from "../i18n";
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
            <th>{localize("Date")}</th>
            <th>{localize("Measurement")}</th>
            <th>{localize("Value")}</th>
            <th>{localize("Baseline comparison")}</th>
            <th>{localize("Source")}</th>
            <th>{localize("Notes")}</th>
          </tr>
        </thead>
        <tbody>
          {localize(
            [...rows]
              .sort((a, b) => b.date.localeCompare(a.date))
              .map((a) => {
                const base = baselineFor(rows, a.metric);
                return (
                  <tr key={a.id}>
                    <td>{localize(a.date)}</td>
                    <td>
                      {localize(metricInfo[a.metric].label)}
                      <small className="table-detail">
                        {localize(metricInfo[a.metric].direction)}
                      </small>
                    </td>
                    <td className="numeric">
                      {localize(a.value)} {localize(metricInfo[a.metric].unit)}
                    </td>
                    <td>
                      {localize(
                        a.baseline ? (
                          <span className="pill">{localize("Baseline")}</span>
                        ) : base ? (
                          (a.protocol ?? "standard") ===
                          (base.protocol ?? "standard") ? (
                            `${fmt(performance(a.value, base.value, metricInfo[a.metric].higher) ?? undefined)}% of baseline`
                          ) : (
                            "Different protocol — no comparison"
                          )
                        ) : (
                          "No baseline"
                        ),
                      )}
                      <small className="table-detail" translate="no">
                        {a.protocol ?? "standard"}
                      </small>
                    </td>
                    <td>
                      {localize(
                        a.id.includes("-manual-")
                          ? "Manual entry"
                          : "Synthetic seed",
                      )}
                    </td>
                    <td translate="no">{a.notes || "—"}</td>
                  </tr>
                );
              }),
          )}
        </tbody>
      </table>
    </div>
  );
}
