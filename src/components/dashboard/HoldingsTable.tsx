import { Card } from "./Card";
import { OverviewCards } from "./OverviewCards";
import { Sparkline } from "./Sparkline";
import type { HoldingRow, HoldingStatusCat, HoldingsCounts } from "@/lib/types";

export const STATUS_BADGE: Record<HoldingStatusCat, { cls: string; label: string }> = {
  critical: { cls: "badge-critical", label: "손절임박" },
  review: { cls: "badge-warning", label: "검토" },
  protect: { cls: "badge-protect", label: "보호중" },
  normal: { cls: "badge-good", label: "순항" },
};

export function HoldingsTable({ rows, counts }: { rows: HoldingRow[]; counts?: HoldingsCounts | null }) {
  return (
    <Card title={`현재 보유 종목 (${rows.length}종목)`}>
      {counts && (
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
          위험 <b style={{ color: "var(--critical)" }}>{counts.critical}</b> · 검토{" "}
          <b style={{ color: "var(--warning)" }}>{counts.review}</b> · 보호{" "}
          <b style={{ color: "var(--protect, #597ea3)" }}>{counts.protect}</b> · 순항{" "}
          <b style={{ color: "var(--good)" }}>{counts.normal}</b>
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
                    <td className="ink-primary">{p.ticker}</td>
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
      <OverviewCards rows={rows} />
    </Card>
  );
}
