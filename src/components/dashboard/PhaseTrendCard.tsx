"use client";

import { useState } from "react";
import { Card, StatRow, StatTile } from "./Card";
import type { PhasePoint, PhaseTrend } from "@/lib/types";

const PHASE_ORDER = ["4plus", "4", "5plus", "5", "3", "2", "1", "6", "7", "0"] as const;
type PhaseKey = (typeof PHASE_ORDER)[number];

const PHASE_LABEL: Record<PhaseKey, string> = {
  "4plus": "돌파임박+",
  "4": "돌파임박",
  "5plus": "본격리더+",
  "5": "본격리더",
  "3": "베이스성숙",
  "2": "바닥매집",
  "1": "관찰",
  "6": "후반피로",
  "7": "분배의심",
  "0": "회피/판정불가",
};

const PHASE_COLOR: Record<PhaseKey, string> = {
  "4plus": "var(--phase-4plus)",
  "4": "var(--phase-4)",
  "5plus": "var(--phase-5plus)",
  "5": "var(--phase-5)",
  "3": "var(--phase-3)",
  "2": "var(--phase-2)",
  "1": "var(--phase-1)",
  "6": "var(--phase-6)",
  "7": "var(--phase-7)",
  "0": "var(--phase-0)",
};

// §02 차트 배경 밴드용 레짐색 (briefing_html.py REGIME_COLOR 와 동일)
const REGIME_COLOR: Record<string, string> = {
  "Confirmed Uptrend": "#3E7D5C",
  "Uptrend Resumed": "#35756B",
  "Uptrend Under Pressure": "#B07C36",
  "Rally Attempt": "#BA6A34",
  Correction: "#A34A44",
};

function StackedChart({ points }: { points: PhasePoint[] }) {
  const [hover, setHover] = useState<number | null>(null);

  const w = 760, h = 260, padL = 34, padR = 16, padT = 12, padB = 24;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const n = points.length;
  const xOf = (i: number) => (n === 1 ? padL : padL + (plotW * i) / (n - 1));

  // 일별 100% 스택 — universe 대비 비율
  const pcts = points.map((p) => {
    const total = p.universe || 1;
    const out: Record<string, number> = {};
    for (const k of PHASE_ORDER) out[k] = (p.counts[k] / total) * 100;
    return out;
  });

  const yOf = (v: number) => padT + plotH * (1 - v / 100);

  const bands = PHASE_ORDER.map((key) => {
    const cum0 = new Array(n).fill(0);
    const cum1 = new Array(n).fill(0);
    for (let i = 0; i < n; i++) {
      let before = 0;
      for (const k of PHASE_ORDER) {
        if (k === key) break;
        before += pcts[i][k];
      }
      cum0[i] = before;
      cum1[i] = before + pcts[i][key];
    }
    const top = points.map((_, i) => [xOf(i), yOf(cum1[i])] as const);
    const bottom = points.map((_, i) => [xOf(i), yOf(cum0[i])] as const).reverse();
    const d =
      "M " + top.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ") +
      " L " + bottom.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ") + " Z";
    return { key, d };
  });

  const xTickCount = Math.min(6, n);
  const xTicks = Array.from({ length: xTickCount }, (_, k) => Math.round((k / (xTickCount - 1)) * (n - 1)));

  // §02 오버레이 — 레짐(#3) + 브레쓰 선(#2). 둘 다 있는 날만(2026-07-22부터, 매일 늘어남).
  // 레짐 표시(#3) — 스택이 100% 꽉 차 배경 밴드가 안 보이므로 차트 아래 색깔 점으로.
  const regimeDotY = padT + plotH + 8;
  const regimeDots = points
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => p.regime && REGIME_COLOR[p.regime as string]);
  const breadthPts = points
    .map((p, i) => (p.breadthPct != null ? ([xOf(i), yOf(p.breadthPct)] as const) : null))
    .filter((v): v is readonly [number, number] => v !== null);
  const breadthPath =
    breadthPts.length >= 2 ? "M " + breadthPts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ") : null;

  const handleMove: React.MouseEventHandler<SVGRectElement> = (e) => {
    const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const scaleX = w / rect.width;
    const localX = (e.clientX - rect.left) * scaleX;
    let i = Math.round(((localX - padL) / plotW) * (n - 1));
    i = Math.max(0, Math.min(n - 1, i));
    setHover(i);
  };

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label="베이스 Phase 분포 추이">
        {[0, 25, 50, 75, 100].map((v) => (
          <g key={v}>
            <line x1={padL} y1={yOf(v)} x2={w - padR} y2={yOf(v)} className="grid-line" />
            <text x={padL - 6} y={yOf(v) + 3} textAnchor="end" className="ink-muted label-sm">
              {v}%
            </text>
          </g>
        ))}
        {xTicks.map((i) => (
          <text key={i} x={xOf(i)} y={h - 6} textAnchor="middle" className="ink-muted label-sm">
            {points[i].date.slice(5)}
          </text>
        ))}
        {bands.map((b) => (
          <path key={b.key} d={b.d} fill={PHASE_COLOR[b.key as PhaseKey]} />
        ))}
        {breadthPath && <path d={breadthPath} fill="none" stroke="#42566B" strokeWidth={1.8} />}
        {regimeDots.map(({ p, i }) => (
          <circle key={`rg-${p.date}`} cx={xOf(i)} cy={regimeDotY} r={2.4} fill={REGIME_COLOR[p.regime as string]} />
        ))}
        {hover !== null && (
          <line x1={xOf(hover)} y1={padT} x2={xOf(hover)} y2={padT + plotH} stroke="var(--text-primary)" strokeWidth={1} strokeDasharray="3 3" opacity={0.5} />
        )}
        <rect x={padL} y={padT} width={plotW} height={plotH} fill="transparent" style={{ cursor: "crosshair" }} onMouseMove={handleMove} onMouseLeave={() => setHover(null)} />
      </svg>

      {hover !== null && (
        <div
          className="ink-primary label-sm"
          style={{
            position: "absolute",
            left: `${(xOf(hover) / w) * 100}%`,
            top: 0,
            transform: "translate(-50%, -100%)",
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "6px 10px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 10,
          }}
        >
          <div style={{ marginBottom: 4, fontWeight: 600 }}>{points[hover].date}</div>
          {PHASE_ORDER.map((k) => (
            <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: PHASE_COLOR[k], display: "inline-block" }} />
              <span className="ink-secondary" style={{ flex: 1 }}>
                {PHASE_LABEL[k]}
              </span>
              <span className="tabular">{points[hover].counts[k]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function PhaseTrendCard({ data }: { data: PhaseTrend | null }) {
  return (
    <Card title="베이스 Phase 분포 (3개월)">
      {!data || data.points.length === 0 ? (
        <p className="ink-muted">데이터 없음</p>
      ) : (
        <>
          <StatRow columns={2}>
            <StatTile label="진입후보풀 (돌파임박+본격리더)" value={`${data.greenPct.toFixed(1)}%`} valueClassName="delta-good" />
            <StatTile label="시장노화 (후반피로+분배의심)" value={`${data.agingPct.toFixed(1)}%`} valueClassName="delta-critical" />
          </StatRow>

          <div style={{ marginTop: 14, marginBottom: 8, display: "flex", flexWrap: "wrap", gap: "8px 14px", fontSize: 11.5 }} className="ink-secondary">
            {PHASE_ORDER.map((k) => (
              <span key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ width: 10, height: 10, borderRadius: 2, background: PHASE_COLOR[k], display: "inline-block" }} />
                {PHASE_LABEL[k]}
              </span>
            ))}
          </div>

          <StackedChart points={data.points} />

          <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: "6px 12px", fontSize: 11 }} className="ink-secondary">
            <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 14, borderTop: "2px solid #42566B", display: "inline-block" }} />
              브레쓰(50MA 위)
            </span>
            <span className="ink-muted">차트 아래 점 = 그날 레짐:</span>
            {(
              [
                ["Confirmed", "Confirmed Uptrend"],
                ["Resumed", "Uptrend Resumed"],
                ["Under Pressure", "Uptrend Under Pressure"],
                ["Rally Attempt", "Rally Attempt"],
                ["Correction", "Correction"],
              ] as const
            ).map(([label, key]) => (
              <span key={key} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: 99, background: REGIME_COLOR[key], display: "inline-block" }} />
                {label}
              </span>
            ))}
          </div>

          <div className="label-sm ink-muted" style={{ marginTop: 6 }}>
            유니버스 대비 일별 구성비(%) — 우리 시스템 신호(dist_pivot/RS/추세템플릿 등)로 근사 분류한
            라이프사이클 단계, 원본과 임계값이 다를 수 있음
          </div>
        </>
      )}
    </Card>
  );
}
