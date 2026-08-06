"use client";

import { useState } from "react";
import { Card } from "./Card";
import type { DaTrendPoint } from "@/lib/types";

function LinePanel({
  title,
  data,
  ddKey,
  rdKey,
}: {
  title: string;
  data: DaTrendPoint[];
  ddKey: "gspcDd" | "ixicDd";
  rdKey: "gspcRd" | "ixicRd";
}) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 700, h = 200, padL = 30, padR = 16, padT = 12, padB = 24;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const n = data.length;
  const vmax = Math.max(...data.map((d) => Math.max(d[ddKey], d[rdKey]))) + 1;

  const xOf = (i: number) => (n === 1 ? padL : padL + (plotW * i) / (n - 1));
  const yOf = (v: number) => padT + plotH * (1 - v / vmax);

  const yTicks = [0, Math.round(vmax / 2), vmax];
  const xTickCount = Math.min(6, n);
  const xTicks = Array.from({ length: xTickCount }, (_, k) => Math.round((k / (xTickCount - 1)) * (n - 1)));

  const pathOf = (key: "gspcDd" | "ixicDd" | "gspcRd" | "ixicRd") =>
    "M " + data.map((d, i) => `${xOf(i).toFixed(1)},${yOf(d[key]).toFixed(1)}`).join(" L ");

  const handleMove: React.MouseEventHandler<SVGRectElement> = (e) => {
    const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const scaleX = w / rect.width;
    const localX = (e.clientX - rect.left) * scaleX;
    let i = Math.round(((localX - padL) / plotW) * (n - 1));
    i = Math.max(0, Math.min(n - 1, i));
    setHover(i);
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <div className="label-sm ink-secondary" style={{ marginBottom: 8 }}>
        {title}
      </div>
      <div style={{ position: "relative" }}>
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label={`${title} D/A 추이`}>
          {yTicks.map((v) => {
            const y = yOf(v);
            return (
              <g key={v}>
                <line x1={padL} y1={y} x2={w - padR} y2={y} className="grid-line" />
                <text x={padL - 6} y={y + 3} textAnchor="end" className="ink-muted label-sm">
                  {v}
                </text>
              </g>
            );
          })}
          {xTicks.map((i) => (
            <text key={i} x={xOf(i)} y={h - 6} textAnchor="middle" className="ink-muted label-sm">
              {data[i].date.slice(5)}
            </text>
          ))}
          <path d={pathOf(ddKey)} fill="none" stroke="var(--critical)" strokeWidth={2} />
          <path d={pathOf(rdKey)} fill="none" stroke="var(--good)" strokeWidth={2} />
          {hover !== null && (
            <>
              <line x1={xOf(hover)} y1={padT} x2={xOf(hover)} y2={padT + plotH} stroke="var(--text-muted)" strokeWidth={1} strokeDasharray="3 3" />
              <circle cx={xOf(hover)} cy={yOf(data[hover][ddKey])} r={4} fill="var(--surface-1)" stroke="var(--critical)" strokeWidth={2} />
              <circle cx={xOf(hover)} cy={yOf(data[hover][rdKey])} r={4} fill="var(--surface-1)" stroke="var(--good)" strokeWidth={2} />
            </>
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
              padding: "4px 8px",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            {data[hover].date} · DD {data[hover][ddKey]} · RD {data[hover][rdKey]}
          </div>
        )}
      </div>
    </div>
  );
}

export function DaTrendCard({ data }: { data: DaTrendPoint[] }) {
  return (
    <Card title="Distribution Day / Rally Day 추이 (3개월)">
      {data.length === 0 ? (
        <p className="ink-muted">데이터 없음</p>
      ) : (
        <>
          <div style={{ display: "flex", gap: 16, fontSize: 12 }} className="ink-secondary">
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 14, height: 2, background: "var(--critical)", display: "inline-block", borderRadius: 1 }} />
              Distribution Day
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 14, height: 2, background: "var(--good)", display: "inline-block", borderRadius: 1 }} />
              Rally Day
            </span>
          </div>
          <div style={{ marginTop: 10 }}>
            <LinePanel title="S&P500 (^GSPC)" data={data} ddKey="gspcDd" rdKey="gspcRd" />
            <LinePanel title="나스닥 (^IXIC)" data={data} ddKey="ixicDd" rdKey="ixicRd" />
          </div>
          <div className="label-sm ink-muted" style={{ marginTop: 4 }}>
            25영업일 롤링 카운트. 2026-07-22 이전 구간은 과거 가격으로 역산 백필(±1 오차 가능).
          </div>
        </>
      )}
    </Card>
  );
}
