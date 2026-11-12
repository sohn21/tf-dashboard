import { Card } from "./Card";
import type { AnchorLedger, AnchorStat, AnchorControl } from "@/lib/types";

// 2026-11-13 A-2: 관찰 전용 앵커 원장. 계산은 tf_project paper_trader/anchor_ledger.py.
// 매매 규칙과 무관 — 목록에 처음 들어온 날 이후 5/20/60거래일 수익을 쌓아 두는 장부.
const W = ["r5", "r20", "r60"] as const;

function StatCells({ s }: { s: AnchorStat | null | undefined }) {
  if (!s) {
    return <td colSpan={3} className="ink-muted" style={{ textAlign: "center" }}>—</td>;
  }
  const dim = s.n < 30;
  const cls = dim ? "ink-muted" : s.avg > 0 ? "delta-good" : s.avg < 0 ? "delta-critical" : "";
  return (
    <>
      <td className="tabular ink-muted" style={{ textAlign: "right" }}>{s.n}</td>
      <td className={`tabular ${cls}`} style={{ textAlign: "right" }}>
        {s.avg > 0 ? "+" : ""}{s.avg.toFixed(1)}% <span className="label-sm">({s.win}%)</span>
      </td>
      <td className={`tabular ${cls}`} style={{ textAlign: "right" }}>
        {s.avgA === null ? "—" : `${s.avgA > 0 ? "+" : ""}${s.avgA.toFixed(1)}`}
      </td>
    </>
  );
}

function ControlCells({ c }: { c: AnchorControl | undefined }) {
  if (!c) return <td colSpan={3} className="ink-muted" style={{ textAlign: "center" }}>—</td>;
  return (
    <>
      <td className="tabular ink-muted" style={{ textAlign: "right" }}>{c.days}일</td>
      <td className="tabular" style={{ textAlign: "right" }}>
        {c.avg > 0 ? "+" : ""}{c.avg.toFixed(1)}% <span className="label-sm">({c.win}%)</span>
      </td>
      <td className="tabular" style={{ textAlign: "right" }}>
        {c.avgA === null ? "—" : `${c.avgA > 0 ? "+" : ""}${c.avgA.toFixed(1)}`}
      </td>
    </>
  );
}

export function AnchorLedgerCard({ data }: { data?: AnchorLedger | null }) {
  if (!data || !data.stats?.byType) return null;
  const { byType, control, overlap } = data.stats;
  const label = Object.fromEntries(data.types.map((t) => [t.key, t.label]));
  const tl = byType["theme_lead"];
  const ovKeys: [string, string][] = [["n1", "1개 타입"], ["n2", "2개 겹침"], ["n3+", "3개+ 겹침"]];
  return (
    <Card title={`앵커 원장 — 관찰 전용 (${data.firstDay} ~ ${data.lastDay} · ${data.nDays}일 · ${data.nAnchors.toLocaleString()}건)`}>
      <div className="label-sm ink-muted" style={{ marginBottom: 8 }}>
        목록에 처음 들어온 날 직전 미국장 종가 기준 +5/+20/+60거래일 평균 수익(승률)과 SPY 대비 α — 대조군(같은 날 유니버스 평균)과 비교
      </div>
      <div style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th rowSpan={2}>타입 · strong/working/failed</th>
              <th colSpan={3} style={{ textAlign: "center" }}>+5거래일</th>
              <th colSpan={3} style={{ textAlign: "center" }}>+20거래일</th>
              <th colSpan={3} style={{ textAlign: "center" }}>+60거래일</th>
            </tr>
            <tr>
              {W.map((w) => [
                <th key={`${w}n`} style={{ textAlign: "right" }}>n</th>,
                <th key={`${w}a`} style={{ textAlign: "right" }}>평균(승률)</th>,
                <th key={`${w}x`} style={{ textAlign: "right" }}>α</th>,
              ])}
            </tr>
          </thead>
          <tbody>
            {data.types.map((t) => {
              const row = byType[t.key];
              if (!row) return null;
              return (
                <tr key={t.key}>
                  <td title={t.rule}>
                    <b>{t.label}</b>{" "}
                    <span className="label-sm ink-muted">
                      {row.n}건 · <span className="delta-good">{row.status.strong}</span>/{row.status.working}/
                      <span className="delta-critical">{row.status.failed}</span>
                    </span>
                  </td>
                  {W.map((w) => <StatCells key={w} s={row[w]} />)}
                </tr>
              );
            })}
            <tr style={{ borderTop: "2px solid var(--color-neutral-300, #ccc)" }}>
              <td className="ink-secondary"><b>대조군</b> <span className="label-sm">유니버스 동일가중</span></td>
              {W.map((w) => <ControlCells key={w} c={control[w]} />)}
            </tr>
          </tbody>
        </table>
      </div>
      <div className="label-sm ink-secondary" style={{ marginTop: 8, lineHeight: 1.7 }}>
        {tl?.lead?.r20 && tl?.member?.r20 && (
          <div>
            발화테마 r20 — lead {tl.lead.r20.avg.toFixed(1)}% (n{tl.lead.r20.n}) vs member {tl.member.r20.avg.toFixed(1)}% (n{tl.member.r20.n})
          </div>
        )}
        <div>
          같은 날 여러 타입에 겹친 종목 r20 —{" "}
          {ovKeys
            .filter(([k]) => overlap[k]?.r20)
            .map(([k, l]) => `${l} ${overlap[k].r20!.avg.toFixed(1)}% (n${overlap[k].r20!.n})`)
            .join(" · ")}
        </div>
      </div>
      <details style={{ marginTop: 10 }}>
        <summary className="label-sm" style={{ cursor: "pointer" }}>최근 앵커 15건</summary>
        <div style={{ overflowX: "auto" }}>
          <table className="data-table" style={{ marginTop: 6 }}>
            <thead>
              <tr>
                <th>날짜</th><th>타입</th><th>종목</th>
                <th style={{ textAlign: "right" }}>수익</th>
                <th style={{ textAlign: "right" }}>α</th>
                <th style={{ textAlign: "right" }}>경과</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.slice(0, 15).map((a) => (
                <tr key={`${a.type}|${a.sym}|${a.date}`}>
                  <td className="tabular">{a.date.slice(5)}</td>
                  <td className="label-sm">
                    {label[a.type] ?? a.type}
                    {a.role ? ` (${a.role})` : a.accounts ? ` (${a.accounts.join("·")})` : ""}
                  </td>
                  <td><b>{a.sym}</b>{a.streak > 1 ? ` ×${a.streak}` : ""}</td>
                  <td className={`tabular ${a.ret === null ? "ink-muted" : a.ret > 0 ? "delta-good" : a.ret < 0 ? "delta-critical" : ""}`} style={{ textAlign: "right" }}>
                    {a.ret === null ? "—" : `${a.ret > 0 ? "+" : ""}${a.ret.toFixed(1)}%`}
                  </td>
                  <td className="tabular" style={{ textAlign: "right" }}>
                    {a.alpha === null ? "—" : `${a.alpha > 0 ? "+" : ""}${a.alpha.toFixed(1)}`}
                  </td>
                  <td className="tabular ink-muted" style={{ textAlign: "right" }}>{a.bd ?? 0}일</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
      <div className="label-sm ink-muted" style={{ marginTop: 8 }}>
        2수집일 안에 다시 들어오면 같은 앵커(×연속). 회색 = 표본 30건 미만(판단 보류). 관찰 전용 — 매매 규칙에 연결하지 않음.
      </div>
    </Card>
  );
}
