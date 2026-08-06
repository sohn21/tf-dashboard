export function Sparkline({ values, width = 90, height = 28 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return null;

  const vmin = Math.min(...values);
  const vmax = Math.max(...values);
  const range = vmax - vmin || 1;
  const up = values[values.length - 1] >= values[0];
  const color = up ? "var(--good)" : "var(--critical)";

  const xOf = (i: number) => (width * i) / (values.length - 1);
  const yOf = (v: number) => height - ((v - vmin) / range) * height;

  const points = values.map((v, i) => [xOf(i), yOf(v)] as const);
  const pathD = "M " + points.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" L ");
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} role="img" aria-label="최근 가격 추이">
      <path d={pathD} fill="none" stroke={color} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={last[0]} cy={last[1]} r={2} fill={color} />
    </svg>
  );
}
