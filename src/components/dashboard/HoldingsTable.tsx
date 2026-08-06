import { Card } from "./Card";
import { Sparkline } from "./Sparkline";
import type { HoldingRow } from "@/lib/types";

export function HoldingsTable({ rows }: { rows: HoldingRow[] }) {
  return (
    <Card title="현재 보유 종목">
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
                <th>스탑</th>
                <th>최근 추이</th>
                <th>플래그</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const cls = p.gainPct >= 0 ? "delta-good" : "delta-critical";
                const arrow = p.gainPct >= 0 ? "▲" : "▼";
                const flags: string[] = [];
                if (p.isRunner) flags.push("🚀 런너");
                if (p.pyramided) flags.push("➕ 피라미드");
                if (p.climaxTrimmed) flags.push("✂ 트림");
                return (
                  <tr key={p.ticker}>
                    <td className="ink-primary">{p.ticker}</td>
                    <td className="tabular ink-secondary">{p.entryPx.toFixed(2)}</td>
                    <td className="tabular ink-secondary">{p.lastClose.toFixed(2)}</td>
                    <td className={`tabular ${cls}`}>
                      {arrow} {p.gainPct >= 0 ? "+" : ""}
                      {p.gainPct.toFixed(1)}%
                    </td>
                    <td className="tabular ink-secondary">
                      {p.currentStopPct >= 0 ? "+" : ""}
                      {p.currentStopPct.toFixed(0)}%
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
