/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";

export type Language = "en" | "th";

export interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  toggleLang: () => void;
  tr: (en: string, th: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLang = "en",
}: {
  children: React.ReactNode;
  initialLang?: Language;
}) {
  const [lang, setLangState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("wanchai-v2-lang");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed === "en" || parsed === "th") return parsed;
      }
    } catch {
      // fallback
    }
    return initialLang;
  });

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem("wanchai-v2-lang", JSON.stringify(newLang));
    } catch {
      // ignore storage error
    }
    document.documentElement.lang = newLang;
  }, []);

  const toggleLang = useCallback(() => {
    setLangState((curr) => {
      const next = curr === "en" ? "th" : "en";
      try {
        localStorage.setItem("wanchai-v2-lang", JSON.stringify(next));
      } catch {
        // ignore
      }
      document.documentElement.lang = next;
      return next;
    });
  }, []);

  const tr = useCallback((en: string, th: string) => (lang === "en" ? en : th), [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      toggleLang,
      tr,
    }),
    [lang, setLang, toggleLang, tr]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export function LanguageToggle({
  className = "",
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const { lang, toggleLang, tr } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLang}
      className={`language-toggle-btn ${className}`}
      title={tr("Switch to Thai / เปลี่ยนเป็นภาษาไทย", "Switch to English / เปลี่ยนเป็นภาษาอังกฤษ")}
      aria-label={tr("Toggle Language (current: English)", "เปลี่ยนภาษา (ปัจจุบัน: ภาษาไทย)")}
    >
      <span className="lang-icon" aria-hidden="true">🌐</span>
      <span className="lang-code-tag">
        <span className={lang === "en" ? "active-lang" : "inactive-lang"}>EN</span>
        <span className="lang-sep">/</span>
        <span className={lang === "th" ? "active-lang" : "inactive-lang"}>TH</span>
      </span>
      {!compact && (
        <span className="lang-label">
          {lang === "en" ? "ไทย" : "EN"}
        </span>
      )}
    </button>
  );
}

export default LanguageContext;
