import type { StockEasyCrossCheck } from "@/lib/types";

// 교차검증 — StockEasy 미국 스크리너 후보가 전략실(코어) 픽과 겹치는지. /briefing 05번(전략실
// 게이트 상위종목) 바로 아래. 겹치면 어떻게 겹치는지, 안 겹치면 "없음"을 명시.
const STATUS_COLOR: Record<string, string> = {
  passed: "var(--good)",
  held: "var(--good)",
  failed: "var(--warn, #b58900)",
  untracked: "var(--text-muted)",
  none: "var(--text-muted)",
};

export function StockEasyCrossCheckCard({ data }: { data: StockEasyCrossCheck | null | undefined }) {
  if (!data) {
    return (
      <div className="blueprint" style={{ padding: 16 }}>
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <p className="ink-muted">교차검증 데이터 없음 (compare-us-*.json)</p>
      </div>
    );
  }

  const nOverlap = data.overlapTickers.length;

  return (
    <div className="blueprint" style={{ padding: "16px 18px" }}>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 8 }}>
        {nOverlap > 0 ? (
          <b style={{ color: "var(--good)" }}>
            오늘 겹치는 종목 {nOverlap}개 — {data.overlapTickers.join(", ")}
          </b>
        ) : (
          <b style={{ color: "var(--warn, #b58900)" }}>오늘 전략실 픽과 겹치는 StockEasy 미국 후보: 없음</b>
        )}
        <br />
        StockEasy {data.stockeasyDate ?? "?"} · 전략실 {data.tfDate ?? "?"} 기준
      </div>

      {data.rows.length === 0 ? (
        <p className="ink-muted">오늘 StockEasy 미국 후보 없음</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>티커</th>
              <th>종목</th>
              <th>업종</th>
              <th>StockEasy RS</th>
              <th>전략실 상태</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.ticker}>
                <td className="ink-primary">{r.ticker}</td>
                <td className="ink-secondary">{r.name}</td>
                <td className="ink-secondary">{r.sector}</td>
                <td className="tabular ink-secondary">{r.rs ?? "—"}</td>
                <td style={{ color: STATUS_COLOR[r.status.kind] ?? "var(--text-muted)" }}>
                  {r.status.kind === "passed" || r.status.kind === "held" ? "◆ " : ""}
                  {r.status.label}
                  {r.status.detail && <span className="ink-muted"> ({r.status.detail})</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
