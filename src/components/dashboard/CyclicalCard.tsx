import { Card } from "./Card";
import Link from "next/link";
import type { Cyclical, CyclicalCandidate, CyclicalMacro, CyclicalPaper, CyclicalReview } from "@/lib/types";

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
            <th style={{ textAlign: "right" }}>피크 이익수익률(EV 기준)</th>
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
                {note && c.report_line && <div className="label-sm" style={{ marginTop: 2 }}><b>{c.report_line}</b></div>}
              </td>
              <td className="label-sm">{c.industry}</td>
              <td className="tabular" style={{ textAlign: "right" }}>{num(c.mcap_eok)}</td>
              <td className="tabular" style={{ textAlign: "right" }}>{num(c.debt_eok)}</td>
              <td className="tabular label-sm" style={{ textAlign: "right" }}>{c.q_op_recent ?? "—"}</td>
              <td className="tabular" style={{ textAlign: "right" }}>{num(c.psr_now, 2)}</td>
              <td className="tabular" style={{ textAlign: "right" }}><b className={c.ev_neg ? "delta-good" : undefined}>{c.ev_neg ? "순현금>시총" : c.peak_ev_yield == null ? "—" : `${c.peak_ev_yield.toFixed(0)}%`}</b></td>
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

const LEVEL_CLS: Record<string, string> = { "매도 검토": "delta-critical", 주의: "delta-warning", "매수 검토": "delta-good" };

// 2026-11-17: 관심 종목 검토 신호 — cycleVI scripts/review_signals.py(아침 크론). 리포트를 다시 볼 이유, 매매 지시 아님.
export function ReviewSignals({ review }: { review?: CyclicalReview | null }) {
  if (!review) return null;
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, marginBottom: 4 }}>
        <b>관심 종목 검토 신호</b>{" "}
        <span className="label-sm ink-muted">({review.asof} · DART 공시·리포트 목표가·업종 지표 · 매매 지시 아님)</span>
      </div>
      {review.rows.length === 0 && <div className="label-sm ink-muted">최근 14일 신호 없음</div>}
      {review.rows.map((s, i) => (
        <div key={i} className="label-sm" style={{ padding: "3px 0", borderBottom: "1px dashed var(--gridline)", lineHeight: 1.5 }}>
          {s.new && <b className="delta-good" style={{ fontSize: 10.5 }}>NEW </b>}
          <b className={LEVEL_CLS[s.level] ?? "ink-muted"}>{s.level}</b> · <b>{s.name}</b>{" "}
          <span className="ink-muted">{s.date ?? ""}</span> {s.kind} — <span className="ink-secondary">{s.text}</span>
          {s.src && (
            <>
              {" "}
              <a href={s.src} target="_blank" rel="noopener noreferrer">공시</a>
            </>
          )}
        </div>
      ))}
    </div>
  );
}

// 2026-11-17: cycleVI 연습계좌 — 사람이 정한 매매만 기록(scripts/paper.py), 평가는 아침 크론. 자동매매 아님.
export function PaperAccount({ p }: { p?: CyclicalPaper | null }) {
  if (!p) return null;
  const cls = (v: number) => (v > 0 ? "delta-good" : v < 0 ? "delta-critical" : "");
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 13, marginBottom: 4 }}>
        <b>연습계좌 (원화)</b>{" "}
        <span className="label-sm ink-muted">
          ({p.start_date} 시작 · {p.asof} 종가 · 사람이 정한 매매만 기록, 자동매매 아님)
        </span>
      </div>
      <div className="label-sm">
        평가 <b>{num(p.nav)}원</b> <span className={cls(p.ret_pct)}>{p.ret_pct > 0 ? "+" : ""}{p.ret_pct.toFixed(2)}%</span>
        <span className="ink-muted">
          {" "}· KOSPI {p.kospi_ret_pct > 0 ? "+" : ""}{p.kospi_ret_pct.toFixed(2)}% · 현금 {p.cash_pct.toFixed(0)}% · MDD {p.mdd_pct.toFixed(1)}% · 실현손익 {num(p.realized)}원
        </span>
      </div>
      {p.holdings.length === 0 ? (
        <div className="label-sm ink-muted">보유 없음</div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>종목</th>
                <th style={{ textAlign: "right" }}>주식수</th>
                <th style={{ textAlign: "right" }}>평단</th>
                <th style={{ textAlign: "right" }}>종가</th>
                <th style={{ textAlign: "right" }}>손익</th>
                <th style={{ textAlign: "right" }}>비중</th>
                <th style={{ textAlign: "right" }}>분할 매도 시작가(남은 폭)</th>
                <th style={{ textAlign: "right" }}>하루 거래대금(백만, 60일) · 전량 매도</th>
              </tr>
            </thead>
            <tbody>
              {p.holdings.map((h) => (
                <tr key={h.code}>
                  <td><b>{h.name}</b></td>
                  <td className="tabular" style={{ textAlign: "right" }}>{num(h.shares)}</td>
                  <td className="tabular" style={{ textAlign: "right" }}>{num(h.avg)}</td>
                  <td className="tabular" style={{ textAlign: "right" }}>{num(h.close)}</td>
                  <td className={`tabular ${cls(h.pnl_pct)}`} style={{ textAlign: "right" }}>
                    {h.pnl_pct > 0 ? "+" : ""}{h.pnl_pct.toFixed(2)}%
                  </td>
                  <td className="tabular" style={{ textAlign: "right" }}>{((h.value / p.nav) * 100).toFixed(0)}%</td>
                  <td className="tabular" style={{ textAlign: "right" }}>
                    {h.sell_start ? `${num(h.sell_start)}원 (${(h.to_sell_start_pct ?? 0) > 0 ? "+" : ""}${h.to_sell_start_pct?.toFixed(1)}%)` : "—"}
                  </td>
                  <td className={`tabular ${(h.days_to_exit ?? 0) > 1 ? "delta-warning" : ""}`} style={{ textAlign: "right" }}>
                    {h.adv_mn ? `중앙 ${num(h.adv_mn)}${h.adv_mean_mn ? ` / 평균 ${num(h.adv_mean_mn)}` : ""} · ${h.days_to_exit}일` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function MacroPhase({ m }: { m?: CyclicalMacro | null }) {
  if (!m) return null;
  return (
    <div style={{ marginBottom: 10, lineHeight: 1.7 }}>
      <b>전체 경기 국면(근사): {m.phase}기</b>{" "}
      <span className="label-sm ink-muted">
        선행지수 순환변동치 {m.leading.toFixed(1)} · {m.month} 기준 · {m.since}부터
      </span>
      {m.note && <span className="label-sm delta-warning"> · {m.note}</span>}
      <div className="label-sm">
        지금 경기(동행 {m.coincident.toFixed(1)}): {m.now}기 · {m.hint}
      </div>
    </div>
  );
}

// 2026-11-17: 메인·브리핑에는 전체 경기 국면 한 줄만 — 업종·후보·검토 신호·연습계좌는 /cyclevi 페이지로 분리(사용자 요청).
export function CyclicalMacroCard({ data }: { data?: Cyclical | null }) {
  if (!data?.macro) return null;
  return (
    <Card title="전체 경기 국면 (한국, 통계청 순환변동치)">
      <MacroPhase m={data.macro} />
      <div className="label-sm">
        <Link href="/cyclevi">cycleVI 페이지 →</Link>{" "}
        <span className="ink-muted">업종 국면 · 후보 · 관심 종목 검토 신호 · 연습계좌</span>
      </div>
    </Card>
  );
}

export function CyclicalCard({ data }: { data?: Cyclical | null }) {
  if (!data || !data.industries?.length) return null;
  return (
    <Card title={`시클리컬 요약 (한국 가치투자) — 월 1회 갱신 · 데이터 ${data.dataDate}`}>
      <div className="label-sm ink-muted" style={{ marginBottom: 8 }}>
        업종이 불황 바닥을 지나 회복 초입인지, 적자 뒤 흑자로 돌아선 회사가 어디인지 · 국면 ②수량↑ = 출하가 먼저 늘기 시작 · 표시 전용
      </div>
      <MacroPhase m={data.macro} />
      <ReviewSignals review={data.review} />
      <PaperAccount p={data.paper} />
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
        <b>A 전환 조짐 상위 5</b> <span className="label-sm ink-muted">(전체 {data.nA}곳 · EV 기준 피크 이익수익률 순)</span>
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
        피크 이익수익률(EV 기준) = 과거 최고 영업이익 ÷ EV(시총 + 이자 붙는 부채 − 현금·단기 금융자산, DART 최근 분기말). EV가 0 이하(현금이 시총+빚보다 많음)면 수익률 대신 "순현금&gt;시총"으로 표시하고 맨 위에 둠. 최근 분기는 DART 잠정실적·분기보고서로 먼저 채움(마지막=잠정). 국면은 최근 3개월
        출하·제품가격 방향 근사. 자료: wisereport·네이버(실적), 한국은행 ECOS(가격·출하).
      </div>
    </Card>
  );
}
