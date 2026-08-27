import type { Exposure, Ftd, MarketMetric, Regime, RegimeStatus } from "@/lib/types";
import { TermTrigger } from "./TermTrigger";

const STATUS_COLOR: Record<RegimeStatus, string> = {
  good: "var(--good)",
  warning: "var(--warning)",
  serious: "var(--serious)",
  critical: "var(--critical)",
};

function MetricCard({ m }: { m: MarketMetric }) {
  const chgColor = (m.chgPct ?? 0) >= 0 ? "var(--good)" : "var(--critical)";
  let sub = "";
  let subColor = "var(--text-muted)";
  if (m.dd != null) {
    sub = `DD ${m.dd}`;
    subColor = m.dd >= 6 ? "var(--critical)" : m.dd >= 4 ? "var(--warning)" : "var(--text-muted)";
  } else if (m.level != null) {
    sub = `${m.levelPrefix}${m.level >= 100 ? Math.round(m.level).toLocaleString() : m.level.toFixed(2)}`;
  }
  return (
    <div
      style={{
        border: "1px solid var(--border)",
        background: "var(--surface-2)",
        padding: "8px 6px",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 10, color: "var(--text-muted)" }}>{m.label}</div>
      <div style={{ fontSize: 15, fontWeight: 700, color: chgColor }}>
        {m.chgPct != null ? `${m.chgPct >= 0 ? "+" : ""}${m.chgPct.toFixed(2)}%` : "—"}
      </div>
      <div style={{ fontSize: 9.5, color: subColor }}>{sub}</div>
    </div>
  );
}

export function ExposureCard({
  regime,
  regimeStatus,
  exposure,
  ftd,
  marketMetrics,
}: {
  regime: Regime;
  regimeStatus: RegimeStatus;
  exposure: Exposure | null | undefined;
  ftd?: Ftd | null;
  marketMetrics?: MarketMetric[] | null;
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
      {ftd && ftd.valid != null && (
        <div style={{ fontSize: 12, marginTop: 6, color: "var(--text-secondary)" }}>
          FTD{" "}
          {ftd.valid ? (
            <b style={{ color: "var(--good)" }}>
              {ftd.daysAgo}거래일 전 · 유효
            </b>
          ) : (
            <b>없음</b>
          )}{" "}
          <span style={{ color: "var(--text-muted)" }}>(레짐 판정엔 미반영 — 표시 전용)</span>
        </div>
      )}
      {marketMetrics && marketMetrics.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(78px, 1fr))",
            gap: 6,
            marginTop: 12,
          }}
        >
          {marketMetrics.map((m) => (
            <MetricCard key={m.label} m={m} />
          ))}
        </div>
      )}
    </div>
  );
}
