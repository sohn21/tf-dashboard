import { Card, StatRow, StatTile } from "./Card";
import type { BacktestSummary } from "@/lib/types";

export function BacktestSummaryCard({ data }: { data: BacktestSummary | null }) {
  return (
    <Card title="백테스트 요약 (참고용 — 라이브 계좌와 별개)">
      {!data ? (
        <p className="ink-muted">백테스트 결과 없음</p>
      ) : (
        <>
          <StatRow columns={4}>
            <StatTile label="기간" value={<span style={{ fontSize: 15 }}>{data.startDate} ~ {data.endDate}</span>} />
            <StatTile
              label="총수익률"
              value={`${data.totalReturnPct >= 0 ? "+" : ""}${data.totalReturnPct.toFixed(1)}%`}
              valueClassName={data.totalReturnPct >= 0 ? "delta-good" : "delta-critical"}
            />
            <StatTile label="MDD" value={`${data.mddPct.toFixed(1)}%`} valueClassName="delta-critical" />
            <StatTile label="거래수 · 승률" value={`${data.nTrades} · ${data.winRatePct.toFixed(0)}%`} />
          </StatRow>
          {data.benchmarks.length > 0 && (
            <>
              <div
                className="label-sm ink-muted"
                style={{ marginTop: 16, marginBottom: 8, paddingTop: 12, borderTop: "1px solid var(--gridline)" }}
              >
                큰 숫자는 벤치마크 자체의 buy&amp;hold 수익률 — 우리 시스템 수익률이 아님. &quot;초과 N%p&quot;가 우리 시스템 총수익률({data.totalReturnPct >= 0 ? "+" : ""}
                {data.totalReturnPct.toFixed(1)}%)에서 벤치마크 수익률을 뺀 실제 차이
              </div>
              <StatRow columns={data.benchmarks.length}>
                {data.benchmarks.map((b) => (
                  <StatTile
                    key={b.label}
                    label={`${b.label} buy&hold 수익률`}
                    value={<span style={{ fontSize: 15 }}>{`${b.returnPct >= 0 ? "+" : ""}${b.returnPct.toFixed(1)}%`}</span>}
                    sub={
                      <span className={b.excessPct >= 0 ? "delta-good" : "delta-critical"}>
                        우리 시스템 초과분 {b.excessPct >= 0 ? "+" : ""}
                        {b.excessPct.toFixed(1)}%p
                      </span>
                    }
                  />
                ))}
              </StatRow>
            </>
          )}
        </>
      )}
    </Card>
  );
}
