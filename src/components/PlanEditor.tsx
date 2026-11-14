import { localize } from "../i18n";
import { useState } from "react";
import { Upload, Plus, Trash2, Save } from "lucide-react";
import { Panel, Empty } from "./ui";
import { useProfileData } from "../hooks/useProfileData";
import { blankActivity, fields, readPlanFile } from "../lib/planImport";
import {
  activatePlan,
  savePlanVersion,
  validatePlan,
  scheduleDays,
} from "../lib/planWorkflow";
import type { RecoveryPlan } from "../types";
export function PlanEditor() {
  const { p, state, update, saving } = useProfileData();
  const plans = (state.plans || []).filter((plan) => plan.profileId === p.id);
  const [draft, setDraft] = useState<RecoveryPlan | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  function manual() {
    setDraft({
      id: crypto.randomUUID(),
      profileId: p.id,
      title: "",
      author: "",
      sourceName: "Manual entry",
      importedAt: new Date().toISOString(),
      activities: [blankActivity()],
    });
    setError("");
  }
  async function importFile(file: File) {
    setDraft(null);
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const activities = await readPlanFile(file);
      setDraft({
        id: crypto.randomUUID(),
        profileId: p.id,
        title: file.name.replace(/\.[^.]+$/, ""),
        author: "",
        sourceName: file.name,
        importedAt: new Date().toISOString(),
        activities,
      });
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "The document could not be read. It may be encrypted or invalid.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function save() {
    if (!draft) return;
    const warnings = validatePlan(draft);
    if (warnings.length) {
      setError(warnings.join(" "));
      return;
    }
    if (await update((s) => savePlanVersion(s, draft))) {
      setDraft(null);
      setError("");
      setMessage(
        "Plan version saved locally. Review the schedule and explicitly activate the demo plan.",
      );
    }
  }
  async function schedule(plan: RecoveryPlan) {
    try {
      plan.activities.forEach((a) => scheduleDays(a.schedule));
    } catch {
      setError("Enter explicit mission days 1–365 for every activity.");
      return;
    }
    if (
      !window.confirm(
        localize(
          "Activate this reviewed demo plan? This records your authorization to use the demonstration, not verified specialist approval. Pending activities from today onward will be archived; completed and skipped history will be preserved.",
        ),
      )
    )
      return;
    try {
      const next = activatePlan(state, plan.id, p.day, true);
      if (await update(() => next)) {
        setError("");
        setMessage(
          "Demo plan activated. Previous versions and session history are retained.",
        );
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Activation failed.");
    }
  }
  return (
    <Panel
      title={localize("Specialist-authored plan import")}
      eyebrow={localize("CSV / TXT / PDF / DOCX · LOCAL PROCESSING")}
    >
      <p>
        {localize(
          "Import only authored content. Review all extracted fields before saving. Unstructured text remains in instructions; no doses or medical recommendations are inferred. Source-language content is preserved.",
        )}
      </p>
      <p className="notice">
        {localize(
          "Plans are stored in this browser’s IndexedDB, not a server database. Upload and review do not verify specialist approval. Unknown doses stay blank.",
        )}
      </p>
      <div className="import-actions">
        <label className="button">
          <Upload size={15} />
          {localize("Import document")}
          <input
            className="file-input"
            type="file"
            accept=".csv,.txt,.pdf,.docx"
            disabled={busy || saving}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importFile(file);
              e.target.value = "";
            }}
          />
        </label>
        <button className="button" disabled={busy || saving} onClick={manual}>
          <Plus size={15} />
          {localize("Create manual plan")}
        </button>
      </div>
      {localize(
        busy && (
          <p role="status">{localize("Reading document locally\u2026")}</p>
        ),
      )}
      {localize(
        error && (
          <p className="error-text" role="alert">
            {localize(error)}
          </p>
        ),
      )}
      <p className="save-message" role="status">
        {localize(message)}
      </p>
      {localize(
        draft && (
          <div className="plan-review">
            <h3>{localize("Review and edit before saving")}</h3>
            <p>
              {localize("Review warnings")}: {draft.activities.length}{" "}
              {localize("parsed entries")}; {validatePlan(draft).length}{" "}
              {localize("blocking issues")}
            </p>
            <ul>
              {validatePlan(draft).map((w) => (
                <li key={w}>{localize(w)}</li>
              ))}
            </ul>
            <p>
              {localize(
                "CSV headers: exercise, instructions, sets, repetitions, duration, frequency, schedule, notes. For TXT use labeled lines, with blank lines between activities. Verify PDF/DOCX reading order against the original.",
              )}
            </p>
            <div className="form-row">
              <label>
                {localize("Plan title")}
                <input
                  value={draft.title}
                  maxLength={200}
                  onChange={(e) =>
                    setDraft({ ...draft, title: e.target.value })
                  }
                />
              </label>
              <label>
                {localize("Specialist / source author")}
                <input
                  value={draft.author}
                  maxLength={200}
                  onChange={(e) =>
                    setDraft({ ...draft, author: e.target.value })
                  }
                />
              </label>
            </div>
            <p>
              {localize("Source:")}
              <span translate="no">{draft.sourceName}</span>
            </p>
            {localize(
              draft.activities.map((a, i) => (
                <fieldset className="import-activity" key={a.id}>
                  <legend>
                    {localize("Activity")}
                    {localize(i + 1)}
                  </legend>
                  <div className="editor-fields">
                    {localize(
                      fields.map((field) => (
                        <label key={field}>
                          {localize(field)}
                          <textarea
                            aria-label={localize(`${field} ${i + 1}`)}
                            value={a[field]}
                            maxLength={10000}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                activities: draft.activities.map((row) =>
                                  row.id === a.id
                                    ? { ...row, [field]: e.target.value }
                                    : row,
                                ),
                              })
                            }
                          />
                        </label>
                      )),
                    )}
                  </div>
                  <button
                    className="button danger"
                    onClick={() =>
                      setDraft({
                        ...draft,
                        activities: draft.activities.filter(
                          (row) => row.id !== a.id,
                        ),
                      })
                    }
                  >
                    <Trash2 size={14} />
                    {localize("Remove activity")}
                  </button>
                </fieldset>
              )),
            )}
            <div className="exercise-actions">
              <button
                className="button"
                disabled={draft.activities.length >= 200}
                onClick={() =>
                  setDraft({
                    ...draft,
                    activities: [...draft.activities, blankActivity()],
                  })
                }
              >
                <Plus size={14} />
                {localize("Add activity")}
              </button>
              <button
                className="button primary"
                disabled={saving}
                onClick={() => void save()}
              >
                <Save size={14} />
                {localize("Save reviewed plan")}
              </button>
              <button className="button" onClick={() => setDraft(null)}>
                {localize("Cancel")}
              </button>
            </div>
          </div>
        ),
      )}
      <div className="saved-plans">
        {localize(
          plans.length ? (
            plans.map((plan) => (
              <article className="saved-plan" key={plan.id}>
                <div>
                  <h3 translate="no">{plan.title}</h3>
                  <p translate="no">
                    {plan.author}
                    {localize(" \u00B7")}
                    {plan.sourceName}
                  </p>
                  <small>
                    {localize("Version")} {plan.version ?? 1} ·{" "}
                    {plan.activatedAt
                      ? localize(plan.archivedAt ? "Archived" : "Active")
                      : localize("Reviewed only")}{" "}
                    · {localize(plan.activities.length)}
                    {localize(" activities \u00B7")}
                    {localize(plan.importedAt.slice(0, 10))}
                  </small>
                </div>
                <p>
                  {localize("Specialist approval")}: {localize("NOT VERIFIED")}
                  <br />
                  {localize("Activation date")}: {plan.activatedAt ?? "—"}
                  <br />
                  {localize("Previous version")}:{" "}
                  {plan.previousVersionId ?? "—"}
                </p>
                <div className="exercise-actions">
                  <button
                    className="button"
                    onClick={() => {
                      setDraft(structuredClone(plan));
                      setError("");
                    }}
                  >
                    {localize("Review / edit")}
                  </button>
                  <button
                    className="button primary"
                    disabled={
                      saving || Boolean(plan.activatedAt || plan.archivedAt)
                    }
                    onClick={() => void schedule(plan)}
                  >
                    {localize("Activate reviewed demo plan")}
                  </button>
                </div>
              </article>
            ))
          ) : (
            <Empty>{localize("No imported plans for this profile.")}</Empty>
          ),
        )}
      </div>
    </Panel>
  );
}
