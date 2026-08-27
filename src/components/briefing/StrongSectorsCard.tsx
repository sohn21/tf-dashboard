import type { Rotation } from "@/lib/types";

const WEAK = 38; // 원본 §03: <38 = 약세 (이식값 53/45/38)

function rowMeta(score: number, strong: number, concern: number): { c: string; tag: string } {
  if (score >= strong) return { c: "var(--good)", tag: "강세" };
  if (score >= concern) return { c: "var(--warning)", tag: "관심" };
  if (score < WEAK) return { c: "var(--critical)", tag: "약세" };
  return { c: "var(--text-muted)", tag: "중립" };
}

function Row({ name, score, strong, concern }: { name: string; score: number; strong: number; concern: number }) {
  const { c, tag } = rowMeta(score, strong, concern);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "5px 0",
        borderBottom: "1px dashed var(--border)",
        fontSize: 13,
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
        <span style={{ width: 9, height: 9, borderRadius: 99, background: c }} />
        {name}
      </span>
      <span>
        <b className="tabular">{score.toFixed(1)}</b> <span style={{ fontSize: 11, color: c }}>{tag}</span>
      </span>
    </div>
  );
}

function Panel({
  title,
  sub,
  rows,
  empty,
  borderColor,
  strong,
  concern,
}: {
  title: string;
  sub: string;
  rows: { name: string; score: number }[];
  empty: string;
  borderColor: string;
  strong: number;
  concern: number;
}) {
  return (
    <div className="blueprint" style={{ borderColor, padding: "12px 14px" }}>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      <div style={{ fontFamily: "var(--font-heading)", fontSize: 15, fontWeight: 600, color: borderColor, marginBottom: 6 }}>
        {title}{" "}
        <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 400 }}>{sub}</span>
      </div>
      {rows.length === 0 ? (
        <p className="ink-muted" style={{ fontSize: 12 }}>
          {empty}
        </p>
      ) : (
        rows.map((r) => <Row key={r.name} name={r.name} score={r.score} strong={strong} concern={concern} />)
      )}
    </div>
  );
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
  const upper = sorted.filter((s) => s.score >= concern);
  const lower = sorted.filter((s) => s.score < concern);
  const nStrong = upper.filter((s) => s.score >= strong).length;
  const nWatch = upper.length - nStrong;

  return (
    <div>
      <div style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 10 }}>
        강세(주도, ≥{strong}) <b>{nStrong}</b>개 · 관심({concern}~{strong}) <b>{nWatch}</b>개 · {concern} 미만 <b>{lower.length}</b>개
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12 }}>
        <Panel
          title="강세 · 관심 대역"
          sub={`종합점수 ≥ ${concern}`}
          rows={upper}
          empty={`≥${concern} 섹터 없음 — 광역 강세 부재`}
          borderColor="var(--good)"
          strong={strong}
          concern={concern}
        />
        <Panel
          title="약세 섹터"
          sub={`종합점수 < ${concern}`}
          rows={lower}
          empty="약세 섹터 없음"
          borderColor="var(--critical)"
          strong={strong}
          concern={concern}
        />
      </div>
    </div>
  );
}
