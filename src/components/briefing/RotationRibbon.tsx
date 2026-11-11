"use client";

import { useState } from "react";
import type { RibbonMeta, Rotation } from "@/lib/types";
import { TermButton } from "./TermTrigger";

// 2026-11-11 리본 강화 — tf_project briefing_html._section_rotation() 과 동일 규칙.
const RANK_W = 20;
const LABEL_W = 190;
const COL_W = 13;
const ROW_H = 17;
const TOP_H = 14;
const MEM_W = 230;
const BROWN = "#854F0B";

function bandColor(score: number, strong: number, concern: number): string {
  if (score >= strong) return "var(--good)";
  if (score >= concern) return "var(--warning)";
  return "var(--border)";
}

function cellStyle(score: number, rb: RibbonMeta): [string, number] {
  if (score >= rb.strong) return ["var(--good)", 1];
  if (score >= rb.leading) return ["var(--good)", 0.45 + ((score - rb.leading) / (rb.strong - rb.leading)) * 0.35];
  if (score >= rb.mid) return [BROWN, 0.32];
  return [BROWN, 0.13];
}

const fmt = (v: number | null | undefined, signed = false) =>
  v == null ? "-" : signed ? `${v >= 0 ? "+" : ""}${v.toFixed(1)}` : v.toFixed(1);

export function RotationRibbon({ rotation }: { rotation: Rotation | null | undefined }) {
  const [days, setDays] = useState(30);
  if (!rotation || rotation.dates.length === 0 || rotation.themes.length === 0) {
    return (
      <div className="blueprint" style={{ padding: 16 }}>
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <p className="ink-muted">로테이션 히스토리 없음</p>
      </div>
    );
  }
  const { themes, sectors, sectorStrongThreshold, sectorConcernThreshold } = rotation;
  const rb: RibbonMeta = rotation.ribbon ?? {
    leading: rotation.themeConcernThreshold, strong: rotation.themeStrongThreshold, mid: rotation.themeConcernThreshold - 5,
    priorK: 0, rankDays: 30, halfLife: 3, nIndustries: themes.length, leadingToday: 0,
  };
  const k0 = Math.max(0, rotation.dates.length - days);
  const dates = rotation.dates.slice(k0);
  const latest = dates[dates.length - 1];
  const x0 = RANK_W + LABEL_W;
  const w = x0 + dates.length * COL_W + 8 + MEM_W;
  const h = TOP_H + themes.length * ROW_H + 4;
  const ticks: number[] = [];
  for (let i = 0; i < dates.length; i += 10) ticks.push(i);
  if (dates.length - 1 - (ticks[ticks.length - 1] ?? 0) >= 4) ticks.push(dates.length - 1);
  const btn = (d: number) => (
    <button
      key={d}
      onClick={() => setDays(d)}
      style={{
        fontSize: 11, fontWeight: 700, padding: "3px 9px", borderRadius: 6, cursor: "pointer",
        border: "1px solid var(--border)",
        background: days === d ? "var(--text-primary)" : "transparent",
        color: days === d ? "var(--bg, #fff)" : "var(--text-secondary)",
      }}
    >
      {d}일
    </button>
  );
  const chip = (fill: string, op: number, label: string) => (
    <span key={label} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--text-secondary)" }}>
      <span style={{ width: 10, height: 10, background: fill, opacity: op, display: "inline-block" }} />
      {label}
    </span>
  );

  return (
    <div className="blueprint" style={{ padding: "16px 18px" }}>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
        <div style={{ fontSize: 12, color: "var(--text-secondary)", flex: "1 1 300px" }}>
          상위 {themes.length}개 업종 · 순위 = 최근 {rb.rankDays}일 보정점수 지수가중평균(반감기 {rb.halfLife}일) — 일부러 관성을 둠,{" "}
          <span style={{ color: "var(--warning)" }}>“오늘 n위”</span> = 오늘 점수 순위와 5계단 이상 어긋남(로테이션 진행 중). 오늘 리딩 업종{" "}
          <b>{rb.leadingToday}</b>/{rb.nIndustries} · 오른쪽 = 오늘 구성종목 RS 상위 3 · 셀 호버 = 4키
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>{[30, 60].map(btn)}</div>
      </div>
      <div style={{ overflowX: "auto" }}>
        <svg viewBox={`0 0 ${w} ${h}`} width={w} style={{ maxWidth: "100%", height: "auto", display: "block" }}>
          {ticks.map((ci) => (
            <text key={`ax-${ci}`} x={x0 + ci * COL_W + COL_W / 2} y={10} textAnchor="middle" fontSize={9} fill="var(--text-secondary)">
              {dates[ci].slice(5)}
            </text>
          ))}
          {themes.map((t, ri) => {
            const y = TOP_H + ri * ROW_H;
            const rank = t.rank ?? ri + 1;
            const drift = t.todayRank != null && Math.abs(t.todayRank - rank) >= 5;
            const mems = (t.members ?? [])
              .map((m) => `${m.sym} ${m.rs != null ? m.rs.toFixed(0) : "-"}${m.phase ? `·P${m.phase}` : ""}`)
              .join("  ");
            return (
              <g key={t.name}>
                <text x={RANK_W - 4} y={y + ROW_H - 5} textAnchor="end" fontSize={9.5} fontWeight={700} fill="var(--text-secondary)">
                  {rank}
                </text>
                <text x={x0 - 6} y={y + ROW_H - 5} textAnchor="end" fontSize={10} fill="var(--text-primary)">
                  <title>
                    {`${t.sector ? `${t.sector} ▸ ` : ""}${t.name} · 30일 가중평균 ${fmt(t.ewScore)} · 오늘 ${t.todayRank ?? "-"}위 · 종목 ${t.nMembers ?? "-"}개`}
                  </title>
                  {t.name.slice(0, 26)}
                  {drift && (
                    <tspan fill="var(--warning)" fontSize={8.5}>
                      {` 오늘 ${t.todayRank}위`}
                    </tspan>
                  )}
                </text>
                {dates.map((d, ci) => {
                  const j = k0 + ci;
                  const sc = t.scores[j];
                  if (sc == null) return null;
                  const [fill, op] = cellStyle(sc, rb);
                  return (
                    <rect
                      key={d}
                      x={x0 + ci * COL_W}
                      y={y}
                      width={COL_W - 1.5}
                      height={ROW_H - 2}
                      fill={fill}
                      fillOpacity={op}
                      stroke={d === latest ? "var(--text-primary)" : undefined}
                      strokeWidth={d === latest ? 0.6 : undefined}
                    >
                      <title>
                        {`${t.name} · ${d}\n보정 점수 ${sc.toFixed(1)} (${sc >= rb.leading ? "✓ 리딩" : "미통과"})\n원점수 ${fmt(t.raw?.[j])} · 베이즈 RS ${fmt(t.bayesRs?.[j])} · Δ1주 ${fmt(t.delta1w?.[j], true)} · ${t.n?.[j] ?? "-"}종목`}
                      </title>
                    </rect>
                  );
                })}
                <text x={x0 + dates.length * COL_W + 10} y={y + ROW_H - 5} fontSize={9.5} fill="var(--text-secondary)" fontFamily="var(--font-mono, monospace)">
                  {mems}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
        {chip("var(--good)", 1, `강세 ≥${rb.strong}`)}
        {chip("var(--good)", 0.6, `리딩 ≥${rb.leading}`)}
        {chip(BROWN, 0.32, `중간 ≥${rb.mid}`)}
        {chip(BROWN, 0.13, "약세")}
      </div>
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6 }}>섹터 절대점수(오늘)</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {sectors.map((s) => (
            <span
              key={s.name}
              style={{
                display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--text-secondary)",
                border: "1px solid var(--border)", borderRadius: 4, padding: "2px 8px",
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: 99, background: bandColor(s.score, sectorStrongThreshold, sectorConcernThreshold) }} />
              {s.name} {s.score.toFixed(0)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RotationSectionHeader() {
  return (
    <div className="shead">
      <span className="snum">14</span>
      <h2 className="stitle">테마 로테이션 Ribbon</h2>
      <TermButton termKey="rotation" />
    </div>
  );
}
