import { Card } from "./Card";
import type { Cyclical, CyclicalCandidate } from "@/lib/types";

// 2026-11-13: cycleVI(타짱 방식 한국 시클리컬 가치투자) 요약 — 월 1회 갱신, 표시 전용.
// 계산은 cycleVI scripts/build_board.py, 내보내기는 tf_project export_public._cyclical_safe().
function Pct({ v }: { v: number | null | undefined }) {
  if (v === null || v === undefined) return <span className="ink-muted">—</span>;
  const cls = v > 1 ? "delta-good" : v < -1 ? "delta-critical" : "";
  return <span className={cls}>{v > 0 ? "+" : ""}{v.toFixed(1)}%</span>;
}

const num = (v: number | null | undefined, d = 0) =>
  v === null || v === undefined ? "—" : v.toLocaleString(undefined, { maximumFractionDigits: d, minimumFractionDigits: d });

function CandTable({ rows, note }: { rows: CyclicalCandidate[]; note?: boolean }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="data-table">
        <thead>
          <tr>
            <th>종목</th>
            <th>업종</th>
            <th style={{ textAlign: "right" }}>시총(억)</th>
            <th style={{ textAlign: "right" }}>부채(억)</th>
            <th style={{ textAlign: "right" }}>최근 4분기 영업이익</th>
            <th style={{ textAlign: "right" }}>PSR</th>
            <th style={{ textAlign: "right" }}>피크 이익수익률(빚 반영)</th>
            <th>경고</th>
            <th>매집 신호(12개월)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.code}>
              <td>
                <b>{c.name}</b> <span className="label-sm ink-muted">{c.code}</span>
                {note && <div className="label-sm ink-muted">{c.watch_note} · {c.tier}</div>}
              </td>
              <td className="label-sm">{c.industry}</td>
              <td className="tabular" style={{ textAlign: "right" }}>{num(c.mcap_eok)}</td>
              <td className="tabular" style={{ textAlign: "right" }}>{num(c.debt_eok)}</td>
              <td className="tabular label-sm" style={{ textAlign: "right" }}>{c.q_op_recent ?? "—"}</td>
              <td className="tabular" style={{ textAlign: "right" }}>{num(c.psr_now, 2)}</td>
              <td className="tabular" style={{ textAlign: "right" }}><b>{c.peak_ev_yield == null ? "—" : `${c.peak_ev_yield.toFixed(0)}%`}</b></td>
              <td className="label-sm delta-warning" style={{ whiteSpace: "normal" }}>{c.red_flags || ""}</td>
              <td className="label-sm" style={{ whiteSpace: "normal" }}>
                <b className={c.insider_level === "매집" ? "delta-good" : c.insider_level === "반대" ? "delta-critical" : c.insider_level === "엇갈림" ? "delta-warning" : "ink-muted"}>
                  {c.insider_level ?? "—"}
                </b>{" "}
                <span className="ink-muted">{c.insider_text ?? ""}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function CyclicalCard({ data }: { data?: Cyclical | null }) {
  if (!data || !data.industries?.length) return null;
  return (
    <Card title={`시클리컬 요약 (한국 가치투자) — 월 1회 갱신 · 데이터 ${data.dataDate}`}>
      <div className="label-sm ink-muted" style={{ marginBottom: 8 }}>
        업종이 불황 바닥을 지나 회복 초입인지, 적자 뒤 흑자로 돌아선 회사가 어디인지 · 국면 ②수량↑ = 출하가 먼저 늘기 시작 · 표시 전용
      </div>
      {data.macro && (
        <div style={{ marginBottom: 10, lineHeight: 1.7 }}>
          <b>전체 경기 국면(근사): {data.macro.phase}기</b>{" "}
          <span className="label-sm ink-muted">
            선행지수 순환변동치 {data.macro.leading.toFixed(1)} · {data.macro.month} 기준 · {data.macro.since}부터
          </span>
          {data.macro.note && <span className="label-sm delta-warning"> · {data.macro.note}</span>}
          <div className="label-sm">
            지금 경기(동행 {data.macro.coincident.toFixed(1)}): {data.macro.now}기 · {data.macro.hint}
          </div>
        </div>
      )}
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>업종</th>
              <th>국면(근사)</th>
              <th style={{ textAlign: "right" }}>적자 비율</th>
              <th style={{ textAlign: "right" }}>전환 조짐</th>
              <th style={{ textAlign: "right" }}>이익 바닥</th>
              <th style={{ textAlign: "right" }}>최근 분기 영업이익(억)</th>
              <th style={{ textAlign: "right" }}>출하 YoY</th>
            </tr>
          </thead>
          <tbody>
            {data.industries.map((r) => (
              <tr key={r.industry}>
                <td><b>{r.industry}</b></td>
                <td className="label-sm">{r.stage ?? "—"}</td>
                <td className={`tabular ${(r.loss_pct ?? 0) >= 40 ? "delta-critical" : ""}`} style={{ textAlign: "right" }}>
                  {num(r.loss_pct)}%
                </td>
                <td className="tabular" style={{ textAlign: "right" }}>{r.turn}</td>
                <td className="tabular ink-muted" style={{ textAlign: "right" }}>{r.op_q_trough_quarter?.slice(2) ?? "—"}</td>
                <td className="tabular" style={{ textAlign: "right" }}>{num(r.op_q_last)}</td>
                <td className="tabular" style={{ textAlign: "right" }}><Pct v={r.ship_yoy} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ fontSize: 13, margin: "14px 0 4px" }}>
        <b>A 전환 조짐 상위 5</b> <span className="label-sm ink-muted">(전체 {data.nA}곳 · 빚 반영 피크 이익수익률 순)</span>
      </div>
      <CandTable rows={data.topA} />
      {data.watch && data.watch.length > 0 && (
        <>
          <div style={{ fontSize: 13, margin: "14px 0 4px" }}>
            <b>관심 종목</b> <span className="label-sm ink-muted">(순위와 무관하게 항상 표시)</span>
          </div>
          <CandTable rows={data.watch} note />
        </>
      )}
      <div className="label-sm ink-muted" style={{ marginTop: 10, lineHeight: 1.7 }}>
        피크 이익수익률(빚 반영) = 과거 최고 영업이익 ÷ (시총 + 이자 붙는 부채), 현금 미차감. 최근 분기는 DART 잠정실적·분기보고서로 먼저 채움(마지막=잠정). 국면은 최근 3개월
        출하·제품가격 방향 근사. 자료: wisereport·네이버(실적), 한국은행 ECOS(가격·출하).
      </div>
    </Card>
  );
}
