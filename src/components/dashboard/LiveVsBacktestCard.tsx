import { Card } from "./Card";
import type { LiveVsBacktest, LvbSide, LvbTrade } from "@/lib/types";

// 2026-11-13: 라이브 ↔ 백테스트 일치도(월간, 관찰 전용). 계산은 tf_project paper_trader/live_vs_backtest.py.
// 매달 각 계좌 개설일부터 같은 설정으로 백테스트를 다시 돌려 NAV·거래를 1:1로 대조한다.
const KIND: Record<LvbTrade["kind"], [string, string]> = {
  match_exact: ["정확 일치", "delta-good"],
  match_diff: ["같은 종목·결과 다름", "delta-warning"],
  live_only: ["라이브만", "delta-critical"],
  bt_only: ["백테스트만", "ink-muted"],
};

function Pct({ v }: { v: number | null | undefined }) {
  if (v === null || v === undefined) return <span className="ink-muted">—</span>;
  const cls = v > 0 ? "delta-good" : v < 0 ? "delta-critical" : "";
  return <span className={cls}>{v > 0 ? "+" : ""}{v.toFixed(2)}%</span>;
}

function Spark({ series }: { series: { d: string; live: number; bt: number }[] }) {
  if (series.length < 2) return null;
  const w = 300, h = 90;
  const vals = series.flatMap((r) => [r.live, r.bt]).concat(0);
  const lo = Math.min(...vals), hi = Math.max(...vals), rng = hi - lo || 1;
  const xy = (i: number, v: number) =>
    `${(6 + (i * (w - 12)) / (series.length - 1)).toFixed(1)},${(6 + ((hi - v) / rng) * (h - 12)).toFixed(1)}`;
  const zy = 6 + (hi / rng) * (h - 12);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: w, display: "block" }} role="img" aria-label="라이브 대 백테스트 누적수익률">
      <line x1={6} x2={w - 6} y1={zy} y2={zy} stroke="var(--color-neutral-300)" strokeDasharray="3 3" />
      <polyline points={series.map((r, i) => xy(i, r.bt)).join(" ")} fill="none" stroke="#8a8f98" strokeWidth={1.6} strokeDasharray="4 3" />
      <polyline points={series.map((r, i) => xy(i, r.live)).join(" ")} fill="none" stroke="#2f7fc1" strokeWidth={2} />
    </svg>
  );
}

function Side({ x }: { x: LvbSide | null }) {
  if (!x) return <td colSpan={2} className="ink-muted" style={{ textAlign: "center" }}>—</td>;
  const ex = x.open ? "보유중" : `${(x.exit_date ?? "").slice(5)} ${x.reason}`;
  return (
    <>
      <td className="tabular label-sm">{x.entry_date.slice(5)} ${x.entry_px.toLocaleString(undefined, { minimumFractionDigits: 2 })} → {ex}</td>
      <td className="tabular" style={{ textAlign: "right" }}><Pct v={x.pnl_pct} /></td>
    </>
  );
}

export function LiveVsBacktestCard({ data }: { data?: LiveVsBacktest | null }) {
  if (!data || !data.accounts) return null;
  const accts = Object.entries(data.accounts);
  return (
    <Card title={`라이브 ↔ 백테스트 일치도 — 월간 (실행 ${data.runDate})`}>
      <div className="label-sm ink-muted" style={{ marginBottom: 8 }}>
        각 계좌 개설일부터 라이브와 같은 설정·같은 종가로 백테스트를 다시 돌려 NAV와 거래를 1:1로 대조 · 관찰 전용
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>계좌 · 기간</th>
              <th style={{ textAlign: "right" }}>라이브</th>
              <th style={{ textAlign: "right" }}>백테스트</th>
              <th style={{ textAlign: "right" }}>차이</th>
              <th style={{ textAlign: "right" }}>MDD 라이브/백테</th>
              <th style={{ textAlign: "right" }}>일간 상관</th>
              <th style={{ textAlign: "right" }}>정확/다름/라이브만/백테만</th>
              <th style={{ textAlign: "right" }}>일치율</th>
            </tr>
          </thead>
          <tbody>
            {accts.map(([k, a]) => (
              <tr key={k}>
                <td>
                  <b>{a.label}</b>{" "}
                  <span className="label-sm ink-muted">
                    {(a.nav.startDate ?? "").slice(5)}~{(a.nav.endDate ?? "").slice(5)} · {a.nav.nDays}일
                  </span>
                </td>
                <td className="tabular" style={{ textAlign: "right" }}><Pct v={a.nav.liveRet} /></td>
                <td className="tabular" style={{ textAlign: "right" }}><Pct v={a.nav.btRet} /></td>
                <td className="tabular" style={{ textAlign: "right" }}>{a.nav.gap > 0 ? "+" : ""}{a.nav.gap.toFixed(2)}%p</td>
                <td className="tabular" style={{ textAlign: "right" }}>{a.nav.liveMdd.toFixed(1)}% / {a.nav.btMdd.toFixed(1)}%</td>
                <td className="tabular" style={{ textAlign: "right" }}>{a.nav.dailyCorr === null ? "—" : a.nav.dailyCorr.toFixed(2)}</td>
                <td className="tabular" style={{ textAlign: "right" }}>
                  <span className="delta-good">{a.counts.matchExact}</span> / <span className="delta-warning">{a.counts.matchDiff}</span> /{" "}
                  <span className="delta-critical">{a.counts.liveOnly}</span> / {a.counts.btOnly}
                </td>
                <td className="tabular" style={{ textAlign: "right" }}><b>{a.matchRate === null ? "—" : `${a.matchRate.toFixed(0)}%`}</b></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 12 }}>
        {accts.map(([k, a]) => (
          <div key={k} style={{ flex: "1 1 300px", minWidth: 0 }}>
            <div className="label-sm" style={{ marginBottom: 4 }}>
              <b>{a.label}</b> <span style={{ color: "#2f7fc1" }}>━ 라이브 {a.nav.liveRet.toFixed(1)}%</span>{" "}
              <span style={{ color: "#8a8f98" }}>┅ 백테스트 {a.nav.btRet.toFixed(1)}%</span>
            </div>
            <Spark series={a.nav.series} />
            <details style={{ marginTop: 6 }}>
              <summary className="label-sm" style={{ cursor: "pointer" }}>거래 대조 {a.trades.length}건</summary>
              <div style={{ overflowX: "auto" }}>
                <table className="data-table" style={{ marginTop: 6 }}>
                  <thead>
                    <tr>
                      <th>종목</th><th>판정</th><th>라이브 (진입 → 청산)</th><th style={{ textAlign: "right" }}>손익</th>
                      <th>백테스트 (진입 → 청산)</th><th style={{ textAlign: "right" }}>손익</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...a.trades].reverse().map((t, i) => (
                      <tr key={`${t.ticker}-${i}`}>
                        <td><b>{t.ticker}</b></td>
                        <td className={`label-sm ${KIND[t.kind][1]}`}>{KIND[t.kind][0]}{t.manual ? " (수동)" : ""}</td>
                        <Side x={t.live} />
                        <Side x={t.bt} />
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          </div>
        ))}
      </div>
      <div className="label-sm ink-muted" style={{ marginTop: 10, lineHeight: 1.7 }}>
        일치율 = 수동 조치(캡 축소·합병)를 뺀 거래 중 같은 종목을 진입일 ±2거래일 안에 산 비율. 라이브 날짜(KST 실행일)는 직전 미국 종가일로 바꿔 비교.
        차이는 대개 시작 시점 슬롯 상태, 중간에 바뀐 설정, 실적일 캐시 차이에서 생김.
      </div>
    </Card>
  );
}
