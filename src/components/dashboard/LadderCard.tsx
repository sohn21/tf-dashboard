"use client";

import { useState } from "react";
import { Card, StatRow, StatTile } from "./Card";
import { OverviewCards } from "./OverviewCards";
import { Sparkline } from "./Sparkline";
import { STATUS_BADGE, NewEntryBadge, HoldingsExitLine } from "./HoldingsTable";
import type { AlphaDecay, LadderData, LadderExitReasonRow } from "@/lib/types";

const fmtMoney = (x: number) => `$${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const DECAY_STATUS_CLS: Record<string, string> = {
  "강화 중": "delta-good",
  건강: "delta-good",
  주의: "ink-secondary",
  경고: "delta-critical",
  심각: "delta-critical",
};

function LadderAlphaDecay({ data }: { data: AlphaDecay }) {
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

const TRIM_STAGE_LABEL: Record<number, string> = {
  0: "트림 전",
  1: "1차 트림(24%)",
  2: "2차 트림(50%)",
};

const REASON_LABEL: Record<string, string> = {
  stop: "손절 (-8%)",
  stop_locked8: "고정스탑 청산 (+8%)",
  trim1_24pct: "1차 트림 (+24%)",
  trim2_50pct: "2차 트림 (+50%)",
  final_100: "전량 청산 (+100%)",
};
const REASON_COLOR: Record<string, string> = {
  stop: "var(--reason-stop)",
  stop_locked8: "var(--reason-locked)",
  trim1_24pct: "var(--reason-trim1)",
  trim2_50pct: "var(--reason-trim2)",
  final_100: "var(--reason-final)",
};
const REASON_ORDER = ["stop", "stop_locked8", "trim1_24pct", "trim2_50pct", "final_100"];

function ExitReasonDonut({ rows }: { rows: LadderExitReasonRow[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const ordered = [...rows].sort((a, b) => REASON_ORDER.indexOf(a.reason) - REASON_ORDER.indexOf(b.reason));
  const total = ordered.reduce((s, r) => s + r.count, 0);
  if (total === 0) return null;

  const cx = 110, cy = 110, r = 80, sw = 30;
  const circumference = 2 * Math.PI * r;
  const gap = 3;
  let offset = 0;

  return (
    <div className="donut-grid" style={{ gridTemplateColumns: "220px 1fr" }}>
      <div className="donut-wrap">
        <svg viewBox="0 0 220 220" width={220} height={220}>
          {ordered.map((seg) => {
            const rawLen = (seg.count / total) * circumference;
            const len = Math.max(rawLen - gap, 1);
            const dashoffset = -offset;
            offset += rawLen;
            const color = REASON_COLOR[seg.reason] ?? "var(--text-muted)";
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
        {ordered.map((seg) => {
          const pct = ((seg.count / total) * 100).toFixed(0);
          return (
            <div
              key={seg.reason}
              className="donut-legend-row"
              style={{ opacity: hovered && hovered !== seg.reason ? 0.4 : 1 }}
              onMouseEnter={() => setHovered(seg.reason)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="donut-swatch" style={{ background: REASON_COLOR[seg.reason] }} />
              <span className="donut-legend-name">{REASON_LABEL[seg.reason] ?? seg.reason}</span>
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

export function LadderCard({ data }: { data: LadderData | null }) {
  if (!data) {
    return (
      <Card title="래더 (스탑/트림 실험 계좌)">
        <p className="ink-muted">아직 데이터 없음</p>
      </Card>
    );
  }

  return (
    <Card title="래더 (스탑/트림 실험 계좌)">
      <p className="ink-muted" style={{ marginTop: -4, marginBottom: 10 }}>
        코어 계좌와 별도인 $10,000 실험 계좌 · 코어의 런너 승격·피라미딩·스위칭·실적 R-tier·노출도
        상한은 미적용(청산 로직만 비교하는 목적).
      </p>
      <div
        style={{
          marginBottom: 14,
          padding: "10px 12px",
          border: "1px solid var(--gridline)",
          borderRadius: 6,
          fontSize: 12,
          lineHeight: 1.65,
        }}
      >
        <div style={{ marginBottom: 5 }}>
          <b style={{ color: "var(--good)" }}>매수</b>{" "}
          <span className="ink-secondary">
            코어 시스템과 동일한 후보 선정(추세추종 게이트 G0~G4 + 가드)을 통과한 상위 랭킹 종목을
            최대 4종목·종목당 NAV 25%까지 신규 매수. 부분 매수·피라미딩 없음.
          </span>
        </div>
        <div>
          <b style={{ color: "var(--critical)" }}>매도</b>{" "}
          <span className="ink-secondary">
            −8% 손절(초기 하드스톱). +24% 도달 시 보유수량 30% 매도 후 잔량 스탑을 +8%로 고정(이후
            +8%까지 밀리면 잔량 전량 청산). +50% 도달 시 잔량 절반 매도. +100% 도달 시 전량 매도.
          </span>
        </div>
      </div>
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
                  <th>손절여유</th>
                  <th>상태</th>
                  <th>최근 추이</th>
                  <th>단계</th>
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
                      <td className={`tabular ${stopDistCls}`}>
                        {p.stopDistPct != null ? `${p.stopDistPct.toFixed(1)}%` : "-"}
                      </td>
                      <td>
                        {status ? <span className={`badge ${status.cls}`}>{status.label}</span> : <span className="ink-muted">-</span>}
                      </td>
                      <td>
                        <Sparkline values={p.spark} />
                      </td>
                      <td className="ink-secondary">{TRIM_STAGE_LABEL[p.trimStage] ?? p.trimStage}</td>
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
                청산사유별 분포 — 손절(빨강)에서 트림 단계가 깊어질수록 진한 초록
              </div>
              <ExitReasonDonut rows={data.backtest.exitReasons} />
            </div>
          )}
        </div>
      )}

      <LadderAlphaDecay data={data.alphaDecay} />
    </Card>
  );
}
