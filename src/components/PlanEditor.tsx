import { localize } from "../i18n";
import { useState } from "react";
import { Upload, Plus, Trash2, Save } from "lucide-react";
import { Panel, Empty } from "./ui";
import { useProfileData } from "../hooks/useProfileData";
import { blankActivity, fields, readPlanFile } from "../lib/planImport";
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
    if (
      !draft.title.trim() ||
      !draft.author.trim() ||
      !draft.activities.length ||
      draft.activities.some((a) => !a.exercise.trim() || !a.instructions.trim())
    ) {
      setError(
        "Enter a plan title, source author, and a name and instructions for every activity.",
      );
      return;
    }
    if (
      await update((s) => ({
        ...s,
        plans: [
          ...(s.plans || []).filter((plan) => plan.id !== draft.id),
          draft,
        ],
      }))
    ) {
      setDraft(null);
      setError("");
      setMessage(
        "Plan saved locally. Scheduling requires an explicit reviewed mission day.",
      );
    }
  }
  async function schedule(plan: RecoveryPlan) {
    const scheduled = plan.activities.map((a) => ({
      a,
      days: a.schedule
        .split(/[,;\s]+/)
        .filter(Boolean)
        .map(Number),
    }));
    if (
      scheduled.some(
        ({ days }) =>
          !days.length ||
          days.some((d) => !Number.isInteger(d) || d < 1 || d > 365),
      )
    ) {
      setError(
        "For scheduling, enter explicit mission days from 1 to 365 separated by commas for every activity. Frequency text is never interpreted automatically.",
      );
      return;
    }
    const added = scheduled.flatMap(({ a, days }) =>
      [...new Set(days)].map((day) => ({
        id: `${plan.id}-${a.id}-${day}`,
        planId: plan.id,
        profileId: p.id,
        day,
        exercise: a.exercise,
        description: a.instructions,
        dose:
          [
            a.sets && `${a.sets} sets`,
            a.repetitions && `${a.repetitions} repetitions`,
            a.duration,
          ]
            .filter(Boolean)
            .join(" · ") || "See source instructions",
        category: "Imported plan",
        status: "scheduled" as const,
        notes: a.notes,
        fatigue: 0,
        discomfort: 0,
      })),
    );
    if (
      await update((s) => ({
        ...s,
        sessions: [
          ...s.sessions,
          ...added.filter((a) => !s.sessions.some((old) => old.id === a.id)),
        ],
      }))
    ) {
      setError("");
      setMessage(
        "Reviewed activities added to the daily schedule. Existing records were preserved.",
      );
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
                    {localize(plan.activities.length)}
                    {localize(" activities \u00B7")}
                    {localize(plan.importedAt.slice(0, 10))}
                  </small>
                </div>
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
                    disabled={saving}
                    onClick={() => void schedule(plan)}
                  >
                    {localize("Add reviewed schedule")}
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
