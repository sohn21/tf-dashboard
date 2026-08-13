import { Card } from "./Card";
import { GATE_KEYS, type CandidateRow } from "@/lib/types";

const fmtCap = (x: number | null) => (x == null ? "-" : `$${(x / 1e9).toLocaleString(undefined, { maximumFractionDigits: 1 })}B`);
const fmtRatio = (x: number | null) => (x == null ? "-" : x.toFixed(1));
// yfinance가 이미 %단위 숫자로 주는 필드(dividendYield/debtToEquity)는 export_public.py에서
// 그대로 넘어옴 — 분수로 착각해 재곱하면 안 됨(예전에 대시보드에서 105%로 잘못 표시된 버그와 같은 함정)
const fmtPctAlready = (x: number | null, decimals = 2) => (x == null ? "-" : `${x.toFixed(decimals)}%`);

function OverviewCards({ rows }: { rows: CandidateRow[] }) {
  const withOverview = rows.filter((r) => r.overview);
  if (withOverview.length === 0) return null;
  return (
    <>
      <div className="ink-secondary label-sm" style={{ margin: "18px 0 8px" }}>
        기업개요 & 재무 요약 (매수 전 참고자료 — display-only, 게이트/스코어 미반영)
      </div>
      <div className="ticker-details">
        {withOverview.map((r) => {
          const ov = r.overview!;
          const stats: [string, string][] = [
            ["PER (실적)", fmtRatio(ov.trailingPE)],
            ["PER (예상)", fmtRatio(ov.forwardPE)],
            ["부채/자본", fmtPctAlready(ov.debtToEquityPct, 0)],
            ["배당수익률", fmtPctAlready(ov.dividendYieldPct)],
            ["연매출", fmtCap(ov.totalRevenue)],
            ["매출총이익률", fmtPctAlready(ov.grossMarginsPct)],
            ["잉여현금흐름", fmtCap(ov.freeCashflow)],
            ["Comp Rating", fmtRatio(ov.compRating)],
          ];
          return (
            <details key={r.ticker}>
              <summary>
                <span className="caret">▶</span>
                <strong className="ink-primary">{r.ticker}</strong>
                <span className="ink-muted">
                  — {r.sector} · {r.industry}
                </span>
              </summary>
              <div style={{ padding: "10px 0 2px 18px" }}>
                {ov.businessSummary && (
                  <p className="ink-secondary" style={{ fontSize: 13, lineHeight: 1.6, margin: "0 0 10px" }}>
                    {ov.businessSummary}
                  </p>
                )}
                <div className="overview-stat-grid">
                  {stats.map(([label, value]) => (
                    <div className="overview-stat" key={label}>
                      <div className="overview-stat-label">{label}</div>
                      <div className="overview-stat-value tabular">{value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </>
  );
}

export function CandidatesTable({ rows, topN = 15 }: { rows: CandidateRow[]; topN?: number }) {
  const top = rows.slice(0, topN);
  return (
    <Card title={`오늘 후보 상위 ${Math.min(topN, rows.length)}종목 (점수 기준)`}>
      {top.length === 0 ? (
        <p className="ink-muted">신호 데이터 없음</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>티커</th>
                <th>섹터</th>
                <th>업종</th>
                <th>종가</th>
                <th>시총</th>
                <th>점수</th>
                <th>MTR</th>
                <th>A/D</th>
                <th>RVOL</th>
                <th>베이스</th>
                {GATE_KEYS.map((g) => (
                  <th key={g}>{g}</th>
                ))}
                <th>통과</th>
              </tr>
            </thead>
            <tbody>
              {top.map((r) => {
                const mtrCls = r.mtrState != null && [3, 7].includes(r.mtrState) ? "delta-good" : "ink-secondary";
                const adCls =
                  r.adRating && ["A", "B"].includes(r.adRating)
                    ? "delta-good"
                    : r.adRating && ["D", "E"].includes(r.adRating)
                      ? "delta-critical"
                      : "ink-secondary";
                const rvolCls = r.rvol != null && r.rvol >= 1.4 ? "delta-good" : r.rvol != null && r.rvol < 0.8 ? "delta-critical" : "ink-secondary";
                const baseCls =
                  r.baseLabel === "1st" || r.baseLabel === "2nd"
                    ? "delta-good"
                    : r.baseLabel === "4th+"
                      ? "delta-critical"
                      : "ink-secondary";
                return (
                  <tr key={r.ticker}>
                    <td className="ink-primary">
                      {r.ticker}
                      {r.newHigh52w && <span className="delta-good"> 🔺</span>}
                    </td>
                    <td className="ink-secondary">{r.sector}</td>
                    <td className="ink-secondary">{r.industry}</td>
                    <td className="tabular ink-secondary">{r.close.toFixed(2)}</td>
                    <td className="tabular ink-secondary">{fmtCap(r.marketCap)}</td>
                    <td className="tabular ink-primary">{r.score.toFixed(1)}</td>
                    <td className={`tabular ${mtrCls}`}>
                      {r.mtrState != null ? `${r.mtrState}${r.mtrAccelerating ? "++" : ""}` : "-"}
                    </td>
                    <td className={`tabular ${adCls}`}>{r.adRating ?? "-"}</td>
                    <td className={`tabular ${rvolCls}`}>{r.rvol != null ? `${r.rvol.toFixed(2)}x` : "-"}</td>
                    <td className={`tabular ${baseCls}`}>
                      {r.baseLabel ?? "-"}
                      {r.patternName ? ` ${r.patternName}` : ""}
                    </td>
                    {GATE_KEYS.map((g) => (
                      <td key={g} className={`gate-cell ${r.gates[g] ? "gate-pass" : "gate-fail"}`}>
                        {r.gates[g] ? "✓" : "✗"}
                      </td>
                    ))}
                    <td className={`gate-cell ${r.passed ? "gate-pass" : "gate-fail"}`}>{r.passed ? "✓" : "✗"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <OverviewCards rows={top} />
    </Card>
  );
}
