import { mockData } from "@/lib/mockData";
import { getDashboardData } from "@/lib/kv";
import { Card } from "@/components/dashboard/Card";
import { NavChart } from "@/components/dashboard/NavChart";
import { PhaseTrendCard } from "@/components/dashboard/PhaseTrendCard";
import { GateFunnelCard } from "@/components/dashboard/GateFunnelCard";
import { AlphaDecayCard } from "@/components/dashboard/AlphaDecayCard";
import { ExposureCard } from "@/components/briefing/ExposureCard";
import { ProtectionRulesCard } from "@/components/briefing/ProtectionRulesCard";
import { RotationRibbon, RotationSectionHeader } from "@/components/briefing/RotationRibbon";
import { TermButton } from "@/components/briefing/TermTrigger";

// 친구쪽 전략실 브리핑 룩앤필을 우리 데이터로 재구현한 공개 리포트 라우트.
// [[project_briefing_html_clone]] 2026-08-26 — 로컬 정적 버전(private repo tf_project의
// paper_trader/briefing_html.py)과 동일 섹션 구성/문구, React로 재구현. 이미 메인
// 대시보드에서 쓰던 필드(regime/phaseTrend/gateFunnel/navHistory/alphaDecay)는 기존
// 컴포넌트를 그대로 재사용 — 새로 그리지 않음. exposure/protectionRules 만 이 라우트 전용
// 신규 필드(둘 다 optional, 이전 KV blob엔 없을 수 있음).
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

      <PhaseTrendCard data={data.phaseTrend} />

      <RotationSectionHeader />
      <RotationRibbon rotation={data.rotation} />

      <GateFunnelCard rows={data.gateFunnel} />

      <div className="shead">
        <span className="snum">05</span>
        <h2 className="stitle">포트폴리오 NAV / MDD</h2>
      </div>
      <Card>
        <NavChart data={data.navHistory} />
      </Card>

      <div className="shead">
        <span className="snum">06</span>
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

      <AlphaDecayCard data={data.alphaDecay} />
    </div>
  );
}
