"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { TERMS } from "./glossaryTerms";

const GlossaryContext = createContext<{ open: (key: string) => void } | null>(null);

export function useGlossary() {
  const ctx = useContext(GlossaryContext);
  if (!ctx) throw new Error("useGlossary must be used within GlossaryProvider");
  return ctx;
}

export function GlossaryProvider({ children }: { children: React.ReactNode }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const open = useCallback((key: string) => setActiveKey(key), []);
  const close = useCallback(() => setActiveKey(null), []);

  useEffect(() => {
    if (!activeKey) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeKey, close]);

  const term = activeKey ? TERMS[activeKey] : null;

  return (
    <GlossaryContext.Provider value={{ open }}>
      {children}
      {term && (
        <div className="term-pop" role="dialog" aria-label={term.t} onClick={(e) => e.stopPropagation()}>
          <button
            aria-label="닫기"
            onClick={close}
            style={{
              float: "right",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--text-secondary)",
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ×
          </button>
          <b>{term.t}</b>
          {term.ps.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      )}
      {activeKey && <div onClick={close} style={{ position: "fixed", inset: 0, zIndex: 40 }} aria-hidden="true" />}
    </GlossaryContext.Provider>
  );
}
