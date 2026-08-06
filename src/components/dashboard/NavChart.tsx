"use client";

import { useState } from "react";
import type { NavPoint } from "@/lib/types";

const fmtMoney = (x: number) => `$${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export function NavChart({ data }: { data: NavPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="ink-muted">NAV 기록 없음</p>;
  }

  const w = 700;
  const h = 220;
  const padL = 56;
  const padR = 16;
  const padT = 16;
  const padB = 8;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  // 드로다운 서브플롯 — 메인 NAV 차트와 x축 공유, 높이만 훨씬 얇게
  const ddH = 46;
  const ddPadT = 6;
  const ddPlotH = ddH - ddPadT - 18;

  const values = data.map((d) => d.nav);
  let vmin = Math.min(...values);
  let vmax = Math.max(...values);
  if (vmax === vmin) {
    vmin -= 1;
    vmax += 1;
  }

  let runningMax = -Infinity;
  const drawdowns = values.map((v) => {
    runningMax = Math.max(runningMax, v);
    return (v / runningMax - 1) * 100;
  });
  const ddMin = Math.min(...drawdowns, 0);

  const n = data.length;
  const xOf = (i: number) => (n === 1 ? padL : padL + (plotW * i) / (n - 1));
  const yOf = (v: number) => padT + plotH * (1 - (v - vmin) / (vmax - vmin));
  const ddYOf = (v: number) => ddPadT + (ddMin === 0 ? 0 : ddPlotH * (v / ddMin));

  const points = data.map((d, i) => [xOf(i), yOf(d.nav)] as const);
  const pathD = "M " + points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
  const areaD = `${pathD} L ${points[points.length - 1][0].toFixed(1)},${(padT + plotH).toFixed(1)} L ${points[0][0].toFixed(1)},${(padT + plotH).toFixed(1)} Z`;

  const ddPoints = drawdowns.map((v, i) => [xOf(i), ddYOf(v)] as const);
  const ddPathD = "M " + ddPoints.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
  const ddAreaD = `${ddPathD} L ${ddPoints[ddPoints.length - 1][0].toFixed(1)},${ddPadT.toFixed(1)} L ${ddPoints[0][0].toFixed(1)},${ddPadT.toFixed(1)} Z`;

  const last = points[points.length - 1];

  return (
    <div style={{ position: "relative" }}>
      <svg viewBox={`0 0 ${w} ${h}`} className="nav-chart" role="img" aria-label="NAV 추이">
        {[0, 0.5, 1].map((f) => {
          const y = padT + plotH * f;
          const value = vmax - (vmax - vmin) * f;
          return (
            <g key={f}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} className="grid-line" />
              <text x={padL - 8} y={y} textAnchor="end" dominantBaseline="middle" className="ink-muted label-sm">
                {fmtMoney(value)}
              </text>
            </g>
          );
        })}
        <path d={areaD} className="nav-area" />
        <path d={pathD} className="nav-line" />
        {points.map(([x, y], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={hover === i ? 6 : 4}
            className="nav-dot"
            onMouseEnter={() => setHover(i)}
            onMouseLeave={() => setHover(null)}
          />
        ))}
        <text x={last[0] + 8} y={last[1] - 8} className="ink-secondary label-sm">
          {fmtMoney(data[data.length - 1].nav)}
        </text>
      </svg>

      <div className="label-sm ink-muted" style={{ marginTop: 2, marginBottom: 2 }}>
        드로다운 (최고점 대비, 최대 {ddMin.toFixed(1)}%)
      </div>
      <svg viewBox={`0 0 ${w} ${ddH}`} width="100%" height={ddH} role="img" aria-label="드로다운">
        <line x1={padL} y1={ddPadT} x2={w - padR} y2={ddPadT} className="grid-line" />
        <path d={ddAreaD} fill="var(--critical)" opacity={0.12} />
        <path d={ddPathD} fill="none" stroke="var(--critical)" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && <circle cx={ddPoints[hover][0]} cy={ddPoints[hover][1]} r={3} fill="var(--critical)" />}
      </svg>

      {hover !== null && (
        <div
          className="ink-primary label-sm"
          style={{
            position: "absolute",
            left: `${(points[hover][0] / w) * 100}%`,
            top: `${(points[hover][1] / h) * 100}%`,
            transform: "translate(-50%, -140%)",
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "4px 8px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {data[hover].date}: {fmtMoney(data[hover].nav)} (DD {drawdowns[hover].toFixed(1)}%)
        </div>
      )}
    </div>
  );
}
