import { localize } from "../i18n";
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
  const [isBaseline, setIsBaseline] = useState(false),
    [notes, setNotes] = useState("");
  const [protocol, setProtocol] = useState(
    baseline("strength")?.protocol ?? "standard",
  );
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!protocol.trim()) {
      setError("Enter a protocol identifier.");
      return;
    }
    const err = validateAssessment(
      Number(value),
      date,
      metric,
      isBaseline
        ? rows.filter((a) => !(a.metric === metric && a.baseline))
        : rows,
    );
    setError(err);
    setMessage("");
    if (err) return;
    const ok = await update((s) => ({
      ...s,
      assessments: [
        ...s.assessments.filter(
          (a) =>
            !(
              isBaseline &&
              a.profileId === p.id &&
              a.metric === metric &&
              a.baseline
            ),
        ),
        {
          id: `${p.id}-manual-${crypto.randomUUID()}`,
          profileId: p.id,
          date,
          metric,
          value: Number(value),
          baseline: isBaseline,
          notes,
          protocol: protocol.trim(),
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
        label={localize("MEASURE / RECORD / OBSERVE")}
        title={localize("Functional Assessment")}
        description={localize(
          "Manual measurement entry. Your browser is not connected to medical devices.",
        )}
      />
      <div className="assessment-grid">
        <Panel
          title={localize("Record an assessment")}
          eyebrow={localize("MANUAL ENTRY")}
          action={<ScanLine className="teal" size={20} />}
        >
          <form onSubmit={(e) => void submit(e)} noValidate>
            <label>
              {localize("Measurement type")}
              <select
                value={metric}
                onChange={(e) => {
                  setMetric(e.target.value as Metric);
                  setProtocol(
                    baseline(e.target.value as Metric)?.protocol ?? "standard",
                  );
                  setError("");
                }}
              >
                {localize(
                  Object.entries(metricInfo).map(([key, m]) => (
                    <option key={key} value={key}>
                      {localize(m.label)}
                      {localize(" (")}
                      {localize(m.unit)}
                      {localize(")")}
                    </option>
                  )),
                )}
              </select>
            </label>
            <p className="field-help">
              {localize(metricInfo[metric].direction)}
              {localize(". Demonstration entry range: > 0 to ")}
              {localize(metricInfo[metric].max)}{" "}
              {localize(metricInfo[metric].unit)}
              {localize(
                "; this is a technical bound, not a clinical reference range.",
              )}
            </p>
            <div className="form-row">
              <label>
                {localize("Assessment date")}
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <label>
                {localize("Measured value (")}
                {localize(metricInfo[metric].unit)}
                {localize(")")}
                <input
                  type="number"
                  required
                  min="0.001"
                  max={metricInfo[metric].max}
                  step="any"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  placeholder={localize(`Enter ${metricInfo[metric].unit}`)}
                />
              </label>
            </div>
            <label className="toggle-label">
              <input
                type="checkbox"
                checked={isBaseline}
                onChange={(e) => setIsBaseline(e.target.checked)}
              />
              {localize(
                "Save as individual baseline (replaces this metric's existing baseline)",
              )}
            </label>
            <label>
              {localize("Protocol identifier")}
              <input
                value={protocol}
                maxLength={200}
                onChange={(e) => setProtocol(e.target.value)}
              />
            </label>
            <label>
              {localize("Measurement notes")}
              <textarea
                value={notes}
                maxLength={2000}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={localize("Record task setup and observations")}
              />
            </label>
            <p className="field-help">
              {localize(
                "Use the same task, units, and protocol as the baseline. Comparisons describe measurements, not clinical readiness.",
              )}
            </p>
            {localize(
              error && (
                <p role="alert" className="error-text">
                  {localize(error)}
                </p>
              ),
            )}
            <button className="button primary" type="submit" disabled={saving}>
              <Plus size={16} />
              {localize(saving ? "Saving…" : "Save assessment")}
            </button>
            <p className="save-message" aria-live="polite">
              {localize(message)}
            </p>
          </form>
        </Panel>
        <Panel
          title={localize("Pre-mission baselines")}
          eyebrow={localize("INDIVIDUAL BASELINES / DEMO DEFAULTS")}
        >
          <div className="baseline-list">
            {localize(
              (Object.keys(metricInfo) as Metric[]).map((m) => (
                <div key={m}>
                  <span>
                    {localize(metricInfo[m].label)}
                    <small>{localize(baseline(m)?.date)}</small>
                  </span>
                  <strong>
                    {localize(fmt(baseline(m)?.value))}{" "}
                    <small>{localize(metricInfo[m].unit)}</small>
                  </strong>
                </div>
              )),
            )}
          </div>
          <p>
            {localize(
              "Baseline ratios describe changes in recorded measurements. They are not estimates of clinical recovery or readiness.",
            )}
          </p>
        </Panel>
      </div>
      <Panel
        title={localize("Assessment history")}
        eyebrow={localize(`${p.name.toUpperCase()} / ISOLATED PROFILE RECORDS`)}
      >
        <AssessmentHistory rows={rows} />
      </Panel>
    </>
  );
}
