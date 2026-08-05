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

## Metadata fields

`generatedAt` (added 2026-07-27) is a plain export-time timestamp
("YYYY-MM-DD HH:MM KST"), not a scoring input — no exclusion concerns.
Existing KV blobs written before this field existed will render it as
`undefined` in the UI until the next daily export overwrites the key.

## `set2` — second live account (added 2026-08-05)

A completely separate $10,000 paper account (`data/paper_portfolio_set2.json`
in the private repo) running a different stop/trim ladder than the main
account: -8% initial stop; at +24% gain sell 30% and lock the stop to +8%;
at +50% sell half the remainder; at +100% sell all. Max 4 positions, 25%
NAV cap per position. Candidate selection reuses the main account's gates
(G0–G4)/guards — only sizing and exits differ. `null` until the account has
run at least once (file doesn't exist yet in a fresh clone/before
2026-08-05). No backtest yet — live-only for now, `Set2Data` has no
`backtest` field.

## Source of truth

`src/lib/types.ts` — `DashboardData` and its nested types are the
canonical schema. When the private repo's export script (`paper_trader/`)
is written, it must produce JSON that satisfies this shape. If the shape
changes, update `types.ts` first and treat it as the spec.

## Storage

- Provider: **Upstash Redis** via Vercel Marketplace (`@upstash/redis`) —
  "Vercel KV" as a first-party product is sunset; Upstash is its
  functional replacement, provisioned 2026-07-27 and connected to this
  project. Env vars: `KV_REST_API_URL` / `KV_REST_API_TOKEN` (also
  `REDIS_URL` / `KV_URL` if using a raw Redis client instead of the REST
  client).
- Key: `dashboard:latest` (single JSON blob, whole-object overwrite daily)
- No history/versioning in KV — daily snapshots are ephemeral by design,
  consistent with "no historical signal data in public infra"
