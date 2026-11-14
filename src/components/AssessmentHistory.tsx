import { localize } from "../i18n";
import type { Assessment } from "../types";
import { metricInfo } from "../data/seed";
import {
  baselineFor,
  performance,
  personalCompatible,
} from "../lib/calculations";
import { protocolLabel } from "../lib/assessmentWorkflow";
import { fmt } from "./ui";
export function AssessmentHistory({
  rows,
  contextRows = rows,
  onEdit,
}: {
  rows: Assessment[];
  contextRows?: Assessment[];
  onEdit?: (a: Assessment) => void;
}) {
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
                const base = baselineFor(contextRows, a.metric, a.date);
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
                          <span className="pill">
                            {localize(
                              a.supersededAt ? "Archived baseline" : "Baseline",
                            )}
                          </span>
                        ) : base ? (
                          personalCompatible(a, base) ? (
                            `${fmt(performance(a.value, base.value, metricInfo[a.metric].higher) ?? undefined)}% of baseline`
                          ) : (
                            "Different protocol/environment — no comparison"
                          )
                        ) : (
                          "No baseline"
                        ),
                      )}
                      <small className="table-detail" translate="no">
                        {localize(protocolLabel(a.protocol))}
                        <br />
                        {a.environment ?? "Personal demo / unspecified gravity"}
                      </small>
                    </td>
                    <td>
                      {localize(
                        a.id.includes("-manual-")
                          ? "Manual entry"
                          : "Synthetic seed",
                      )}
                    </td>
                    <td translate="no">
                      {a.notes || "—"}
                      {a.changeHistory?.length ? (
                        <small>
                          {localize("Revisions")}: {a.changeHistory.length}
                        </small>
                      ) : null}
                      {onEdit && !a.baseline && a.id.includes("-manual-") && (
                        <button className="button" onClick={() => onEdit(a)}>
                          {localize("Edit observation")}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              }),
          )}
        </tbody>
      </table>
    </div>
  );
}
