# Public dashboard data contract

The private `tf_project` repo writes one JSON object matching
`DashboardData` (`src/lib/types.ts`) to a single Vercel KV key
(`dashboard:latest`) once per trading day. This app reads only that key —
no other data source, no GitHub-committed JSON.

## Design rule

Only **outcomes** (computed scores, ratings, pass/fail flags, prices,
labels) are exported. Any field that is itself a threshold or parameter
used *inside* the scoring/gating logic is excluded, even if it would make
a nicer table column.

## Explicitly excluded (present in `data/signals_history/*.csv`, dropped here)

| raw column | why excluded |
|---|---|
| `dist_pivot_pct`, `pivot`, `pattern_pivot`, `pattern_dist_pivot_pct` | exact pivot proximity inputs to G2 |
| `base_depth_pct`, `base_weeks` | exact base-quality thresholds used by G2 |
| `momentum_pct_rank`, `trend_pass` | raw inputs to G4 / trend template scoring |
| `ascending_grade`, `pattern_score`, `pattern_stale_class`, `pattern_maturing`, `pattern_days_tracked` | pattern-engine internals |
| `rs_new_high`, `rs_accelerating`, `rs_divergence`, `day_return_pct`, `ema50`, `above_50ema` | raw signal inputs, redundant with derived fields we do expose |
| `theme_leading` (per-ticker) | exposed only pre-aggregated as `SectorRow.leading` |

Gate columns `G0`–`G4` and `passed` **are** exported, but as booleans only
— no description text anywhere in the UI explains what a gate checks
(confirmed 2026-07-27: legends intentionally omitted).

## Included, with a caveat

`mtrState`, `adRating`, `rvol`, `baseLabel` are exported as computed
values, and the UI colors them against fixed cutoffs (RVOL ≥1.4 / <0.8,
A/B vs D/E, base 1st/2nd vs 4th+). These cutoffs are standard textbook
O'Neil/Minervini conventions, not proprietary — decided 2026-07-27 to
keep the color coding rather than flatten it to plain numbers.

## Source of truth

`src/lib/types.ts` — `DashboardData` and its nested types are the
canonical schema. When the private repo's export script (`paper_trader/`)
is written, it must produce JSON that satisfies this shape. If the shape
changes, update `types.ts` first and treat it as the spec.

## Storage

- Key: `dashboard:latest` (single JSON blob, whole-object overwrite daily)
- No history/versioning in KV — daily snapshots are ephemeral by design,
  consistent with "no historical signal data in public infra"
