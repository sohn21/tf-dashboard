import { mockData } from "@/lib/mockData";
import { getDashboardData } from "@/lib/kv";
import { Card } from "@/components/dashboard/Card";
import { NavChart } from "@/components/dashboard/NavChart";
import { PhaseTrendCard } from "@/components/dashboard/PhaseTrendCard";
import { SectorBreakdownTable } from "@/components/dashboard/SectorBreakdownTable";
import { CandidatesTable } from "@/components/dashboard/CandidatesTable";
import { HoldingsTable } from "@/components/dashboard/HoldingsTable";
import { ThemeLeadershipCard } from "@/components/dashboard/ThemeLeadershipCard";
import { AlphaDecayCard } from "@/components/dashboard/AlphaDecayCard";
import { ExposureCard } from "@/components/briefing/ExposureCard";
import { StrongSectorsCard } from "@/components/briefing/StrongSectorsCard";
import { RiskStatsCard } from "@/components/briefing/RiskStatsCard";
import { MddChart } from "@/components/briefing/MddChart";
import { ProtectionRulesCard } from "@/components/briefing/ProtectionRulesCard";
import { RotationRibbon, RotationSectionHeader } from "@/components/briefing/RotationRibbon";
import { StockEasyCard } from "@/components/briefing/StockEasyCard";
import { StockEasyUsCard } from "@/components/briefing/StockEasyUsCard";
import { StockEasyCrossCheckCard } from "@/components/briefing/StockEasyCrossCheckCard";
import { CatalystCard } from "@/components/dashboard/CatalystCard";
import { StalkingTable } from "@/components/dashboard/StalkingTable";
import { LadderCard } from "@/components/dashboard/LadderCard";
import { RatchetCard } from "@/components/dashboard/RatchetCard";
import { TermButton } from "@/components/briefing/TermTrigger";

// 친구쪽 전략실 브리핑 룩앤필을 우리 데이터로 재구현한 공개 리포트 라우트.
// [[project_briefing_html_clone]] 2026-08-26 — 원본이 11개 섹션(01 시장상태 ~ 11 테마로테이션)
// 이라는 걸 사용자가 지적한 뒤 전체 번호/제목을 원본에서 직접 대조해 채웠다(로컬 정적 버전
// paper_trader/briefing_html.py 와 동일 매핑). 이미 메인 대시보드에 있던 컴포넌트
// (PhaseTrendCard/SectorBreakdownTable/CandidatesTable/HoldingsTable/ThemeLeadershipCard/
// NavChart/AlphaDecayCard)는 그대로 재사용 — 새로 그리지 않음. 신규는 03(StrongSectorsCard)/
// 07(RiskStatsCard, Sharpe·연변동성·기간수익률·현금비중 새 계산)/08(MddChart, 낙폭추이
// 라인차트, 기존엔 스탯 숫자 하나뿐이었음)/11(RotationRibbon, 이전 세션에 이미 구현)뿐.
// 보호룰(BE·LOCK·8주룰)은 원본 11개 섹션에 없는 이 저장소 자체 추가라 번호 없이 맨 끝에 붙인다.
export default async function Briefing() {
  const live = await getDashboardData();
  const data = live ?? mockData;

  return (
    <div className="briefing-wrap">
      <div>
        <h1>Daily Briefing</h1>
        <div className="subtitle">
          생성: {data.generatedAt} · 최근 신호: {data.signalsDate}
          {!live && " · 예시 데이터 (아직 실데이터 없음)"}
        </div>
      </div>

      <div className="shead">
        <span className="snum">01</span>
        <h2 className="stitle">오늘의 시장 상태</h2>
      </div>
      <ExposureCard regime={data.summary.regime} regimeStatus={data.summary.regimeStatus} exposure={data.exposure} />

      <div className="shead">
        <span className="snum">02</span>
        <h2 className="stitle">베이스 분포도</h2>
      </div>
      <PhaseTrendCard data={data.phaseTrend} />

      <div className="shead">
        <span className="snum">03</span>
        <h2 className="stitle">강세 섹터</h2>
        <TermButton termKey="strongsectors" />
      </div>
      <StrongSectorsCard rotation={data.rotation} />

      <div className="shead">
        <span className="snum">04</span>
        <h2 className="stitle">세부 업종 상위</h2>
        <TermButton termKey="sectordetail" />
      </div>
      <SectorBreakdownTable rows={data.sectorBreakdown} indexRs={data.indexRs} />

      {/* 오늘의 발화 테마 (Catalyst) — 04번과 같은 오늘자 업종 강도 블록, 번호 없이. */}
      <div className="shead" style={{ marginTop: 28 }}>
        <span className="snum" style={{ color: "var(--text-muted)" }}>
          ·
        </span>
        <h2 className="stitle">오늘의 발화 테마 (Catalyst)</h2>
      </div>
      <CatalystCard data={data.catalyst} />

      <div className="shead">
        <span className="snum">05</span>
        <h2 className="stitle">전략실 게이트 상위종목</h2>
        <TermButton termKey="candidates" />
      </div>
      <CandidatesTable rows={data.candidates} topN={15} />

      {/* 다음 리더 추적 (Stalking) — G0~G4 통과 전 준후보 스코어러, 05번 바로 아래, 번호 없이. */}
      <div className="shead" style={{ marginTop: 28 }}>
        <span className="snum" style={{ color: "var(--text-muted)" }}>
          ·
        </span>
        <h2 className="stitle">다음 리더 추적 (Stalking)</h2>
      </div>
      <StalkingTable rows={data.stalking ?? []} />

      {/* 교차검증 — StockEasy 미국 스크리너 vs 전략실. 05번 바로 아래, 번호 없이. */}
      <div className="shead" style={{ marginTop: 28 }}>
        <span className="snum" style={{ color: "var(--text-muted)" }}>
          ·
        </span>
        <h2 className="stitle">교차검증 — StockEasy 미국 스크리너 vs 전략실</h2>
      </div>
      <StockEasyCrossCheckCard data={data.stockeasy?.usCrossCheck} />

      <div className="shead">
        <span className="snum">06</span>
        <h2 className="stitle">전략실 NAV 곡선</h2>
        <TermButton termKey="navcurve" />
      </div>
      <Card>
        <NavChart data={data.navHistory} />
      </Card>

      <div className="shead">
        <span className="snum">07</span>
        <h2 className="stitle">수익 · 위험 통계</h2>
        <TermButton termKey="riskstats" />
      </div>
      <RiskStatsCard navHistory={data.navHistory} cash={data.summary.cash} nav={data.summary.nav} />
      <AlphaDecayCard data={data.alphaDecay} />

      <div className="shead">
        <span className="snum">08</span>
        <h2 className="stitle">MDD 차트</h2>
        <TermButton termKey="mddchart" />
      </div>
      <MddChart navHistory={data.navHistory} />

      <div className="shead">
        <span className="snum">09</span>
        <h2 className="stitle">현재 보유종목 상황</h2>
        <TermButton termKey="holdings" />
      </div>
      <HoldingsTable rows={data.holdings} />

      <div className="shead">
        <span className="snum">10</span>
        <h2 className="stitle">Leading Theme Count</h2>
        <TermButton termKey="leadingcount" />
      </div>
      <ThemeLeadershipCard data={data.themeLeadership} />

      <RotationSectionHeader />
      <RotationRibbon rotation={data.rotation} />

      {/* 래더/래칫 보조 계좌 — 코어 전용인 06~10번과 달리 각자 카드가 없어 브리핑에서 안 보였다.
          메인 대시보드의 LadderCard/RatchetCard 를 그대로 재사용. 원본 11개에 없는 자체 추가라 번호 없이. */}
      <div className="shead" style={{ marginTop: 28 }}>
        <span className="snum" style={{ color: "var(--text-muted)" }}>
          ·
        </span>
        <h2 className="stitle">래더 계좌 (미국 주식)</h2>
      </div>
      <LadderCard data={data.ladder} />

      <div className="shead" style={{ marginTop: 28 }}>
        <span className="snum" style={{ color: "var(--text-muted)" }}>
          ·
        </span>
        <h2 className="stitle">래칫 계좌 (미국 주식)</h2>
      </div>
      <RatchetCard data={data.ratchet} />

      <div className="shead">
        <span className="snum">12</span>
        <h2 className="stitle">StockEasy (국내 주식)</h2>
        <TermButton termKey="stockeasy" />
      </div>
      <StockEasyCard stockeasy={data.stockeasy} />

      {/* StockEasy 미국주식 — 2026-08-27 stockeasy 저장소에 US 파이프라인 추가. 번호 없이 국내 바로 뒤. */}
      <div className="shead" style={{ marginTop: 28 }}>
        <span className="snum" style={{ color: "var(--text-muted)" }}>
          ·
        </span>
        <h2 className="stitle">
          StockEasy (미국 주식) <span className="ssub">모의투자 시드 $10,000 · 미국 래더·스크리너·S&amp;P500 RS</span>
        </h2>
      </div>
      <StockEasyUsCard us={data.stockeasy?.us} />

      <div className="shead" style={{ marginTop: 36, borderTop: "1px dashed var(--border)", paddingTop: 20 }}>
        <span className="snum" style={{ color: "var(--text-muted)" }}>
          +
        </span>
        <h2 className="stitle">보호 룰 (BE · LOCK · 8주룰)</h2>
        <TermButton termKey="protection" />
      </div>
      <div className="blueprint" style={{ padding: 16 }}>
        <span className="corner tl" />
        <span className="corner tr" />
        <span className="corner bl" />
        <span className="corner br" />
        <ProtectionRulesCard rules={data.protectionRules} />
      </div>
    </div>
  );
}
