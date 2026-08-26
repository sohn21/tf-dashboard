import type { NavPoint } from "@/lib/types";

function fmtOptPct(v: number | null): string {
  return v === null ? "—" : `${v >= 0 ? "+" : ""}${v.toFixed(1)}%`;
}

function periodReturn(nav: NavPoint[], bdays: number): number | null {
  if (nav.length <= bdays) return null;
  const last = nav[nav.length - 1].nav;
  const prior = nav[nav.length - 1 - bdays].nav;
  return ((last / prior - 1) * 100);
}

function Stat({ label, val, color }: { label: string; val: string; color?: string }) {
  return (
    <div style={{ border: "1px solid var(--border)", borderRadius: 6, padding: "8px 12px", minWidth: 90 }}>
      <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{label}</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: color ?? "var(--text-primary)" }} className="tabular">
        {val}
      </div>
    </div>
  );
}

export function RiskStatsCard({ navHistory, cash, nav }: { navHistory: NavPoint[]; cash: number; nav: number }) {
  if (navHistory.length < 2) {
    return (
      <div className="blueprint" style={{ padding: 16 }}>
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <p className="ink-muted">NAV 기록 부족</p>
      </div>
    );
  }

  const returns: number[] = [];
  for (let i = 1; i < navHistory.length; i++) {
    returns.push(navHistory[i].nav / navHistory[i - 1].nav - 1);
  }
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length - 1 || 1);
  const std = Math.sqrt(variance);
  const annVol = std ? std * Math.sqrt(252) * 100 : null;
  const sharpe = std ? (mean / std) * Math.sqrt(252) : null;

  const ret1w = periodReturn(navHistory, 5);
  const ret1m = periodReturn(navHistory, 21);
  const ret3m = periodReturn(navHistory, 63);
  const cashPct = nav ? (cash / nav) * 100 : null;

  return (
    <div className="blueprint" style={{ padding: "16px 18px" }}>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Stat label="1주 수익률" val={fmtOptPct(ret1w)} color={ret1w !== null ? (ret1w >= 0 ? "var(--good)" : "var(--critical)") : undefined} />
        <Stat label="1개월 수익률" val={fmtOptPct(ret1m)} color={ret1m !== null ? (ret1m >= 0 ? "var(--good)" : "var(--critical)") : undefined} />
        <Stat label="3개월 수익률" val={fmtOptPct(ret3m)} color={ret3m !== null ? (ret3m >= 0 ? "var(--good)" : "var(--critical)") : undefined} />
        <Stat label="연변동성" val={annVol !== null ? `${annVol.toFixed(1)}%` : "—"} />
        <Stat label="Sharpe" val={sharpe !== null ? sharpe.toFixed(2) : "—"} color={sharpe !== null && sharpe >= 1 ? "var(--good)" : undefined} />
        <Stat label="현금비중" val={cashPct !== null ? `${cashPct.toFixed(0)}%` : "—"} />
      </div>
    </div>
  );
}
