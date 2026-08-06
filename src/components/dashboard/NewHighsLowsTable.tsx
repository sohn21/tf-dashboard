"use client";

import { useMemo, useState } from "react";
import { Card } from "./Card";
import type { NewHighLowRow } from "@/lib/types";

const PALETTE = ["var(--cat-1)", "var(--cat-2)", "var(--cat-3)", "var(--cat-4)", "var(--cat-5)", "var(--cat-6)", "var(--cat-7)", "var(--cat-8)"];
const MAX_SLICES = PALETTE.length; // 8슬롯 넘는 섹터는 "기타"로 병합(dataviz 스킬 non-negotiable)
const OTHER_LABEL = "기타";

type Segment = { sector: string; count: number; color: string };

function buildSectorOrder(rows: NewHighLowRow[]): string[] {
  const counts = new Map<string, number>();
  for (const r of rows) counts.set(r.sector, (counts.get(r.sector) ?? 0) + 1);
  const sorted = [...counts.entries()].sort((a, b) => (b[1] !== a[1] ? b[1] - a[1] : a[0].localeCompare(b[0])));
  if (sorted.length <= MAX_SLICES) return sorted.map(([sector]) => sector);
  // 상위 (MAX_SLICES - 1)개만 개별 슬롯, 나머지는 "기타"로 병합해 8슬롯 유지
  return [...sorted.slice(0, MAX_SLICES - 1).map(([sector]) => sector), OTHER_LABEL];
}

function segmentsFor(rows: NewHighLowRow[], kind: "신고가" | "신저가", sectorOrder: string[], colorOf: (s: string) => string): Segment[] {
  const counts = new Map<string, number>();
  for (const r of rows) {
    if (r.kind !== kind) continue;
    const bucket = sectorOrder.includes(r.sector) ? r.sector : OTHER_LABEL;
    counts.set(bucket, (counts.get(bucket) ?? 0) + 1);
  }
  return sectorOrder.filter((s) => counts.has(s)).map((sector) => ({ sector, count: counts.get(sector)!, color: colorOf(sector) }));
}

function Donut({ segments, total, centerLabel, onHoverSector }: { segments: Segment[]; total: number; centerLabel: string; onHoverSector: (s: string | null) => void }) {
  const cx = 100, cy = 100, r = 74, sw = 28;
  const circumference = 2 * Math.PI * r;
  const gap = 3;
  let offset = 0;

  return (
    <div className="donut-wrap">
      <svg viewBox="0 0 200 200" width={200} height={200}>
        {segments.map((seg) => {
          const rawLen = (seg.count / total) * circumference;
          const len = Math.max(rawLen - gap, 1);
          const dashoffset = -offset;
          offset += rawLen;
          return (
            <circle
              key={seg.sector}
              className="donut-arc"
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={sw}
              strokeDasharray={`${len} ${circumference - len}`}
              strokeDashoffset={dashoffset}
              transform={`rotate(-90 ${cx} ${cy})`}
              onMouseEnter={() => onHoverSector(seg.sector)}
              onMouseLeave={() => onHoverSector(null)}
            />
          );
        })}
      </svg>
      <div className="donut-center">
        <div className="n">{total}</div>
        <div className="lbl">{centerLabel}</div>
      </div>
    </div>
  );
}

function Legend({ segments, total, hovered, onHoverSector }: { segments: Segment[]; total: number; hovered: string | null; onHoverSector: (s: string | null) => void }) {
  return (
    <div className="donut-legend">
      {segments.map((seg) => (
        <div
          key={seg.sector}
          className="donut-legend-row"
          style={{ opacity: hovered && hovered !== seg.sector ? 0.4 : 1 }}
          onMouseEnter={() => onHoverSector(seg.sector)}
          onMouseLeave={() => onHoverSector(null)}
        >
          <span className="donut-swatch" style={{ background: seg.color }} />
          <span className="donut-legend-name">{seg.sector}</span>
          <span className="donut-legend-count">{seg.count}</span>
          <span className="donut-legend-pct">{((seg.count / total) * 100).toFixed(0)}%</span>
        </div>
      ))}
    </div>
  );
}

export function NewHighsLowsTable({ rows }: { rows: NewHighLowRow[] }) {
  const [showTable, setShowTable] = useState(false);
  const [hoveredNH, setHoveredNH] = useState<string | null>(null);
  const [hoveredNL, setHoveredNL] = useState<string | null>(null);

  const nhRows = useMemo(() => rows.filter((r) => r.kind === "신고가"), [rows]);
  const nlRows = useMemo(() => rows.filter((r) => r.kind === "신저가"), [rows]);

  const sectorOrder = useMemo(() => buildSectorOrder(rows), [rows]);
  const colorOf = useMemo(() => {
    const map = new Map(sectorOrder.map((s, i) => [s, PALETTE[i % PALETTE.length]]));
    return (sector: string) => map.get(sector) ?? PALETTE[PALETTE.length - 1];
  }, [sectorOrder]);

  const nhSegments = useMemo(() => segmentsFor(rows, "신고가", sectorOrder, colorOf), [rows, sectorOrder, colorOf]);
  const nlSegments = useMemo(() => segmentsFor(rows, "신저가", sectorOrder, colorOf), [rows, sectorOrder, colorOf]);

  const bySector = useMemo(() => {
    const map = new Map<string, { nh: NewHighLowRow[]; nl: NewHighLowRow[] }>();
    for (const r of rows) {
      const bucket = sectorOrder.includes(r.sector) ? r.sector : OTHER_LABEL;
      if (!map.has(bucket)) map.set(bucket, { nh: [], nl: [] });
      const entry = map.get(bucket)!;
      if (r.kind === "신고가") entry.nh.push(r);
      else entry.nl.push(r);
    }
    return [...map.entries()].sort((a, b) => b[1].nh.length + b[1].nl.length - (a[1].nh.length + a[1].nl.length));
  }, [rows, sectorOrder]);

  return (
    <Card title="오늘 52주 신고가/신저가 종목 (섹터별)">
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button className="view-toggle-btn" onClick={() => setShowTable((v) => !v)}>
          {showTable ? "차트로 보기" : "표로 보기"}
        </button>
      </div>

      {rows.length === 0 ? (
        <p className="ink-muted">오늘 52주 신고가/신저가 종목 없음</p>
      ) : showTable ? (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>구분</th>
                <th>티커</th>
                <th>섹터</th>
                <th>업종</th>
                <th>종가</th>
                <th>RS</th>
                <th>200MA 이격</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const overheated = (r.extensionPct200sma ?? 0) >= 70;
                return (
                  <tr key={i}>
                    <td className={r.kind === "신고가" ? "delta-good" : "delta-critical"}>{r.kind}</td>
                    <td className="ink-primary">{r.ticker}</td>
                    <td className="ink-secondary">{r.sector}</td>
                    <td className="ink-secondary">{r.industry}</td>
                    <td className="tabular ink-secondary">{r.close.toFixed(2)}</td>
                    <td className="tabular ink-primary">{r.rsRating.toFixed(1)}</td>
                    <td className={`tabular ${overheated ? "delta-critical" : "ink-secondary"}`}>
                      {r.extensionPct200sma != null ? `${r.extensionPct200sma >= 0 ? "+" : ""}${r.extensionPct200sma.toFixed(0)}%` : "-"}
                      {overheated ? " ⚠과열" : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="donut-grid">
            <div>
              <div className="label-sm ink-secondary" style={{ marginBottom: 8 }}>
                신고가 섹터별 분포 ({nhRows.length}종목)
              </div>
              {nhRows.length === 0 ? (
                <p className="ink-muted">오늘 신고가 종목 없음</p>
              ) : (
                <>
                  <Donut segments={nhSegments} total={nhRows.length} centerLabel="신고가" onHoverSector={setHoveredNH} />
                  <Legend segments={nhSegments} total={nhRows.length} hovered={hoveredNH} onHoverSector={setHoveredNH} />
                </>
              )}
            </div>
            <div>
              <div className="label-sm ink-secondary" style={{ marginBottom: 8 }}>
                신저가 섹터별 분포 ({nlRows.length}종목)
              </div>
              {nlRows.length === 0 ? (
                <p className="ink-muted">오늘 신저가 종목 없음</p>
              ) : (
                <>
                  <Donut segments={nlSegments} total={nlRows.length} centerLabel="신저가" onHoverSector={setHoveredNL} />
                  <Legend segments={nlSegments} total={nlRows.length} hovered={hoveredNL} onHoverSector={setHoveredNL} />
                </>
              )}
            </div>
          </div>

          <div className="ticker-details" style={{ marginTop: 16, paddingTop: 4, borderTop: "1px solid var(--gridline)" }}>
            {bySector.map(([sector, { nh, nl }]) => (
              <details key={sector}>
                <summary>
                  <span className="caret">▶</span>
                  <strong className="ink-primary">{sector}</strong>
                  <span className="ink-muted">
                    — 신고가 {nh.length} · 신저가 {nl.length}
                  </span>
                </summary>
                <div className="ticker-chips">
                  {nh.map((r) => (
                    <span key={r.ticker} className="ticker-chip delta-good">
                      {r.ticker}
                    </span>
                  ))}
                  {nl.map((r) => (
                    <span key={r.ticker} className="ticker-chip delta-critical">
                      {r.ticker}
                    </span>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
