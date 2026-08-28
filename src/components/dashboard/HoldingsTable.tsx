import { Card } from "./Card";
import { OverviewCards } from "./OverviewCards";
import { Sparkline } from "./Sparkline";
import type { HoldingRow, HoldingsExitRow, HoldingStatusCat, HoldingsCounts } from "@/lib/types";

export const STATUS_BADGE: Record<HoldingStatusCat, { cls: string; label: string }> = {
  critical: { cls: "badge-critical", label: "손절임박" },
  review: { cls: "badge-warning", label: "검토" },
  protect: { cls: "badge-protect", label: "보호중" },
  normal: { cls: "badge-good", label: "순항" },
};

// 청산 사유(trade_log.reason) → 한글. paper_trader/portfolio._close_position() 이 내보내는 값 전체.
const EXIT_REASON_LABEL: Record<string, string> = {
  stop: "손절",
  lock_stop: "이익잠금 손절",
  sell_below_50ma: "50일선 이탈 매도",
  sell_rs_div: "RS 다이버전스 매도",
  earnings_trim: "실적 부분정리",
  climax_trim: "클라이맥스 트림",
  profit_trim: "이익 부분실현",
  base_count_trim: "베이스카운트 트림",
  oneill_max_hold: "8주룰 시간캡",
  max_hold: "시간캡(최대보유)",
  dust_cleanup: "더스트 정리",
  switch_out: "스위칭 교체",
  manual_position_cap_resize: "포지션 상한 리사이즈",
};

export function HoldingsTable({
  rows,
  counts,
  exits,
}: {
  rows: HoldingRow[];
  counts?: HoldingsCounts | null;
  exits?: HoldingsExitRow[] | null;
}) {
  const nNew = rows.filter((r) => r.isNewEntry).length;
  const exitRows = exits ?? [];
  return (
    <Card title={`현재 보유 종목 (${rows.length}종목)`}>
      {counts && (
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
          위험 <b style={{ color: "var(--critical)" }}>{counts.critical}</b> · 검토{" "}
          <b style={{ color: "var(--warning)" }}>{counts.review}</b> · 보호{" "}
          <b style={{ color: "var(--protect, #597ea3)" }}>{counts.protect}</b> · 순항{" "}
          <b style={{ color: "var(--good)" }}>{counts.normal}</b>
          {nNew > 0 && (
            <>
              {" "}
              · 신규편입 <b style={{ color: "var(--good)" }}>{nNew}</b>
            </>
          )}
          {exitRows.length > 0 && (
            <>
              {" "}
              · 청산 <b style={{ color: "var(--critical)" }}>{exitRows.length}</b>
            </>
          )}
        </div>
      )}
      {rows.length === 0 ? (
        <p className="ink-muted">현재 보유 종목 없음</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>티커</th>
                <th>진입가</th>
                <th>현재가</th>
                <th>수익률</th>
                <th>비중</th>
                <th>보유일</th>
                <th>스탑</th>
                <th>손절여유</th>
                <th>상태</th>
                <th>사유</th>
                <th>최근 추이</th>
                <th>플래그</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const cls = p.gainPct >= 0 ? "delta-good" : "delta-critical";
                const arrow = p.gainPct >= 0 ? "▲" : "▼";
                const status = p.statusCat ? STATUS_BADGE[p.statusCat] : null;
                const stopDistCls =
                  p.stopDistPct == null
                    ? "ink-muted"
                    : p.stopDistPct <= 4
                      ? "delta-critical"
                      : p.stopDistPct > 7
                        ? "delta-good"
                        : "ink-secondary";
                const flags: string[] = [];
                if (p.isRunner) flags.push("🚀 런너");
                if (p.pyramided) flags.push("➕ 피라미드");
                if (p.climaxTrimmed) flags.push("✂ 트림");
                if (p.isBe) flags.push("🔒 본전 BE");
                else if (p.lockTier) flags.push(`🔒 이익잠금 T${p.lockTier}`);
                return (
                  <tr key={p.ticker}>
                    <td className="ink-primary">
                      {p.ticker}
                      {p.isNewEntry && (
                        <span
                          style={{
                            marginLeft: 5,
                            fontSize: 9.5,
                            fontWeight: 700,
                            color: "var(--good)",
                            border: "1px solid var(--good)",
                            borderRadius: 3,
                            padding: "0 3px",
                            verticalAlign: 1,
                          }}
                        >
                          신규
                        </span>
                      )}
                    </td>
                    <td className="tabular ink-secondary">{p.entryPx.toFixed(2)}</td>
                    <td className="tabular ink-secondary">{p.lastClose.toFixed(2)}</td>
                    <td className={`tabular ${cls}`}>
                      {arrow} {p.gainPct >= 0 ? "+" : ""}
                      {p.gainPct.toFixed(1)}%
                    </td>
                    <td className="tabular ink-secondary">{p.weightPct != null ? `${p.weightPct.toFixed(1)}%` : "-"}</td>
                    <td className="tabular ink-secondary">{p.daysHeld != null ? `${p.daysHeld}일` : "-"}</td>
                    <td className="tabular ink-secondary">
                      {p.currentStopPct >= 0 ? "+" : ""}
                      {p.currentStopPct.toFixed(0)}%
                    </td>
                    <td className={`tabular ${stopDistCls}`}>
                      {p.stopDistPct != null ? `${p.stopDistPct.toFixed(1)}%` : "-"}
                    </td>
                    <td>
                      {status ? <span className={`badge ${status.cls}`}>{status.label}</span> : <span className="ink-muted">-</span>}
                    </td>
                    <td className="ink-secondary" style={{ fontSize: 12 }}>
                      {p.reason ?? "-"}
                    </td>
                    <td>
                      <Sparkline values={p.spark} />
                    </td>
                    <td>{flags.length > 0 ? flags.join(" ") : <span className="ink-muted">-</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {exitRows.length > 0 && (
        <div
          style={{
            fontSize: 12,
            color: "var(--text-secondary)",
            marginTop: 10,
            paddingTop: 8,
            borderTop: "1px solid var(--border)",
          }}
        >
          <b style={{ color: "var(--critical)" }}>이번 실행 청산</b>{" "}
          {exitRows.map((t, i) => {
            const hasPnl = t.pnlPct != null;
            const up = hasPnl && (t.pnlPct as number) >= 0;
            return (
              <span key={t.ticker}>
                {i > 0 ? " · " : "· "}
                {t.ticker}
                {hasPnl && (
                  <b style={{ color: up ? "var(--good)" : "var(--critical)", marginLeft: 4 }}>
                    {up ? "▲" : "▼"}
                    {(t.pnlPct as number) >= 0 ? "+" : ""}
                    {(t.pnlPct as number).toFixed(1)}%
                  </b>
                )}{" "}
                <span className="ink-muted">({EXIT_REASON_LABEL[t.reason] ?? t.reason})</span>
              </span>
            );
          })}
        </div>
      )}
      <OverviewCards rows={rows} />
    </Card>
  );
}
