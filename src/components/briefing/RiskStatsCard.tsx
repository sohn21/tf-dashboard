import type { NavPoint } from "@/lib/types";

type Stats = {
  w1: number | null;
  m1: number | null;
  m3: number | null;
  inc: number | null;
  mdd: number;
  vol: number | null;
  sharpe: number | null;
};

function seriesStats(vals: (number | null | undefined)[]): Stats | null {
  const p = vals.filter((v): v is number => v != null);
  if (p.length < 2) return null;
  const rets: number[] = [];
  for (let i = 1; i < p.length; i++) rets.push(p[i] / p[i - 1] - 1);
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const varr = rets.reduce((a, b) => a + (b - mean) ** 2, 0) / (rets.length - 1 || 1);
  const std = Math.sqrt(varr);
  const pr = (bd: number) => (p.length > bd ? (p[p.length - 1] / p[p.length - 1 - bd] - 1) * 100 : null);
  let peak = p[0];
  let mdd = 0;
  for (const v of p) {
    peak = Math.max(peak, v);
    mdd = Math.min(mdd, (v / peak - 1) * 100);
  }
  return {
    w1: pr(5),
    m1: pr(21),
    m3: pr(63),
    inc: (p[p.length - 1] / p[0] - 1) * 100,
    mdd,
    vol: std ? std * Math.sqrt(252) * 100 : null,
    sharpe: std ? (mean / std) * Math.sqrt(252) : null,
  };
}

function Cell({ v, pct = true, color = false }: { v: number | null; pct?: boolean; color?: boolean }) {
  if (v == null) return <td className="tabular ink-muted">—</td>;
  const s = pct ? `${v >= 0 ? "+" : ""}${v.toFixed(1)}%` : v.toFixed(2);
  return (
    <td className="tabular" style={color ? { color: v >= 0 ? "var(--good)" : "var(--critical)" } : undefined}>
      {s}
    </td>
  );
}

function Row({ label, st }: { label: string; st: Stats | null }) {
  if (!st)
    return (
      <tr>
        <td className="ink-primary">{label}</td>
        {Array.from({ length: 7 }).map((_, i) => (
          <td key={i} className="ink-muted">
            —
          </td>
        ))}
      </tr>
    );
  return (
    <tr>
      <td className="ink-primary">{label}</td>
      <Cell v={st.w1} color />
      <Cell v={st.m1} color />
      <Cell v={st.m3} color />
      <Cell v={st.inc} color />
      <Cell v={st.mdd} />
      <Cell v={st.vol} />
      <Cell v={st.sharpe} pct={false} />
    </tr>
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

  const navSt = seriesStats(navHistory.map((p) => p.nav));
  const spySt = seriesStats(navHistory.map((p) => p.spy));
  const qqqSt = seriesStats(navHistory.map((p) => p.qqq));
  const cashPct = nav ? (cash / nav) * 100 : null;

  return (
    <div className="blueprint" style={{ padding: "16px 18px" }}>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              <th></th>
              <th>1주</th>
              <th>1개월</th>
              <th>3개월</th>
              <th>시작이후</th>
              <th>MDD</th>
              <th>연변동성</th>
              <th>Sharpe</th>
            </tr>
          </thead>
          <tbody>
            <Row label="전략실 NAV" st={navSt} />
            <Row label="SPY" st={spySt} />
            <Row label="QQQ" st={qqqSt} />
          </tbody>
        </table>
      </div>
      {cashPct != null && (
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 8 }}>
          현금비중 <b>{cashPct.toFixed(0)}%</b>
        </div>
      )}
    </div>
  );
}
