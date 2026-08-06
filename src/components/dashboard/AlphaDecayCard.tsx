import { Card, StatRow, StatTile } from "./Card";
import type { AlphaDecay } from "@/lib/types";

const STATUS_CLS: Record<string, string> = {
  "강화 중": "delta-good",
  건강: "delta-good",
  주의: "ink-secondary",
  경고: "delta-critical",
  심각: "delta-critical",
};

export function AlphaDecayCard({ data }: { data: AlphaDecay }) {
  if (!data.reliable) {
    return (
      <Card title="알파감쇠 자가진단">
        <p className="ink-muted">
          {data.status}
          {data.overallWinRate != null ? ` (전체 ${data.nOverall}건 승률 ${data.overallWinRate.toFixed(0)}%, 최근90일 ${data.nRecent}건)` : ""}
          {data.profitFactor != null ? ` · Profit Factor ${data.profitFactor.toFixed(2)}` : ""}
        </p>
      </Card>
    );
  }

  const cls = STATUS_CLS[data.status] ?? "ink-secondary";

  return (
    <Card title="알파감쇠 자가진단">
      <StatRow columns={data.profitFactor != null ? 5 : 4}>
        <StatTile label={`전체 승률 (${data.nOverall}건)`} value={`${data.overallWinRate?.toFixed(0)}%`} />
        <StatTile label={`최근 90일 승률 (${data.nRecent}건)`} value={`${data.recentWinRate?.toFixed(0)}%`} />
        <StatTile label="감쇠" value={`${(data.decayPp ?? 0) >= 0 ? "+" : ""}${data.decayPp?.toFixed(1)}pp`} valueClassName={cls} />
        <StatTile label="건강도" value={<span style={{ fontSize: 16 }}>{data.status}</span>} valueClassName={cls} />
        {data.profitFactor != null && (
          <StatTile label="Profit Factor" value={data.profitFactor.toFixed(2)} valueClassName={data.profitFactor >= 1 ? "delta-good" : "delta-critical"} />
        )}
      </StatRow>
      <div className="label-sm ink-muted" style={{ marginTop: 10 }}>
        3개월 연속 경고/심각일 때만 구조적 변화로 간주 — 단발성 진단으로 결론 내리지 않음
      </div>
    </Card>
  );
}
