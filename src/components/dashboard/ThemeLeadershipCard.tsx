"use client";

import { useState } from "react";
import { Card } from "./Card";
import type { ThemeLeadership, ThemeLeadershipPoint } from "@/lib/types";

function LeadershipChart({ points, bandLo, bandHi }: { points: ThemeLeadershipPoint[]; bandLo: number; bandHi: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 760, h = 220, padL = 34, padR = 16, padT = 12, padB = 24;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const n = points.length;

  const values = points.map((p) => p.nLeading);
  const vmax = Math.max(...values, bandHi) * 1.1 || 1;
  const vmin = 0;

  const xOf = (i: number) => (n === 1 ? padL : padL + (plotW * i) / (n - 1));
  const yOf = (v: number) => padT + plotH * (1 - (v - vmin) / (vmax - vmin));

  const linePoints = points.map((p, i) => [xOf(i), yOf(p.nLeading)] as const);
  const pathD = "M " + linePoints.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");

  const yTicks = [0, Math.round(vmax / 2), Math.round(vmax)];
  const xTickCount = Math.min(6, n);
  const xTicks = Array.from({ length: xTickCount }, (_, k) => Math.round((k / (xTickCount - 1)) * (n - 1)));

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
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label="리딩 테마 개수 추이">
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={padL} y1={yOf(v)} x2={w - padR} y2={yOf(v)} className="grid-line" />
            <text x={padL - 6} y={yOf(v) + 3} textAnchor="end" className="ink-muted label-sm">
              {v}
            </text>
          </g>
        ))}
        {xTicks.map((i) => (
          <text key={i} x={xOf(i)} y={h - 6} textAnchor="middle" className="ink-muted label-sm">
            {points[i].date.slice(5)}
          </text>
        ))}
        {/* 정상 대역(최근 3개월 25~75퍼센타일) */}
        <rect x={padL} y={yOf(bandHi)} width={plotW} height={Math.max(yOf(bandLo) - yOf(bandHi), 0)} fill="var(--series-1)" opacity={0.08} />
        <line x1={padL} y1={yOf(bandHi)} x2={w - padR} y2={yOf(bandHi)} stroke="var(--series-1)" strokeWidth={1} strokeDasharray="4 3" opacity={0.4} />
        <line x1={padL} y1={yOf(bandLo)} x2={w - padR} y2={yOf(bandLo)} stroke="var(--series-1)" strokeWidth={1} strokeDasharray="4 3" opacity={0.4} />

        <path d={pathD} fill="none" stroke="var(--series-1)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        {hover !== null && (
          <>
            <line x1={xOf(hover)} y1={padT} x2={xOf(hover)} y2={padT + plotH} stroke="var(--text-muted)" strokeWidth={1} strokeDasharray="3 3" />
            <circle cx={linePoints[hover][0]} cy={linePoints[hover][1]} r={4} fill="var(--surface-1)" stroke="var(--series-1)" strokeWidth={2} />
          </>
        )}
        <rect x={padL} y={padT} width={plotW} height={plotH} fill="transparent" style={{ cursor: "crosshair" }} onMouseMove={handleMove} onMouseLeave={() => setHover(null)} />
      </svg>
      {hover !== null && (
        <div
          className="ink-primary label-sm"
          style={{
            position: "absolute",
            left: `${(linePoints[hover][0] / w) * 100}%`,
            top: `${(linePoints[hover][1] / h) * 100}%`,
            transform: "translate(-50%, -140%)",
            background: "var(--surface-1)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            padding: "4px 8px",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          {points[hover].date}: {points[hover].nLeading}개 / 전체 {points[hover].nTotal}개
        </div>
      )}
    </div>
  );
}

export function ThemeLeadershipCard({ data }: { data: ThemeLeadership | null }) {
  const today = data && data.points.length ? data.points[data.points.length - 1] : null;
  let interp = "";
  if (today && data) {
    const v = today.nLeading;
    if (v >= data.bandHi) interp = `Leading 테마 ${v}개 — 밴드 상단 이상 · 폭 넓은 주도(broad leadership)`;
    else if (v >= data.bandLo) interp = `Leading 테마 ${v}개 — 정상 범위(25~75 pct) 안 · 보통`;
    else interp = `Leading 테마 ${v}개 — 밴드 하단 이하 · 주도 폭 좁음, 취약한 상승`;
  }
  return (
    <Card title="리딩 테마 개수 추이 (3개월)">
      {!data || data.points.length === 0 ? (
        <p className="ink-muted">데이터 없음</p>
      ) : (
        <>
          <div className="label-sm ink-muted" style={{ marginBottom: 4 }}>
            업종 평균 점수 ≥60(강세 컷) 넘는 업종 수 — 점선/음영은 최근 3개월 25~75퍼센타일 대역
            ({data.bandLo}~{data.bandHi}개)
          </div>
          {interp && (
            <div
              style={{ fontSize: 12, marginBottom: 8 }}
              className={today && today.nLeading >= data.bandLo ? "ink-secondary" : "delta-critical"}
            >
              {interp}
            </div>
          )}
          <LeadershipChart points={data.points} bandLo={data.bandLo} bandHi={data.bandHi} />
        </>
      )}
    </Card>
  );
}
