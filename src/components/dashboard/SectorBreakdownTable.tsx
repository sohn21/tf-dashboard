"use client";

import { useState } from "react";
import { Card } from "./Card";
import type { SectorRow, IndexRsRow } from "@/lib/types";

type RulerItem = { key: string; label: string; rs: number; sub?: string };

// 2026-08-08: 업종 20개+지수를 한 줄씩 쌓던 막대 목록을, 하나의 공유 RS축(0~100) 위에 지수는
// 강조 핀으로 직접 라벨링하고 나머지 업종은 회색 삼각형 눈금으로 찍는 "emphasis" 형태로 교체
// (dataviz 스킬 choosing-a-form.md — "one series is the point, rest are context").
// 업종끼리 값이 몰려도 겹치지 않도록 그리디 겹침방지만 적용, 지수는 소수(≤3개)라 그대로 실제
// 위치에 라벨링. 정확한 수치는 호버/표 보기에서 그대로 유지(표는 이 컴포넌트 안에 있음).
// 2026-08-10: 지수 RS를 넘는(모든 지수를 상회하는) 업종은 삼각형 대신 지수와 같은 수직선+라벨로
// 승격 — 나머지 업종은 그대로 컨텍스트 삼각형. 겹치는 라벨은 기존처럼 단(tier)을 올리되, 이번엔
// 라벨만 옮기지 않고 수직선 길이 자체를 단마다 늘려(리더라인 효과, dataviz 스킬
// marks-and-anatomy.md의 "겹치는 끝라벨엔 leader line" 권고) 선-라벨 매칭이 한눈에 보이게 함.
const CONTEXT_GRAY = "#8a8a86";
const INDEX_COLOR = "var(--cat-5)";
const LEADER_COLOR = "var(--cat-1)";
const VW = 700;
const PAD_L = 14;
const PAD_R = 14;
const MIN_BASELINE_Y = 78;
const BOTTOM_PAD = 34; // 축 눈금+라벨용 하단 여백
const TICK_H = 9; // 업종(지수 이하) 삼각형 높이
const BASE_PIN_H = 26; // 수직선 기본 길이(0단)
const TIER_STEP = 16; // 겹치는 라벨마다 수직선을 이만큼씩 늘려 단을 구분
const MIN_GAP = 11; // 업종 마크 간 최소 간격(px)
const LABEL_MARGIN = 10; // 핀 라벨 겹침판정 시 글자폭 양옆에 추가하는 여유
const LABEL_GAP = 4; // 수직선 끝~라벨 사이 간격
const TEXT_TOP_PAD = 16; // 가장 높은 단 라벨이 캔버스 위로 안 잘리게 하는 여유
const MAX_LEADERS = 6; // 지수를 넘는 업종 중 수직선으로 승격할 최대 개수(RS 상위순)

// 지수 라벨("S&P500")은 짧지만 업종명("Technology Hardware, Storage & Peripherals")은 훨씬 길어서
// 고정 px 겹침판정으로는 부족함 — 12px bold 기준 대략치로 실제 텍스트 폭을 추정해 판정한다.
const approxLabelHalfWidth = (label: string) => (label.length * 6.4) / 2 + LABEL_MARGIN;

export function SectorBreakdownTable({ rows, indexRs }: { rows: SectorRow[]; indexRs: IndexRsRow[] }) {
  const [showTable, setShowTable] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const hasData = rows.length > 0 || indexRs.length > 0;

  const indexItems: RulerItem[] = indexRs.map((r) => ({ key: `idx-${r.label}`, label: r.label, rs: r.rs }));
  const allIndustryItems: RulerItem[] = rows.map((r, i) => ({ key: `sec-${i}`, label: r.industry, rs: r.avgRs, sub: r.sector }));

  // 모든 지수를 상회하는 업종 중 RS 상위 MAX_LEADERS개만 "리더"로 승격 — 나머지는 기존처럼
  // 컨텍스트 삼각형. 시장 폭이 넓어 지수를 넘는 업종이 많은 날(예: 20개 중 17개)에도 승격 개수를
  // 고정해서 "몇 개만 강조"라는 emphasis 패턴이 무너지지 않게 함(2026-08-10).
  const maxIndexRs = indexItems.length > 0 ? Math.max(...indexItems.map((it) => it.rs)) : -Infinity;
  const leaderItems: RulerItem[] = allIndustryItems
    .filter((it) => it.rs > maxIndexRs)
    .sort((a, b) => b.rs - a.rs)
    .slice(0, MAX_LEADERS);
  const leaderKeys = new Set(leaderItems.map((it) => it.key));
  const contextItems: RulerItem[] = allIndustryItems.filter((it) => !leaderKeys.has(it.key));

  const maxRs = Math.max(100, ...indexItems.map((it) => it.rs), ...allIndustryItems.map((it) => it.rs));
  const plotW = VW - PAD_L - PAD_R;
  const xOf = (rs: number) => PAD_L + (rs / maxRs) * plotW;

  const industryPositioned = [...contextItems]
    .sort((a, b) => a.rs - b.rs)
    .reduce<Array<RulerItem & { x: number }>>((acc, it) => {
      const prevX = acc.length > 0 ? acc[acc.length - 1].x : -Infinity;
      acc.push({ ...it, x: Math.max(xOf(it.rs), prevX + MIN_GAP) });
      return acc;
    }, []);

  // 지수+리더업종을 같은 채널(수직선)로 합쳐서 겹침방지 — 정렬 후 인접(prev)만 보면 여러 개가
  // 서로 다 가까울 때 1번째/3번째가 같은 단(tier)에 남아 다시 겹친다. 각 단에 마지막으로 배치한
  // x와 비교해 안 겹치는 가장 낮은 단을 그리디로 찾는다(단이 부족하면 자동으로 새 단 추가).
  // 단이 올라갈수록 수직선 길이 자체도 늘어나므로(TIER_STEP) 라벨뿐 아니라 선도 서로 구분된다.
  // 단마다 "마지막으로 배치한 라벨의 오른쪽 끝"을 기록해두고, 다음 라벨의 왼쪽 끝이 거길
  // 넘으면(글자폭 기준) 겹친다고 보고 다음 단으로 — 짧은 지수명과 긴 업종명이 섞여 있어 고정
  // px 간격으로는 부족함.
  const tierLastRight: number[] = [];
  const pinPositioned = [
    ...indexItems.map((it) => ({ ...it, kind: "index" as const })),
    ...leaderItems.map((it) => ({ ...it, kind: "leader" as const })),
  ]
    .sort((a, b) => a.rs - b.rs)
    .map((it) => ({ ...it, x: xOf(it.rs) }))
    .map((it) => {
      const halfW = approxLabelHalfWidth(it.label);
      let tier = 0;
      while (tierLastRight[tier] !== undefined && it.x - halfW < tierLastRight[tier]) tier++;
      tierLastRight[tier] = it.x + halfW;
      return { ...it, tier, pinHeight: BASE_PIN_H + tier * TIER_STEP };
    });

  const maxPinTier = pinPositioned.reduce((m, it) => Math.max(m, it.tier), 0);
  const BASELINE_Y = Math.max(MIN_BASELINE_Y, BASE_PIN_H + maxPinTier * TIER_STEP + TEXT_TOP_PAD);
  const H = BASELINE_Y + BOTTOM_PAD;

  const gridTicks = [0, 25, 50, 75, 100].filter((t) => t <= maxRs);
  const hoveredItem = [...industryPositioned, ...pinPositioned].find((it) => it.key === hovered);
  const hoveredPin = pinPositioned.find((it) => it.key === hovered);
  // 어느 핀을 호버해도 툴팁은 항상 가장 높은 단(라벨이 제일 위로 어긋난 핀) 위에 뜨도록 —
  // 낮은 단 핀의 툴팁이 위 단 라벨과 겹치는 걸 방지
  const topmostPinHeight = BASE_PIN_H + maxPinTier * TIER_STEP;
  const hoveredTopY = hoveredPin
    ? BASELINE_Y - topmostPinHeight - LABEL_GAP - 14
    : BASELINE_Y - TICK_H - 6;

  return (
    <Card title="업종/테마별 집계 (평균RS 기준, 종목수 2개 이상)">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button className="view-toggle-btn" onClick={() => setShowTable((v) => !v)}>
          {showTable ? "차트로 보기" : "표로 보기"}
        </button>
      </div>

      {!hasData ? (
        <p className="ink-muted">집계할 업종 데이터 없음</p>
      ) : showTable ? (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>섹터</th>
                <th>업종</th>
                <th>종목수</th>
                <th>평균RS</th>
                <th>평균점수</th>
                <th>테마주도</th>
                <th>게이트통과</th>
              </tr>
            </thead>
            <tbody>
              {indexRs.map((r) => (
                <tr key={r.label}>
                  <td className="ink-secondary">지수</td>
                  <td className="ink-primary">{r.label}</td>
                  <td className="tabular ink-secondary">-</td>
                  <td className="tabular ink-primary">{r.rs.toFixed(1)}</td>
                  <td className="tabular ink-secondary">-</td>
                  <td className="gate-cell">-</td>
                  <td className="tabular ink-secondary">-</td>
                </tr>
              ))}
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="ink-secondary">{r.sector}</td>
                  <td className="ink-primary">{r.industry}</td>
                  <td className="tabular ink-secondary">{r.count}</td>
                  <td className="tabular ink-primary">{r.avgRs.toFixed(1)}</td>
                  <td className="tabular ink-secondary">{r.avgScore.toFixed(1)}</td>
                  <td className={`gate-cell ${r.leading ? "gate-pass" : "gate-fail"}`}>{r.leading ? "✓" : "✗"}</td>
                  <td className="tabular ink-secondary">{r.passed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 16, fontSize: 12, marginBottom: 4, flexWrap: "wrap" }} className="ink-secondary">
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 2, height: 13, background: INDEX_COLOR, display: "inline-block" }} />
              지수
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 2, height: 13, background: LEADER_COLOR, display: "inline-block" }} />
              지수 상회 업종
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                style={{
                  width: 0,
                  height: 0,
                  borderLeft: "5px solid transparent",
                  borderRight: "5px solid transparent",
                  borderBottom: `9px solid ${CONTEXT_GRAY}`,
                  display: "inline-block",
                }}
              />
              업종 평균 RS (종목수 2개 이상) · 마커에 마우스를 올리면 상세
            </span>
          </div>

          <div style={{ position: "relative" }}>
            <svg viewBox={`0 0 ${VW} ${H}`} width="100%" height={H} role="img" aria-label="업종/지수 RS 분포">
              <line x1={PAD_L} y1={BASELINE_Y} x2={VW - PAD_R} y2={BASELINE_Y} className="grid-line" strokeWidth={1.5} />
              {gridTicks.map((t) => (
                <g key={t}>
                  <line x1={xOf(t)} y1={BASELINE_Y - 3} x2={xOf(t)} y2={BASELINE_Y + 3} className="grid-line" />
                  <text x={xOf(t)} y={BASELINE_Y + 17} textAnchor="middle" className="ink-muted label-sm">
                    {t}
                  </text>
                </g>
              ))}

              {industryPositioned.map((it) => (
                <g key={it.key} onMouseEnter={() => setHovered(it.key)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
                  <circle cx={it.x} cy={BASELINE_Y - TICK_H / 2} r={12} fill="transparent" />
                  <polygon
                    points={`${(it.x - 4.5).toFixed(1)},${BASELINE_Y} ${(it.x + 4.5).toFixed(1)},${BASELINE_Y} ${it.x.toFixed(1)},${BASELINE_Y - TICK_H}`}
                    fill={CONTEXT_GRAY}
                    stroke="var(--surface-1)"
                    strokeWidth={1.5}
                    opacity={hovered && hovered !== it.key ? 0.4 : 1}
                  />
                </g>
              ))}

              {pinPositioned.map((it) => {
                // 라벨이 캔버스 좌우 끝을 넘어가면(긴 업종명이 축 가장자리에 걸릴 때) 가운데
                // 정렬 대신 안쪽으로 붙여서 잘리지 않게 함
                const halfW = approxLabelHalfWidth(it.label);
                const overflowsRight = it.x + halfW > VW - PAD_R;
                const overflowsLeft = it.x - halfW < PAD_L;
                const labelAnchor = overflowsRight ? "end" : overflowsLeft ? "start" : "middle";
                const labelX = overflowsRight ? VW - PAD_R : overflowsLeft ? PAD_L : it.x;
                return (
                  <g key={it.key} onMouseEnter={() => setHovered(it.key)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
                    <rect x={it.x - 12} y={BASELINE_Y - it.pinHeight} width={24} height={it.pinHeight} fill="transparent" />
                    <line
                      x1={it.x}
                      y1={BASELINE_Y}
                      x2={it.x}
                      y2={BASELINE_Y - it.pinHeight}
                      stroke={it.kind === "index" ? INDEX_COLOR : LEADER_COLOR}
                      strokeWidth={2}
                      strokeLinecap="round"
                      opacity={hovered && hovered !== it.key ? 0.5 : 1}
                    />
                    <text
                      x={labelX}
                      y={BASELINE_Y - it.pinHeight - LABEL_GAP}
                      textAnchor={labelAnchor}
                      className="ink-primary label-sm"
                      style={{ fontWeight: 600 }}
                    >
                      {it.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hoveredItem && (
              <div
                className="ink-primary label-sm"
                style={{
                  position: "absolute",
                  left: `${(hoveredItem.x / VW) * 100}%`,
                  top: `${(hoveredTopY / H) * 100}%`,
                  transform: "translate(-50%, -100%)",
                  background: "var(--surface-1)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: "4px 8px",
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                  zIndex: 10,
                }}
              >
                {hoveredItem.sub && <span className="ink-muted">{hoveredItem.sub} · </span>}
                <b>{hoveredItem.label}</b> <span className="tabular">{hoveredItem.rs.toFixed(1)}</span>
              </div>
            )}
          </div>
        </>
      )}
    </Card>
  );
}
