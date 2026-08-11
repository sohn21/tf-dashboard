"use client";

import { useState } from "react";
import type { NavPoint } from "@/lib/types";

const fmtMoney = (x: number) => `$${x.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

const BENCHMARK_STYLE: Record<"spy" | "qqq" | "tqqq" | "gld" | "btc-usd", { label: string; color: string; dashed: boolean }> = {
  spy: { label: "SPY", color: "#8a8a86", dashed: false },
  qqq: { label: "QQQ", color: "#2a78d6", dashed: false },
  tqqq: { label: "TQQQ", color: "#c07a3e", dashed: true },
  gld: { label: "GLD", color: "#b8860b", dashed: false },
  "btc-usd": { label: "BTC", color: "#8a5cf6", dashed: false },
};

export function NavChart({ data }: { data: NavPoint[] }) {
  const [hover, setHover] = useState<number | null>(null);

  if (data.length === 0) {
    return <p className="ink-muted">NAV 기록 없음</p>;
  }

  // tfbook/briefing_chartdecks 아이디어(2026-08-08, §16-A) — SPY/QQQ/TQQQ를 NAV 시작값과
  // 같은 달러 기준으로 리베이스해 오버레이. 전 구간에 값이 있는 시리즈만(중간 결측 시 생략).
  const benchmarkKeys = (Object.keys(BENCHMARK_STYLE) as Array<keyof typeof BENCHMARK_STYLE>).filter((key) =>
    data.every((d) => d[key] != null)
  );
  const navStart = data[0].nav;
  const benchmarkSeries: Record<string, number[]> = {};
  for (const key of benchmarkKeys) {
    const start = data[0][key]!;
    benchmarkSeries[key] = data.map((d) => (d[key]! / start) * navStart);
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
  const allSeriesValues = [values, ...Object.values(benchmarkSeries)].flat() as number[];
  let vmin = Math.min(...allSeriesValues);
  let vmax = Math.max(...allSeriesValues);
  if (vmax === vmin) {
    vmin -= 1;
    vmax += 1;
  }

  const drawdownsOf = (series: number[]) => {
    let runningMax = -Infinity;
    return series.map((v) => {
      runningMax = Math.max(runningMax, v);
      return (v / runningMax - 1) * 100;
    });
  };
  const drawdowns = drawdownsOf(values);
  const benchmarkDrawdowns: Record<string, number[]> = {};
  for (const key of benchmarkKeys) benchmarkDrawdowns[key] = drawdownsOf(benchmarkSeries[key]!);
  const ddMin = Math.min(...drawdowns, ...Object.values(benchmarkDrawdowns).flat(), 0);

  const n = data.length;
  const xOf = (i: number) => (n === 1 ? padL : padL + (plotW * i) / (n - 1));
  const yOf = (v: number) => padT + plotH * (1 - (v - vmin) / (vmax - vmin));
  const ddYOf = (v: number) => ddPadT + (ddMin === 0 ? 0 : ddPlotH * (v / ddMin));

  const pathOf = (series: number[], y: (v: number) => number) => {
    const pts = series.map((v, i) => [xOf(i), y(v)] as const);
    return { pts, d: "M " + pts.map(([x, y2]) => `${x.toFixed(1)},${y2.toFixed(1)}`).join(" L ") };
  };

  const { pts: points, d: pathD } = pathOf(values, yOf);
  const areaD = `${pathD} L ${points[points.length - 1][0].toFixed(1)},${(padT + plotH).toFixed(1)} L ${points[0][0].toFixed(1)},${(padT + plotH).toFixed(1)} Z`;
  const benchmarkPaths = benchmarkKeys.map((key) => ({ key, ...pathOf(benchmarkSeries[key]!, yOf) }));

  const { pts: ddPoints, d: ddPathD } = pathOf(drawdowns, ddYOf);
  const ddAreaD = `${ddPathD} L ${ddPoints[ddPoints.length - 1][0].toFixed(1)},${ddPadT.toFixed(1)} L ${ddPoints[0][0].toFixed(1)},${ddPadT.toFixed(1)} Z`;
  const benchmarkDdPaths = benchmarkKeys.map((key) => ({ key, ...pathOf(benchmarkDrawdowns[key]!, ddYOf) }));

  const last = points[points.length - 1];
  const returnPct = (series: number[]) => ((series[series.length - 1] / series[0] - 1) * 100).toFixed(1);

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
        {benchmarkPaths.map(({ key, d }) => {
          const style = BENCHMARK_STYLE[key as keyof typeof BENCHMARK_STYLE];
          return (
            <path
              key={key}
              d={d}
              fill="none"
              stroke={style.color}
              strokeWidth={1.4}
              strokeDasharray={style.dashed ? "5,3" : undefined}
              opacity={0.85}
            />
          );
        })}
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

      {benchmarkKeys.length > 0 && (
        <div className="label-sm ink-secondary" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 4 }}>
          <span>
            <span style={{ display: "inline-block", width: 12, borderTop: "1.4px solid var(--series-1)", marginRight: 4 }} />
            NAV <b className="tabular">{returnPct(values)}%</b>
          </span>
          {benchmarkKeys.map((key) => {
            const style = BENCHMARK_STYLE[key as keyof typeof BENCHMARK_STYLE];
            return (
              <span key={key}>
                <span
                  style={{
                    display: "inline-block",
                    width: 12,
                    borderTop: `1.4px ${style.dashed ? "dashed" : "solid"} ${style.color}`,
                    marginRight: 4,
                  }}
                />
                {style.label} <b className="tabular">{returnPct(benchmarkSeries[key]!)}%</b>
              </span>
            );
          })}
        </div>
      )}

      <div className="label-sm ink-muted" style={{ marginTop: 6, marginBottom: 2 }}>
        드로다운 (최고점 대비, 최대 {ddMin.toFixed(1)}%)
      </div>
      <svg viewBox={`0 0 ${w} ${ddH}`} width="100%" height={ddH} role="img" aria-label="드로다운">
        <line x1={padL} y1={ddPadT} x2={w - padR} y2={ddPadT} className="grid-line" />
        {benchmarkDdPaths.map(({ key, d }) => {
          const style = BENCHMARK_STYLE[key as keyof typeof BENCHMARK_STYLE];
          return (
            <path
              key={key}
              d={d}
              fill="none"
              stroke={style.color}
              strokeWidth={1.2}
              strokeDasharray={style.dashed ? "5,3" : undefined}
              opacity={0.75}
            />
          );
        })}
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
