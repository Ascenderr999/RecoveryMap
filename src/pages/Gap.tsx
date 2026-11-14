import { useProfileData } from "../hooks/useProfileData";
import { PageTitle, Panel, fmt } from "../components/ui";
import { TrajectoryChart } from "../components/Charts";
import { metricInfo } from "../data/seed";
import { performance } from "../lib/calculations";
export default function Gap() {
  const { rows, trend, latest, baseline } = useProfileData();
  const pair = trend.at(-1);
  return (
    <>
      <PageTitle
        label="CORE CONCEPT / DESCRIPTIVE ANALYSIS"
        title="The Recovery Gap"
        description="Strength and function tell different parts of the recovery story."
      />
      <div className="gap-hero">
        <div>
          <span className="eyebrow">
            LATEST MATCHED COMPARISON · {pair?.date || "NO MATCHED DATA"}
          </span>
          <h2>
            See the difference.
            <br />
            <span className="teal">Understand the divergence.</span>
          </h2>
          <p>
            {pair && pair.strength > pair.mobility
              ? "Measured strength is closer to baseline than functional mobility in this paired observation."
              : "Strength and mobility follow distinct baseline-relative trajectories."}{" "}
            This observation does not diagnose a condition or predict an
            outcome.
          </p>
        </div>
        <div className="gap-number">
          <strong>
            {fmt(pair?.gap)}
            <small>pp</small>
          </strong>
          <span>
            descriptive difference in percentage points
            <br />
            between baseline-relative changes
          </span>
        </div>
      </div>
      <div className="two-col">
        <Panel
          title="Strength & mobility trend"
          eyebrow="MATCHED ASSESSMENT DATES"
        >
          <TrajectoryChart rows={rows} />
        </Panel>
        <Panel
          title="Recovery Gap over time"
          eyebrow="PERCENTAGE POINTS / NOT A RISK SCORE"
        >
          <TrajectoryChart rows={rows} gap />
        </Panel>
      </div>
      <Panel
        title="Each measurement, in context"
        eyebrow="LATEST OBSERVATION PER METRIC"
      >
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Metric & direction</th>
                <th>Baseline</th>
                <th>Latest</th>
                <th>Observation date</th>
                <th>Baseline ratio</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              {(
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
                      {metricInfo[m].label}
                      <small className="table-detail">
                        {metricInfo[m].direction}
                      </small>
                    </td>
                    <td>
                      {b?.value} {metricInfo[m].unit}
                    </td>
                    <td>
                      {a?.value} {metricInfo[m].unit}
                    </td>
                    <td>{a?.date || "—"}</td>
                    <td>{fmt(ratio ?? undefined)}%</td>
                    <td>{fmt(ratio === null ? undefined : ratio - 100)}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="chart-caption">
          Latest values above may have different dates. The charts and
          highlighted gap use only exact same-date strength and mobility pairs;
          no interpolation or carry-forward is used.
        </p>
      </Panel>
      <div className="two-col">
        <Panel
          title="Transparent by design"
          eyebrow="REPRODUCIBLE CALCULATIONS"
        >
          <div className="formula">
            <span>Higher-is-better baseline ratio</span>
            <code>current / baseline × 100</code>
            <span>Lower-is-better timed-test ratio</span>
            <code>baseline / current × 100</code>
            <span>Strength change</span>
            <code>(current force / baseline force − 1) × 100</code>
            <span>Mobility change</span>
            <code>(baseline time / current time − 1) × 100</code>
            <span>Recovery Gap</span>
            <code>strength change − mobility change</code>
          </div>
          {pair && (
            <p>
              For {pair.date}: {fmt(pair.strength - 100)}% − (
              {fmt(pair.mobility - 100)}%) ={" "}
              <b className="teal">{fmt(pair.gap)} pp</b>.
            </p>
          )}
        </Panel>
        <Panel title="Interpret with care" eyebrow="DATA LIMITATIONS">
          <ul className="reading-list">
            <li>
              All profiles, measurements, and plans are synthetic
              demonstrations.
            </li>
            <li>
              This difference is not a clinically validated risk score. No
              diagnostic thresholds are applied.
            </li>
            <li>
              Task setup, measurement error, and baseline selection can affect
              comparisons.
            </li>
            <li>
              These independent measures are not interchangeable. Ratios may
              exceed 100%.
            </li>
            <li>
              Matching dates do not guarantee identical testing conditions or
              simultaneous measurements.
            </li>
            <li>
              Recorded results never change assigned exercises or generate
              medical recommendations.
            </li>
          </ul>
        </Panel>
      </div>
    </>
  );
}
