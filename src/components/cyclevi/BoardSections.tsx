"use client";

import { useState } from "react";
import { LineChart, type Band } from "./LineChart";
import type { CycleviBoard, CycleviRow } from "@/lib/types";

// 2026-11-17: 시클리컬 보드(Claude Artifact)와 같은 내용을 Vercel /cyclevi 에 — 표시 전용, 매매 규칙과 무관.
const n0 = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 }));
const d2 = (v: unknown, d = 2) => (v === null || v === undefined || v === "" ? "—" : Number(v).toFixed(d));
const pct = (v: unknown) => (v === null || v === undefined ? "—" : `${Number(v) > 0 ? "+" : ""}${Number(v).toFixed(1)}%`);
const cls = (v: unknown) => (v === null || v === undefined ? "" : Number(v) > 1 ? "delta-good" : Number(v) < -1 ? "delta-critical" : "");
const PHASE_COLOR: Record<string, string> = { 회복: "var(--cat-1)", 호황: "var(--good)", 후퇴: "var(--warning)", 불황: "var(--critical)" };

export function MacroChart({ b }: { b: CycleviBoard }) {
  const bands: (Band & { label: string })[] = [];
  for (let i = 0; i < b.macro.length; i++) {
    const r = b.macro[i], nx = b.macro[i + 1];
    const last = bands.at(-1);
    if (last && last.label === r.phase + "기") last.to = nx?.month ?? r.month;
    else bands.push({ from: r.month, to: nx?.month ?? r.month, color: PHASE_COLOR[r.phase] ?? "transparent", label: r.phase + "기" });
  }
  return (
    <>
      <LineChart ariaLabel="선행·동행지수 순환변동치 월간 추이와 선행 기준 국면" refY={100} bands={bands}
        lines={[
          { label: "선행지수 순환변동치", color: "var(--cat-1)", points: b.macro.map((r) => [r.month, r.leading]) },
          { label: "동행지수 순환변동치", color: "var(--cat-5)", dash: "5,3", points: b.macro.map((r) => [r.month, r.coincident]) },
        ]} />
      <div className="label-sm ink-muted" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {Object.entries(PHASE_COLOR).map(([k, c]) => <span key={k}><span style={{ background: c, opacity: 0.35, display: "inline-block", width: 12, height: 10 }} /> {k}</span>)}
      </div>
      <p className="label-sm ink-muted" style={{ lineHeight: 1.6 }}>
        배경색은 선행지수 기준 국면입니다. 책의 원칙: 후퇴기 후반~불황기에 사고, 호황기에 판다(후퇴기 전에). 1996~2020년 공식 경기 정점·저점 12개는 모두 ±6개월 안에서 국면 전환이 잡혔지만,
        국면이 평균 6개월마다 바뀔 만큼 깜빡이므로 한두 달짜리 전환은 흘려 봅니다. 순환변동치는 매달 소급 수정됩니다.
      </p>
    </>
  );
}

export function IndustriesFull({ rows }: { rows: CycleviRow[] }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table">
        <thead><tr>
          <th>업종</th><th style={{ textAlign: "right" }}>기업 수</th><th style={{ textAlign: "right" }}>적자 비율</th><th style={{ textAlign: "right" }}>2년+ 적자</th>
          <th style={{ textAlign: "right" }}>전환 조짐</th><th style={{ textAlign: "right" }}>PSR 5년 최저 이하</th><th style={{ textAlign: "right" }}>영업이익 바닥 분기</th>
          <th style={{ textAlign: "right" }}>최근 분기 영업이익(억)</th><th>국면(근사)</th><th>대표 제품</th><th style={{ textAlign: "right" }}>제품 가격 3개월</th>
          <th style={{ textAlign: "right" }}>가격 10년 위치</th><th style={{ textAlign: "right" }}>스프레드 10년 위치</th><th style={{ textAlign: "right" }}>출하 YoY</th>
        </tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r.industry)}>
              <td><b>{r.industry}</b></td>
              <td className="tabular" style={{ textAlign: "right" }}>{n0(r.n)}</td>
              <td className={`tabular ${Number(r.loss_pct) >= 40 ? "delta-critical" : ""}`} style={{ textAlign: "right" }}>{n0(r.loss_pct)}%</td>
              <td className="tabular" style={{ textAlign: "right" }}>{n0(r.loss2y)}</td>
              <td className="tabular" style={{ textAlign: "right" }}>{n0(r.turn)}</td>
              <td className="tabular" style={{ textAlign: "right" }}>{n0(r.psr_below_5y_low)}</td>
              <td className="tabular ink-muted" style={{ textAlign: "right" }}>{String(r.op_q_trough_quarter ?? "—")}</td>
              <td className="tabular" style={{ textAlign: "right" }}>{n0(r.op_q_last)}</td>
              <td className="label-sm">{String(r.stage ?? "—")}</td>
              <td className="label-sm">{String(r.price_name ?? "—")}</td>
              <td className={`tabular ${cls(r.price_3m)}`} style={{ textAlign: "right" }}>{pct(r.price_3m)}</td>
              <td className="tabular" style={{ textAlign: "right" }}>{d2(r.price_pos10y)}</td>
              <td className="tabular" style={{ textAlign: "right" }}>{d2(r.spread_pos10y)}</td>
              <td className={`tabular ${cls(r.ship_yoy)}`} style={{ textAlign: "right" }}>{pct(r.ship_yoy)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function QuarterGrid({ b }: { b: CycleviBoard }) {
  const order = b.industries.map((r) => String(r.industry));
  const groups = order.map((ind) => ({ ind, rows: b.industryQ.filter((r) => r.industry === ind).sort((a, c) => a.quarter.localeCompare(c.quarter)) })).filter((g) => g.rows.length);
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
      {groups.map(({ ind, rows }) => {
        const W = 220, H = 110, top = 8, bot = 18;
        const vals = rows.map((r) => r.op_sum_eok);
        const lo = Math.min(0, ...vals), hi = Math.max(0, ...vals);
        const y = (v: number) => top + (1 - (v - lo) / (hi - lo || 1)) * (H - top - bot);
        const bw = (W - 8) / rows.length;
        const last = rows.at(-1)!;
        return (
          <div key={ind}>
            <div className="label-sm"><b>{ind}</b> <span className="ink-muted">최근 {last.quarter} {n0(last.op_sum_eok)}억 · 흑자 {last.profitable_pct}%</span></div>
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img" aria-label={`${ind} 분기 영업이익 합계`}>
              <line x1={4} x2={W - 4} y1={y(0)} y2={y(0)} stroke="var(--text-muted)" />
              {rows.map((r, i) => (
                <rect key={r.quarter} x={4 + i * bw + bw * 0.1} width={bw * 0.8} y={Math.min(y(0), y(r.op_sum_eok))} height={Math.abs(y(r.op_sum_eok) - y(0))}
                  fill={r.op_sum_eok < 0 ? "var(--critical)" : "var(--series-1)"}>
                  <title>{`${r.quarter} 영업이익 합계 ${n0(r.op_sum_eok)}억 · 흑자 기업 ${r.profitable_pct}% (${r.n}곳)`}</title>
                </rect>
              ))}
              <text x={4} y={H - 4} fontSize={10} fill="var(--text-muted)">{rows[0].quarter}</text>
              <text x={W - 4} y={H - 4} fontSize={10} fill="var(--text-muted)" textAnchor="end">{last.quarter}</text>
            </svg>
          </div>
        );
      })}
    </div>
  );
}

export function IndicatorPanel({ b }: { b: CycleviBoard }) {
  const groups = Array.from(new Set(b.series.map((s) => s.group)));
  const [g, setG] = useState(groups.includes("철강") ? "철강" : groups[0]);
  const pick = (names: string[], colors: string[]) =>
    names.flatMap((nm, i) => b.series.filter((s) => s.group === g && s.series === nm).map((s) => ({ label: `${nm}: ${s.item}`, color: colors[i], points: s.points })));
  const a = pick(["제품 가격", "원재료 가격"], ["var(--cat-1)", "var(--cat-6)"]);
  const c = pick(["스프레드", "출하(계절조정)"], ["var(--cat-2)", "var(--cat-3)"]);
  return (
    <>
      <label className="label-sm">지표 업종{" "}
        <select value={g} onChange={(e) => setG(e.target.value)} style={{ font: "inherit" }}>
          {groups.map((x) => <option key={x}>{x}</option>)}
        </select>
      </label>
      <div style={{ marginTop: 8 }}>{a.length ? <LineChart ariaLabel={`${g} 제품·원재료 가격`} lines={a} /> : <p className="label-sm ink-muted">{g}: 가격 자료 없음</p>}</div>
      <div style={{ marginTop: 12 }}>{c.length ? <LineChart ariaLabel={`${g} 스프레드·출하`} lines={c} /> : <p className="label-sm ink-muted">{g}: 스프레드·출하 자료 없음</p>}</div>
    </>
  );
}

const TIERS = [["A 전환 조짐", "A 전환 조짐"], ["B 2년+ 연속 적자", "B 2년+ 적자"], ["C 적자 중", "C 적자 중"], ["watch", "관심 종목"], ["insider", "매집 신호"]] as const;
const INS_CLS: Record<string, string> = { 매집: "delta-good", 반대: "delta-critical", 엇갈림: "delta-warning" };

export function CandidatesTabs({ rows }: { rows: CycleviRow[] }) {
  const [t, setT] = useState<string>("A 전환 조짐");
  const [aOnly, setAOnly] = useState(false);
  const hit = (r: CycleviRow) => r.insider_level === "매집" || r.insider_level === "엇갈림";
  const list = rows
    .filter((r) => (t === "watch" ? r.watch === true : t === "insider" ? hit(r) && (!aOnly || r.tier === "A 전환 조짐") : r.tier === t))
    .sort((a, c) => (c.ev_neg ? 1e9 : Number(c.peak_ev_yield ?? -1)) - (a.ev_neg ? 1e9 : Number(a.peak_ev_yield ?? -1)));
  return (
    <>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8, alignItems: "center" }}>
        {TIERS.map(([k, lab]) => (
          <button key={k} type="button" aria-pressed={t === k} onClick={() => setT(k)} className="label-sm"
            style={{ padding: "3px 10px", borderRadius: 6, border: "1px solid var(--border)", cursor: "pointer",
              background: t === k ? "var(--text-primary)" : "transparent", color: t === k ? "var(--page)" : "var(--text-primary)" }}>
            {lab} ({rows.filter((r) => (k === "watch" ? r.watch === true : k === "insider" ? hit(r) : r.tier === k)).length})
          </button>
        ))}
        {t === "insider" && <label className="label-sm ink-muted"><input type="checkbox" checked={aOnly} onChange={(e) => setAOnly(e.target.checked)} /> A 전환 조짐만</label>}
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead><tr>
            <th>종목</th><th>업종</th><th>시장</th><th style={{ textAlign: "right" }}>시총(억)</th><th style={{ textAlign: "right" }}>부채(억)</th>
            <th style={{ textAlign: "right" }}>현금·단기금융(억)</th><th style={{ textAlign: "right" }}>하루 거래대금(백만)</th><th style={{ textAlign: "right" }}>연속 적자(년)</th>
            <th style={{ textAlign: "right" }}>최근 4분기 영업이익(억)</th><th style={{ textAlign: "right" }}>PSR</th><th style={{ textAlign: "right" }}>PSR 5년 위치</th>
            <th style={{ textAlign: "right" }}>매출/피크</th><th style={{ textAlign: "right" }}>피크 이익수익률, EV 기준(%)</th><th style={{ textAlign: "right" }}>PBR</th>
            <th>경고</th><th>매집 신호(12개월)</th><th>내역</th><th>관심 메모</th>
          </tr></thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan={18} className="ink-muted">해당 종목 없음</td></tr>}
            {list.map((r) => (
              <tr key={String(r.code)}>
                <td><b>{String(r.name)}{r.watch ? " ★" : ""}</b> <span className="label-sm ink-muted">{String(r.code)}</span></td>
                <td className="label-sm">{String(r.industry)}</td>
                <td className="label-sm ink-muted">{String(r.market ?? "")}</td>
                <td className="tabular" style={{ textAlign: "right" }}>{n0(r.mcap_eok)}</td>
                <td className="tabular" style={{ textAlign: "right" }}>{n0(r.debt_eok)}</td>
                <td className="tabular" style={{ textAlign: "right" }}>{n0(r.cash_eok)}</td>
                <td className={`tabular ${r.adv_mn !== null && r.adv_mn !== undefined && Number(r.adv_mn) < 50 ? "delta-warning" : ""}`} style={{ textAlign: "right" }}>{n0(r.adv_mn)}</td>
                <td className="tabular" style={{ textAlign: "right" }}>{n0(r.loss_streak_y)}</td>
                <td className="tabular label-sm" style={{ textAlign: "right" }}>{String(r.q_op_recent ?? "—")}</td>
                <td className="tabular" style={{ textAlign: "right" }}>{d2(r.psr_now)}</td>
                <td className={`tabular ${r.psr_pos !== null && Number(r.psr_pos) < 0 ? "delta-good" : ""}`} style={{ textAlign: "right" }}>{d2(r.psr_pos)}</td>
                <td className="tabular" style={{ textAlign: "right" }}>{d2(r.sales_vs_peak)}</td>
                <td className={`tabular ${r.ev_neg ? "delta-good" : ""}`} style={{ textAlign: "right" }}><b>{r.ev_neg ? "순현금>시총" : d2(r.peak_ev_yield, 1)}</b></td>
                <td className="tabular" style={{ textAlign: "right" }}>{d2(r.pbr_last)}</td>
                <td className="label-sm delta-warning" style={{ whiteSpace: "normal", minWidth: 120 }}>{String(r.red_flags ?? "")}</td>
                <td className={`label-sm ${INS_CLS[String(r.insider_level)] ?? "ink-muted"}`}><b>{String(r.insider_level ?? "—")}</b></td>
                <td className="label-sm ink-muted" style={{ whiteSpace: "normal", minWidth: 200 }}>{String(r.insider_text ?? "")}</td>
                <td className="label-sm ink-muted" style={{ whiteSpace: "normal", minWidth: 220 }}>{[r.report_line, r.watch_note].filter(Boolean).join(" / ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
