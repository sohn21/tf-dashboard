import type { StockEasyLeaders } from "@/lib/types";

// StockEasy 오늘의 주도주·업종 — 업종 대/중분류 + 테마, 연속 등장일, ★(그날의 진짜 주도주)
// + 래더 신고가 후보 중 주도 카드에 나온 종목. FTD 후 진입 준비용 관찰, 매매 규칙 아님. 2026-11-14.
export function StockEasyLeadersTable({ ld }: { ld: StockEasyLeaders | null | undefined }) {
  if (!ld || ld.groups.length === 0) return null;
  const note = ld.history < 20 ? ` · 연속일은 기록 ${ld.history + 1}거래일분 기준` : "";
  return (
    <>
      <div style={{ fontSize: 12, color: "var(--text-muted)", margin: "14px 0 6px" }}>
        오늘의 주도주·업종{" "}
        <span className="ink-muted">
          (기준 {ld.date ?? "—"} · FTD 후 진입 준비용 관찰, 매매 규칙 아님{note})
        </span>
      </div>
      <table className="data-table">
        <thead>
          <tr>
            <th>구분</th>
            <th>이름</th>
            <th>등락</th>
            <th>대금</th>
            <th>연속</th>
            <th>종목 (★ 그날의 진짜 주도주)</th>
          </tr>
        </thead>
        <tbody>
          {ld.groups.map((g, i) => (
            <tr key={`${g.kind}-${g.name}-${i}`}>
              <td className="ink-secondary">{g.kind}</td>
              <td className="ink-primary">
                <b>{g.name}</b>
              </td>
              <td
                className="tabular"
                style={{ color: (g.chg ?? "").startsWith("+") ? "var(--good)" : "var(--critical)" }}
              >
                {g.chg ?? "—"}
              </td>
              <td className="tabular ink-secondary">{g.value ?? "—"}</td>
              <td className="tabular ink-secondary">
                {g.days >= 3 ? <b style={{ color: "var(--good)" }}>{g.days}일째</b> : `${g.days}일째`}
              </td>
              <td className="ink-secondary">
                {g.stocks.map((x, j) => (
                  <span key={j}>
                    {j > 0 && ", "}
                    {x.star ? (
                      <>
                        <b>★{x.name}</b>
                        {(x.starDays ?? 1) > 1 && <span className="ink-muted">({x.starDays}일)</span>}
                      </>
                    ) : (
                      x.name
                    )}
                  </span>
                ))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {ld.screenOverlap.length > 0 && (
        <div style={{ fontSize: 12, marginTop: 6 }}>
          래더 신고가 후보 중 주도 카드에 나온 종목:{" "}
          {ld.screenOverlap.map((c, i) => (
            <span key={c.code}>
              {i > 0 && ", "}
              <b>
                {c.star ? "★" : ""}
                {c.name}
              </b>
              <span className="ink-muted">
                {" "}
                ({c.status} · RS {c.rs ?? "—"}
                {c.screened ? " · 스크린 통과" : ""} · {c.in.join(", ")})
              </span>
            </span>
          ))}
        </div>
      )}
    </>
  );
}
