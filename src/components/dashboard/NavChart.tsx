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
  const padB = 28;
  const plotW = w - padL - padR;
  const plotH = h - padT - padB;

  const values = data.map((d) => d.nav);
  let vmin = Math.min(...values);
  let vmax = Math.max(...values);
  if (vmax === vmin) {
    vmin -= 1;
    vmax += 1;
  }

  const n = data.length;
  const xOf = (i: number) => (n === 1 ? padL : padL + (plotW * i) / (n - 1));
  const yOf = (v: number) => padT + plotH * (1 - (v - vmin) / (vmax - vmin));

  const points = data.map((d, i) => [xOf(i), yOf(d.nav)] as const);
  const pathD = "M " + points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
  const areaD = `${pathD} L ${points[points.length - 1][0].toFixed(1)},${(padT + plotH).toFixed(1)} L ${points[0][0].toFixed(1)},${(padT + plotH).toFixed(1)} Z`;

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
          {data[hover].date}: {fmtMoney(data[hover].nav)}
        </div>
      )}
    </div>
  );
}
