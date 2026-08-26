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

## `benchmarkCandles` — 5-benchmark daily OHLC, 6 months (added 2026-08-12)

`Record<string, CandlePoint[]>` keyed by ticker (`SPY`/`QQQ`/`TQQQ`/`GLD`/`BTC-USD`), each a
list of `{date, open, high, low, close}`. Renders as a 3x2 grid of small-multiple candlestick
charts directly under the NAV trend card. Window is a **calendar-date cutoff** (today minus 6
months), not "last N rows" — BTC-USD trades 7 days/week so a row-count cutoff would give it a
shorter actual window than the 5-day-a-week equity/ETF tickers; expect BTC-USD's array to have
noticeably more points than the others for the same date range. Source: private repo's
`data/price_cache/<ticker>.csv` (2-year rolling OHLCV cache already maintained daily for
signal-computation purposes) — a different source than `NavPoint.spy`/etc. above, which only
has close price; this needed full OHLC so it reads the raw per-ticker cache instead of
`benchmark_history.csv`. A ticker's array is `[]` (never missing/undefined) if its cache file
doesn't exist yet.

## `CandidateRow.overview` — company overview & fundamentals (added 2026-08-13)

`CompanyOverview | null`, optional field. Source: private repo's `paper_trader/fundamentals.py`
`get_company_overview()` (yfinance `Ticker.info`, 7-day cache, scoped to the ~15 tickers actually
shown in the candidates table — not the full universe). Contains `businessSummary` (yfinance
`longBusinessSummary`, untruncated here — UI truncates for display), `trailingPE`/`forwardPE`,
`debtToEquityPct`/`dividendYieldPct` (yfinance already returns these two as %-scale numbers, e.g.
`1.05` means 1.05% — do **not** multiply by 100 a second time, that produced a real 105%-dividend-
yield display bug caught and fixed in the private dashboard the same day), `totalRevenue`,
`grossMarginsPct` (this one *is* a 0–1 fraction from yfinance, converted to % in the export step),
`freeCashflow`, and `compRating` (the existing display-only Comp Rating proxy, just carried along
here per-candidate rather than only living on the signals CSV). Consistent with the "outcomes
only" design rule above — all fields are reference/valuation data, not scoring/gating internals.
`null` when yfinance returned nothing for that ticker (best-effort, not all tickers have full
`.info` coverage). Renders as collapsible `<details>` cards under the candidates table
(`CandidatesTable.tsx`), display-only — not wired into any gate or score.

`businessSummary` is machine-translated to Korean at fetch time (private repo's
`fundamentals._translate_to_korean`, `deep-translator`'s free Google Translate frontend, no API
key) — the cached value is Korean, not the raw yfinance English text. Falls back to English on
translation failure (best-effort).

**`HoldingRow.overview`/`.sector`/`.industry` (added 2026-08-13, same day/shape)**: the same
`CompanyOverview` shape and rendering (`OverviewCards.tsx`, extracted as a shared component used
by both `CandidatesTable.tsx` and `HoldingsTable.tsx`) also appears under the holdings table, for
currently-held positions rather than today's candidates. `sector`/`industry` are looked up from
the same day's signals row when the ticker is present there; `null` otherwise.

**`LadderHoldingRow.overview`/`.sector`/`.industry` (added 2026-08-13, same day/shape)**: same
addition, this time to the ladder account's holdings (`LadderCard.tsx`) — same `_company_overview()`
helper in `export_public.py`, same `OverviewCards.tsx` component, so a ticker held in both the
core and ladder accounts on the same day makes exactly one `fundamentals.get_company_overview()`
cache read (no duplicate network calls, `fetch_company_overview_raw()` only runs on a cache miss).

## `ratchet` — third live account (added 2026-08-20)

A completely separate $10,000 paper account (`data/paper_portfolio_ratchet.json` in the private
repo), §14-C "Lock 래칫" — the private repo's third live account alongside the main account and
`ladder`. Candidate selection and sizing are identical to `ladder` (same G0-G5 gates/guards, max 4
positions, 25% NAV cap per position, no §1-F exposure cap/pyramiding/switching) — only the exit
rule differs: no partial sells (unlike `ladder`'s trim ladder). Initial stop -7%; at +15% max-gain
the stop moves to breakeven; from +25% onward the stop ratchets up through a fixed schedule
(+25%→+10%, +35%→+20%, +50%→+25%, +70%→+35%, +100%→+60%, +200%→+150%, ... +100pp-spaced above
+600%) and never loosens. Positions that have ever reached +100% max-gain ("runners") don't exit
on a stop breach alone while price is still above the 50-day EMA — only a simultaneous 50-EMA
breach closes them. `null` until the account has run at least once.

`RatchetData` mirrors `LadderData`'s shape (`nav`/`cash`/`nPositions`/`navHistory`/`holdings`/
`recentTrades`/`backtest`/`alphaDecay`), with two differences on `RatchetHoldingRow`: no
`trimStage` (ratchet never partially sells), and instead `maxGainPct` (best closed-price gain
seen so far, drives the lock level) plus `isRunner` (`maxGainPct >= 100`, the 50-EMA-mercy flag).
`RatchetBacktestSummary.exitReasons`' `reason` key is either `"stop"` (initial -7% floor) or a
dynamically-generated `"stop_lock{N}"` (N = the locked stop % at exit) — not a fixed small set
like `ladder`'s, so `RatchetCard.tsx` renders reasons by count rather than a hardcoded order/color
map. Source: `backtest.run_backtest_ratchet()` (private repo,
`data/backtest_{nav_history,trade_log,summary}_ratchet.csv/json`) — first iwb runs 2026-08-20, 5y
+245.98%/-29.12% MDD (34 trades) and 20y +856.57%/-38.45% MDD (112 trades), both beating `ladder`
on return but with meaningfully worse MDD (the tradeoff: ratchet earns bull-market convexity by
giving up early-bear-market defense — confirmed by a 19-year walk-forward split, ratchet wins
9/19 one-year windows concentrated in strong-recovery years, ladder wins the initial-decline years
including 2021-22 by -29pp).

## `rsLeading` — RS Line 선행 신호 (added 2026-08-25)

`RsLeadingRow[]` — tickers where the RS Line hit a 252-trading-day high (`rs_new_high` in
`signals.py`) but the price itself hasn't yet made a 52-week high (`price_new_high_52w` is
false), i.e. `signals.py`'s `rs_leading = rs_new_high AND NOT price_new_high_52w`. Concept from
the private repo's `tfbook/추세추종_투자전략_리포트.pdf` §5.2, which calls this the strongest
pre-breakout entry signal (relative strength confirms before price does) — these names never
show up in `newHighsLows` since price hasn't broken out, so this is a separate discovery list.
Fields: `ticker`/`sector`/`industry`/`close`/`rsRating`/`mtrState` — deliberately **excludes**
`dist_pivot_pct` even though it would be a natural addition (how close to the G2 pivot window),
per the "Explicitly excluded" rule above (it's a raw G2 threshold input). `CandidateRow.rsLeading`
is the same boolean surfaced per-candidate for the ⭐ badge in `CandidatesTable.tsx` (next to the
existing 🔺 new-high badge). Both fields optional per the standard migration pattern.

## `stalking` — 다음 리더 추적 (Stalking, added 2026-08-26)

`StalkingRow[]`, top 30 by `stalkingScore` descending. Ported from the private repo's original
"전략실" dashboard ⑨ panel (a pre-entry candidate scorer, completely separate from the G0-G4
gate funnel and from `rsLeading`) — scans the RS 70~89 band (not yet a leader, but close) for
names likely to become the *next* leader. Source: `paper_trader/stalking.py`, `signals.py`'s
`stalking_score`/`stalking_grade` columns (`stalking_score_row()` already applies the eligibility
filter — this list only contains names that passed it).

Fields exported: `ticker`/`sector`/`industry`/`close`/`rsRating`/`stalkingScore`/`stalkingGrade`
("S"/"A"/"B"/"C", S=75+/A=60~74/B=45~59/C=<45). Deliberately **excludes** the four sub-scores
that sum to `stalkingScore` (RS_norm/AD/Passes/EarlyZone) and the filter thresholds
(`rs∈[70,89]`, `trend_pass≥6`, `ad_score≥45`) — same "outcomes only" rule as everywhere else, and
`trend_pass` specifically is already on the excluded-raw-column list above. Note for context (not
enforced by the schema): the private repo's `AD`/`EarlyZone` sub-scores are themselves
approximations of the original friend-side system (whose exact formula isn't available), so
`stalkingScore` numbers won't byte-match the original tool even before this schema's exclusions.

## `catalyst` — 오늘의 발화 테마 (Catalyst + Sustain, added 2026-08-26)

`CatalystData | null` — ported from the private repo's original "전략실" dashboard ⑦ panel, a
**daily** theme-ignition/decay state machine (distinct from `themeLeadership`, which tracks a
persistent multi-day flag). Source: `paper_trader/catalyst.py`, backed by
`data/catalyst_history.csv` (private repo, not exported directly — only the latest day's rows).

`CatalystData.ignited: CatalystIgnitedRow[]` — that day's top-8 "ignited" industry clusters:
avg same-day return in the top 8 across all industries AND clearing a floor (avg ≥1.0% or the
single best mover in the cluster ≥8%). `CatalystData.weakened: string[]` — industry names that
were ignited the prior trading day but dropped out of today's top-8 (this repo's own conservative
choice: unlike `ignited`, this is not itself a scoring threshold, just today-vs-yesterday set
difference, so it's fine to expose as a plain list per the "outcomes only" rule).

`CatalystIgnitedRow.badge` is the sustain streak label: `"new"` (day 1) → `"D+1"` → `"D+2"` →
`"D+3+ ★★★"` (4+ consecutive days = promoted to a "main theme" per the original panel's own
language). `reIgnited` is true when a cluster ignites again after a gap (streak resets to 1
either way, this flag is the only way to tell "brand new" from "back after a break"). `cascade`
is true when ≥50% of the cluster's members were up that day (broad participation, i.e. sector
rotation rather than one stock). `topMembers` is the top 5 members by same-day return within the
cluster.

Unlike `stalking`, every field here is an **exact** reproduction of the original panel's
algorithm — the tooltip text on the original spelled out the full formula, so there was no
approximation to make (the private repo's own addition on top of the original: same-industry
clusters need ≥2 members to count, otherwise a single stock could dominate as its own "cluster").
The one deliberately unported piece is `catalyst_tracker.py`'s optional live web-search news
tagging (`--with-catalyst` flag) — out of scope, this dashboard has no news-search capability.

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
