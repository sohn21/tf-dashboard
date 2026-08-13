import type { CompanyOverview } from "@/lib/types";

const fmtCap = (x: number | null) => (x == null ? "-" : `$${(x / 1e9).toLocaleString(undefined, { maximumFractionDigits: 1 })}B`);
const fmtRatio = (x: number | null) => (x == null ? "-" : x.toFixed(1));
// yfinance가 이미 %단위 숫자로 주는 필드(dividendYield/debtToEquity)는 export_public.py에서
// 그대로 넘어옴 — 분수로 착각해 재곱하면 안 됨(예전에 대시보드에서 105%로 잘못 표시된 버그와 같은 함정)
const fmtPctAlready = (x: number | null, decimals = 2) => (x == null ? "-" : `${x.toFixed(decimals)}%`);

export interface OverviewCardRow {
  ticker: string;
  sector?: string | null;
  industry?: string | null;
  overview?: CompanyOverview | null;
}

export function OverviewCards({ rows, title }: { rows: OverviewCardRow[]; title?: string }) {
  const withOverview = rows.filter((r) => r.overview);
  if (withOverview.length === 0) return null;
  return (
    <>
      <div className="ink-secondary label-sm" style={{ margin: "18px 0 8px" }}>
        {title ?? "기업개요 & 재무 요약 (display-only, 게이트/스코어 미반영)"}
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
          const meta = [r.sector, r.industry].filter(Boolean).join(" · ");
          return (
            <details key={r.ticker}>
              <summary>
                <span className="caret">▶</span>
                <strong className="ink-primary">{r.ticker}</strong>
                {meta && <span className="ink-muted">— {meta}</span>}
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
