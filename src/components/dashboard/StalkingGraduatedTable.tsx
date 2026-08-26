import { Card } from "./Card";
import type { StalkingGrade, StalkingGraduatedRow } from "@/lib/types";

const GRADE_CLASS: Record<StalkingGrade, string> = {
  S: "badge-good",
  A: "badge-good",
  B: "badge-warning",
  C: "badge-serious",
};

export function StalkingGraduatedTable({ rows }: { rows: StalkingGraduatedRow[] }) {
  return (
    <Card title="🎓 Stalking 졸업 (리더 등극)">
      <p className="ink-muted" style={{ marginBottom: 12 }}>
        Stalking 후보풀(RS 70~89)에 있던 종목이 RS Rating 90 이상으로 올라오면 표시(최근 30일) — 매수 신호 아님, 참고용
      </p>
      {rows.length === 0 ? (
        <p className="ink-muted">최근 30일 내 졸업 기록 없음</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>티커</th>
                <th>졸업일</th>
                <th>추적기간</th>
                <th>최고등급</th>
                <th>진입 RS</th>
                <th>졸업 RS</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.ticker}-${r.graduatedDate}`}>
                  <td className="ink-primary">🎓 {r.ticker}</td>
                  <td className="tabular ink-secondary">{r.graduatedDate}</td>
                  <td className="tabular ink-secondary">
                    {r.firstTrackedDate}~{r.lastTrackedDate} ({r.daysTracked}일)
                  </td>
                  <td>
                    <span className={`badge ${GRADE_CLASS[r.peakGrade]}`}>{r.peakGrade}</span>
                  </td>
                  <td className="tabular ink-secondary">{r.trackedRsEntry.toFixed(1)}</td>
                  <td className="tabular delta-good">{r.graduatedRs.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
