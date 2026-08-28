import { Card } from "./Card";
import type { MomentumJt } from "@/lib/types";

const money = (x: number) => (x >= 1e6 ? `$${(x / 1e6).toFixed(1)}M` : `$${Math.round(x).toLocaleString()}`);

const SERIES: { key: string; label: string; color: string; dash?: boolean }[] = [
  { key: "iwb", label: "전체(IWB)", color: "var(--series-1, #2a78d6)" },
  { key: "sp500", label: "S&P500", color: "var(--good, #0f9d58)" },
  { key: "nasdaq100", label: "NASDAQ100", color: "var(--cat-6, #c07a3e)" },
  { key: "spy", label: "SPY 벤치", color: "var(--text-muted, #888)", dash: true },
  { key: "qqq", label: "QQQ 벤치", color: "var(--text-secondary, #aaa)", dash: true },
];

function EquityChart({ curve }: { curve: Array<Record<string, number | string>> }) {
  if (!curve || curve.length < 2) return null;
  const w = 640, h = 200, padL = 44, padR = 10, padT = 10, padB = 22;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const n = curve.length;
  const vals: number[] = [];
  for (const p of curve) for (const s of SERIES) if (typeof p[s.key] === "number") vals.push(p[s.key] as number);
  const lo = Math.log10(Math.max(1, Math.min(...vals)));
  const hi = Math.log10(Math.max(...vals));
  const x = (i: number) => padL + (plotW * i) / (n - 1);
  const y = (v: number) => padT + plotH * (1 - (Math.log10(Math.max(1, v)) - lo) / (hi - lo || 1));
  const ticks = [1e4, 1e5, 1e6, 1e7].filter((t) => Math.log10(t) >= lo - 0.3 && Math.log10(t) <= hi + 0.3);
  return (
    <div style={{ overflowX: "auto" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} style={{ maxWidth: "100%", height: "auto", display: "block" }}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={padL} y1={y(t)} x2={w - padR} y2={y(t)} stroke="var(--border)" strokeWidth={1} />
            <text x={padL - 6} y={y(t) + 3} textAnchor="end" fontSize={9} fill="var(--text-muted)">
              {money(t)}
            </text>
          </g>
        ))}
        {[0, Math.floor(n / 2), n - 1].map((i) => (
          <text key={i} x={x(i)} y={h - 6} textAnchor="middle" fontSize={9} fill="var(--text-muted)">
            {String(curve[i].date).slice(0, 4)}
          </text>
        ))}
        {SERIES.map((s) => {
          const pts = curve
            .map((p, i) => (typeof p[s.key] === "number" ? `${x(i).toFixed(1)},${y(p[s.key] as number).toFixed(1)}` : null))
            .filter(Boolean)
            .join(" L ");
          return (
            <path
              key={s.key}
              d={`M ${pts}`}
              fill="none"
              stroke={s.color}
              strokeWidth={s.dash ? 1.3 : 2}
              strokeDasharray={s.dash ? "4 3" : undefined}
            />
          );
        })}
      </svg>
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 4 }}>
        {SERIES.map((s) => (
          <span key={s.key} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--text-secondary)" }}>
            <span style={{ width: 14, height: 2, background: s.color, display: "inline-block" }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MomentumJtCard({ data }: { data: MomentumJt | null | undefined }) {
  if (!data) {
    return (
      <Card title="momentum_jt (Jegadeesh & Titman)">
        <p className="ink-muted">아직 데이터 없음 — research/momentum_jt/backtest.py 실행 필요</p>
      </Card>
    );
  }
  const { seed, period: pr } = data;
  return (
    <Card title="momentum_jt (Jegadeesh & Titman)">
      <p className="ink-muted" style={{ marginTop: -4, marginBottom: 12, lineHeight: 1.6, fontSize: 12.5 }}>
        <b style={{ color: "var(--text-primary)" }}>Jegadeesh &amp; Titman (1993)</b> 모멘텀 재현 백테스트. 최근{" "}
        <b style={{ color: "var(--text-primary)" }}>6개월 수익률 상위 10종목</b> 동일가중 매수,{" "}
        <b style={{ color: "var(--text-primary)" }}>매달</b> 새 상위 종목으로 교체한다 (롱온리 · 편도 {data.costBpsOneWay}bp). 세
        유니버스(S&amp;P500 / NASDAQ100 / 전체 IWB) 각각 시드{" "}
        <b style={{ color: "var(--text-primary)" }}>${seed.toLocaleString()}</b>. {pr.start}~{pr.end} · {pr.months}개월 · 라이브 계좌 아님(과거 시뮬레이션).
      </p>

      <EquityChart curve={data.equityCurveYearly} />

      <div className="table-scroll" style={{ marginTop: 12 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>포트폴리오</th>
              <th>시드</th>
              <th>최종</th>
              <th>CAGR</th>
              <th>MDD</th>
              <th>Sharpe</th>
              <th>같은풀EW CAGR</th>
            </tr>
          </thead>
          <tbody>
            {data.portfolios.map((p) => {
              const cls = p.cagrPct >= 0 ? "delta-good" : "delta-critical";
              return (
                <tr key={p.key}>
                  <td className="ink-primary">{p.label}</td>
                  <td className="tabular ink-secondary">${seed.toLocaleString()}</td>
                  <td className={`tabular ${cls}`}>{money(p.endValue)}</td>
                  <td className={`tabular ${cls}`}>{p.cagrPct.toFixed(1)}%</td>
                  <td className="tabular delta-critical">{p.mddPct.toFixed(0)}%</td>
                  <td className="tabular ink-secondary">{p.sharpe.toFixed(2)}</td>
                  <td className="tabular ink-secondary">{p.poolEwCagrPct.toFixed(1)}%</td>
                </tr>
              );
            })}
            {data.benchmarks.map((b) => (
              <tr key={b.key}>
                <td className="ink-secondary">
                  {b.label} <span style={{ fontSize: 11, color: "var(--text-muted)" }}>벤치</span>
                </td>
                <td className="tabular ink-secondary">${seed.toLocaleString()}</td>
                <td className="tabular ink-secondary">{money(b.endValue)}</td>
                <td className="tabular ink-secondary">{b.cagrPct.toFixed(1)}%</td>
                <td className="tabular ink-secondary">{b.mddPct.toFixed(0)}%</td>
                <td className="tabular ink-secondary">—</td>
                <td className="tabular ink-secondary">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 8 }}>
        {data.portfolios.map((p) => (
          <div key={p.key} style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 3 }}>
            <b style={{ color: "var(--text-primary)" }}>{p.label}</b> 최근 픽 ({p.lastRebalance}):{" "}
            <span className="ink-secondary">{p.lastPicks.join(" · ")}</span>
          </div>
        ))}
      </div>

      <div
        style={{
          fontSize: 11,
          color: "var(--text-muted)",
          marginTop: 10,
          paddingTop: 8,
          borderTop: "1px solid var(--border)",
          lineHeight: 1.55,
        }}
      >
        ⚠ 유니버스가 <b>현재 지수 구성 고정</b>이라 상장폐지·탈락 종목이 빠져 절대수익이 크게 과대. &quot;같은 풀 동일가중(EW)
        buy&amp;hold 대비 초과분&quot;만 신뢰 — 그 기준으로도 모멘텀 top10이 20년 중 ~17년 우위(Sharpe도 S&amp;P 1.31 vs
        0.94). 10종목 집중이라 MDD -47~-59%.
      </div>
    </Card>
  );
}
