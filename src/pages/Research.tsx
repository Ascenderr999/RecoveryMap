import { useState } from "react";
import { ExternalLink, Database, ShieldCheck, RotateCcw } from "lucide-react";
import { useRecovery } from "../hooks/useRecovery";
import { Panel, PageTitle, ProfileSelector } from "../components/ui";
export default function Research() {
  const { state, update, reset, saving } = useRecovery();
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <PageTitle
        label="EVIDENCE / TRANSPARENCY / LOCAL CONTROL"
        title="Research & Settings"
        description="The motivation, boundaries, and controls behind your recovery workspace."
      />
      <div className="two-col">
        <Panel title="Why RecoveryMap?" eyebrow="SCIENTIFIC MOTIVATION">
          <div className="research-copy">
            <h3>Function deserves its own measurement</h3>
            <p>
              Post-flight sensorimotor changes can affect balance, coordination,
              and functional mobility. A force measurement and a timed mobility
              task capture different aspects of performance. Comparing each with
              its own baseline can make differences visible without treating one
              as a substitute for the other.
            </p>
            <h3>Monitoring beyond immediate support</h3>
            <p>
              Exploration missions motivate tools that organize
              specialist-authored activities when communication or in-person
              support is limited. Offline operation supports continuity of the
              record; it does not replace clinical supervision.
            </p>
            <h3>Analog data has limits</h3>
            <p>
              Earth-based analog studies cannot fully reproduce exploration
              environments. Different tasks, populations, gravity conditions,
              and protocols limit transferability. No NASA dataset or
              participant result is included in this MVP.
            </p>
          </div>
        </Panel>
        <Panel title="Research references" eyebrow="EXTERNAL PRIMARY SOURCES">
          <a
            className="research-link"
            href="https://nlsp.nasa.gov/explore/data/details/933d244c-5967-54ee-90c6-ce560da2108d?dataType=DATASETS"
            target="_blank"
            rel="noreferrer"
          >
            <span>
              NASA CFT70 dataset<small>NASA Life Sciences Data Archive</small>
            </span>
            <ExternalLink size={18} />
          </a>
          <a
            className="research-link"
            href="https://humanresearchroadmap.nasa.gov/gaps/gap.aspx?i=695"
            target="_blank"
            rel="noreferrer"
          >
            <span>
              Human Research Roadmap — SM-204
              <small>NASA Human Research Program</small>
            </span>
            <ExternalLink size={18} />
          </a>
          <div className="notice">
            Research integration planned for a later milestone.
          </div>
          <p>
            These links provide research context. RecoveryMap is a team RANGERS
            hackathon demonstration and does not imply NASA endorsement or
            clinical validation.
          </p>
        </Panel>
      </div>
      <div className="two-col">
        <Panel title="Workspace settings" eyebrow="YOUR DEVICE / YOUR DEMO">
          <label>
            Active synthetic astronaut
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
            Compact workspace spacing
          </label>
          <div className="setting-info">
            <Database size={20} />
            <div>
              <h3>Local IndexedDB storage</h3>
              <p>
                Selected profile, session status, notes, assessments, and
                spacing preference persist in this browser. Clearing site data
                removes them. Private browsing may discard them.
              </p>
            </div>
          </div>
          <div className="setting-info">
            <ShieldCheck size={20} />
            <div>
              <h3>Privacy by default</h3>
              <p>
                No authentication, telemetry, device connection, or external
                data transmission is implemented. All app assets are local.
                Opening a research link visits an external NASA website. Do not
                enter personal health information in this demo.
              </p>
            </div>
          </div>
        </Panel>
        <Panel title="Demo controls & limitations" eyebrow="RECOVERYMAP V0.1.0">
          <p>
            Three fictional profiles use a fixed demo date and prefilled
            synthetic history. Plans are fictional specialist-authored examples,
            not real prescriptions. No diagnosis, outcome prediction, or
            automatic plan adjustment is provided.
          </p>
          <p>
            The app shell is cached after an online visit; local records work
            offline. Your first visit requires a network connection to load the
            app.
          </p>
          <p>
            Document import, validated research integration, and advanced
            exports are future milestones.
          </p>
          <div className="reset-box">
            <h3>Restore synthetic defaults</h3>
            <p>
              Resets all three profiles, manual measurements, notes, sessions,
              and settings on this device.
            </p>
            {confirm ? (
              <div role="alert">
                <p>
                  <b>Delete all locally entered demonstration records?</b> This
                  cannot be undone.
                </p>
                <div className="exercise-actions">
                  <button
                    className="button danger"
                    disabled={saving}
                    onClick={async () => {
                      await reset();
                      setConfirm(false);
                    }}
                  >
                    Confirm reset
                  </button>
                  <button className="button" onClick={() => setConfirm(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                className="button danger"
                onClick={() => setConfirm(true)}
              >
                <RotateCcw size={15} />
                Reset demo data
              </button>
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}
