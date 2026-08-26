// 브리핑 클론 용어집(added 2026-08-26) — 원본(친구쪽 전략실 브리핑)을 베끼지 않고 우리
// 시스템(gates.py/portfolio.py/exposure.py/market_regime.py) 실제 값으로 새로 작성.
// 내용은 private repo tf_project의 paper_trader/briefing_html.py TERMS 딕셔너리와 동기화.
export interface GlossaryTerm {
  t: string;
  ps: string[];
}

export const TERMS: Record<string, GlossaryTerm> = {
  regime: {
    t: "시장 레짐 (Market Regime)",
    ps: [
      "market_regime.py 가 분배일(distribution day) 누적치 기준으로 매일 판정: Confirmed Uptrend / Uptrend Resumed / Uptrend Under Pressure / Rally Attempt / Correction.",
      "레짐별 최대 노출 상한(REGIME_TABLE): Confirmed/Resumed 100%(무제한 신규진입) · Under Pressure 50%(주 2건) · Rally Attempt 30%(주 1건) · Correction 25%(신규진입 0건).",
    ],
  },
  exposure: {
    t: "3층 노출 상한",
    ps: [
      "L1(레짐 상한) → 섹터 가드(강세 섹터 0개면 -15%p) → 테마 가드(강세 테마 0개면 -20%p) 순으로 깎아 그날의 최종 신규진입 노출 상한을 계산(exposure.py:three_layer_exposure()).",
      "비green 레짐(Under Pressure 등)에서는 이미 §1-D 레짐 캡이 보수적이라 감산폭을 절반으로 줄임(이중감축 방지).",
      "우리 시스템은 밴드(lo~hi)가 아니라 단일 상한값 — 보유 종목을 강제 매도하진 않고 신규 진입만 억제.",
    ],
  },
  dd: {
    t: "분배일 (Distribution Day)",
    ps: ["지수가 전일 대비 하락하면서 거래량이 전일보다 늘어난 날. 최근 25거래일 누적 카운트로 관리하며 레짐 판정의 핵심 입력."],
  },
  breadth: {
    t: "마켓 브레스 (Breadth)",
    ps: ["유니버스 종목 중 50일 이동평균선 위에 있는 비율. 게이트 G0b 임계값(BREADTH_GATE_PCT_DEFAULT) 이상이면 통과 — 낮으면 소수 종목만 끌고 가는 취약한 상승."],
  },
  phaseguide: {
    t: "베이스 분포도 — 보는 법",
    ps: [
      "pattern_engine.classify_phase() 가 매일 유니버스 전체를 Phase 0~7로 분류한 결과의 스택형 비율 추이.",
      "위쪽 초록(4+/4/5+/5) 두께 = 진입 후보 풀 크기. 아래쪽 주황/빨강(6/7) 두께 = 시장 노화·분배 의심 신호.",
    ],
  },
  strongsectors: {
    t: "강세 섹터",
    ps: [
      "exposure.py:sector_theme_scores() 가 계산하는 섹터(11개 대분류) 종합점수(구성 업종 total_score 평균) 절대 임계 분류.",
      "강세(3층 노출도 가드 기준 임계값 이상) · 관심 · 그 외 3단계.",
    ],
  },
  sectordetail: {
    t: "세부 업종 상위",
    ps: [
      "유니버스 스캔 결과를 업종(industry)별로 묶어 평균 RS/평균 total_score/오늘 통과 후보 수를 집계(2종목 미만 업종은 잡음으로 제외).",
      "주도 여부(leading) 배지는 G1 게이트와 같은 기준(당일 상위 25% RS 업종 + 어제도 상위였던 v7 지속성 게이트).",
    ],
  },
  candidates: {
    t: "전략실 게이트 상위종목",
    ps: [
      "오늘 신호 중 total_score 상위 종목 — G0~G4 게이트 통과 여부를 컬럼으로 병기.",
      "게이트 전부 통과(passed=true)가 실제 매수 후보, 나머지는 어느 게이트에서 걸렸는지 참고용으로 노출.",
      "G0 시장 레짐(Correction 아니어야 통과, 전역) · G1 업종 주도력(당일 상위 25% RS 업종 + 어제도 상위였던 v7 지속성) · G2 베이스/피벗 근접도(피벗 -10%~+5%, 베이스깊이 5~45%, 5주 이상) · G3 RS 가속+252일 신고가(핵심 방아쇠) · G4 종합점수(유니버스 중앙값 이상)+추세템플릿(8개 중 6개 이상).",
    ],
  },
  navcurve: {
    t: "전략실 NAV 곡선",
    ps: ["Portfolio NAV — 시작일 대비 순자산가치 추이. 실현+미실현 손익 누적."],
  },
  riskstats: {
    t: "수익 · 위험 통계",
    ps: [
      "기간 수익률(1주=5·1개월=21·3개월=63거래일 전 NAV 대비), 연변동성(일수익률 표준편차×√252), Sharpe(일수익률 평균/표준편차×√252, 무위험수익률 0 가정), 현금비중(현금÷NAV) — 전부 NAV 히스토리 기반 직접 계산.",
      "표본이 짧으면(예: 3개월 미만 운영) 해당 기간 수익률은 \"데이터 부족\"으로 표시.",
    ],
  },
  mddchart: {
    t: "MDD 낙폭 추이",
    ps: [
      "그 시점까지의 역대 고점 대비 낙폭(drawdown) 추이 — 0%가 신고점, 아래로 갈수록 손실 구간.",
      "MDD(최대낙폭) = 이 곡선의 최저값. 수익률이 같아도 이 곡선이 깊으면 실제로 버티기 어려움.",
    ],
  },
  holdings: {
    t: "현재 보유종목 상황",
    ps: ["오늘자 보유 포지션 — 진입가/현재가/수익률/손절선 거리."],
  },
  leadingcount: {
    t: "Leading Theme Count",
    ps: [
      "그날 테마 종합점수가 강세 임계값을 통과한 업종(industry) 수 — 시장 리더십의 폭을 재는 지표.",
      "밴드(음영)는 이 저장소 자체 계산 — 최근 구간의 25th~75th percentile. 지수는 오르는데 카운트가 줄면 리더십 협소화(후반부 경고) 신호로 해석.",
    ],
  },
  rotation: {
    t: "섹터/테마 로테이션 리본",
    ps: [
      "exposure.py:sector_theme_scores() 가 매일 계산하는 업종(테마) 종합점수(total_score 평균)의 60거래일 추이 — 상위 테마부터 위에서 아래로 정렬.",
      "색 구분은 3층 노출도 가드와 같은 임계값: 강세(초록) · 관심(주황) · 그 외(회색).",
      "2026-08-26부터 축적 시작 — 초반엔 얇은 띠 1~2칸뿐이지만 매일 크론이 돌 때마다 자동으로 넓어짐.",
    ],
  },
  ph4p: {
    t: "Phase 4+ / 4 — 돌파임박",
    ps: ["Stage2 초기 + 강한 가속(4+는 장기배경까지 양호) — 오닐 pivot buy point 구간, G2/G3 게이트와 밀접."],
  },
  ph5p: {
    t: "Phase 5+ / 5 — 본격리더",
    ps: ["Stage2 + 상승 상태, 이미 추세 진행 중인 리더. 신규 추격보다 보유·눌림 대응 영역."],
  },
  ph3: {
    t: "Phase 3 — 베이스성숙",
    ps: ["다음 로테이션 후보 대기실 — 팽창하면 이후 4/4+ 승격 흐름을 추적."],
  },
  ph67: {
    t: "Phase 6/7 — 후반피로 / 분배의심",
    ps: ["6=Stage2 고점 풀백(시장 노화), 7=지속 하락·RS 다이버전스(분배 의심). 급증 시 방어 전환 신호."],
  },
  protection: {
    t: "보호 룰 (BE · LOCK · 8주룰)",
    ps: [
      "진입 후 이익이 쌓이면 손절선을 끌어올리는 래칫 스톱(LOCK_TIERS) — 카드에 실제 티어 표 참고.",
      "O'Neill 홀드룰 — 진입 후 일정 거래일 내 큰 폭 급등하면 최소 보유기간을 강제(조기 익절 방지).",
    ],
  },
  mddterm: {
    t: "MDD (최대 낙폭)",
    ps: ["그 시점까지의 역대 고점 대비 하락률의 최저값 — 전략의 위험을 재는 핵심 지표."],
  },
  hitrate: {
    t: "청산 트레이드 통계",
    ps: [
      "청산 완료 트레이드 기준. Hit=실현수익률>0 비율, PF(Profit Factor)=총이익÷|총손실|.",
      "8주룰로 계속 보유 중인 winner는 아직 청산 전이라 closed 통계는 loser/단기 winner 위주로 보수적으로 나옴.",
    ],
  },
  alphadecay: {
    t: "알파 감쇠 진단",
    ps: ["최근 90일 승률 vs 전체기간 승률 비교 — 3개월 연속 경고/심각일 때만 구조적 변화로 간주."],
  },
};
