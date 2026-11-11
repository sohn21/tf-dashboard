import type { HoldingPhasePattern } from "@/lib/types";

// 2026-11-11 §09: 보유표 Phase/패턴 두 칸 — tf_project dashboard.phase_pattern_cells() 와 동일 규칙.
// 진입 phase 가 현재와 다르면 "(진입 4)" 병기, 현재 감지 패턴이 없으면 진입 패턴을 흐리게.
const PHASE_LABELS: Record<string, string> = {
  "0": "회피/판정불가", "1": "관찰", "2": "바닥매집", "3": "베이스성숙", "4": "돌파임박", "4+": "돌파임박+",
  "5": "본격리더", "5+": "본격리더+", "6": "후반피로", "7": "분배의심",
};

export function PhasePatternCells({ p }: { p: HoldingPhasePattern }) {
  const ph = p.phase ?? null;
  const cls = ph === "4+" || ph === "4" ? "delta-good" : ph === "6" || ph === "7" ? "delta-critical" : "ink-secondary";
  return (
    <>
      {ph ? (
        <td className={`tabular ${cls}`} title={PHASE_LABELS[ph] ?? ""}>
          {ph}
          {p.entryPhase && p.entryPhase !== ph && (
            <span className="ink-muted" style={{ fontSize: 11 }}> (진입 {p.entryPhase})</span>
          )}
        </td>
      ) : (
        <td className="tabular ink-muted" title="오늘 신호에 없음(유니버스 이탈 등)">-</td>
      )}
      {p.pattern ? (
        <td className="ink-secondary" style={{ fontSize: 12 }}>{p.pattern}</td>
      ) : p.entryPattern ? (
        <td className="ink-muted" style={{ fontSize: 12 }} title="현재 감지 패턴 없음 — 진입 시점 패턴">
          진입: {p.entryPattern}
        </td>
      ) : (
        <td className="ink-muted">-</td>
      )}
    </>
  );
}
