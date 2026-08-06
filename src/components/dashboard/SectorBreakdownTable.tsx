"use client";

import { useState } from "react";
import { Card } from "./Card";
import type { SectorRow, IndexRsRow } from "@/lib/types";

type BarItem = { key: string; label: string; rs: number; isIndex: boolean; sub?: string };

export function SectorBreakdownTable({ rows, indexRs }: { rows: SectorRow[]; indexRs: IndexRsRow[] }) {
  const [showTable, setShowTable] = useState(false);
  const hasData = rows.length > 0 || indexRs.length > 0;

  const items: BarItem[] = [
    ...indexRs.map((r) => ({ key: `idx-${r.label}`, label: r.label, rs: r.rs, isIndex: true })),
    ...rows.map((r, i) => ({ key: `sec-${i}`, label: r.industry, rs: r.avgRs, isIndex: false, sub: r.sector })),
  ].sort((a, b) => b.rs - a.rs);

  const maxRs = Math.max(100, ...items.map((it) => it.rs));

  return (
    <Card title="업종/테마별 집계 (평균RS 기준, 종목수 2개 이상)">
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
              <span style={{ width: 14, height: 10, background: "var(--cat-5)", display: "inline-block", borderRadius: 2 }} />
              지수
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 14, height: 10, background: "var(--series-1)", display: "inline-block", borderRadius: 2 }} />
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
                      background: it.isIndex ? "var(--cat-5)" : "var(--series-1)",
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
