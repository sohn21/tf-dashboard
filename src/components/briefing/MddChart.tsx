import type { NavPoint } from "@/lib/types";
import { TermTrigger } from "./TermTrigger";

export function MddChart({ navHistory }: { navHistory: NavPoint[] }) {
  if (navHistory.length < 2) {
    return (
      <div className="blueprint" style={{ padding: 16 }}>
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <p className="ink-muted">NAV 기록 부족</p>
      </div>
    );
  }

  let runningMax = navHistory[0].nav;
  const dd = navHistory.map((p) => {
    runningMax = Math.max(runningMax, p.nav);
    return ((p.nav / runningMax - 1) * 100);
  });
  const dates = navHistory.map((p) => p.date);
  const n = dd.length;
  const w = 700, h = 180, padL = 42, padR = 12, padT = 10, padB = 24;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const vmin = Math.min(...dd, -1);

  const xOf = (i: number) => (n === 1 ? padL : padL + (plotW * i) / (n - 1));
  const yOf = (v: number) => padT + (plotH * (0 - v)) / (0 - vmin);

  const pts = dd.map((v, i) => [xOf(i), yOf(v)] as const);
  const pathD = "M " + pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
  const zeroY = yOf(0);
  const areaD = `${pathD} L ${pts[pts.length - 1][0].toFixed(1)},${zeroY.toFixed(1)} L ${pts[0][0].toFixed(1)},${zeroY.toFixed(1)} Z`;
  const mddVal = Math.min(...dd);
  const mddIdx = dd.indexOf(mddVal);
  const dateIdxs = n >= 3 ? [0, Math.floor(n / 2), n - 1] : [0];

  return (
    <div className="blueprint" style={{ padding: "16px 18px" }}>
      <span className="corner tl" />
      <span className="corner tr" />
      <span className="corner bl" />
      <span className="corner br" />
      <div style={{ fontSize: 13, marginBottom: 8 }}>
        <TermTrigger termKey="mddterm" label="MDD" />{" "}
        <b style={{ color: "var(--critical)" }}>{mddVal.toFixed(1)}%</b>{" "}
        <span style={{ fontSize: 11, color: "var(--text-secondary)" }}>({dates[mddIdx]})</span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "auto" }}>
        <line x1={padL} y1={zeroY} x2={w - padR} y2={zeroY} stroke="var(--border)" />
        <path d={areaD} fill="var(--critical)" fillOpacity={0.12} />
        <path d={pathD} fill="none" stroke="var(--critical)" strokeWidth={2} />
        <circle cx={pts[mddIdx][0]} cy={pts[mddIdx][1]} r={3.5} fill="var(--critical)" />
        <text x={padL - 6} y={zeroY + 3} textAnchor="end" fontSize={9.5} fill="var(--text-muted)">
          0%
        </text>
        <text x={padL - 6} y={padT + plotH + 3} textAnchor="end" fontSize={9.5} fill="var(--text-muted)">
          {vmin.toFixed(0)}%
        </text>
        {dateIdxs.map((i) => (
          <text key={i} x={xOf(i)} y={h - 4} textAnchor="middle" fontSize={9.5} fill="var(--text-secondary)">
            {dates[i].slice(5)}
          </text>
        ))}
      </svg>
    </div>
  );
}
