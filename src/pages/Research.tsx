import { localize } from "../i18n";
import { useState } from "react";
import { ExternalLink, Database, ShieldCheck, RotateCcw } from "lucide-react";
import { useRecovery } from "../hooks/useRecovery";
import { Panel, PageTitle, ProfileSelector } from "../components/ui";
import { BackupControls } from "../components/BackupControls";
export default function Research() {
  const { state, update, reset, saving } = useRecovery();
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <PageTitle
        label={localize("EVIDENCE / TRANSPARENCY / LOCAL CONTROL")}
        title={localize("NASA & Sources")}
        description={localize(
          "The motivation, boundaries, and controls behind your recovery workspace.",
        )}
      />
      <div className="two-col">
        <Panel
          title={localize("Why RecoveryMap?")}
          eyebrow={localize("SCIENTIFIC MOTIVATION")}
        >
          <div className="research-copy">
            <p>
              {localize(
                "NASA SM-204 identifies a need to develop and validate post-landing self-administered testing and rehabilitation tools. RecoveryMap demonstrates record organization and descriptive comparisons; it does not implement a NASA-validated medical tool.",
              )}
            </p>
            <h3>{localize("Function deserves its own measurement")}</h3>
            <p>
              {localize(
                "Post-flight sensorimotor changes can affect balance, coordination, and functional mobility. A force measurement and a timed mobility task capture different aspects of performance. Comparing each with its own baseline can make differences visible without treating one as a substitute for the other.",
              )}
            </p>
            <h3>{localize("Monitoring beyond immediate support")}</h3>
            <p>
              {localize(
                "Exploration missions motivate tools that organize specialist-authored activities when communication or in-person support is limited. Offline operation supports continuity of the record; it does not replace clinical supervision.",
              )}
            </p>
            <h3>{localize("Analog data has limits")}</h3>
            <p>
              {localize(
                "Earth-based analog studies cannot fully reproduce exploration environments. Different tasks, populations, gravity conditions, and protocols limit transferability. No NASA dataset or participant result is included in this MVP.",
              )}
            </p>
          </div>
        </Panel>
        <Panel
          title={localize("Research references")}
          eyebrow={localize("EXTERNAL PRIMARY SOURCES")}
        >
          <a
            className="research-link"
            href="https://www.nasa.gov/hrp/"
            target="_blank"
            rel="noreferrer"
          >
            <span>
              {localize("NASA Human Research Program")}
              <small>{localize("Human health and performance in space")}</small>
            </span>
            <ExternalLink size={18} />
          </a>
          <a
            className="research-link"
            href="https://osdr.nasa.gov/bio/repo"
            target="_blank"
            rel="noreferrer"
          >
            <span>
              {localize("NASA Open Science Data Repository")}
              <small>
                {localize("Explore the official research repository")}
              </small>
            </span>
            <ExternalLink size={18} />
          </a>
          <a
            className="research-link"
            href="https://nlsp.nasa.gov/explore/data/details/933d244c-5967-54ee-90c6-ce560da2108d?dataType=DATASETS"
            target="_blank"
            rel="noreferrer"
          >
            <span>
              {localize("NASA CFT70 dataset")}
              <small>{localize("NASA Life Sciences Data Archive")}</small>
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
              {localize("Human Research Roadmap \u2014 SM-204")}
              <small>{localize("NASA Human Research Program")}</small>
            </span>
            <ExternalLink size={18} />
          </a>
          <div className="notice">
            {localize(
              "CFT70 is an Earth-based analog study, not Mars astronaut data. Participant-level integration is pending: the linked dataset files could not be accessed and validated during this milestone. No participant values are fabricated.",
            )}
          </div>
          <p>
            {localize(
              "These links provide research context. RecoveryMap is a team RANGERS hackathon demonstration and does not imply NASA endorsement or clinical validation.",
            )}
          </p>
        </Panel>
      </div>
      <div className="two-col">
        <Panel
          title={localize("Workspace settings")}
          eyebrow={localize("YOUR DEVICE / YOUR DEMO")}
        >
          <BackupControls />
          <label>
            {localize("Active synthetic astronaut")}
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
            {localize("Compact workspace spacing")}
          </label>
          <div className="setting-info">
            <Database size={20} />
            <div>
              <h3>{localize("Local IndexedDB storage")}</h3>
              <p>
                {localize(
                  "Selected profile, session status, notes, assessments, and spacing preference persist in this browser. Clearing site data removes them. Private browsing may discard them.",
                )}
              </p>
            </div>
          </div>
          <div className="setting-info">
            <ShieldCheck size={20} />
            <div>
              <h3>{localize("Privacy by default")}</h3>
              <p>
                {localize(
                  "No authentication, telemetry, device connection, or external data transmission is implemented. All app assets are local. Opening a research link visits an external NASA website. Do not enter personal health information in this demo.",
                )}
              </p>
            </div>
          </div>
        </Panel>
        <Panel
          title={localize("Demo controls & limitations")}
          eyebrow={localize("RECOVERYMAP V0.2.0")}
        >
          <p>
            {localize(
              "Three fictional profiles use a fixed demo date and prefilled synthetic history. Plans are fictional specialist-authored examples, not real prescriptions. No diagnosis, outcome prediction, or automatic plan adjustment is provided.",
            )}
          </p>
          <p>
            {localize(
              "The app shell is cached after an online visit; local records work offline. Your first visit requires a network connection to load the app.",
            )}
          </p>
          <p>
            {localize(
              "CSV, TXT, PDF, and DOCX plan import is available with mandatory review. Scanned PDFs require OCR, which is not supported. Research participant-level integration remains pending.",
            )}
          </p>
          <div className="reset-box">
            <h3>{localize("Restore synthetic defaults")}</h3>
            <p>
              {localize(
                "Resets all three profiles, manual measurements, notes, sessions, and settings on this device.",
              )}
            </p>
            {localize(
              confirm ? (
                <div role="alert">
                  <p>
                    <b>
                      {localize(
                        "Delete all locally entered demonstration records?",
                      )}
                    </b>
                    {localize(" This cannot be undone.")}
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
                      {localize("Confirm reset")}
                    </button>
                    <button
                      className="button"
                      onClick={() => setConfirm(false)}
                    >
                      {localize("Cancel")}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  className="button danger"
                  onClick={() => setConfirm(true)}
                >
                  <RotateCcw size={15} />
                  {localize("Reset demo data")}
                </button>
              ),
            )}
          </div>
        </Panel>
      </div>
    </>
  );
}
