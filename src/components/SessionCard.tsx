import { localize } from "../i18n";
import { useState } from "react";
import { Check, SkipForward, ClipboardList } from "lucide-react";
import type { Session } from "../types";
import { useRecovery } from "../hooks/useRecovery";
export function SessionCard({ session: s }: { session: Session }) {
  const { update, saving, state } = useRecovery();
  const sourcePlan = state.plans?.find((plan) => plan.id === s.planId);
  const [notes, setNotes] = useState(s.notes),
    [fatigue, setFatigue] = useState(s.fatigue),
    [discomfort, setDiscomfort] = useState(s.discomfort),
    [saved, setSaved] = useState("");
  async function save(status: Session["status"]) {
    const ok = await update((state) => ({
      ...state,
      sessions: state.sessions.map((row) =>
        row.id === s.id ? { ...row, status, notes, fatigue, discomfort } : row,
      ),
    }));
    setSaved(ok ? "Saved locally" : "Not saved. Please try again.");
  }
  return (
    <article className="exercise-card">
      <div className="exercise-heading">
        <span className="activity-icon">
          <ClipboardList size={20} />
        </span>
        <div>
          <span className="eyebrow">{localize(s.category)}</span>
          <h3>{s.planId ? s.exercise : localize(s.exercise)}</h3>
        </div>
        <span className={`status ${s.status}`}>{localize(s.status)}</span>
      </div>
      <p>{s.planId ? s.description : localize(s.description)}</p>
      {sourcePlan && (
        <p className="source-info">
          {localize("Source")}:{" "}
          <span translate="no">{sourcePlan.sourceName}</span> ·{" "}
          {localize("Upload does not authenticate a specialist plan.")}
        </p>
      )}
      <div className="dose">
        {localize("Assigned dose ")}
        <strong>{s.planId ? s.dose : localize(s.dose)}</strong>
      </div>
      <label>
        {localize("Session notes")}
        <textarea
          value={notes}
          maxLength={2000}
          onChange={(e) => {
            setNotes(e.target.value);
            setSaved("");
          }}
          placeholder={localize("Record fatigue, discomfort, or observations…")}
        />
      </label>
      <div className="form-row">
        <label>
          {localize("Fatigue (0\u201310)")}
          <input
            type="number"
            min="0"
            max="10"
            step="1"
            value={fatigue}
            onChange={(e) =>
              setFatigue(Math.max(0, Math.min(10, Number(e.target.value))))
            }
          />
        </label>
        <label>
          {localize("Discomfort (0\u201310)")}
          <input
            type="number"
            min="0"
            max="10"
            step="1"
            value={discomfort}
            onChange={(e) =>
              setDiscomfort(Math.max(0, Math.min(10, Number(e.target.value))))
            }
          />
        </label>
      </div>
      <div className="exercise-actions">
        <button
          className="button primary"
          disabled={
            saving || !Number.isFinite(fatigue) || !Number.isFinite(discomfort)
          }
          onClick={() => void save("completed")}
        >
          <Check size={15} />
          {localize("Complete")}
        </button>
        <button
          className="button"
          disabled={saving}
          onClick={() => void save("skipped")}
        >
          <SkipForward size={15} />
          {localize("Skip")}
        </button>
        <button
          className="button subtle"
          disabled={saving}
          onClick={() => void save(s.status)}
        >
          {localize("Save notes")}
        </button>
      </div>
      <div className="save-message" aria-live="polite">
        {localize(saved)}
      </div>
    </article>
  );
}
