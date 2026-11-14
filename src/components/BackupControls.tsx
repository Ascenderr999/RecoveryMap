import { localize } from "../i18n";
import { useState } from "react";
import { useRecovery } from "../hooks/useRecovery";
import { download, parseBackup } from "../lib/backup";
import type { DemoState } from "../types";
export function BackupControls() {
  const { state, update, saving } = useRecovery();
  const [pending, setPending] = useState<DemoState | null>(null),
    [error, setError] = useState("");
  return (
    <div className="backup-controls">
      <button
        className="button"
        onClick={() =>
          download(
            "recoverymap-backup.json",
            JSON.stringify(
              {
                format: "RecoveryMap",
                createdAt: new Date().toISOString(),
                state,
              },
              null,
              2,
            ),
          )
        }
      >
        {localize("Download local backup \u2193")}
      </button>
      <label>
        {localize("Restore RecoveryMap backup")}
        <input
          type="file"
          accept=".json"
          disabled={saving}
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            try {
              if (f.size > 15 * 1024 * 1024)
                throw Error("Maximum file size is 15 MB.");
              setPending(parseBackup(await f.text()));
              setError("");
            } catch (err) {
              setError(
                err instanceof Error
                  ? err.message
                  : "Invalid RecoveryMap backup.",
              );
            }
          }}
        />
      </label>
      {localize(
        error && (
          <p className="error-text" role="alert">
            {localize(error)}
          </p>
        ),
      )}
      {localize(
        pending && (
          <div className="notice">
            <div>
              <p>
                {localize(
                  "Restore replaces all profiles, plans, measurements, and sessions on this device. Download a backup first.",
                )}
              </p>
              <div className="exercise-actions">
                <button
                  className="button primary"
                  disabled={saving}
                  onClick={async () => {
                    if (await update(() => pending)) setPending(null);
                  }}
                >
                  {localize("Confirm restore")}
                </button>
                <button className="button" onClick={() => setPending(null)}>
                  {localize("Cancel")}
                </button>
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
}
