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
        <>
          <Panel title={t("Scientific need and limits")}>
            <p>
              {t(
                "NASA SM-204 establishes the need for post-landing self-administered assessment and rehabilitation tools. It does not validate RecoveryMap. Planetary landing can precede an ongoing surface mission; these Earth analog observations are not in-flight monitoring.",
              )}
            </p>
            <p>
              {t(
                "CFT70 is Earth-based 70-day head-down-bed-rest analog research. Strength and mobility task performance can diverge. The app replays original observations without turning them into astronaut identities, treatment recommendations, or Mars predictions.",
              )}
            </p>
            <p>
              {t(
                "Post-Flight Reconditioning is a source/template presentation, not a personal prescription for participant 9023 or any CFT70 participant.",
              )}
            </p>
          </Panel>
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
        </>
      ) : (
        <DataExplorer />
      )}
    </>
  );
}
