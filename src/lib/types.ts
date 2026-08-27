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
  spy?: number;
  qqq?: number;
  tqqq?: number;
  gld?: number;
  "btc-usd"?: number;
  samsung?: number;
  skhynix?: number;
  gncenergy?: number;
}

export interface CandlePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
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
  regime?: string | null; // §02 차트 배경 밴드용(있는 날만, 2026-07-22부터)
  breadthPct?: number | null; // §02 브레쓰 오버레이 선용
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

// RS 라인이 252일 신고가를 갱신했지만 주가 자체는 아직 52주 신고가가 아닌 종목(added
// 2026-08-25) — NewHighLowRow에는 안 잡히는 조기 후보군. tfbook/추세추종_투자전략_리포트.pdf
// §5.2의 "RS Leading" 개념.
export interface RsLeadingRow {
  ticker: string;
  sector: string;
  industry: string;
  close: number;
  rsRating: number;
  mtrState: number | null;
}

// 다음 리더 추적(Stalking, added 2026-08-26) — G0-G4 게이트와 무관한 사전추적 스코어러.
// RS 70~89(아직 리더 아님) 구간에서 stalkingScore(RS_norm 35%+AD 25%+Passes 20%+
// EarlyZone 20%)로 채점, 등급 S/A/B/C. 서브지표 자체는 SCHEMA.md 설계원칙에 따라 미노출.
export type StalkingGrade = "S" | "A" | "B" | "C";

export interface StalkingRow {
  ticker: string;
  sector: string;
  industry: string;
  close: number;
  rsRating: number;
  stalkingScore: number;
  stalkingGrade: StalkingGrade;
}

// Stalking 졸업(리더 등극, added 2026-08-26) — 과거 Stalking 후보풀(RS 70~89)에 있던
// 종목이 RS Rating 90+ 로 올라오면 기록. 매수 게이트/스코어와 무관한 참고용 배지.
export interface StalkingGraduatedRow {
  ticker: string;
  firstTrackedDate: string;
  lastTrackedDate: string;
  peakGrade: StalkingGrade;
  trackedRsEntry: number;
  graduatedDate: string;
  graduatedRs: number;
  daysTracked: number;
}

// 오늘의 발화 테마(Catalyst + Sustain, added 2026-08-26) — 일간 테마 점화/소멸 상태머신.
// theme_leading(지속형 다일 플래그)과 무관한 별개 지표. 발화 = 당일 industry 평균등락률
// 상위 8개 중 floor(평균≥1.0% 또는 lead≥8%) 통과분. sustain은 전일 대비 상태전이.
export interface CatalystTopMember {
  ticker: string;
  returnPct: number;
}

export interface CatalystIgnitedRow {
  industry: string;
  sector: string;
  avgReturnPct: number;
  leadTicker: string;
  leadReturnPct: number;
  leadRs: number;
  memberCount: number;
  upCount: number;
  cascade: boolean;
  streak: number;
  badge: string;
  reIgnited: boolean;
  topMembers: CatalystTopMember[];
}

export interface CatalystData {
  date: string;
  ignited: CatalystIgnitedRow[];
  weakened: string[];
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

export interface CompanyOverview {
  businessSummary: string | null;
  trailingPE: number | null;
  forwardPE: number | null;
  debtToEquityPct: number | null;
  dividendYieldPct: number | null;
  totalRevenue: number | null;
  grossMarginsPct: number | null;
  freeCashflow: number | null;
  compRating: number | null;
}

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
  // 옵셔널(2026-08-25, generatedAt 마이그레이션 패턴과 동일): RS Leading — 이 필드가
  // 추가되기 전에 쓰인 KV blob엔 없을 수 있음
  rsLeading?: boolean;
  high52w: number | null;
  // 옵셔널(2026-08-13, generatedAt 마이그레이션 패턴과 동일): 이 필드가 추가되기 전에 쓰인
  // KV blob엔 없을 수 있음. display-only 참고자료(게이트/스코어 미반영)
  overview?: CompanyOverview | null;
}

export interface SectorChip {
  sym: string;
  phase: string;
  rs: number;
  accel: boolean;
}

export interface SectorRow {
  sector: string;
  industry: string;
  count: number;
  avgRs: number;
  avgScore: number;
  leading: boolean;
  passed: number;
  chips?: SectorChip[] | null; // §04 개별 종목 칩 (RS 상위 ~12개 업종만)
  chipsMore?: number;
}

export interface SectorBandCounts {
  strong: number;
  watch: number;
  mid: number;
  weak: number;
  strongThreshold: number;
  concernThreshold: number;
  weakThreshold: number;
}

export interface IndexRsRow {
  label: string;
  rs: number;
}

export type HoldingStatusCat = "critical" | "review" | "protect" | "normal";

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
  // 옵셔널(2026-08-08): 이 필드들이 추가되기 전에 쓰인 KV blob엔 없을 수 있음 — 다음 일일
  // export 전까지는 undefined로 온다(generatedAt 필드 때와 같은 마이그레이션 패턴, SCHEMA.md 참고)
  stopDistPct?: number;
  statusCat?: HoldingStatusCat;
  lockTier?: number | null;
  isBe?: boolean;
  // 옵셔널(2026-08-12, 같은 마이그레이션 이유): 진입 시점 투자금액(원가)
  entryValue?: number;
  // 옵셔널(2026-08-13, 같은 마이그레이션 이유): CandidateRow.overview와 동일 소스/형태 —
  // 보유종목 표 아래에도 같은 기업개요/재무 요약 카드를 보여주기 위해 추가
  sector?: string | null;
  industry?: string | null;
  overview?: CompanyOverview | null;
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

// 래더 계좌(구 "세트2") 타입 — 2026-08-12: 타입명 + KV 스키마 필드명("set2"→"ladder") 모두 정리
export interface LadderHoldingRow {
  ticker: string;
  entryPx: number;
  lastClose: number;
  gainPct: number;
  currentStopPct: number;
  trimStage: number;
  spark: number[];
  // 옵셔널(2026-08-08, core account HoldingRow와 같은 마이그레이션 이유) — lockTier/isBe는
  // 래더엔 없음(LOCK_TIERS 없이 -8%→+8% 단일 락이라 개념이 안 맞음, SCHEMA.md 참고)
  stopDistPct?: number;
  statusCat?: HoldingStatusCat;
  // 옵셔널(2026-08-12, 같은 마이그레이션 이유): 진입 시점 투자금액(원가)
  entryValue?: number;
  // 옵셔널(2026-08-13, HoldingRow와 동일 마이그레이션 이유/형태)
  sector?: string | null;
  industry?: string | null;
  overview?: CompanyOverview | null;
}

export interface LadderExitReasonRow {
  reason: string;
  count: number;
  avgPnlPct: number;
}

export interface LadderBacktestSummary extends BacktestSummary {
  exitReasons: LadderExitReasonRow[];
}

export interface LadderData {
  nav: number;
  cash: number;
  nPositions: number;
  navHistory: NavPoint[];
  holdings: LadderHoldingRow[];
  recentTrades: TradeRow[];
  backtest: LadderBacktestSummary | null;
  alphaDecay: AlphaDecay;
}

// 래칫 계좌(§14-C Lock 래칫, 2026-08-20 추가) — 코어·래더와 별도인 세 번째 라이브 계좌.
// 래더와 달리 부분매도가 없어 trimStage 대신 maxGainPct/isRunner를 노출한다.
export interface RatchetHoldingRow {
  ticker: string;
  entryPx: number;
  lastClose: number;
  gainPct: number;
  currentStopPct: number;
  maxGainPct: number;
  isRunner: boolean;
  spark: number[];
  stopDistPct?: number;
  statusCat?: HoldingStatusCat;
  entryValue?: number;
  sector?: string | null;
  industry?: string | null;
  overview?: CompanyOverview | null;
}

export interface RatchetExitReasonRow {
  reason: string;
  count: number;
  avgPnlPct: number;
}

export interface RatchetBacktestSummary extends BacktestSummary {
  exitReasons: RatchetExitReasonRow[];
}

export interface RatchetData {
  nav: number;
  cash: number;
  nPositions: number;
  navHistory: NavPoint[];
  holdings: RatchetHoldingRow[];
  recentTrades: TradeRow[];
  backtest: RatchetBacktestSummary | null;
  alphaDecay: AlphaDecay;
}

// 3층 노출도(added 2026-08-26, /briefing 전용) — 우리 시스템은 원본처럼 lo~hi 밴드가 아니라
// REGIME_TABLE 기준 단일 상한값. L1(레짐) → 섹터가드 → 테마가드 순으로 깎은 최종값.
export interface Exposure {
  l1MaxPct: number;
  finalMaxPct: number;
  cutPct: number;
  sectorOk: boolean;
  themeOk: boolean;
}

// FTD(팔로우스루데이) — §01 표시 전용, 레짐 판정엔 미반영(§12-G 백테스트에서 승격 기각).
export interface Ftd {
  valid: boolean | null;
  daysAgo: number | null;
}

// §01 지수·자산 카드 — S&P/나스닥/러셀(분배일) + 비트코인/금/환율. 전일종가 대비 당일 등락률.
export interface MarketMetric {
  label: string;
  chgPct: number | null;
  level: number | null;
  levelPrefix: string;
  dd: number | null;
}

// 보호 룰(BE·LOCK 래칫 + O'Neill 8주룰, added 2026-08-26) — portfolio.py 상수 그대로 노출
// (계산 아님, 값 자체가 바뀌면 프론트도 자동 반영되게 하드코딩하지 않음).
export interface LockTier {
  gainPct: number;
  lockPct: number;
}

export interface ProtectionRules {
  lockTiers: LockTier[];
  oneillTriggerBdays: number;
  oneillThresholdPct: number;
  oneillHoldBdays: number;
}

// 섹터/테마 로테이션 리본(added 2026-08-26, /briefing 전용) — exposure.py:sector_theme_scores()
// 가 매일 쌓는 히스토리. dates가 짧을수록(2026-08-26부터 축적 시작) 초반엔 얇은 띠 1~2칸뿐 —
// 프론트는 dates 길이에 맞춰서만 그리고, 데이터가 느는 대로 자동으로 넓어진다.
export interface RotationThemeRow {
  name: string;
  scores: (number | null)[]; // dates와 같은 길이, 인덱스로 매칭
}

export interface RotationSectorRow {
  name: string;
  score: number;
}

export interface Rotation {
  dates: string[];
  themes: RotationThemeRow[];
  sectors: RotationSectorRow[];
  themeStrongThreshold: number;
  themeConcernThreshold: number;
  sectorStrongThreshold: number;
  sectorConcernThreshold: number;
}

// StockEasy(국내주식 모멘텀 사이드 프로젝트, added 2026-08-26, /briefing 12번 섹션 전용) —
// tf_project와 별개 저장소(/Users/sohn/work/stockeasy, non-git)의 KR 래더+스크리너 데이터.
// 원본 11개 섹션엔 없는 이 저장소 자체 추가.
export interface StockEasyPosition {
  code: string;
  name: string | null;
  market: string | null;
  sector: string | null;
  entryPx: number | null;
  lastClose: number | null;
  gainPct: number | null;
  currentStopPct: number | null;
}

export interface StockEasyCandidate {
  rank: number | null;
  name: string | null;
  sector: string | null;
  status: string | null;
  pctToHigh: number | null;
}

// StockEasy 미국주식 — 2026-08-27 stockeasy 저장소에 추가된 US 파이프라인(시드 $10,000/4종목 균등).
export interface StockEasyUsPosition {
  ticker: string | null;
  name: string | null;
  sector: string | null;
  entryPx: number | null;
  lastClose: number | null;
  gainPct: number | null;
  currentStopPct: number | null;
}

export interface StockEasyUsCandidate {
  ticker: string | null;
  name: string | null;
  sector: string | null;
  rs: number | null;
  price: number | null;
  signals: string[];
  pass: boolean;
}

export interface StockEasyUs {
  seed: number;
  cash: number | null;
  nav: number | null;
  returnPct: number | null;
  nPositions?: number;
  nClosed?: number;
  closedWinRatePct?: number | null;
  closedAvgPnlPct?: number | null;
  benchmarkIndex: string;
  benchmark: Record<string, number>;
  positions: StockEasyUsPosition[];
  candidates: StockEasyUsCandidate[];
}

// 교차검증 — StockEasy 미국 스크리너 후보 vs 전략실(코어) 픽. /briefing 05번 아래 표 전용.
export interface StockEasyCrossCheckRow {
  ticker: string | null;
  name: string | null;
  sector: string | null;
  rs: number | null;
  status: {
    kind: "passed" | "held" | "failed" | "untracked" | "none";
    label: string;
    detail: string | null;
  };
}

export interface StockEasyCrossCheck {
  stockeasyDate: string | null;
  tfDate: string | null;
  overlapTickers: string[];
  rows: StockEasyCrossCheckRow[];
}

export interface StockEasy {
  seed?: number;
  cash?: number | null;
  nav?: number | null;
  returnPct?: number | null;
  nPositions?: number;
  nClosed?: number;
  closedWinRatePct?: number | null;
  closedAvgPnlPct?: number | null;
  benchmark: Record<string, number>;
  positions: StockEasyPosition[];
  candidates: StockEasyCandidate[];
  us?: StockEasyUs | null;
  usCrossCheck?: StockEasyCrossCheck | null;
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
  // 옵셔널(2026-08-12, generatedAt 마이그레이션 패턴과 동일): 이 필드가 추가되기 전에 쓰인
  // KV blob엔 없을 수 있음
  benchmarkCandles?: Record<string, CandlePoint[]>;
  breadth: MarketBreadth | null;
  sentiment: SentimentMetrics | null;
  distributionRally: DistributionRally | null;
  daTrend: DaTrendPoint[];
  phaseTrend: PhaseTrend | null;
  themeLeadership: ThemeLeadership | null;
  newHighsLows: NewHighLowRow[];
  // 옵셔널(2026-08-25, generatedAt 마이그레이션 패턴과 동일): 이 필드가 추가되기 전에 쓰인
  // KV blob엔 없을 수 있음
  rsLeading?: RsLeadingRow[];
  stalking?: StalkingRow[];
  stalkingGraduated?: StalkingGraduatedRow[];
  catalyst?: CatalystData | null;
  gateFunnel: GateFunnelRow[];
  candidates: CandidateRow[];
  sectorBreakdown: SectorRow[];
  sectorBandCounts?: SectorBandCounts | null;
  indexRs: IndexRsRow[];
  holdings: HoldingRow[];
  recentTrades: TradeRow[];
  alphaDecay: AlphaDecay;
  // 옵셔널(2026-08-26, /briefing 전용 필드): 이전 KV blob엔 없을 수 있음
  exposure?: Exposure | null;
  ftd?: Ftd | null;
  marketMetrics?: MarketMetric[] | null;
  protectionRules?: ProtectionRules | null;
  rotation?: Rotation | null;
  stockeasy?: StockEasy | null;
  ladder: LadderData | null;
  ratchet: RatchetData | null;
}
