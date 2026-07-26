import type { RegimeHistoryPoint } from "@/lib/types";

const REGIME_COLOR_VAR: Record<string, string> = {
  "Confirmed Uptrend": "--good",
  "Uptrend Resumed": "--good",
  "Uptrend Under Pressure": "--warning",
  "Rally Attempt": "--serious",
  Correction: "--critical",
};

export function RegimeSparkline({ data }: { data: RegimeHistoryPoint[] }) {
  if (data.length === 0) {
    return <p className="ink-muted">레짐 히스토리 없음</p>;
  }
  return (
    <>
      <div style={{ display: "flex", gap: 2, alignItems: "center" }}>
        {data.map((row, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              background: `var(${REGIME_COLOR_VAR[row.regime] ?? "--text-muted"})`,
              height: 20,
              borderRadius: 2,
            }}
            title={`${row.date}: ${row.regime}`}
          />
        ))}
      </div>
      <div className="label-sm ink-muted" style={{ marginTop: 6 }}>
        {data[0].date} ~ {data[data.length - 1].date} ({data.length}일)
      </div>
    </>
  );
}
