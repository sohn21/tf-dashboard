import { Card, StatRow, StatTile } from "./Card";
import type { MarketBreadth, SentimentMetrics, DistributionRally } from "@/lib/types";

export function MarketBreadthCard({
  breadth,
  sentiment,
  distributionRally,
}: {
  breadth: MarketBreadth | null;
  sentiment: SentimentMetrics | null;
  distributionRally: DistributionRally | null;
}) {
  return (
    <Card title="마켓 브레스 & 시장신호">
      {!breadth ? (
        <p className="ink-muted">브레스 데이터 없음</p>
      ) : (
        <>
          <div className="label-sm ink-muted" style={{ marginBottom: 8 }}>
            참고지표
          </div>
          <StatRow columns={3}>
            <StatTile label="50일선 위 종목 비율" value={`${breadth.above50emaPct?.toFixed(1)}%`} />
            <StatTile
              label="신고가-신저가 순증(52주)"
              value={`${(breadth.netNewHighs ?? 0) >= 0 ? "+" : ""}${breadth.netNewHighs}`}
              valueClassName={(breadth.netNewHighs ?? 0) >= 0 ? "delta-good" : "delta-critical"}
            />
            <StatTile label="스캔 종목 수" value={breadth.universeCount ?? "-"} />
          </StatRow>
        </>
      )}

      {sentiment && (
        <>
          <div
            className="label-sm ink-muted"
            style={{ marginTop: 16, marginBottom: 8, paddingTop: 12, borderTop: "1px solid var(--gridline)" }}
          >
            심리 지표 — 참고지표
          </div>
          <StatRow columns={5}>
            <StatTile label="VIX" value={<span style={{ fontSize: 15 }}>{sentiment.vix} ({sentiment.vixLabel})</span>} />
            <StatTile
              label="AI 쏠림 갭"
              value={<span style={{ fontSize: 15 }}>{sentiment.concentrationGap != null ? `${sentiment.concentrationGap >= 0 ? "+" : ""}${sentiment.concentrationGap}` : "N/A"} ({sentiment.concentrationLabel})</span>}
            />
            <StatTile
              label="광범위 강세"
              value={<span style={{ fontSize: 15 }}>{sentiment.breadthStrongPct}% ({sentiment.breadthStrongLabel})</span>}
            />
            <StatTile
              label="자체 심리지표"
              value={<span style={{ fontSize: 15 }}>{sentiment.fearGreedScore} ({sentiment.fearGreedLabel})</span>}
              valueClassName={
                (sentiment.fearGreedScore ?? 50) >= 55
                  ? "delta-good"
                  : (sentiment.fearGreedScore ?? 50) <= 45
                    ? "delta-critical"
                    : "ink-primary"
              }
            />
            <StatTile
              label="Fear & Greed (CNN)"
              value={<span style={{ fontSize: 15 }}>{sentiment.cnnFearGreedScore ?? "N/A"} ({sentiment.cnnFearGreedLabel})</span>}
            />
          </StatRow>
        </>
      )}

      {distributionRally && (
        <>
          <div
            className="label-sm ink-muted"
            style={{ marginTop: 16, marginBottom: 8, paddingTop: 12, borderTop: "1px solid var(--gridline)" }}
          >
            레짐 판정에 반영됨
          </div>
          <StatRow columns={2}>
            <StatTile
              label="S&P500 Distribution/Rally Day (25일)"
              value={`${distributionRally.spxDistributionDays} / ${distributionRally.spxRallyDays}`}
            />
            <StatTile
              label="나스닥 Distribution/Rally Day (25일)"
              value={`${distributionRally.ndxDistributionDays} / ${distributionRally.ndxRallyDays}`}
            />
          </StatRow>
        </>
      )}
    </Card>
  );
}
