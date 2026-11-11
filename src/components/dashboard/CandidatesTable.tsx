import { Card } from "./Card";
import { OverviewCards } from "./OverviewCards";
import { GATE_KEYS, type CandidateRow } from "@/lib/types";

const PHASE_LABELS: Record<string, string> = {
  "0": "회피/판정불가", "1": "관찰", "2": "바닥매집", "3": "베이스성숙", "4": "돌파임박", "4+": "돌파임박+",
  "5": "본격리더", "5+": "본격리더+", "6": "후반피로", "7": "분배의심",
};
const phaseCls = (p?: string | null) =>
  p === "4+" || p === "4" ? "delta-good" : p === "6" || p === "7" ? "delta-critical" : "ink-secondary";
const GLOBAL_GATE_DESC: Record<string, string> = {
  G0: "G0 시장 레짐(마켓펄스 Correction)",
  G0b: "G0b 브레스(50일선 위 종목 비율 < 임계값)",
};

const fmtCap = (x: number | null) => (x == null ? "-" : `$${(x / 1e9).toLocaleString(undefined, { maximumFractionDigits: 1 })}B`);

export function CandidatesTable({
  rows,
  topN = 15,
  sortBy = "score",
  nSignals,
  globalGatesOff,
  idioFullCount,
}: {
  rows: CandidateRow[];
  topN?: number;
  sortBy?: "score" | "gates";
  nSignals?: number;
  globalGatesOff?: string[];
  idioFullCount?: number;
}) {
  const off = globalGatesOff ?? [];
  const nCountGates = GATE_KEYS.filter((g) => !off.includes(g)).length;
  const countTitle = off.length ? `${off.join("·")} 전 종목 공통 미충족 → 제외하고 집계` : "G0~G4 통과 수";
  const nPassOf = (r: CandidateRow) => r.nPass ?? Object.values(r.gates).filter(Boolean).length;
  const ranked =
    sortBy === "gates"
      ? [...rows].sort(
          (a, b) => nPassOf(b) - nPassOf(a) || Number(b.gates.G3) - Number(a.gates.G3) || b.score - a.score,
        )
      : rows;
  const top = ranked.slice(0, topN);
  return (
    <Card
      title={
        sortBy === "gates"
          ? `전략실 게이트 상위 ${Math.min(topN, rows.length)}종목 (게이트수 → G3 → 점수)`
          : `오늘 후보 상위 ${Math.min(topN, rows.length)}종목 (점수 기준)`
      }
    >
      {sortBy === "gates" && nSignals != null && (
        <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
          오늘 매수 가능(5게이트 전부 통과){" "}
          <b style={{ color: nSignals > 0 ? "var(--good)" : "var(--text-muted)" }}>{nSignals}</b>건
        </div>
      )}
      {sortBy === "gates" && off.length > 0 && (
        <div
          style={{
            borderLeft: "3px solid var(--warning)",
            background: "var(--bg-subtle, rgba(0,0,0,0.03))",
            padding: "8px 12px",
            fontSize: 12,
            color: "var(--text-secondary)",
            marginBottom: 10,
          }}
        >
          <b style={{ color: "var(--warning)" }}>전역 게이트 미충족</b> — {off.map((g) => GLOBAL_GATE_DESC[g] ?? g).join(" · ")}. 전
          종목이 공통으로 탈락하므로 게이트수는 <b>종목 고유 게이트(G1~G4) 기준</b>으로 표시합니다. 고유 게이트 4개 전부 충족{" "}
          <b>{idioFullCount ?? 0}</b>건 — 전역 게이트가 회복되면 바로 진입 후보가 되는 종목들입니다.
        </div>
      )}
      {top.length === 0 ? (
        <p className="ink-muted">신호 데이터 없음</p>
      ) : (
        <div className="table-scroll">
          <table className="data-table">
            <thead>
              <tr>
                <th>티커</th>
                <th>섹터</th>
                <th>업종</th>
                <th>종가</th>
                <th>시총</th>
                <th>점수</th>
                <th>Phase</th>
                <th>MTR</th>
                <th>A/D</th>
                <th>RVOL</th>
                <th>베이스</th>
                {GATE_KEYS.map((g) => (
                  <th key={g}>{g}</th>
                ))}
                <th title={countTitle}>게이트수</th>
                <th>통과</th>
              </tr>
            </thead>
            <tbody>
              {top.map((r) => {
                const mtrCls = r.mtrState != null && [3, 7].includes(r.mtrState) ? "delta-good" : "ink-secondary";
                const adCls =
                  r.adRating && ["A", "B"].includes(r.adRating)
                    ? "delta-good"
                    : r.adRating && ["D", "E"].includes(r.adRating)
                      ? "delta-critical"
                      : "ink-secondary";
                const rvolCls = r.rvol != null && r.rvol >= 1.4 ? "delta-good" : r.rvol != null && r.rvol < 0.8 ? "delta-critical" : "ink-secondary";
                const baseCls =
                  r.baseLabel === "1st" || r.baseLabel === "2nd"
                    ? "delta-good"
                    : r.baseLabel === "4th+"
                      ? "delta-critical"
                      : "ink-secondary";
                return (
                  <tr key={r.ticker}>
                    <td className="ink-primary">
                      {r.ticker}
                      {r.held && (
                        <span
                          style={{
                            fontSize: 10,
                            color: "#5980a6",
                            border: "1px solid #5980a6",
                            borderRadius: 3,
                            padding: "0 4px",
                            marginLeft: 3,
                          }}
                        >
                          보유
                        </span>
                      )}
                      {r.newHigh52w && <span className="delta-good"> 🔺</span>}
                      {r.rsLeading && <span className="delta-good" title="RS Leading — RS라인이 주가보다 먼저 신고가"> ⭐</span>}
                    </td>
                    <td className="ink-secondary">{r.sector}</td>
                    <td className="ink-secondary">{r.industry}</td>
                    <td className="tabular ink-secondary">{r.close.toFixed(2)}</td>
                    <td className="tabular ink-secondary">{fmtCap(r.marketCap)}</td>
                    <td className="tabular ink-primary">{r.score.toFixed(1)}</td>
                    <td className={`tabular ${phaseCls(r.phase)}`} title={r.phase ? PHASE_LABELS[r.phase] ?? "" : ""}>
                      {r.phase ?? "-"}
                    </td>
                    <td className={`tabular ${mtrCls}`}>
                      {r.mtrState != null ? `${r.mtrState}${r.mtrAccelerating ? "++" : ""}` : "-"}
                    </td>
                    <td className={`tabular ${adCls}`}>{r.adRating ?? "-"}</td>
                    <td className={`tabular ${rvolCls}`}>{r.rvol != null ? `${r.rvol.toFixed(2)}x` : "-"}</td>
                    <td className={`tabular ${baseCls}`}>
                      {r.baseLabel ?? "-"}
                      {r.patternName ? ` ${r.patternName}` : ""}
                    </td>
                    {GATE_KEYS.map((g) => (
                      <td key={g} className={`gate-cell ${r.gates[g] ? "gate-pass" : "gate-fail"}`}>
                        {r.gates[g] ? "✓" : "✗"}
                      </td>
                    ))}
                    <td className="tabular ink-primary" title={countTitle}>
                      {r.nPassIdio ?? (off.length ? GATE_KEYS.filter((g) => !off.includes(g) && r.gates[g]).length : nPassOf(r))}/
                      {nCountGates}
                    </td>
                    <td className={`gate-cell ${r.passed ? "gate-pass" : "gate-fail"}`}>{r.passed ? "✓" : "✗"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <details className="overview-collapse" style={{ marginTop: 8 }}>
        <summary>▸ 기업개요 & 재무 요약 (매수 전 참고자료 — 클릭해서 펼치기)</summary>
        <OverviewCards rows={top} title="" />
      </details>
    </Card>
  );
}
