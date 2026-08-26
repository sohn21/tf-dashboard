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
  gates: {
    t: "게이트 G0~G4",
    ps: ["매수 후보 자격 필터 5종(G0~G4) — 전부 통과해야 후보로 노출(evaluate_gates()). 자격 필터일 뿐 매수 신호 자체는 아님 — 실제 진입은 주간 예산·노출 상한까지 통과해야 함."],
  },
  gate_g0: { t: "G0 — 시장 레짐", ps: ["레짐이 Correction 이 아니어야 통과 — 전역 게이트, 꺾이면 전 종목 공통 탈락."] },
  gate_g1: { t: "G1 — 업종 주도력", ps: ["종목 소속 업종의 평균 RS percentile이 당일 상위 25% 업종에 속하는지(v7 지속성 게이트: 어제도 상위였어야 함)."] },
  gate_g2: { t: "G2 — 베이스/피벗 근접도", ps: ["피벗 -10%~+5%, 베이스 깊이 5~45%, 베이스 기간 5주 이상(base_depth.py 단일 프록시)."] },
  gate_g3: { t: "G3 — RS 가속 + 신고가", ps: ["RS Line 252일 신고가 갱신 + 가속 동시 충족 — 기관 자금 선행 유입을 잡는 핵심 방아쇠."] },
  gate_g4: { t: "G4 — 종합점수/추세템플릿", ps: ["total_score가 당일 유니버스 중앙값 이상 + trend_pass 8개 중 6개 이상."] },
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
