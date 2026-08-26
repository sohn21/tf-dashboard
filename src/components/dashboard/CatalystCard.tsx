import { Card } from "./Card";
import type { CatalystData } from "@/lib/types";

export function CatalystCard({ data }: { data: CatalystData | null | undefined }) {
  return (
    <Card title="⑦ 오늘의 발화 테마 (Catalyst + Sustain)">
      <p className="ink-muted" style={{ marginBottom: 12 }}>
        당일 평균등락률 상위 8업종(floor 1.0% 또는 lead≥8%) — 연속 발화일수(sustain)로 일회성 튐과 진짜 순환매를 구분
      </p>
      {!data || data.ignited.length === 0 ? (
        <p className="ink-muted">발화 테마 기록 없음</p>
      ) : (
        <>
          <div className="label-sm ink-muted" style={{ marginBottom: 8 }}>
            발화 {data.ignited.length}개 · 기준 {data.date}
          </div>
          {data.weakened.length > 0 && (
            <div className="label-sm" style={{ color: "var(--critical)", marginBottom: 12 }}>
              ❄️ 약화(직전 거래일→오늘 미발화): {data.weakened.join(", ")}
            </div>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.ignited.map((r) => (
              <div
                key={r.industry}
                style={{ border: "1px solid var(--border)", borderRadius: 8, padding: "10px 12px" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                  <b className="ink-primary">{r.industry}</b>
                  <span className={`badge ${r.badge === "D+3+ ★★★" ? "badge-good" : "badge-warning"}`}>
                    {r.badge}
                  </span>
                  {r.reIgnited && (
                    <span className="label-sm" style={{ color: "var(--series-1)" }} title="끊겼다가 다시 발화">
                      ↻ 재발화
                    </span>
                  )}
                  {r.cascade && (
                    <span className="label-sm" style={{ color: "var(--warning)" }} title="클러스터 절반 이상 동반 상승">
                      🔥 cascade
                    </span>
                  )}
                </div>
                <div className="label-sm ink-secondary" style={{ marginTop: 4 }}>
                  평균 <b className="ink-primary tabular">{r.avgReturnPct >= 0 ? "+" : ""}{r.avgReturnPct.toFixed(2)}%</b>
                  {" · "}Lead <b className="ink-primary">{r.leadTicker}</b>{" "}
                  <span className="tabular">{r.leadReturnPct >= 0 ? "+" : ""}{r.leadReturnPct.toFixed(2)}%</span>{" "}
                  (RS {r.leadRs.toFixed(0)})
                  {" · "}{r.memberCount}종목 · {r.upCount}개↑
                </div>
                {r.topMembers.length > 0 && (
                  <div className="label-sm ink-muted" style={{ marginTop: 3 }}>
                    {r.topMembers.map((m) => `${m.ticker} ${m.returnPct >= 0 ? "+" : ""}${m.returnPct.toFixed(2)}%`).join(" · ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
