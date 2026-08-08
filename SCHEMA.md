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

## `HoldingRow.spark` / `Set2HoldingRow.spark`, `AlphaDecay.profitFactor` (added 2026-08-06)

Small additions borrowed from ideas seen in `tfbook/briefing_chartdecks/` (a different,
external system's daily briefing tool — not something this dashboard displays directly, just
metrics/visualizations worth reusing on our own data): `spark` is a 60-trading-day close-price
array per holding (rendered as a small inline sparkline, `src/components/dashboard/Sparkline.tsx`),
sourced from `data_io.get_daily_ohlcv()`'s existing per-ticker cache (`refresh=False` — the
day's signals scan already refreshed it). `AlphaDecay.profitFactor` is gross win ÷ |gross loss|
from `trade_log.csv`, `null` when there's no loss to divide by (incl. zero closed trades).

## `themeLeadership` — leading-theme count trend (added 2026-08-06)

`ThemeLeadership { points: ThemeLeadershipPoint[], bandLo, bandHi }`, trailing ~65 trading
days. `ThemeLeadershipPoint { date, nLeading, nTotal }` — count of industries whose average
`total_score` clears the private repo's `exposure.THEME_STRONG_THRESHOLD` (60, absolute) that
day, out of all industries with ≥1 scanned stock. `bandLo`/`bandHi` are the 25th/75th
percentile of this repo's own 3-month series — **not** copied from any external reference
band, computed fresh each export.

Deliberately does not reuse the existing `theme_leading` per-ticker flag (G1) — that's a
75th-percentile-of-the-day cutoff, so its daily leading-industry count is nearly constant at
~25% of all industries by construction and wouldn't show a meaningful trend. This field uses
an absolute score threshold instead, so the count actually varies day to day (seen ranging
33–46 out of 146 industries over the initial 3-month backfill).

## `phaseTrend` — base Phase distribution, 3-month (added 2026-08-06)

`PhaseTrend { points: PhasePoint[], greenPct, agingPct }`, trailing ~65 trading days.
`PhasePoint { date, universe, counts: PhaseCounts }` — daily stacked counts across 10
lifecycle stages (`4plus`/`4`/`5plus`/`5`/`3`/`2`/`1`/`6`/`7`/`0`, see labels in
`PhaseTrendCard.tsx`). `greenPct`/`agingPct` are the latest day's derived headline metrics
(entry-candidate pool % and market-aging %).

Source: private repo's new `pattern_engine.classify_phase()` — an **approximation**, not a
byte-exact port. The concept and the 10-stage naming/color scheme come from
`tfbook/briefing_chartdecks/`'s briefing tool (a different, external system), but only its
client-side JS (label/color/stack-order constants) was recoverable — the actual
classification thresholds are computed server-side there and weren't available. The private
repo instead built its own thresholds from columns it already computes (`dist_pivot_pct`,
`base_depth_pct`, `rs_rating`, `trend_pass`, `extension_pct_200sma`, `rs_divergence`, etc.),
confirmed with the user before implementing — expect real threshold differences from
whatever the source system actually uses. `data/phase_history.csv` (private repo) was
backfilled 63 trading days by re-running the signal computation over cached price history,
kept as its own file for the same reason as `da_trend_history.csv` above.

## `daTrend` — Distribution/Rally Day 3-month trend (added 2026-08-06)

`DaTrendPoint[]`, trailing ~65 trading days: `date`, `gspcDd`/`ixicDd` (25-day rolling
Distribution Day count for S&P500/Nasdaq), `gspcRd`/`ixicRd` (same for Rally Day). Source:
private repo's `data/da_trend_history.csv`, a file dedicated to this chart — deliberately
*not* read from `market_pulse_history.csv`, which only has recorded history back to
2026-07-22 and mixes many other columns/consumers (e.g. the regime sparkline) that weren't
worth the risk of backfilling around. The private repo backfilled 2026-05-07~08-06 by
recomputing `distribution_days()`/`rally_days()` from cached index price history (a pure
function of past OHLCV, safe to reconstruct retroactively — values may differ ±1 from the
same date's live-recorded number due to yfinance volume revisions). `run_daily.py` appends
one row per trading day going forward, so the window keeps rolling.

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

**Backtest field added 2026-08-06** (`Set2Data.backtest`, `Set2BacktestSummary` in
`types.ts`): same shape as the main account's `BacktestSummary` (`startDate`/`endDate`/
`totalReturnPct`/`mddPct`/`nTrades`/`winRatePct`/`benchmarks`) plus an `exitReasons` array
(`reason` raw key — `stop`/`stop_locked8`/`trim1_24pct`/`trim2_50pct`/`final_100` —
`count`, `avgPnlPct`) unique to Set2's stop/trim ladder. Korean labels and per-reason colors
are assigned client-side in `Set2Card.tsx`, not exported, to keep the export "outcomes only"
per the design rule above. Source: `backtest.run_backtest_set2()` (private repo,
`data/backtest_{nav_history,trade_log,summary}_set2.csv/json`, canonical no-suffix-variant
filenames matching the live Set2 file naming convention) — first run 2026-08-06, 5y window,
+107.27%/-29.80% MDD, 74 trades.

**Main account `DashboardData.backtest` field removed 2026-08-07**: the main account's live
position sizing changed that day (`MAX_POSITIONS` 12→4, runner cap 5→2, added a 25%-of-NAV
per-position cap — see the private repo's worklog), so the existing 5-year backtest baseline
(computed under the old 12/5/uncapped sizing) no longer represents what the live account
actually runs. Rather than show a stale/mismatched number publicly, `BacktestSummaryCard.tsx`
and the `backtest` field were deleted outright (`BacktestSummary`/`BenchmarkReturn` types kept,
since `Set2BacktestSummary` still extends `BacktestSummary`). Set2's sizing didn't change, so
its backtest field/card stays. If the main backtest is ever re-run under the new sizing and
the number is worth publishing again, re-add the field/card rather than resurrecting the old
baseline.

**Bug fixed 2026-08-06 (private repo, `paper_trader/run_daily.py`):** the
Upstash push ran inside the main-account update, *before* the Set2 account
updated for the day — so `set2` in the KV blob was always one trading day
stale relative to `main`, even though `generatedAt`/main data looked fresh.
Fixed by moving the push to after both accounts update (see private repo
commit `50a2f9d`). No schema/type change here, just noting it since it
looked like a dashboard bug from this side.

## `HoldingRow.stopDistPct` / `.statusCat` / `.lockTier` / `.isBe` (added 2026-08-08)

Another idea borrowed from `tfbook/briefing_chartdecks/` (per-position 손절여유/보호단계 status
tags). `stopDistPct` = distance from `lastClose` to the actual stop price, as a % of
`lastClose` (derived from `entryPx`/`currentStopPct`, not a new field). `statusCat` is one of
`critical`/`review`/`protect`/`normal` — **not** a byte-exact port: the briefing's 4-way
category is computed server-side there and wasn't recoverable, only its `stopDist` 4%/7% color
cutoffs were visible client-side. The private repo reused those two cutoffs as-is and added its
own split for the remaining range (`protect` if `currentStopPct >= 0`, i.e. stop already locked
at or above breakeven; `normal` otherwise) — confirmed with the user before implementing.
`lockTier` (1-based index into `LOCK_TIERS`, `null` if the stop is still below breakeven) and
`isBe` (`lockTier === 1`, i.e. stop locked exactly at breakeven) are outcomes of the existing
Lock-ratchet mechanism, not new business logic. Source: `paper_trader.portfolio.position_status()`.

**`Set2HoldingRow` (added 2026-08-08, same day)**: `stopDistPct`/`statusCat` only — reuses the
same `position_status()` since its stopDist/cat derivation only needs `entryPx`/`lastClose`/
`currentStopPct` (account-agnostic). No `lockTier`/`isBe`: Set2's stop only ever takes two
values (-8% initial, +8% after the +24%-gain trim), neither of which coincides with any
`LOCK_TIERS` tier value, so those fields would always be `null`/`false` — not worth exporting.

## `NavPoint.spy` / `.qqq` / `.tqqq` (added 2026-08-08, §16-A)

Another `tfbook/briefing_chartdecks/` idea — raw daily close prices (not rebased) for the three
benchmark ETFs, main account's `navHistory` only (Set2 unchanged). `NavChart.tsx` rebases each
series to the live NAV's own starting value client-side and derives both the overlay lines and
their drawdown-from-peak lines there — same "compute outcomes client-side from raw prices"
pattern already used for the NAV drawdown subplot. Fields are optional and a series is only
plotted if every point in the window has a value (no partial/broken lines). Source: private
repo's `data/benchmark_history.csv`, backfilled once for the account's existing NAV history
range, appended one row per trading day going forward (`run_daily.py:_record_benchmarks()`) —
pure historical ETF closes, safe to backfill retroactively like `da_trend_history.csv`.

## Optional-field migration note (added 2026-08-08)

`HoldingRow.stopDistPct`/`.statusCat`/`.lockTier`/`.isBe` are typed optional, **not** because
they're sometimes absent by design, but because a KV blob written before this field existed
still validates against the type and must not crash the UI (`generatedAt`'s original
precedent above, restated here after actually breaking a preview deployment this way once —
see private repo `WORKLOG.md` 2026-08-08). Any field added to an exported type from now on
should default to optional unless there's a hard guarantee every already-live KV blob has it.

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
