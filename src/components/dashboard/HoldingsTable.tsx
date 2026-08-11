import { Card } from "./Card";
import { Sparkline } from "./Sparkline";
import type { HoldingRow, HoldingStatusCat } from "@/lib/types";

export const STATUS_BADGE: Record<HoldingStatusCat, { cls: string; label: string }> = {
  critical: { cls: "badge-critical", label: "손절임박" },
  review: { cls: "badge-warning", label: "검토" },
  protect: { cls: "badge-protect", label: "보호중" },
  normal: { cls: "badge-good", label: "순항" },
};

export function HoldingsTable({ rows }: { rows: HoldingRow[] }) {
  return (
    <Card title={`현재 보유 종목 (${rows.length}종목)`}>
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
                <th>투자금액</th>
                <th>스탑</th>
                <th>손절여유</th>
                <th>상태</th>
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
                    <td className="tabular ink-secondary">{p.entryValue != null ? `$${p.entryValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "-"}</td>
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
    </Card>
  );
}
