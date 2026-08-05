import { Card, StatRow, StatTile } from "./Card";
import type { Set2Data } from "@/lib/types";

const fmtMoney = (x: number) => `$${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const TRIM_STAGE_LABEL: Record<number, string> = {
  0: "트림 전",
  1: "1차 트림(24%)",
  2: "2차 트림(50%)",
};

export function Set2Card({ data }: { data: Set2Data | null }) {
  if (!data) {
    return (
      <Card title="세트2 — 스탑/트림 래더 (실험 계좌)">
        <p className="ink-muted">아직 데이터 없음</p>
      </Card>
    );
  }

  return (
    <Card title="세트2 — 스탑/트림 래더 (실험 계좌)">
      <p className="ink-muted" style={{ marginTop: -4, marginBottom: 14 }}>
        메인 계좌와 별도인 $10,000 계좌. 최대 4종목·종목당 25%, -8% 손절 → +24%에서 30% 매도 후
        스탑 +8% 고정 → +50%에서 잔량 절반 매도 → +100%에서 전량 매도.
      </p>
      <StatRow columns={3}>
        <StatTile label="NAV" value={fmtMoney(data.nav)} />
        <StatTile label="현금" value={fmtMoney(data.cash)} />
        <StatTile label="보유 종목" value={data.nPositions} />
      </StatRow>

      <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--gridline)" }}>
        {data.holdings.length === 0 ? (
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
                  <th>단계</th>
                </tr>
              </thead>
              <tbody>
                {data.holdings.map((p) => {
                  const cls = p.gainPct >= 0 ? "delta-good" : "delta-critical";
                  const arrow = p.gainPct >= 0 ? "▲" : "▼";
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
                      <td className="ink-secondary">{TRIM_STAGE_LABEL[p.trimStage] ?? p.trimStage}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data.recentTrades.length > 0 && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--gridline)" }}>
          <div className="label-sm ink-secondary" style={{ marginBottom: 8 }}>
            최근 청산 이력
          </div>
          <div className="table-scroll">
            <table className="data-table">
              <thead>
                <tr>
                  <th>티커</th>
                  <th>진입일</th>
                  <th>청산일</th>
                  <th>손익%</th>
                  <th>사유</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTrades.map((r, i) => (
                  <tr key={i}>
                    <td className="ink-primary">{r.ticker}</td>
                    <td className="ink-secondary">{r.entryDate}</td>
                    <td className="ink-secondary">{r.exitDate}</td>
                    <td className={`tabular ${r.pnlPct >= 0 ? "delta-good" : "delta-critical"}`}>
                      {r.pnlPct >= 0 ? "+" : ""}
                      {r.pnlPct.toFixed(1)}%
                    </td>
                    <td className="ink-secondary">{r.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Card>
  );
}
