import { Card } from "./Card";
import type { TradeRow } from "@/lib/types";

export function RecentTradesTable({ rows }: { rows: TradeRow[] }) {
  return (
    <Card title="최근 청산 이력">
      {rows.length === 0 ? (
        <p className="ink-muted">청산 이력 없음</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>티커</th>
                <th>진입일</th>
                <th>청산일</th>
                <th>진입가</th>
                <th>청산가</th>
                <th>손익%</th>
                <th>사유</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="ink-primary">{r.ticker}</td>
                  <td className="ink-secondary">{r.entryDate}</td>
                  <td className="ink-secondary">{r.exitDate}</td>
                  <td className="tabular ink-secondary">{r.entryPx.toFixed(2)}</td>
                  <td className="tabular ink-secondary">{r.exitPx.toFixed(2)}</td>
                  <td className={`tabular ${r.pnlPct >= 0 ? "delta-good" : "delta-critical"}`}>
                    {r.pnlPct >= 0 ? "+" : ""}
                    {r.pnlPct.toFixed(1)}%
                  </td>
                  <td className="ink-secondary">{r.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
