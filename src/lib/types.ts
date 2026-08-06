export type Regime =
  | "Confirmed Uptrend"
  | "Uptrend Resumed"
  | "Uptrend Under Pressure"
  | "Rally Attempt"
  | "Correction";

export type RegimeStatus = "good" | "warning" | "serious" | "critical";

export interface Summary {
  nav: number;
  cash: number;
  nPositions: number;
  candidatesPassed: number;
  regime: Regime;
  regimeStatus: RegimeStatus;
  maxExposurePct: number | null;
  newEntriesPerWeek: number | string | null;
  nRunners: number;
  nPyramided: number;
  nTrimmed: number;
}

export interface RegimeHistoryPoint {
  date: string;
  regime: Regime;
}

export interface NavPoint {
  date: string;
  nav: number;
}

export interface BenchmarkReturn {
  label: string;
  returnPct: number;
  excessPct: number;
}

export interface BacktestSummary {
  startDate: string;
  endDate: string;
  totalReturnPct: number;
  mddPct: number;
  nTrades: number;
  winRatePct: number;
  benchmarks: BenchmarkReturn[];
}

export interface MarketBreadth {
  above50emaPct: number | null;
  netNewHighs: number | null;
  universeCount: number | null;
}

export interface SentimentMetrics {
  vix: number | null;
  vixLabel: string;
  concentrationGap: number | null;
  concentrationLabel: string;
  breadthStrongPct: number | null;
  breadthStrongLabel: string;
  fearGreedScore: number | null;
  fearGreedLabel: string;
  cnnFearGreedScore: number | null;
  cnnFearGreedLabel: string;
}

export interface DistributionRally {
  spxDistributionDays: number;
  spxRallyDays: number;
  ndxDistributionDays: number;
  ndxRallyDays: number;
}

export interface DaTrendPoint {
  date: string;
  gspcDd: number;
  ixicDd: number;
  gspcRd: number;
  ixicRd: number;
}

export interface PhaseCounts {
  "4plus": number;
  "4": number;
  "5plus": number;
  "5": number;
  "3": number;
  "2": number;
  "1": number;
  "6": number;
  "7": number;
  "0": number;
}

export interface PhasePoint {
  date: string;
  universe: number;
  counts: PhaseCounts;
}

export interface PhaseTrend {
  points: PhasePoint[];
  greenPct: number;
  agingPct: number;
}

export interface ThemeLeadershipPoint {
  date: string;
  nLeading: number;
  nTotal: number;
}

export interface ThemeLeadership {
  points: ThemeLeadershipPoint[];
  bandLo: number;
  bandHi: number;
}

export interface NewHighLowRow {
  kind: "신고가" | "신저가";
  ticker: string;
  sector: string;
  industry: string;
  close: number;
  rsRating: number;
  extensionPct200sma: number | null;
}

export interface GateFunnelRow {
  key: string;
  label: string;
  count: number;
  total: number;
}

export const GATE_KEYS = ["G0", "G1", "G2", "G3", "G4"] as const;
export type GateKey = (typeof GATE_KEYS)[number];

export interface CandidateRow {
  ticker: string;
  sector: string;
  industry: string;
  close: number;
  marketCap: number | null;
  score: number;
  mtrState: number | null;
  mtrAccelerating: boolean;
  adRating: string | null;
  rvol: number | null;
  baseLabel: string | null;
  patternName: string | null;
  gates: Record<GateKey, boolean>;
  passed: boolean;
  newHigh52w: boolean;
  high52w: number | null;
}

export interface SectorRow {
  sector: string;
  industry: string;
  count: number;
  avgRs: number;
  avgScore: number;
  leading: boolean;
  passed: number;
}

export interface IndexRsRow {
  label: string;
  rs: number;
}

export interface HoldingRow {
  ticker: string;
  entryPx: number;
  lastClose: number;
  gainPct: number;
  currentStopPct: number;
  isRunner: boolean;
  pyramided: boolean;
  climaxTrimmed: boolean;
  spark: number[];
}

export interface TradeRow {
  ticker: string;
  entryDate: string;
  exitDate: string;
  entryPx: number;
  exitPx: number;
  pnlPct: number;
  reason: string;
}

export interface Set2HoldingRow {
  ticker: string;
  entryPx: number;
  lastClose: number;
  gainPct: number;
  currentStopPct: number;
  trimStage: number;
  spark: number[];
}

export interface Set2ExitReasonRow {
  reason: string;
  count: number;
  avgPnlPct: number;
}

export interface Set2BacktestSummary extends BacktestSummary {
  exitReasons: Set2ExitReasonRow[];
}

export interface Set2Data {
  nav: number;
  cash: number;
  nPositions: number;
  navHistory: NavPoint[];
  holdings: Set2HoldingRow[];
  recentTrades: TradeRow[];
  backtest: Set2BacktestSummary | null;
}

export interface AlphaDecay {
  reliable: boolean;
  overallWinRate: number | null;
  recentWinRate: number | null;
  decayPp: number | null;
  status: string;
  nOverall: number;
  nRecent: number;
  profitFactor: number | null;
}

export interface DashboardData {
  generatedAt: string;
  signalsDate: string;
  summary: Summary;
  regimeHistory: RegimeHistoryPoint[];
  navHistory: NavPoint[];
  backtest: BacktestSummary | null;
  breadth: MarketBreadth | null;
  sentiment: SentimentMetrics | null;
  distributionRally: DistributionRally | null;
  daTrend: DaTrendPoint[];
  phaseTrend: PhaseTrend | null;
  themeLeadership: ThemeLeadership | null;
  newHighsLows: NewHighLowRow[];
  gateFunnel: GateFunnelRow[];
  candidates: CandidateRow[];
  sectorBreakdown: SectorRow[];
  indexRs: IndexRsRow[];
  holdings: HoldingRow[];
  recentTrades: TradeRow[];
  alphaDecay: AlphaDecay;
  set2: Set2Data | null;
}
