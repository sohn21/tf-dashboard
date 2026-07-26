import { Card } from "./Card";
import type { GateFunnelRow } from "@/lib/types";

export function GateFunnelCard({ rows }: { rows: GateFunnelRow[] }) {
  return (
    <Card title="게이트 퍼널 (오늘)">
      {rows.map((row) => {
        const pct = row.total > 0 ? (row.count / row.total) * 100 : 0;
        const isFinal = row.key === "passed";
        return (
          <div className="funnel-row" key={row.key}>
            <div className="funnel-label label-sm ink-secondary">{row.label}</div>
            <div className="funnel-track">
              <div
                className={`funnel-fill${isFinal ? " funnel-fill-final" : ""}`}
                style={{ width: `${Math.max(pct, 1.2)}%` }}
              />
            </div>
            <div className="funnel-value label-sm ink-primary">
              {row.count}/{row.total}
            </div>
          </div>
        );
      })}
    </Card>
  );
}
