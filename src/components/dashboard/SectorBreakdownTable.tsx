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
const CONTEXT_GRAY = "#8a8a86";
const VW = 700;
const H = 112;
const PAD_L = 14;
const PAD_R = 14;
const BASELINE_Y = 78;
const TICK_H = 9; // 업종 삼각형 높이
const PIN_H = 26; // 지수 핀 높이(모든 핀 동일 — 라벨만 겹칠 때 위 단으로 어긋냄)
const MIN_GAP = 11; // 업종 마크 간 최소 간격(px)
const LABEL_COLLIDE_PX = 80; // 지수 라벨끼리 이 거리보다 가까우면 위 단으로 어긋냄
const LABEL_TIER_OFFSET = 14;

export function SectorBreakdownTable({ rows, indexRs }: { rows: SectorRow[]; indexRs: IndexRsRow[] }) {
  const [showTable, setShowTable] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const hasData = rows.length > 0 || indexRs.length > 0;

  const indexItems: RulerItem[] = indexRs.map((r) => ({ key: `idx-${r.label}`, label: r.label, rs: r.rs }));
  const industryItems: RulerItem[] = rows.map((r, i) => ({ key: `sec-${i}`, label: r.industry, rs: r.avgRs, sub: r.sector }));

  const maxRs = Math.max(100, ...indexItems.map((it) => it.rs), ...industryItems.map((it) => it.rs));
  const plotW = VW - PAD_L - PAD_R;
  const xOf = (rs: number) => PAD_L + (rs / maxRs) * plotW;

  const industryPositioned = [...industryItems]
    .sort((a, b) => a.rs - b.rs)
    .reduce<Array<RulerItem & { x: number }>>((acc, it) => {
      const prevX = acc.length > 0 ? acc[acc.length - 1].x : -Infinity;
      acc.push({ ...it, x: Math.max(xOf(it.rs), prevX + MIN_GAP) });
      return acc;
    }, []);
  // 지수 라벨 겹침방지 — 정렬 후 인접(prev)만 보면 3개가 서로 다 가까울 때 1번째/3번째가
  // 같은 단(tier)에 남아 다시 겹친다. 각 단에 마지막으로 배치한 x와 비교해 안 겹치는
  // 가장 낮은 단을 그리디로 찾는다(단이 부족하면 자동으로 새 단 추가).
  const tierLastX: number[] = [];
  const indexPositioned = [...indexItems]
    .sort((a, b) => a.rs - b.rs)
    .map((it) => ({ ...it, x: xOf(it.rs) }))
    .map((it) => {
      let tier = 0;
      while (tierLastX[tier] !== undefined && it.x - tierLastX[tier] < LABEL_COLLIDE_PX) tier++;
      tierLastX[tier] = it.x;
      return { ...it, tier };
    });
  const gridTicks = [0, 25, 50, 75, 100].filter((t) => t <= maxRs);
  const hoveredItem = [...industryPositioned, ...indexPositioned].find((it) => it.key === hovered);
  const hoveredIndex = indexPositioned.find((it) => it.key === hovered);
  // 어느 지수를 호버해도 툴팁은 항상 가장 높은 단(라벨이 제일 위로 어긋난 지수) 위에 뜨도록 —
  // 낮은 단 지수의 툴팁이 위 단 지수 라벨과 겹치는 걸 방지
  const maxIndexTier = indexPositioned.reduce((m, it) => Math.max(m, it.tier), 0);
  const hoveredTopY = hoveredIndex
    ? BASELINE_Y - PIN_H - 18 - maxIndexTier * LABEL_TIER_OFFSET
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
          <div style={{ display: "flex", gap: 16, fontSize: 12, marginBottom: 4 }} className="ink-secondary">
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 2, height: 13, background: "var(--cat-5)", display: "inline-block" }} />
              지수
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

              {indexPositioned.map((it) => (
                <g key={it.key} onMouseEnter={() => setHovered(it.key)} onMouseLeave={() => setHovered(null)} style={{ cursor: "pointer" }}>
                  <rect x={it.x - 12} y={BASELINE_Y - PIN_H} width={24} height={PIN_H} fill="transparent" />
                  <line
                    x1={it.x}
                    y1={BASELINE_Y}
                    x2={it.x}
                    y2={BASELINE_Y - PIN_H}
                    stroke="var(--cat-5)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    opacity={hovered && hovered !== it.key ? 0.5 : 1}
                  />
                  <text
                    x={it.x}
                    y={BASELINE_Y - PIN_H - 4 - it.tier * LABEL_TIER_OFFSET}
                    textAnchor="middle"
                    className="ink-primary label-sm"
                    style={{ fontWeight: 600 }}
                  >
                    {it.label}
                  </text>
                </g>
              ))}
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
