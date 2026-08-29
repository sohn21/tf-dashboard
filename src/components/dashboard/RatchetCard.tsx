"use client";

import { useState } from "react";
import { Card, StatRow, StatTile } from "./Card";
import { OverviewCards } from "./OverviewCards";
import { Sparkline } from "./Sparkline";
import { STATUS_BADGE, NewEntryBadge, HoldingsExitLine } from "./HoldingsTable";
import type { AlphaDecay, RatchetData, RatchetExitReasonRow } from "@/lib/types";

const fmtMoney = (x: number) => `$${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const DECAY_STATUS_CLS: Record<string, string> = {
  "강화 중": "delta-good",
  건강: "delta-good",
  주의: "ink-secondary",
  경고: "delta-critical",
  심각: "delta-critical",
};

function RatchetAlphaDecay({ data }: { data: AlphaDecay }) {
  if (!data.reliable) {
    return (
      <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--gridline)" }}>
        <div className="label-sm ink-secondary" style={{ marginBottom: 8 }}>
          알파감쇠 자가진단
        </div>
        <p className="ink-muted">
          {data.status}
          {data.overallWinRate != null ? ` (전체 ${data.nOverall}건 승률 ${data.overallWinRate.toFixed(0)}%, 최근90일 ${data.nRecent}건)` : ""}
          {data.profitFactor != null ? ` · Profit Factor ${data.profitFactor.toFixed(2)}` : ""}
        </p>
      </div>
    );
  }

  const cls = DECAY_STATUS_CLS[data.status] ?? "ink-secondary";

  return (
    <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--gridline)" }}>
      <div className="label-sm ink-secondary" style={{ marginBottom: 8 }}>
        알파감쇠 자가진단
      </div>
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
    </div>
  );
}

// 래칫은 stop_lock 단계가 max_gain 구간에 따라 동적으로 생기므로(래더처럼 고정 5종류가
// 아님) 고정 순서/색 팔레트 대신 건수 내림차순으로 정렬하고 손절(stop)만 강조색을 준다.
const REASON_LABEL: Record<string, string> = { stop: "초기 손절 (-7%)" };
const REASON_COLOR_STOP = "var(--reason-stop, #c0392b)";
const REASON_PALETTE = ["#2a78d6", "#0f9d58", "#c07a3e", "#8a5cf6", "#b8860b", "#1631a3", "#e2231a"];

function ExitReasonDonut({ rows }: { rows: RatchetExitReasonRow[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const ordered = [...rows].sort((a, b) => b.count - a.count);
  const total = ordered.reduce((s, r) => s + r.count, 0);
  if (total === 0) return null;

  const colorOf = (reason: string, i: number) => (reason === "stop" ? REASON_COLOR_STOP : REASON_PALETTE[i % REASON_PALETTE.length]);
  const labelOf = (reason: string) => REASON_LABEL[reason] ?? (reason.startsWith("stop_lock") ? `락 청산 (+${reason.replace("stop_lock", "")}%)` : reason);

  const cx = 110, cy = 110, r = 80, sw = 30;
  const circumference = 2 * Math.PI * r;
  const gap = 3;
  let offset = 0;

  return (
    <div className="donut-grid" style={{ gridTemplateColumns: "220px 1fr" }}>
      <div className="donut-wrap">
        <svg viewBox="0 0 220 220" width={220} height={220}>
          {ordered.map((seg, i) => {
            const rawLen = (seg.count / total) * circumference;
            const len = Math.max(rawLen - gap, 1);
            const dashoffset = -offset;
            offset += rawLen;
            const color = colorOf(seg.reason, i);
            return (
              <circle
                key={seg.reason}
                className={`donut-arc ${hovered && hovered !== seg.reason ? "dim" : ""}`}
                cx={cx}
                cy={cy}
                r={r}
                fill="none"
                stroke={color}
                strokeWidth={sw}
                strokeDasharray={`${len} ${circumference - len}`}
                strokeDashoffset={dashoffset}
                transform={`rotate(-90 ${cx} ${cy})`}
                onMouseEnter={() => setHovered(seg.reason)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}
        </svg>
        <div className="donut-center">
          <div className="n">{total}</div>
          <div className="lbl">건</div>
        </div>
      </div>
      <div className="donut-legend" style={{ marginTop: 0, justifyContent: "center", display: "flex", flexDirection: "column" }}>
        {ordered.map((seg, i) => {
          const pct = ((seg.count / total) * 100).toFixed(0);
          return (
            <div
              key={seg.reason}
              className="donut-legend-row"
              style={{ opacity: hovered && hovered !== seg.reason ? 0.4 : 1 }}
              onMouseEnter={() => setHovered(seg.reason)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="donut-swatch" style={{ background: colorOf(seg.reason, i) }} />
              <span className="donut-legend-name">{labelOf(seg.reason)}</span>
              <span className="donut-legend-count">{seg.count}</span>
              <span className="donut-legend-pct">{pct}%</span>
              <span
                className="tabular"
                style={{ width: 56, textAlign: "right", fontWeight: 600, color: seg.avgPnlPct >= 0 ? "var(--good)" : "var(--critical)" }}
              >
                {seg.avgPnlPct >= 0 ? "+" : ""}
                {seg.avgPnlPct.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function RatchetCard({ data }: { data: RatchetData | null }) {
  if (!data) {
    return (
      <Card title="래칫 (Lock 래칫 실험 계좌)">
        <p className="ink-muted">아직 데이터 없음</p>
      </Card>
    );
  }

  return (
    <Card title="래칫 (Lock 래칫 실험 계좌)">
      <p className="ink-muted" style={{ marginTop: -4, marginBottom: 14 }}>
        코어·래더와 별도로 운용하는 $10,000 실험 계좌.
      </p>
      <StatRow columns={3}>
        <StatTile label="NAV" value={fmtMoney(data.nav)} />
        <StatTile label="현금" value={fmtMoney(data.cash)} />
        <StatTile label="보유 종목" value={data.nPositions} />
      </StatRow>

      <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--gridline)" }}>
        <div className="label-sm ink-secondary" style={{ marginBottom: 8 }}>
          보유 종목 ({data.holdings.length}종목)
        </div>
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
                  <th>투자금액</th>
                  <th>스탑</th>
                  <th>최고수익</th>
                  <th>손절여유</th>
                  <th>상태</th>
                  <th>최근 추이</th>
                </tr>
              </thead>
              <tbody>
                {data.holdings.map((p) => {
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
                  return (
                    <tr key={p.ticker}>
                      <td className="ink-primary">
                        {p.ticker}
                        {p.isNewEntry && <NewEntryBadge />}
                        {p.isRunner && (
                          <span className="badge" style={{ marginLeft: 6, fontSize: 10 }}>
                            런너
                          </span>
                        )}
                      </td>
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
                      <td className="tabular ink-secondary">+{p.maxGainPct.toFixed(1)}%</td>
                      <td className={`tabular ${stopDistCls}`}>
                        {p.stopDistPct != null ? `${p.stopDistPct.toFixed(1)}%` : "-"}
                      </td>
                      <td>
                        {status ? <span className={`badge ${status.cls}`}>{status.label}</span> : <span className="ink-muted">-</span>}
                      </td>
                      <td>
                        <Sparkline values={p.spark} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <OverviewCards rows={data.holdings} />
        <HoldingsExitLine exits={data.holdingsExits} />
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

      {data.backtest && (
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: "1px solid var(--gridline)" }}>
          <div className="label-sm ink-secondary" style={{ marginBottom: 10 }}>
            백테스트 요약 (참고용 — 라이브 계좌와 별개) · {data.backtest.startDate} ~ {data.backtest.endDate}
          </div>
          <StatRow columns={3}>
            <StatTile
              label="총수익률"
              value={`${data.backtest.totalReturnPct >= 0 ? "+" : ""}${data.backtest.totalReturnPct.toFixed(1)}%`}
              valueClassName={data.backtest.totalReturnPct >= 0 ? "delta-good" : "delta-critical"}
            />
            <StatTile label="MDD" value={`${data.backtest.mddPct.toFixed(1)}%`} valueClassName="delta-critical" />
            <StatTile label="거래수 · 승률" value={`${data.backtest.nTrades} · ${data.backtest.winRatePct.toFixed(0)}%`} />
          </StatRow>

          {data.backtest.benchmarks.length > 0 && (
            <StatRow columns={data.backtest.benchmarks.length}>
              {data.backtest.benchmarks.map((b) => (
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
          )}

          {data.backtest.exitReasons.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div className="label-sm ink-muted" style={{ marginBottom: 10 }}>
                청산사유별 분포 — 초기 손절(빨강) vs 단계별 락 청산
              </div>
              <ExitReasonDonut rows={data.backtest.exitReasons} />
            </div>
          )}
        </div>
      )}

      <RatchetAlphaDecay data={data.alphaDecay} />
    </Card>
  );
}
