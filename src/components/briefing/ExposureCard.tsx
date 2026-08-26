import type { Exposure, Regime, RegimeStatus } from "@/lib/types";
import { TermTrigger } from "./TermTrigger";

const STATUS_COLOR: Record<RegimeStatus, string> = {
  good: "var(--good)",
  warning: "var(--warning)",
  serious: "var(--serious)",
  critical: "var(--critical)",
};

export function ExposureCard({
  regime,
  regimeStatus,
  exposure,
}: {
  regime: Regime;
  regimeStatus: RegimeStatus;
  exposure: Exposure | null | undefined;
}) {
  const rgColor = STATUS_COLOR[regimeStatus];
  const guards: string[] = [];
  if (exposure && exposure.sectorOk === false) guards.push("섹터 가드");
  if (exposure && exposure.themeOk === false) guards.push("테마 가드");

  return (
    <div className="blueprint" style={{ borderColor: rgColor, padding: "16px 18px" }}>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 26, fontWeight: 600, color: rgColor }}>
        {regime}
      </div>
      <div style={{ fontSize: 13, marginTop: 6 }}>
        <TermTrigger termKey="exposure" label="노출 상한" />{" "}
        {exposure ? (
          <>
            {exposure.l1MaxPct.toFixed(0)}% → 최종{" "}
            <b style={{ fontSize: 18, color: rgColor }}>{exposure.finalMaxPct.toFixed(0)}%</b>{" "}
            {exposure.cutPct > 0 ? (
              <span style={{ fontSize: 12, color: "var(--warning)" }}>
                (-{exposure.cutPct.toFixed(0)}%p, {guards.join(" + ")} 발동)
              </span>
            ) : (
              <span style={{ fontSize: 12, color: "var(--text-secondary)" }}>(가드 미발동, 감산 없음)</span>
            )}
          </>
        ) : (
          "—"
        )}
      </div>
    </div>
  );
}
