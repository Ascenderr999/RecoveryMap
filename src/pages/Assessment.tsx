import { useState, type FormEvent } from "react";
import { Plus, ScanLine } from "lucide-react";
import { useProfileData } from "../hooks/useProfileData";
import { PageTitle, Panel, fmt } from "../components/ui";
import { AssessmentHistory } from "../components/AssessmentHistory";
import { dateFor, metricInfo } from "../data/seed";
import { validateAssessment } from "../lib/calculations";
import type { Metric } from "../types";
export default function Assessment() {
  const { p, rows, baseline, update, saving } = useProfileData();
  const [metric, setMetric] = useState<Metric>("strength"),
    [date, setDate] = useState(dateFor(p, p.day + 1)),
    [value, setValue] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  async function submit(e: FormEvent) {
    e.preventDefault();
    const err = validateAssessment(Number(value), date, metric, rows);
    setError(err);
    setMessage("");
    if (err) return;
    const ok = await update((s) => ({
      ...s,
      assessments: [
        ...s.assessments,
        {
          id: `${p.id}-manual-${crypto.randomUUID()}`,
          profileId: p.id,
          date,
          metric,
          value: Number(value),
        },
      ],
    }));
    if (ok) {
      setValue("");
      setMessage("Assessment saved locally. Dashboard and reports updated.");
    }
  }
  return (
    <>
      <PageTitle
        label="MEASURE / RECORD / OBSERVE"
        title="Functional Assessment"
        description="Manual measurement entry. Your browser is not connected to medical devices."
      />
      <div className="assessment-grid">
        <Panel
          title="Record an assessment"
          eyebrow="MANUAL ENTRY"
          action={<ScanLine className="teal" size={20} />}
        >
          <form onSubmit={(e) => void submit(e)} noValidate>
            <label>
              Measurement type
              <select
                value={metric}
                onChange={(e) => {
                  setMetric(e.target.value as Metric);
                  setError("");
                }}
              >
                {Object.entries(metricInfo).map(([key, m]) => (
                  <option key={key} value={key}>
                    {m.label} ({m.unit})
                  </option>
                ))}
              </select>
            </label>
            <p className="field-help">
              {metricInfo[metric].direction}. Demonstration entry range: &gt; 0
              to {metricInfo[metric].max} {metricInfo[metric].unit}; this is a
              technical bound, not a clinical reference range.
            </p>
            <div className="form-row">
              <label>
                Assessment date
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label>
                Measured value ({metricInfo[metric].unit})
                <input
                  type="number"
                  required
                  min="0.001"
                  max={metricInfo[metric].max}
                  step="any"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={`Enter ${metricInfo[metric].unit}`}
                />
              </label>
            </div>
            {error && (
              <p role="alert" className="error-text">
                {error}
              </p>
            )}
            <button className="button primary" type="submit" disabled={saving}>
              <Plus size={16} />
              {saving ? "Saving…" : "Save assessment"}
            </button>
            <p className="save-message" aria-live="polite">
              {message}
            </p>
          </form>
        </Panel>
        <Panel
          title="Pre-mission baselines"
          eyebrow="SYNTHETIC REFERENCE VALUES"
        >
          <div className="baseline-list">
            {(Object.keys(metricInfo) as Metric[]).map((m) => (
              <div key={m}>
                <span>
                  {metricInfo[m].label}
                  <small>{baseline(m)?.date}</small>
                </span>
                <strong>
                  {fmt(baseline(m)?.value)} <small>{metricInfo[m].unit}</small>
                </strong>
              </div>
            ))}
          </div>
          <p>
            Baseline ratios describe changes in recorded measurements. They are
            not estimates of clinical recovery or readiness.
          </p>
        </Panel>
      </div>
      <Panel
        title="Assessment history"
        eyebrow={`${p.name.toUpperCase()} / ISOLATED PROFILE RECORDS`}
      >
        <AssessmentHistory rows={rows} />
      </Panel>
    </>
  );
}
