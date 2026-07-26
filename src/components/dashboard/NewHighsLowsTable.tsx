import { Card } from "./Card";
import type { NewHighLowRow } from "@/lib/types";

export function NewHighsLowsTable({ rows }: { rows: NewHighLowRow[] }) {
  return (
    <Card title="오늘 52주 신고가/신저가 종목 (섹터별)">
      {rows.length === 0 ? (
        <p className="ink-muted">오늘 52주 신고가/신저가 종목 없음</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>구분</th>
                <th>티커</th>
                <th>섹터</th>
                <th>업종</th>
                <th>종가</th>
                <th>RS</th>
                <th>200MA 이격</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const overheated = (r.extensionPct200sma ?? 0) >= 70;
                return (
                  <tr key={i}>
                    <td className={r.kind === "신고가" ? "delta-good" : "delta-critical"}>{r.kind}</td>
                    <td className="ink-primary">{r.ticker}</td>
                    <td className="ink-secondary">{r.sector}</td>
                    <td className="ink-secondary">{r.industry}</td>
                    <td className="tabular ink-secondary">{r.close.toFixed(2)}</td>
                    <td className="tabular ink-primary">{r.rsRating.toFixed(1)}</td>
                    <td className={`tabular ${overheated ? "delta-critical" : "ink-secondary"}`}>
                      {r.extensionPct200sma != null ? `${r.extensionPct200sma >= 0 ? "+" : ""}${r.extensionPct200sma.toFixed(0)}%` : "-"}
                      {overheated ? " ⚠과열" : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
