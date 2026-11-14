import { localize as t } from "../i18n";
import { useSearchParams } from "react-router-dom";
import { PageTitle, Panel } from "../components/ui";
import { DataExplorer } from "../research/DataExplorer";
import { PersonalSettings } from "../components/PersonalSettings";
import { DATASET_URL, METADATA_URL } from "../research/model";
export default function Research() {
  const [query, setQuery] = useSearchParams();
  const tab = query.get("tab") || "data";
  return (
    <>
      <PageTitle
        label={t("EVIDENCE / TRANSPARENCY / LOCAL CONTROL")}
        title={t("NASA Research & Settings")}
        description={t(
          "A recovery-plan and functional-monitoring companion for gravity transitions during future exploration missions.",
        )}
      />
      <div className="mode-tabs secondary-tabs">
        {[
          ["data", "Data explorer"],
          ["sources", "NASA sources"],
          ["settings", "Local settings"],
        ].map(([id, label]) => (
          <button
            key={id}
            aria-pressed={tab === id}
            onClick={() => setQuery({ tab: id })}
          >
            {t(label)}
          </button>
        ))}
      </div>
      {tab === "settings" ? (
        <PersonalSettings />
      ) : tab === "sources" ? (
          <Panel title={t("Official primary sources")}>
            {[
              [DATASET_URL, "NASA CFT70 dataset"],
              [METADATA_URL, "Dataset metadata API"],
              [
                "https://humanresearchroadmap.nasa.gov/gaps/gap.aspx?i=695",
                "NASA Human Research Roadmap — SM-204",
              ],
              [
                "https://ntrs.nasa.gov/citations/20240000802",
                "NASA Post-Flight Reconditioning · 20240000802",
              ],
              ["https://www.nasa.gov/hrp/", "NASA Human Research Program"],
              [
                "https://osdr.nasa.gov/bio/repo",
                "NASA Open Science Data Repository",
              ],
            ].map(([url, label]) => (
              <a
                key={url}
                className="research-link"
                href={url}
                target="_blank"
                rel="noreferrer"
              >
                {t(label)} ↗
              </a>
            ))}
          </Panel>
      ) : (
        <DataExplorer />
      )}
    </>
  );
}
