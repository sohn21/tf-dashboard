import type { Rotation } from "@/lib/types";

function bandColor(score: number, strong: number, concern: number): string {
  if (score >= strong) return "var(--good)";
  if (score >= concern) return "var(--warning)";
  return "var(--border)";
}

export function StrongSectorsCard({ rotation }: { rotation: Rotation | null | undefined }) {
  if (!rotation || rotation.sectors.length === 0) {
    return (
      <div className="blueprint" style={{ padding: 16 }}>
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <p className="ink-muted">섹터 점수 히스토리 없음</p>
      </div>
    );
  }

  const { sectors, sectorStrongThreshold: strong, sectorConcernThreshold: concern } = rotation;
  const sorted = [...sectors].sort((a, b) => b.score - a.score);
  const nStrong = sectors.filter((s) => s.score >= strong).length;

  return (
    <div className="blueprint" style={{ padding: "16px 18px" }}>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
        강세 {nStrong}/{sectors.length}개
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {sorted.map((s) => (
          <span
            key={s.name}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: "5px 12px",
            }}
          >
            <span style={{ width: 9, height: 9, borderRadius: 99, background: bandColor(s.score, strong, concern) }} />
            {s.name} <b>{s.score.toFixed(1)}</b>
          </span>
        ))}
      </div>
    </div>
  );
}
