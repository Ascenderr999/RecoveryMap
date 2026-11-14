import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  adaptDataset,
  type ResearchDataset,
  type ResearchSession,
} from "./model";
export type WorkspaceMode = "personal" | "research";
export interface WorkspaceSelection {
  mode: WorkspaceMode;
  participantId: string;
  session: ResearchSession;
}
export const DEFAULT_SELECTION: WorkspaceSelection = {
  mode: "personal",
  participantId: "9023",
  session: "D",
};
export function restoreSelection(value: string | null): WorkspaceSelection {
  try {
    const r = JSON.parse(value || "null");
    return {
      mode: r?.mode === "research" ? "research" : "personal",
      participantId:
        typeof r?.participantId === "string" && /^\d+$/.test(r.participantId)
          ? r.participantId
          : "9023",
      session: ["D", "E", "F", "G"].includes(r?.session) ? r.session : "D",
    };
  } catch {
    return { ...DEFAULT_SELECTION };
  }
}
const Context = createContext<{
  selection: WorkspaceSelection;
  setSelection: (patch: Partial<WorkspaceSelection>) => void;
  dataset: ResearchDataset | null;
  error: string;
} | null>(null);
export function ResearchProvider({ children }: { children: ReactNode }) {
  const [selection, setState] = useState(() => {
      try {
        return restoreSelection(localStorage.getItem("recoverymap-workspace"));
      } catch {
        return { ...DEFAULT_SELECTION };
      }
    }),
    [dataset, setDataset] = useState<ResearchDataset | null>(null),
    [error, setError] = useState("");
  useEffect(() => {
    let mounted = true;
    fetch("/data/cft70/cft70.normalized.json")
      .then((r) => {
        if (!r.ok) throw Error();
        return r.json();
      })
      .then(adaptDataset)
      .then((data) => {
        if (mounted) {
          setDataset(data);
          setState((s) =>
            data.participantIds.includes(s.participantId)
              ? s
              : { ...s, participantId: "9023" },
          );
        }
      })
      .catch(() => {
        if (mounted)
          setError(
            "Bundled research data could not load. Reconnect once to cache the dataset. Personal records are unaffected.",
          );
      });
    return () => {
      mounted = false;
    };
  }, []);
  function setSelection(patch: Partial<WorkspaceSelection>) {
    setState((s) => {
      const next = { ...s, ...patch };
      try {
        localStorage.setItem("recoverymap-workspace", JSON.stringify(next));
      } catch {
        /* selection still works without preference persistence */
      }
      return next;
    });
  }
  return (
    <Context.Provider value={{ selection, setSelection, dataset, error }}>
      {children}
    </Context.Provider>
  );
}
export function useResearch() {
  const c = useContext(Context);
  if (!c) throw Error("Missing research provider");
  return c;
}
