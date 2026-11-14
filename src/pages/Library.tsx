import { localize } from "../i18n";
import { useState } from "react";
import { PageTitle, Panel, Empty } from "../components/ui";
import { useProfileData } from "../hooks/useProfileData";
export default function Library() {
  const { sessions } = useProfileData();
  const [search, setSearch] = useState(""),
    [expanded, setExpanded] = useState<string | null>(null);
  const unique = [
    ...new Map(sessions.map((s) => [s.exercise, s])).values(),
  ].filter((s) =>
    `${s.exercise} ${s.category}`.toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <>
      <PageTitle
        label={localize("ASSIGNED CONTENT / EXERCISE LIBRARY")}
        title={localize("Exercise Library")}
        description={localize(
          "Understand the movements already assigned to this profile. This library does not prescribe new exercises.",
        )}
      />
      <label>
        {localize("Search assigned activities")}
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={localize("Search by activity or category")}
        />
      </label>
      <div className="library">
        {localize(
          unique.map((s, i) => (
            <Panel
              key={s.id}
              title={localize(s.exercise)}
              eyebrow={localize(s.category)}
            >
              <div className="movement">
                {localize(["↥", "⫶", "⌁", "↔"][i % 4])}
              </div>
              <p>
                {localize(
                  s.planId
                    ? "Imported specialist-authored content"
                    : "Synthetic demonstration content",
                )}
              </p>
              <button
                className="button"
                aria-expanded={expanded === s.id}
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              >
                {localize(
                  expanded === s.id
                    ? "Close instructions"
                    : "Open instructions ↗",
                )}
              </button>
              {localize(
                expanded === s.id && (
                  <div className="library-detail">
                    <p translate={s.planId ? "no" : undefined}>
                      {s.planId ? s.description : localize(s.description)}
                    </p>
                    <p translate={s.planId ? "no" : undefined}>
                      {s.planId ? s.dose : localize(s.dose)}
                    </p>
                  </div>
                ),
              )}
            </Panel>
          )),
        )}
      </div>
      {localize(
        !unique.length && (
          <Empty>{localize("No matching activities for this profile.")}</Empty>
        ),
      )}
    </>
  );
}
