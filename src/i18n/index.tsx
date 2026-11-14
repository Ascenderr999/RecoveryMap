import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import az from "./az.json";
export type Language = "en" | "az";
let active: Language = "en";
const normalize = (s: string) => s.replace(/\s+/g, " ").trim();
const lookup = new Map(
  Object.entries(az).map(([en, value]) => [normalize(en).toLowerCase(), value]),
);
const fragments = Object.keys(az)
  .filter((k) => k.length >= 3)
  .sort((a, b) => b.length - a.length);
const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const fragmentPattern = new RegExp(
  `(?<![\\p{L}])(?:${fragments.map(escape).join("|")})(?![\\p{L}])`,
  "giu",
);
export function translate(text: string) {
  if (active === "en") return text;
  const trimmed = normalize(text);
  const direct = lookup.get(trimmed.toLowerCase());
  const result =
    direct ??
    trimmed.replace(
      fragmentPattern,
      (part) => lookup.get(part.toLowerCase()) ?? part,
    );
  const rendered =
    trimmed.length > 2 && trimmed === trimmed.toUpperCase()
      ? result.toLocaleUpperCase("az-AZ")
      : result;
  return text.replace(text.trim(), rendered);
}
/** Only presentation is localized; persisted source content and form values stay unchanged. */
export function localize<T>(value: T): T {
  return (
    typeof value === "string"
      ? translate(value) +
        (!/\s$/.test(value) &&
        /(?:\bDay|\bday|RECOVERY DAY| ·|:|completed of|through today)$/.test(
          value.trim(),
        )
          ? " "
          : "")
      : Array.isArray(value)
        ? value.map((v) => localize(v))
        : value
  ) as T;
}
const Context = createContext<{
  language: Language;
  setLanguage: (lang: Language) => void;
}>({ language: "en", setLanguage: () => {} });
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [language, setLang] = useState<Language>(() => {
    try {
      return localStorage.getItem("recoverymap-language") === "az"
        ? "az"
        : "en";
    } catch {
      return "en";
    }
  });
  active = language;
  function setLanguage(lang: Language) {
    active = lang;
    setLang(lang);
    try {
      localStorage.setItem("recoverymap-language", lang);
    } catch {
      /* switching remains available when browser storage is restricted */
    }
  }
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);
  return (
    <Context.Provider value={{ language, setLanguage }}>
      {children}
    </Context.Provider>
  );
}
export function useLocale() {
  return useContext(Context);
}
export function LanguageSwitcher() {
  const { language, setLanguage } = useLocale();
  return (
    <div
      className="language-switch"
      role="group"
      aria-label={translate("Interface language")}
    >
      {(["en", "az"] as const).map((lang) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          aria-pressed={language === lang}
          className={language === lang ? "selected" : ""}
          onClick={() => setLanguage(lang)}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
