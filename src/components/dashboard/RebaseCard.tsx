import { Card } from "./Card";
import type { Rebase } from "@/lib/types";

// 2026-11-13 A-1: 개설일이 다른 계좌를 09-01 같은 출발선에서 비교(표시 전용). 계산은 tf_project
// export_public.rebase_since(). NAV·거래 기록·청산 카운트는 그대로.
function Pct({ v, bold }: { v: number | null; bold?: boolean }) {
  if (v === null || v === undefined) {
    return <td className="tabular ink-muted" style={{ textAlign: "right" }}>—</td>;
  }
  const cls = v > 0 ? "delta-good" : v < 0 ? "delta-critical" : "ink-muted";
  return (
    <td className={`tabular ${cls}`} style={{ textAlign: "right", fontWeight: bold ? 700 : undefined }}>
      {v > 0 ? "+" : ""}{v.toFixed(1)}%
    </td>
  );
}

export function RebaseCard({ data }: { data?: Rebase | null }) {
  if (!data || data.accounts.length === 0) return null;
  return (
    <Card title={`09-01 공통 기준 성과 (${data.baseDate} → ${data.endDate})`}>
      <div className="label-sm ink-muted" style={{ marginBottom: 8 }}>
        개설일이 다른 계좌를 같은 출발선에서 비교 — 표시만 다시 잼, 거래 기록·청산 카운트는 그대로
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>계좌</th>
              <th style={{ textAlign: "right" }}>09-01 NAV</th>
              <th style={{ textAlign: "right" }}>현재 NAV</th>
              <th style={{ textAlign: "right" }}>09-01 이후</th>
              <th style={{ textAlign: "right" }}>MDD</th>
              <th style={{ textAlign: "right" }}>vs SPY</th>
              <th style={{ textAlign: "right" }}>누적(개설일~)</th>
            </tr>
          </thead>
          <tbody>
            {data.accounts.map((a) => (
              <tr key={a.key}>
                <td>
                  <b>{a.label}</b> <span className="label-sm ink-muted">{a.startDate}~</span>
                </td>
                <td className="tabular" style={{ textAlign: "right" }}>${Math.round(a.baseNav).toLocaleString()}</td>
                <td className="tabular" style={{ textAlign: "right" }}>${Math.round(a.nav).toLocaleString()}</td>
                <Pct v={a.retSince} bold />
                <Pct v={a.mddSince} />
                <Pct v={a.vsSpy} />
                <Pct v={a.retInception} />
              </tr>
            ))}
            <tr style={{ borderTop: "2px solid var(--color-neutral-300, #ccc)" }}>
              <td className="ink-secondary">SPY</td>
              <td /><td />
              <Pct v={data.spy} />
              <td /><td /><td />
            </tr>
            <tr>
              <td className="ink-secondary">QQQ</td>
              <td /><td />
              <Pct v={data.qqq} />
              <td /><td /><td />
            </tr>
          </tbody>
        </table>
      </div>
      <div className="label-sm ink-muted" style={{ marginTop: 8 }}>
        momentum_jt는 09-01 개설이라 두 값이 같고, NAV가 월 리밸 시점만 있어 MDD 없음.
      </div>
    </Card>
  );
}
