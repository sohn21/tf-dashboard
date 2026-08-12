"use client";

import { useState } from "react";
import { Card } from "./Card";
import type { CandlePoint } from "@/lib/types";

const TICKER_ORDER = ["SPY", "QQQ", "TQQQ", "GLD", "BTC-USD"];
const TICKER_LABEL: Record<string, string> = {
  SPY: "SPY", QQQ: "QQQ", TQQQ: "TQQQ", GLD: "GLD", "BTC-USD": "BTC-USD",
};

function MiniCandlestick({ ticker, points }: { ticker: string; points: CandlePoint[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const w = 260, h = 150, padL = 40, padR = 8, padT = 10, padB = 18;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const n = points.length;

  if (n === 0) {
    return (
      <div>
        <div className="candle-cell-title">{TICKER_LABEL[ticker] ?? ticker}</div>
        <p className="ink-muted" style={{ fontSize: 12 }}>데이터 없음</p>
      </div>
    );
  }

  const lows = points.map((p) => p.low);
  const highs = points.map((p) => p.high);
  const vMin = Math.min(...lows);
  const vMax = Math.max(...highs);
  const pad = (vMax - vMin) * 0.06 || vMax * 0.02;
  const vLo = vMin - pad, vHi = vMax + pad;

  const xOf = (i: number) => (n === 1 ? padL + plotW / 2 : padL + (plotW * i) / (n - 1));
  const yOf = (v: number) => padT + plotH * (1 - (v - vLo) / (vHi - vLo));
  const bodyW = Math.max((plotW / n) * 0.6, 1.2);

  const last = points[n - 1];
  const first = points[0];
  const retPct = ((last.close / first.close - 1) * 100);
  const retCls = retPct >= 0 ? "delta-good" : "delta-critical";

  const yTicks = [vLo + (vHi - vLo) * 0.25, vLo + (vHi - vLo) * 0.75];

  const handleMove: React.MouseEventHandler<SVGRectElement> = (e) => {
    const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
    const scaleX = w / rect.width;
    const localX = (e.clientX - rect.left) * scaleX;
    let i = Math.round(((localX - padL) / plotW) * (n - 1));
    i = Math.max(0, Math.min(n - 1, i));
    setHover(i);
  };

  const hp = hover != null ? points[hover] : null;

  return (
    <div>
      <div className="candle-cell-title">{TICKER_LABEL[ticker] ?? ticker}</div>
      <div style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>
        {last.close.toLocaleString(undefined, { maximumFractionDigits: 2 })}{" "}
        <span className={retCls}>
          {retPct >= 0 ? "+" : ""}
          {retPct.toFixed(1)}%
        </span>
      </div>
      <div style={{ position: "relative" }}>
        <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} role="img" aria-label={`${ticker} 일봉 차트`}>
          {yTicks.map((v) => (
            <g key={v}>
              <line x1={padL} y1={yOf(v)} x2={w - padR} y2={yOf(v)} className="grid-line" />
              <text x={padL - 6} y={yOf(v) + 3} textAnchor="end" className="ink-muted label-sm">
                {v.toLocaleString(undefined, { maximumFractionDigits: v >= 1000 ? 0 : 1 })}
              </text>
            </g>
          ))}
          <text x={padL} y={h - 4} textAnchor="start" className="ink-muted label-sm">
            {first.date.slice(5)}
          </text>
          <text x={w - padR} y={h - 4} textAnchor="end" className="ink-muted label-sm">
            {last.date.slice(5)}
          </text>
          {points.map((p, i) => {
            const up = p.close >= p.open;
            const color = up ? "var(--good)" : "var(--critical)";
            const x = xOf(i);
            const bodyTop = yOf(Math.max(p.open, p.close));
            const bodyBottom = yOf(Math.min(p.open, p.close));
            const bodyH = Math.max(bodyBottom - bodyTop, 1);
            return (
              <g key={p.date}>
                <line x1={x} y1={yOf(p.high)} x2={x} y2={yOf(p.low)} stroke={color} strokeWidth={1} />
                <rect x={x - bodyW / 2} y={bodyTop} width={bodyW} height={bodyH} fill={color} />
              </g>
            );
          })}
          {hover != null && (
            <line x1={xOf(hover)} y1={padT} x2={xOf(hover)} y2={padT + plotH} stroke="var(--text-muted)" strokeWidth={1} strokeDasharray="3 3" />
          )}
          <rect x={padL} y={padT} width={plotW} height={plotH} fill="transparent" style={{ cursor: "crosshair" }} onMouseMove={handleMove} onMouseLeave={() => setHover(null)} />
        </svg>
        {hp && (
          <div
            className="ink-primary label-sm"
            style={{
              position: "absolute",
              left: `${(xOf(hover!) / w) * 100}%`,
              top: 0,
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
            <div style={{ fontWeight: 600, marginBottom: 2 }}>{hp.date}</div>
            <div className="ink-secondary">
              O {hp.open.toFixed(2)} · H {hp.high.toFixed(2)} · L {hp.low.toFixed(2)} · C {hp.close.toFixed(2)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function BenchmarkCandlesGrid({ candles }: { candles: Record<string, CandlePoint[]> | undefined }) {
  if (!candles) return null;
  const hasAny = TICKER_ORDER.some((t) => (candles[t]?.length ?? 0) > 0);
  return (
    <Card title="벤치마크 일봉 차트 (6개월)">
      {!hasAny ? (
        <p className="ink-muted">데이터 없음</p>
      ) : (
        <div className="candle-grid">
          {TICKER_ORDER.map((t) => (
            <MiniCandlestick key={t} ticker={t} points={candles[t] ?? []} />
          ))}
        </div>
      )}
    </Card>
  );
}
