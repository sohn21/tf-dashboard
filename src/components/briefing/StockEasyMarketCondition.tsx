import type { StockEasyMarketCondition as MC } from "@/lib/types";

// StockEasy 시장 여건 표 — 시장별 상태·권장 노출·분산일·Rally Day·마지막 FTD·신규 진입 판정
// + 그날 막힌 후보. KR(StockEasyCard)·US(StockEasyUsCard) 공용. 2026-11-11.
export function StockEasyMarketCondition({ mc }: { mc: MC | null | undefined }) {
  if (!mc) return null;
  return (
    <>
      <div style={{ fontSize: 12, color: "var(--text-muted)", margin: "10px 0 6px" }}>
        시장 여건 <span className="ink-muted">(기준 {mc.date ?? "—"})</span>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>시장</th>
            <th>상태</th>
            <th>권장 노출</th>
            <th>분산일</th>
            <th>Rally Day</th>
            <th>마지막 FTD</th>
            <th>신규 진입</th>
          </tr>
        </thead>
        <tbody>
          {mc.markets.map((m) =>
            m.missing ? (
              <tr key={m.key}>
                <td className="ink-primary">{m.name}</td>
                <td colSpan={5} className="ink-muted">
                  조회 실패
                </td>
                <td style={{ color: "var(--critical)" }}>
                  <b>차단</b>
                </td>
              </tr>
            ) : (
              <tr key={m.key}>
                <td className="ink-primary">{m.name}</td>
                <td className="ink-secondary">{m.status ?? "—"}</td>
                <td className="tabular ink-primary">
                  <b>{m.exposureRaw ?? "—"}</b>
                </td>
                <td className="tabular ink-secondary">{m.distributionDays ?? "—"}</td>
                <td className="tabular ink-secondary">{m.rallyDay ?? "—"}</td>
                <td className="tabular ink-secondary">{m.lastFTD ?? "—"}</td>
                <td style={{ color: m.allow ? "var(--good)" : "var(--critical)" }}>
                  <b>{m.allow ? `허용 · 최대 ${m.maxPositions}종목` : "차단"}</b>
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
      {mc.blocked.length > 0 && (
        <div style={{ fontSize: 12, marginTop: 6 }}>
          막힌 후보 <span className="ink-muted">({mc.blockedDate ?? "—"})</span>:{" "}
          {mc.blocked.map((b, i) => (
            <span key={i}>
              {i > 0 && ", "}
              {b.name}
              <span className="ink-muted"> ({b.reason})</span>
            </span>
          ))}
        </div>
      )}
    </>
  );
}
