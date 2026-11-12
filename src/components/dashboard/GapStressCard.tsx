import { Card } from "./Card";
import type { GapStress } from "@/lib/types";

// 2026-11-12: 보유 종목 동시 갭 하락 시 NAV 손실(표시 전용, 매매 규칙 무관). 계산은 tf_project
// export_public.gap_stress().
function Pct({ v }: { v: number }) {
  return (
    <td className={`tabular ${v < 0 ? "delta-critical" : "ink-muted"}`} style={{ textAlign: "right" }}>
      {v > 0 ? "+" : ""}{v.toFixed(1)}%
    </td>
  );
}

export function GapStressCard({ data }: { data?: GapStress | null }) {
  if (!data || data.accounts.length === 0) return null;
  const gapCols = data.accounts[0].gaps.map((g) => g.gapPct);
  return (
    <Card title="갭 하락 스트레스">
      <div className="label-sm ink-muted" style={{ marginBottom: 8 }}>
        보유 종목이 같은 날 동시에 갭 하락하면 NAV가 얼마나 빠지나 — 갭은 손절선을 건너뛰어 체결된다
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>계좌</th>
              <th style={{ textAlign: "right" }}>주식 비중</th>
              {gapCols.map((g) => (
                <th key={g} style={{ textAlign: "right" }}>−{g}% 갭</th>
              ))}
              <th style={{ textAlign: "right" }}>전 종목 손절 시</th>
              <th>최대 업종 비중</th>
            </tr>
          </thead>
          <tbody>
            {data.accounts.map((a) => (
              <tr key={a.key}>
                <td><b>{a.label}</b></td>
                <td className="tabular" style={{ textAlign: "right" }}>{a.investedPct.toFixed(0)}%</td>
                {a.gaps.map((g) => <Pct key={g.gapPct} v={g.navImpactPct} />)}
                <Pct v={a.stopImpactPct} />
                <td className={`label-sm ${a.topIndustry && a.topIndustry.tickers.length >= 2 ? "delta-critical" : "ink-secondary"}`}>
                  {a.topIndustry ? `${a.topIndustry.industry} ${a.topIndustry.weightPct.toFixed(0)}% (${a.topIndustry.tickers.join(", ")})` : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.overlap.length > 0 && (
        <div className="label-sm delta-critical" style={{ marginTop: 8 }}>
          계좌 간 중복 보유: {data.overlap.map((o) => `${o.ticker}(${o.accounts.join("·")})`).join(", ")}
        </div>
      )}
    </Card>
  );
}
