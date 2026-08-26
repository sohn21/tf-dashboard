"use client";

import { useGlossary } from "./GlossaryProvider";

export function TermTrigger({
  termKey,
  label,
  variant,
}: {
  termKey: string;
  label: string;
  variant?: "n";
}) {
  const { open } = useGlossary();
  return (
    <span
      className={`term ${variant === "n" ? "n" : ""}`}
      role="button"
      tabIndex={0}
      onClick={() => open(termKey)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          open(termKey);
        }
      }}
    >
      {label}
    </span>
  );
}

export function TermButton({ termKey, label = "용어 ⓘ" }: { termKey: string; label?: string }) {
  const { open } = useGlossary();
  return (
    <button className="ibtn" onClick={() => open(termKey)}>
      {label}
    </button>
  );
}
