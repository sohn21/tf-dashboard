import type { StockEasy } from "@/lib/types";

export function StockEasyCard({ stockeasy }: { stockeasy: StockEasy | null | undefined }) {
  if (!stockeasy) {
    return (
      <div className="blueprint" style={{ padding: 16 }}>
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <p className="ink-muted">StockEasy 데이터 없음</p>
      </div>
    );
  }

  const { benchmark, positions, candidates } = stockeasy;

  return (
    <div className="blueprint" style={{ padding: "16px 18px" }}>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      {stockeasy.nav != null && (
        <div style={{ fontSize: 13, marginBottom: 8 }}>
          모의투자 · 시드 ₩{stockeasy.seed?.toLocaleString()} · NAV <b>₩{stockeasy.nav.toLocaleString()}</b>
          {stockeasy.returnPct != null && (
            <>
              {" · 누적 "}
              <b style={{ color: stockeasy.returnPct >= 0 ? "var(--good)" : "var(--critical)" }}>
                {stockeasy.returnPct >= 0 ? "+" : ""}
                {stockeasy.returnPct.toFixed(1)}%
              </b>
            </>
          )}
          {stockeasy.nPositions != null && (
            <>
              {" · 보유 "}
              <b>{stockeasy.nPositions}</b>종목
            </>
          )}
          {stockeasy.nClosed ? (
            <>
              {" · 청산 "}
              <b>{stockeasy.nClosed}</b>건 (승률 {stockeasy.closedWinRatePct ?? 0}%
              {stockeasy.closedAvgPnlPct != null && (
                <>
                  {" · 평균 "}
                  <b style={{ color: stockeasy.closedAvgPnlPct >= 0 ? "var(--good)" : "var(--critical)" }}>
                    {stockeasy.closedAvgPnlPct >= 0 ? "+" : ""}
                    {stockeasy.closedAvgPnlPct.toFixed(1)}%
                  </b>
                </>
              )}
              )
            </>
          ) : null}
        </div>
      )}
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 10 }}>
        {Object.entries(benchmark)
          .map(([k, v]) => `${k} RS ${v}`)
          .join(" · ")}
      </div>

      <div style={{ fontSize: 12, color: "var(--text-muted)", margin: "10px 0 6px" }}>래더 보유종목</div>
      {positions.length === 0 ? (
        <p className="ink-muted">보유 종목 없음</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>종목</th>
              <th>시장</th>
              <th>업종</th>
              <th>진입가</th>
              <th>현재가</th>
              <th>수익률</th>
              <th>스탑</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((p) => (
              <tr key={p.code}>
                <td className="ink-primary">{p.name}</td>
                <td className="ink-secondary">{p.market}</td>
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
      {candidates.length === 0 ? (
        <p className="ink-muted">오늘 후보 없음</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>순위</th>
              <th>종목</th>
              <th>업종</th>
              <th>상태</th>
              <th>52주고점 대비</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c, i) => (
              <tr key={i}>
                <td className="tabular ink-secondary">{c.rank ?? "—"}</td>
                <td className="ink-primary">{c.name}</td>
                <td className="ink-secondary">{c.sector}</td>
                <td className="ink-secondary">{c.status}</td>
                <td className="tabular ink-secondary">{c.pctToHigh ?? "—"}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
