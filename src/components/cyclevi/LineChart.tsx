"use client";

import { useRef, useState } from "react";

// 2026-11-17: /cyclevi 월간 선 그래프(경기 순환변동치·선행지표). 의존성 없는 SVG, 마우스/터치로 값 표시.
export interface Line { label: string; color: string; dash?: string; points: [string, number][] }
export interface Band { from: string; to: string; color: string }

export function LineChart({ lines, bands, refY, height = 220, ariaLabel }: {
  lines: Line[]; bands?: Band[]; refY?: number; height?: number; ariaLabel: string;
}) {
  const box = useRef<SVGSVGElement>(null);
  const [hi, setHi] = useState<number | null>(null);
  const months = Array.from(new Set(lines.flatMap((l) => l.points.map((p) => p[0])))).sort();
  if (!months.length) return <p className="label-sm ink-muted">자료 없음</p>;
  const W = 720, H = height, m = { t: 10, r: 12, b: 22, l: 40 };
  const vals = lines.flatMap((l) => l.points.map((p) => p[1])).concat(refY ?? []);
  let lo = Math.min(...vals), hiV = Math.max(...vals);
  const pad = (hiV - lo) * 0.06 || 1; lo -= pad; hiV += pad;
  const xi = (mo: string) => m.l + (months.indexOf(mo) / Math.max(1, months.length - 1)) * (W - m.l - m.r);
  const y = (v: number) => m.t + (1 - (v - lo) / (hiV - lo)) * (H - m.t - m.b);
  const ticksY = Array.from({ length: 5 }, (_, i) => lo + ((hiV - lo) * i) / 4);
  const yearTicks = months.filter((mo) => mo.endsWith("-01")).filter((_, i, a) => a.length <= 12 || i % 2 === 0);
  const onMove = (e: React.PointerEvent) => {
    const r = box.current?.getBoundingClientRect(); if (!r) return;
    const px = ((e.clientX - r.left) / r.width) * W;
    const i = Math.round(((px - m.l) / (W - m.l - m.r)) * (months.length - 1));
    setHi(Math.max(0, Math.min(months.length - 1, i)));
  };
  const hm = hi === null ? null : months[hi];
  return (
    <div style={{ position: "relative" }}>
      <svg ref={box} viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={ariaLabel}
        onPointerMove={onMove} onPointerDown={onMove} onPointerLeave={() => setHi(null)} style={{ touchAction: "pan-y", display: "block" }}>
        {bands?.map((b, i) => (
          <rect key={i} x={xi(b.from)} y={m.t} width={Math.max(1, xi(b.to) - xi(b.from))} height={H - m.t - m.b} fill={b.color} opacity={0.14} />
        ))}
        {ticksY.map((v, i) => (
          <g key={i}>
            <line x1={m.l} x2={W - m.r} y1={y(v)} y2={y(v)} stroke="var(--gridline)" />
            <text x={m.l - 4} y={y(v) + 3} textAnchor="end" fontSize={10} fill="var(--text-muted)">{v.toFixed(0)}</text>
          </g>
        ))}
        {refY !== undefined && <line x1={m.l} x2={W - m.r} y1={y(refY)} y2={y(refY)} stroke="var(--text-muted)" strokeDasharray="3,3" />}
        {yearTicks.map((mo) => (
          <text key={mo} x={xi(mo)} y={H - 6} textAnchor="middle" fontSize={10} fill="var(--text-muted)">{mo.slice(0, 4)}</text>
        ))}
        {lines.map((l) => (
          <polyline key={l.label} fill="none" stroke={l.color} strokeWidth={1.8} strokeDasharray={l.dash}
            points={l.points.map((p) => `${xi(p[0])},${y(p[1])}`).join(" ")} />
        ))}
        {hm && <line x1={xi(hm)} x2={xi(hm)} y1={m.t} y2={H - m.b} stroke="var(--text-secondary)" strokeWidth={0.8} />}
      </svg>
      {hm && (
        <div className="label-sm" style={{ position: "absolute", top: 4, left: (hi ?? 0) > months.length / 2 ? 48 : undefined, right: (hi ?? 0) > months.length / 2 ? undefined : 16,
          background: "var(--surface-1)", border: "1px solid var(--border)", borderRadius: 6, padding: "4px 8px", pointerEvents: "none" }}>
          <b>{hm}</b>
          {lines.map((l) => { const p = l.points.find((q) => q[0] === hm); return p ? <div key={l.label}><span style={{ color: l.color }}>■</span> {l.label} {p[1].toFixed(1)}</div> : null; })}
          {bands?.filter((b) => b.from <= hm && hm < b.to).map((b, i) => <div key={i} className="ink-muted">{(b as Band & { label?: string }).label}</div>)}
        </div>
      )}
      <div className="label-sm" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 4 }}>
        {lines.map((l) => <span key={l.label}><span style={{ color: l.color }}>━</span> {l.label}</span>)}
      </div>
    </div>
  );
}
