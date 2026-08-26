import { Card } from "./Card";
import type { StalkingGrade, StalkingRow } from "@/lib/types";

const GRADE_CLASS: Record<StalkingGrade, string> = {
  S: "badge-good",
  A: "badge-good",
  B: "badge-warning",
  C: "badge-serious",
};

export function StalkingTable({ rows }: { rows: StalkingRow[] }) {
  const counts = rows.reduce<Record<string, number>>((acc, r) => {
    acc[r.stalkingGrade] = (acc[r.stalkingGrade] ?? 0) + 1;
    return acc;
  }, {});
  const summary = (["S", "A", "B", "C"] as const)
    .filter((g) => counts[g])
    .map((g) => `${g} ${counts[g]}`)
    .join(" · ");

  return (
    <Card title="⑨ 다음 리더 추적 (Stalking)">
      <p className="ink-muted" style={{ marginBottom: 12 }}>
        G0-G4 게이트와 무관한 별도 사전추적 — RS 70~89(아직 리더 아님, 90+ 진입 직전) 구간에서 다음 리더가 될 잠재력을 채점
      </p>
      {rows.length === 0 ? (
        <p className="ink-muted">오늘 Stalking 후보 없음</p>
      ) : (
        <>
          <div className="label-sm ink-muted" style={{ marginBottom: 10 }}>
            총 {rows.length}개 후보 · {summary}
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>티커</th>
                  <th>섹터</th>
                  <th>업종</th>
                  <th>종가</th>
                  <th>등급</th>
                  <th>점수</th>
                  <th>RS</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.ticker}>
                    <td className="ink-primary">{r.ticker}</td>
                    <td className="ink-secondary">{r.sector}</td>
                    <td className="ink-secondary">{r.industry}</td>
                    <td className="tabular ink-secondary">{r.close.toFixed(2)}</td>
                    <td>
                      <span className={`badge ${GRADE_CLASS[r.stalkingGrade]}`}>{r.stalkingGrade}</span>
                    </td>
                    <td className="tabular ink-primary">{r.stalkingScore.toFixed(1)}</td>
                    <td className="tabular ink-secondary">{r.rsRating.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
