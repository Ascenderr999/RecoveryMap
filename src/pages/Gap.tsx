import { localize } from "../i18n";
import { useProfileData } from "../hooks/useProfileData";
import { PageTitle, Panel, fmt } from "../components/ui";
import { TrajectoryChart } from "../components/Charts";
import { metricInfo } from "../data/seed";
import { performance } from "../lib/calculations";
import { useResearch } from "../research/ResearchContext";
import { ResearchAnalysis } from "../research/ResearchViews";
export default function Gap() {
  const { selection } = useResearch();
  const { rows, trend, latest, baseline } = useProfileData();
  const pair = trend.at(-1);
  if (selection.mode === "research") return <ResearchAnalysis />;
  return (
    <>
      <PageTitle
        label={localize("CORE CONCEPT / DESCRIPTIVE ANALYSIS")}
        title={localize("The Recovery Gap")}
        description={localize(
          "Strength and function tell different parts of the recovery story.",
        )}
      />
      <div className="gap-hero">
        <div>
          <span className="eyebrow">
            {localize("LATEST MATCHED COMPARISON \u00B7 ")}
            {localize(pair?.date || "NO MATCHED DATA")}
          </span>
          <h2>
            {localize("See the difference.")}
            <br />
            <span className="teal">
              {localize("Understand the divergence.")}
            </span>
          </h2>
          <p>
            {localize(
              pair && pair.strength > pair.mobility
                ? "Measured strength is closer to baseline than functional mobility in this paired observation."
                : "Strength and mobility follow distinct baseline-relative trajectories.",
            )}
            {localize(" ")}
            {localize(
              "This observation does not diagnose a condition or predict an outcome.",
            )}
          </p>
        </div>
        <div className="gap-number">
          <strong>
            {localize(fmt(pair?.gap))}
            <small>{localize("pp")}</small>
          </strong>
          <span>
            {localize("descriptive difference in percentage points")}
            <br />
            {localize("between baseline-relative changes")}
          </span>
        </div>
      </div>
      <div className="two-col">
        <Panel
          title={localize("Strength & mobility trend")}
          eyebrow={localize("MATCHED ASSESSMENT DATES")}
        >
          <p>
            {localize(
              "Only observations using the baseline protocol are compared. Different protocols remain visible in history.",
            )}
          </p>
          <TrajectoryChart rows={rows} />
        </Panel>
        <Panel
          title={localize("Recovery Gap over time")}
          eyebrow={localize("PERCENTAGE POINTS / NOT A RISK SCORE")}
        >
          <TrajectoryChart rows={rows} gap />
        </Panel>
      </div>
      <Panel
        title={localize("Each measurement, in context")}
        eyebrow={localize("LATEST OBSERVATION PER METRIC")}
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{localize("Metric & direction")}</th>
                <th>{localize("Baseline")}</th>
                <th>{localize("Latest")}</th>
                <th>{localize("Observation date")}</th>
                <th>{localize("Baseline ratio")}</th>
                <th>{localize("Change")}</th>
              </tr>
            </thead>
            <tbody>
              {localize(
                (
                  ["strength", "mobility", "balance", "coordination"] as const
                ).map((m) => {
                  const a = latest(m),
                    b = baseline(m),
                    ratio =
                      a && b
                        ? performance(a.value, b.value, metricInfo[m].higher)
                        : null;
                  return (
                    <tr key={m}>
                      <td>
                        {localize(metricInfo[m].label)}
                        <small className="table-detail">
                          {localize(metricInfo[m].direction)}
                        </small>
                      </td>
                      <td>
                        {localize(b?.value)} {localize(metricInfo[m].unit)}
                      </td>
                      <td>
                        {localize(a?.value)} {localize(metricInfo[m].unit)}
                      </td>
                      <td>{localize(a?.date || "—")}</td>
                      <td>
                        {localize(fmt(ratio ?? undefined))}
                        {localize("%")}
                      </td>
                      <td>
                        {localize(
                          fmt(ratio === null ? undefined : ratio - 100),
                        )}
                        {localize("%")}
                      </td>
                    </tr>
                  );
                }),
              )}
            </tbody>
          </table>
        </div>
        <p className="chart-caption">
          {localize(
            "Latest values above may have different dates. The charts and highlighted gap use only exact same-date strength and mobility pairs; no interpolation or carry-forward is used.",
          )}
        </p>
      </Panel>
      <div className="two-col">
        <Panel
          title={localize("Transparent by design")}
          eyebrow={localize("REPRODUCIBLE CALCULATIONS")}
        >
          <div className="formula">
            <span>{localize("Higher-is-better baseline ratio")}</span>
            <code>{localize("current / baseline \u00D7 100")}</code>
            <span>{localize("Lower-is-better timed-test ratio")}</span>
            <code>{localize("baseline / current \u00D7 100")}</code>
            <span>{localize("Strength change")}</span>
            <code>
              {localize("(current force / baseline force \u2212 1) \u00D7 100")}
            </code>
            <span>{localize("Mobility change")}</span>
            <code>
              {localize("(baseline time / current time \u2212 1) \u00D7 100")}
            </code>
            <span>{localize("Recovery Gap")}</span>
            <code>{localize("strength change \u2212 mobility change")}</code>
          </div>
          {localize(
            pair && (
              <p>
                {localize("For ")}
                {localize(pair.date)}
                {localize(":")}
                {localize(fmt(pair.strength - 100))}
                {localize("% \u2212 (")}
                {localize(fmt(pair.mobility - 100))}
                {localize("%) =")}
                {localize(" ")}
                <b className="teal">
                  {localize(fmt(pair.gap))}
                  {localize(" pp")}
                </b>
                {localize(".")}
              </p>
            ),
          )}
        </Panel>
        <Panel
          title={localize("Interpret with care")}
          eyebrow={localize("DATA LIMITATIONS")}
        >
          <ul className="reading-list">
            <li>
              {localize(
                "Seed profiles and measurements are synthetic. Manual entries and imported plans are user-provided.",
              )}
            </li>
            <li>
              {localize(
                "This difference is not a clinically validated risk score. No diagnostic thresholds are applied.",
              )}
            </li>
            <li>
              {localize(
                "Task setup, measurement error, and baseline selection can affect comparisons.",
              )}
            </li>
            <li>
              {localize(
                "These independent measures are not interchangeable. Ratios may exceed 100%.",
              )}
            </li>
            <li>
              {localize(
                "Matching dates do not guarantee identical testing conditions or simultaneous measurements.",
              )}
            </li>
            <li>
              {localize(
                "Recorded results never change assigned exercises or generate medical recommendations.",
              )}
            </li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
