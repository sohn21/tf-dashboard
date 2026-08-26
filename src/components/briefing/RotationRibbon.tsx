import type { Rotation } from "@/lib/types";
import { TermButton } from "./TermTrigger";

const ROW_H = 15;
const COL_W = 8;
const LABEL_W = 150;

function bandColor(score: number, strong: number, concern: number): string {
  if (score >= strong) return "var(--good)";
  if (score >= concern) return "var(--warning)";
  return "var(--border)";
}

export function RotationRibbon({ rotation }: { rotation: Rotation | null | undefined }) {
  if (!rotation || rotation.dates.length === 0 || rotation.themes.length === 0) {
    return (
      <div className="blueprint" style={{ padding: 16 }}>
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <p className="ink-muted">로테이션 히스토리 없음</p>
      </div>
    );
  }

  const { dates, themes, sectors, themeStrongThreshold: strong, themeConcernThreshold: concern } = rotation;
  const latestDate = dates[dates.length - 1];
  const w = LABEL_W + dates.length * COL_W + 8;
  const h = themes.length * ROW_H;
  const daysNote =
    dates.length >= 14 ? `${dates.length}거래일` : `${dates.length}거래일 — 축적 초반, 매일 자동으로 넓어짐`;

  return (
    <div className="blueprint" style={{ padding: "16px 18px" }}>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
        테마 상위 {themes.length}개 · {daysNote} · 오늘({latestDate}) 기준 정렬
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto", maxHeight: 340 }}>
        {themes.map((row, ri) => {
          const y = ri * ROW_H;
          return (
            <g key={row.name}>
              <text x={LABEL_W - 6} y={y + ROW_H - 4} textAnchor="end" fontSize={9.5} fill="var(--text-secondary)">
                {row.name.slice(0, 22)}
              </text>
              {row.scores.map((score, ci) => {
                if (score === null) return null;
                const x = LABEL_W + ci * COL_W;
                const isToday = dates[ci] === latestDate;
                return (
                  <rect
                    key={ci}
                    x={x}
                    y={y}
                    width={COL_W - 1}
                    height={ROW_H - 1}
                    fill={bandColor(score, strong, concern)}
                    fillOpacity={isToday ? 1 : 0.85}
                  >
                    <title>
                      {dates[ci]} {row.name}: {score.toFixed(1)}
                    </title>
                  </rect>
                );
              })}
            </g>
          );
        })}
      </svg>
      <div style={{ marginTop: 8, display: "flex", gap: 10, flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--text-secondary)" }}>
          <span style={{ width: 9, height: 9, background: "var(--good)", display: "inline-block" }} />
          강세(≥{strong.toFixed(0)})
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--text-secondary)" }}>
          <span style={{ width: 9, height: 9, background: "var(--warning)", display: "inline-block" }} />
          관심(≥{concern.toFixed(0)})
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, color: "var(--text-secondary)" }}>
          <span style={{ width: 9, height: 9, background: "var(--border)", display: "inline-block" }} />
          약세
        </span>
      </div>
      <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed var(--border)" }}>
        <div style={{ fontSize: 11, color: "var(--text-secondary)", marginBottom: 6 }}>섹터 절대점수(오늘)</div>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {sectors.map((s) => (
            <span
              key={s.name}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "var(--text-secondary)",
                border: "1px solid var(--border)",
                borderRadius: 4,
                padding: "2px 8px",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 99,
                  background: bandColor(s.score, strong, concern),
                }}
              />
              {s.name} {s.score.toFixed(0)}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function RotationSectionHeader() {
  return (
    <div className="shead">
      <span className="snum">03</span>
      <h2 className="stitle">섹터/테마 로테이션</h2>
      <TermButton termKey="rotation" />
    </div>
  );
}
