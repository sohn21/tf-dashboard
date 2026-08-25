import { Card } from "./Card";
import type { RsLeadingRow } from "@/lib/types";

export function RsLeadingTable({ rows }: { rows: RsLeadingRow[] }) {
  return (
    <Card title="RS Leading — RS라인 선행 신호">
      <p className="ink-muted" style={{ marginBottom: 12 }}>
        RS Line이 252일 신고가를 갱신했지만 주가는 아직 52주 신고가 전(前) — 위 표에는 안 잡히는 조기 후보군
      </p>
      {rows.length === 0 ? (
        <p className="ink-muted">오늘 RS Leading 종목 없음</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>티커</th>
                <th>섹터</th>
                <th>업종</th>
                <th>종가</th>
                <th>RS</th>
                <th>MTR</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const mtrCls = r.mtrState != null && [3, 7].includes(r.mtrState) ? "delta-good" : "ink-secondary";
                return (
                  <tr key={r.ticker}>
                    <td className="ink-primary">{r.ticker}</td>
                    <td className="ink-secondary">{r.sector}</td>
                    <td className="ink-secondary">{r.industry}</td>
                    <td className="tabular ink-secondary">{r.close.toFixed(2)}</td>
                    <td className="tabular ink-primary">{r.rsRating.toFixed(1)}</td>
                    <td className={`tabular ${mtrCls}`}>{r.mtrState ?? "-"}</td>
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
