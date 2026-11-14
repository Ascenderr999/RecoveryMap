import { useState } from "react";
import { localize as t } from "../i18n";
import { Panel, ProfileSelector } from "./ui";
import { BackupControls } from "./BackupControls";
import { useRecovery } from "../hooks/useRecovery";
export function PersonalSettings() {
  const { state, update, reset, saving } = useRecovery();
  const [confirm, setConfirm] = useState(false);
  return (
    <div className="two-col">
      <Panel
        title={t("Personal demo settings")}
        eyebrow={t("PERSONAL DATA ONLY")}
      >
        <label>
          {t("Active synthetic astronaut")}
          <ProfileSelector />
        </label>
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={state.compact}
            disabled={saving}
            onChange={(e) =>
              void update((s) => ({ ...s, compact: e.target.checked }))
            }
          />
          {t("Compact workspace spacing")}
        </label>
        <p>
          {t(
            "Selected profile, sessions, notes, assessments, and imported plans are stored in this browser using IndexedDB. Language and workspace selection use localStorage. No personal data is sent to NASA or another service.",
          )}
        </p>
        <BackupControls />
      </Panel>
      <Panel title={t("Privacy and reset boundaries")}>
        <p>
          {t(
            "Research CSV/JSON files are immutable bundled assets. Reset restores only personal demo defaults; research observations and their source hashes are untouched. Backups contain personal records only.",
          )}
        </p>
        <p>
          {t(
            "Demo plans are synthetic. Imported user plans are not authenticated merely by upload. No diagnosis, prescription, EVA clearance, or automatic exercise adjustment is provided.",
          )}
        </p>
        <div className="reset-box">
          <h3>{t("Restore synthetic defaults")}</h3>
          <p>
            {t(
              "Download a personal backup before resetting. Research records are excluded.",
            )}
          </p>
          {confirm ? (
            <div role="alert">
              <p>
                {t("Delete all locally entered demonstration records?")}{" "}
                {t("This cannot be undone.")}
              </p>
              <div className="exercise-actions">
                <button
                  className="button danger"
                  disabled={saving}
                  onClick={async () => {
                    if (await reset()) setConfirm(false);
                  }}
                >
                  {t("Confirm reset")}
                </button>
                <button className="button" onClick={() => setConfirm(false)}>
                  {t("Cancel")}
                </button>
              </div>
            </div>
          ) : (
            <button className="button danger" onClick={() => setConfirm(true)}>
              {t("Reset demo data")}
            </button>
          )}
        </div>
      </Panel>
    </div>
  );
}
