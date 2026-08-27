import type { StockEasyUs } from "@/lib/types";

// StockEasy 미국주식 — 2026-08-27 stockeasy 저장소에 추가된 US 파이프라인(시드 $10,000/4종목 균등).
// KR용 StockEasyCard 와 같은 레이아웃, 통화·컬럼만 미국식.
export function StockEasyUsCard({ us }: { us: StockEasyUs | null | undefined }) {
  if (!us) {
    return (
      <div className="blueprint" style={{ padding: 16 }}>
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <p className="ink-muted">StockEasy 미국주식 데이터 없음</p>
      </div>
    );
  }

  const usd = (v: number) => `$${v.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
  const b = us.benchmark ?? {};

  return (
    <div className="blueprint" style={{ padding: "16px 18px" }}>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      {us.nav != null && (
        <div style={{ fontSize: 13, marginBottom: 8 }}>
          모의투자 · 시드 {usd(us.seed)} · NAV <b>{usd(us.nav)}</b>
          {us.returnPct != null && (
            <>
              {" · 누적 "}
              <b style={{ color: us.returnPct >= 0 ? "var(--good)" : "var(--critical)" }}>
                {us.returnPct >= 0 ? "+" : ""}
                {us.returnPct.toFixed(1)}%
              </b>
            </>
          )}
        </div>
      )}
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
        {us.benchmarkIndex} RS <b>{b.rs ?? "—"}</b> (1M {b.rs1m ?? "—"} / 3M {b.rs3m ?? "—"} / 6M {b.rs6m ?? "—"})
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", margin: "10px 0 6px" }}>미국 래더 보유종목</div>
      {us.positions.length === 0 ? (
        <p className="ink-muted">보유 종목 없음</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>티커</th>
              <th>종목</th>
              <th>업종</th>
              <th>진입가</th>
              <th>현재가</th>
              <th>수익률</th>
              <th>스탑</th>
            </tr>
          </thead>
          <tbody>
            {us.positions.map((p) => (
              <tr key={p.ticker}>
                <td className="ink-primary">{p.ticker}</td>
                <td className="ink-secondary">{p.name}</td>
                <td className="ink-secondary">{p.sector}</td>
                <td className="tabular ink-secondary">{p.entryPx?.toLocaleString() ?? "—"}</td>
                <td className="tabular ink-secondary">{p.lastClose?.toLocaleString() ?? "—"}</td>
                <td className="tabular" style={{ color: (p.gainPct ?? 0) >= 0 ? "var(--good)" : "var(--critical)" }}>
                  {p.gainPct !== null ? `${p.gainPct >= 0 ? "+" : ""}${p.gainPct.toFixed(1)}%` : "—"}
                </td>
                <td className="tabular ink-secondary">{p.currentStopPct ?? "—"}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div style={{ fontSize: 12, color: "var(--text-muted)", margin: "14px 0 6px" }}>스크리너 후보</div>
      {us.candidates.length === 0 ? (
        <p className="ink-muted">오늘 후보 없음</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>티커</th>
              <th>종목</th>
              <th>업종</th>
              <th>RS</th>
              <th>현재가</th>
              <th>시그널</th>
              <th>통과</th>
            </tr>
          </thead>
          <tbody>
            {us.candidates.map((c, i) => (
              <tr key={i}>
                <td className="ink-primary">{c.ticker}</td>
                <td className="ink-secondary">{c.name}</td>
                <td className="ink-secondary">{c.sector}</td>
                <td className="tabular ink-secondary">{c.rs ?? "—"}</td>
                <td className="tabular ink-secondary">{c.price ?? "—"}</td>
                <td className="ink-secondary">{c.signals.join(", ")}</td>
                <td className="tabular" style={{ color: c.pass ? "var(--good)" : "var(--text-muted)" }}>
                  {c.pass ? "✓" : "✗"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
