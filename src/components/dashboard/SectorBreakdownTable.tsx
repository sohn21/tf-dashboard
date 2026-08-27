"use client";

import { useState } from "react";
import { Card } from "./Card";
import type { SectorRow, IndexRsRow, SectorBandCounts } from "@/lib/types";

type BarItem = { key: string; label: string; rs: number; isIndex: boolean; sub?: string };

const PHASE_EMOJI: Record<string, string> = {
  "4+": "🟢", "4": "🟢", "5+": "🟩", "5": "🟩", "3": "🟨", "2": "🟨", "1": "⬜", "6": "🟧", "7": "🟥", "0": "⬜",
};

function scoreColor(score: number, b: SectorBandCounts): string {
  if (score >= b.strongThreshold) return "var(--good)";
  if (score >= b.concernThreshold) return "var(--warning)";
  if (score < b.weakThreshold) return "var(--critical)";
  return "var(--text-muted)";
}

export function SectorBreakdownTable({
  rows,
  indexRs,
  bandCounts,
}: {
  rows: SectorRow[];
  indexRs: IndexRsRow[];
  bandCounts?: SectorBandCounts | null;
}) {
  const [showTable, setShowTable] = useState(false);
  const hasData = rows.length > 0 || indexRs.length > 0;
  const chipRows = rows.filter((r) => r.chips && r.chips.length > 0);

  const items: BarItem[] = [
    ...indexRs.map((r) => ({ key: `idx-${r.label}`, label: r.label, rs: r.rs, isIndex: true })),
    ...rows.map((r, i) => ({ key: `sec-${i}`, label: r.industry, rs: r.avgRs, isIndex: false, sub: r.sector })),
  ].sort((a, b) => b.rs - a.rs);

  const maxRs = Math.max(100, ...items.map((it) => it.rs));

  return (
    <Card title="업종/테마별 집계 (평균RS 기준, 종목수 2개 이상)">
      {bandCounts && (
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
          강세(≥{bandCounts.strongThreshold}) <b style={{ color: "var(--good)" }}>{bandCounts.strong}</b> · 관심(
          {bandCounts.concernThreshold}~{bandCounts.strongThreshold}){" "}
          <b style={{ color: "var(--warning)" }}>{bandCounts.watch}</b> · 중립 <b>{bandCounts.mid}</b> · 약세(&lt;
          {bandCounts.weakThreshold}) <b style={{ color: "var(--critical)" }}>{bandCounts.weak}</b>
        </div>
      )}

      {bandCounts && chipRows.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div className="ink-muted" style={{ fontSize: 11, margin: "2px 0 4px" }}>
            RS 상위 {chipRows.length}개 업종 · 칩 = 구성종목 (P=phase, ▲=RS가속)
          </div>
          {chipRows.map((r, i) => (
            <div
              key={i}
              style={{ padding: "6px 0", borderBottom: "1px dashed var(--border)" }}
            >
              <div style={{ fontSize: 12.5, marginBottom: 3 }}>
                <b>{r.industry}</b>{" "}
                <span className="ink-muted">
                  {r.sector} · {r.count}종목 · 평균RS {r.avgRs.toFixed(0)} · 점수{" "}
                  <span style={{ color: scoreColor(r.avgScore, bandCounts) }}>{r.avgScore.toFixed(1)}</span>
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {r.chips!.map((c) => (
                  <span
                    key={c.sym}
                    style={{
                      border: "1px solid var(--border)",
                      borderRadius: 5,
                      padding: "2px 7px",
                      fontSize: 11.5,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {PHASE_EMOJI[c.phase] ?? ""}
                    {c.sym} <span className="ink-muted">P{c.phase} RS{c.rs.toFixed(0)}{c.accel ? " ▲" : ""}</span>
                  </span>
                ))}
                {r.chipsMore ? <span className="ink-muted" style={{ fontSize: 11 }}>+{r.chipsMore}개</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button className="view-toggle-btn" onClick={() => setShowTable((v) => !v)}>
          {showTable ? "차트로 보기" : "표로 보기"}
        </button>
      </div>

      {!hasData ? (
        <p className="ink-muted">집계할 업종 데이터 없음</p>
      ) : showTable ? (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>섹터</th>
                <th>업종</th>
                <th>종목수</th>
                <th>평균RS</th>
                <th>평균점수</th>
                <th>테마주도</th>
                <th>게이트통과</th>
              </tr>
            </thead>
            <tbody>
              {indexRs.map((r) => (
                <tr key={r.label}>
                  <td className="ink-secondary">지수</td>
                  <td className="ink-primary">{r.label}</td>
                  <td className="tabular ink-secondary">-</td>
                  <td className="tabular ink-primary">{r.rs.toFixed(1)}</td>
                  <td className="tabular ink-secondary">-</td>
                  <td className="gate-cell">-</td>
                  <td className="tabular ink-secondary">-</td>
                </tr>
              ))}
              {rows.map((r, i) => (
                <tr key={i}>
                  <td className="ink-secondary">{r.sector}</td>
                  <td className="ink-primary">{r.industry}</td>
                  <td className="tabular ink-secondary">{r.count}</td>
                  <td className="tabular ink-primary">{r.avgRs.toFixed(1)}</td>
                  <td className="tabular ink-secondary">{r.avgScore.toFixed(1)}</td>
                  <td className={`gate-cell ${r.leading ? "gate-pass" : "gate-fail"}`}>{r.leading ? "✓" : "✗"}</td>
                  <td className="tabular ink-secondary">{r.passed}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 16, fontSize: 12, marginBottom: 10 }} className="ink-secondary">
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 14, height: 10, background: "var(--series-1)", display: "inline-block", borderRadius: 2 }} />
              지수
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 14, height: 10, background: "var(--text-secondary)", display: "inline-block", borderRadius: 2 }} />
              업종 평균 RS (종목수 2개 이상)
            </span>
          </div>
          <div>
            {items.map((it) => (
              <div className="hbar-row" key={it.key} title={it.sub ? `${it.sub} · ${it.label}` : it.label}>
                <div className={`hbar-label ${it.isIndex ? "ink-primary" : "ink-secondary"}`} style={it.isIndex ? { fontWeight: 600 } : undefined}>
                  {it.label}
                </div>
                <div className="hbar-track">
                  <div
                    className="hbar-fill"
                    style={{
                      width: `${Math.max((it.rs / maxRs) * 100, 1.5)}%`,
                      background: it.isIndex ? "var(--series-1)" : "var(--text-secondary)",
                    }}
                  />
                </div>
                <div className="hbar-value ink-primary">{it.rs.toFixed(1)}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
