import { useState } from "react";
import { localize as t } from "../i18n";
import { Panel } from "../components/ui";
import { useResearch } from "./ResearchContext";
import {
  ResearchLoading,
  ResearchObservationTable,
  researchCSV,
} from "./ResearchViews";
import { BASELINE_METHOD, DATASET_URL, METADATA_URL } from "./model";
import { download } from "../lib/backup";
import { compareResearch } from "./calculations";
export function DataExplorer() {
  const { dataset } = useResearch();
  const [participant, setParticipant] = useState("all"),
    [file, setFile] = useState("all"),
    [page, setPage] = useState(0),
    [group, setGroup] = useState("all"),
    [session, setSession] = useState("all"),
    [integrity, setIntegrity] = useState<Record<string, string>>({});
  if (!dataset) return <ResearchLoading />;
  const rows = dataset.observations.filter(
    (r) =>
      (participant === "all" || r.participantId === participant) &&
      (file === "all" || r.sourceFile === file) &&
      (group === "all" || r.group === group) &&
      (session === "all" || r.session === session),
  );
  const complete = dataset.participantIds.filter(
    (id) => compareResearch(dataset.observations, id, "D").ok,
  ).length;
  return (
    <>
      <Panel
        title={t("Verified source inventory")}
        eyebrow={t("REAL NASA EARTH-ANALOG DATA")}
      >
        <div className="source-summary">
          <strong>
            {dataset.participantIds.length}
            <small>{t("Participant IDs")}</small>
          </strong>
          <strong>
            {
              dataset.observations.filter((r) => r.metric === "leg_force")
                .length
            }{" "}
            /{" "}
            {
              dataset.observations.filter((r) => r.metric === "slalom_time")
                .length
            }
            <small>{t("Force / slalom rows")}</small>
          </strong>
          <strong>
            {complete}
            <small>{t("Complete B/C + first POST D pairs")}</small>
          </strong>
        </div>
        <p>
          {t(
            "These files contain observations, not prescriptions, session completion, fatigue, symptoms, or medical outcomes. Group labels Control, Ex, Ex&T, Flywheel are preserved literally without invented treatment descriptions.",
          )}
        </p>
        <p>{t(BASELINE_METHOD)}</p>
        <p>
          {t(
            "PRE A/B/C and POST D/E/F/G retain their source phases. Positive PRE BR_Day values must not be interpreted as post-recovery days. Source dates use US M/D/YYYY; missing dates remain null.",
          )}
        </p>
      </Panel>
      <div className="two-col">
        {dataset.sources.map((source) => {
          const rr = dataset.observations.filter(
            (r) => r.sourceFile === source.file,
          );
          return (
            <Panel title={source.file} key={source.file} eyebrow="NASA CFT70">
              <p>
                {rr.length} {t("rows")} · 9 {t("columns")} ·{" "}
                {new Set(rr.map((r) => r.participantId)).size}{" "}
                {t("Participant IDs")}
              </p>
              <p>
                {t("Missing source dates")}:{" "}
                {rr.filter((r) => r.sourceDate === null).length}
              </p>
              <p role="status">
                {integrity[source.file] ??
                  t("Hash not yet checked in this browser")}
              </p>
              <button
                className="button"
                onClick={async () => {
                  try {
                    const bytes = await (
                      await fetch(`/data/cft70/raw/${source.file}`)
                    ).arrayBuffer();
                    const digest = await crypto.subtle.digest("SHA-256", bytes);
                    const hash = Array.from(new Uint8Array(digest), (n) =>
                      n.toString(16).padStart(2, "0"),
                    ).join("");
                    setIntegrity((prev) => ({
                      ...prev,
                      [source.file]: t(
                        hash === source.sha256
                          ? "SHA-256 matches bundled manifest"
                          : "INTEGRITY FAILURE — do not use these records",
                      ),
                    }));
                  } catch {
                    setIntegrity((prev) => ({
                      ...prev,
                      [source.file]: t("NOT VERIFIED — hash check unavailable"),
                    }));
                  }
                }}
              >
                {t("Verify bundled SHA-256")}
              </button>
              <label>
                SHA-256<code className="hash-value">{source.sha256}</code>
              </label>
              <div className="exercise-actions">
                <a
                  className="button primary"
                  href={`/data/cft70/raw/${source.file}`}
                  download={source.file}
                >
                  {t("Download unchanged raw CSV")}
                </a>
                <a
                  className="button"
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {t("Exact NASA file API")}
                </a>
              </div>
            </Panel>
          );
        })}
      </div>
      <Panel title={t("Bundled records and metadata")}>
        <div className="exercise-actions">
          <a
            className="button"
            href="/data/cft70/cft70.normalized.json"
            download
          >
            {t("Download normalized JSON")}
          </a>
          <a className="button" href="/data/cft70/manifest.json" download>
            {t("Download SHA-256 manifest")}
          </a>
          <a className="button" href="/data/cft70/cft_metadata.json" download>
            {t("Download archived metadata")}
          </a>
          <a
            className="button"
            href={DATASET_URL}
            target="_blank"
            rel="noreferrer"
          >
            {t("Dataset page")}
          </a>
          <a
            className="button"
            href={METADATA_URL}
            target="_blank"
            rel="noreferrer"
          >
            {t("Exact metadata API")}
          </a>
        </div>
        <p>
          {t(
            "Every displayed observation identifies the original CSV and its ID column. Raw files are immutable; reset and backup/restore affect personal records only. Dataset-specific redistribution terms were not identified in the supplied metadata; retain NASA attribution and inspect archive terms before wider redistribution.",
          )}
        </p>
      </Panel>
      <Panel title={t("Research data explorer")}>
        <div className="form-row">
          <label>
            {t("Participant ID")}
            <select
              aria-label={t("Explorer participant filter")}
              value={participant}
              onChange={(e) => {
                setParticipant(e.target.value);
                setPage(0);
              }}
            >
              <option value="all">{t("All 35 participants")}</option>
              {dataset.participantIds.map((id) => (
                <option key={id}>{id}</option>
              ))}
            </select>
          </label>
          <label>
            {t("Source file")}
            <select
              aria-label={t("Explorer file filter")}
              value={file}
              onChange={(e) => {
                setFile(e.target.value);
                setPage(0);
              }}
            >
              <option value="all">{t("Both files")}</option>
              {dataset.sources.map((s) => (
                <option key={s.file}>{s.file}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            {t("Group label")}
            <select
              aria-label={t("Explorer group filter")}
              value={group}
              onChange={(e) => {
                setGroup(e.target.value);
                setPage(0);
              }}
            >
              <option value="all">{t("All groups")}</option>
              {[...new Set(dataset.observations.map((r) => r.group))].map(
                (g) => (
                  <option key={g}>{g}</option>
                ),
              )}
            </select>
          </label>
          <label>
            {t("Session")}
            <select
              aria-label={t("Explorer session filter")}
              value={session}
              onChange={(e) => {
                setSession(e.target.value);
                setPage(0);
              }}
            >
              <option value="all">{t("All sessions")}</option>
              {["A", "B", "C", "D", "E", "F", "G"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
          </label>
        </div>
        <button
          className="button"
          onClick={() =>
            download(
              "cft70-filtered.csv",
              researchCSV(rows, dataset.sources, session, dataset.observations),
              "text/csv;charset=utf-8",
            )
          }
        >
          {t("Export filtered research CSV")}
        </button>
        <ResearchObservationTable
          rows={rows.slice(page * 25, (page + 1) * 25)}
        />
        <div className="row pagination">
          <button
            className="button"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("Previous")}
          </button>
          <span>
            {page * 25 + 1}–{Math.min((page + 1) * 25, rows.length)} /{" "}
            {rows.length}
          </span>
          <button
            className="button"
            disabled={(page + 1) * 25 >= rows.length}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("Next")}
          </button>
        </div>
      </Panel>
    </>
  );
}
