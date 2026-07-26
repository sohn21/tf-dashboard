import { Card } from "./Card";
import type { SectorRow, IndexRsRow } from "@/lib/types";

export function SectorBreakdownTable({ rows, indexRs }: { rows: SectorRow[]; indexRs: IndexRsRow[] }) {
  const hasData = rows.length > 0 || indexRs.length > 0;
  return (
    <Card title="업종/테마별 집계 (평균RS 기준, 종목수 2개 이상)">
      {!hasData ? (
        <p className="ink-muted">집계할 업종 데이터 없음</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>섹터</th>
                <th>업종</th>
                <th>종목수</th>
                <th>평균RS</th>
                <th>평균점수</th>
                <th>테마주도</th>
                <th>게이트통과</th>
              </tr>
            </thead>
            <tbody>
              {indexRs.map((r) => (
                <tr key={r.label}>
                  <td className="ink-secondary">지수</td>
                  <td className="ink-primary">{r.label}</td>
                  <td className="tabular ink-secondary">-</td>
                  <td className="tabular ink-primary">{r.rs.toFixed(1)}</td>
                  <td className="tabular ink-secondary">-</td>
                  <td className="gate-cell">-</td>
                  <td className="tabular ink-secondary">-</td>
                </tr>
              ))}
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="ink-secondary">{r.sector}</td>
                  <td className="ink-primary">{r.industry}</td>
                  <td className="tabular ink-secondary">{r.count}</td>
                  <td className="tabular ink-primary">{r.avgRs.toFixed(1)}</td>
                  <td className="tabular ink-secondary">{r.avgScore.toFixed(1)}</td>
                  <td className={`gate-cell ${r.leading ? "gate-pass" : "gate-fail"}`}>{r.leading ? "✓" : "✗"}</td>
                  <td className="tabular ink-secondary">{r.passed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
