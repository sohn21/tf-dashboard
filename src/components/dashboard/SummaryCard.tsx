import { Card, StatRow, StatTile } from "./Card";
import { RegimeSparkline } from "./RegimeSparkline";
import type { Summary, RegimeHistoryPoint } from "@/lib/types";

const fmtMoney = (x: number) => `$${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export function SummaryCard({ summary, regimeHistory }: { summary: Summary; regimeHistory: RegimeHistoryPoint[] }) {
  const entriesLabel =
    typeof summary.newEntriesPerWeek === "number" ? `${summary.newEntriesPerWeek}/주` : (summary.newEntriesPerWeek ?? "N/A");
  const exposureSub =
    summary.maxExposurePct != null ? `최대 노출 ${summary.maxExposurePct}% · 신규진입 ${entriesLabel}` : "N/A";
  const flagsSub = `🚀${summary.nRunners} · ➕${summary.nPyramided} · ✂${summary.nTrimmed}`;

  return (
    <Card>
      <StatRow columns={5}>
        <StatTile label="NAV" value={fmtMoney(summary.nav)} />
        <StatTile label="현금" value={fmtMoney(summary.cash)} />
        <StatTile label="보유 종목" value={summary.nPositions} sub={flagsSub} />
        <StatTile label="오늘 통과 후보" value={summary.candidatesPassed} />
        <StatTile
          label="시장 레짐"
          value={<span className={`badge badge-${summary.regimeStatus}`}>{summary.regime}</span>}
          sub={exposureSub}
        />
      </StatRow>
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--gridline)" }}>
        <div className="label-sm ink-secondary" style={{ marginBottom: 8 }}>
          레짐 추이 (최근 30일)
        </div>
        <RegimeSparkline data={regimeHistory} />
      </div>
    </Card>
  );
}
