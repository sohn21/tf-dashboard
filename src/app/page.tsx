import { mockData } from "@/lib/mockData";
import { getDashboardData } from "@/lib/kv";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { NavChart } from "@/components/dashboard/NavChart";
import { BenchmarkCandlesGrid } from "@/components/dashboard/BenchmarkCandlesGrid";
import { MarketBreadthCard } from "@/components/dashboard/MarketBreadthCard";
import { NewHighsLowsTable } from "@/components/dashboard/NewHighsLowsTable";
import { GateFunnelCard } from "@/components/dashboard/GateFunnelCard";
import { CandidatesTable } from "@/components/dashboard/CandidatesTable";
import { SectorBreakdownTable } from "@/components/dashboard/SectorBreakdownTable";
import { HoldingsTable } from "@/components/dashboard/HoldingsTable";
import { RecentTradesTable } from "@/components/dashboard/RecentTradesTable";
import { AlphaDecayCard } from "@/components/dashboard/AlphaDecayCard";
import { DaTrendCard } from "@/components/dashboard/DaTrendCard";
import { PhaseTrendCard } from "@/components/dashboard/PhaseTrendCard";
import { ThemeLeadershipCard } from "@/components/dashboard/ThemeLeadershipCard";
import { LadderCard } from "@/components/dashboard/LadderCard";
import { Card } from "@/components/dashboard/Card";

export default async function Home() {
  const live = await getDashboardData();
  const data = live ?? mockData;

  return (
    <div className="wrap">
      <div>
        <h1>페이퍼 트레이딩 대시보드</h1>
        <div className="subtitle">
          업데이트: {data.generatedAt} · 최근 신호: {data.signalsDate}
          {!live && " · 예시 데이터 (아직 실데이터 없음)"}
        </div>
      </div>

      <SummaryCard summary={data.summary} regimeHistory={data.regimeHistory} />

      <Card
        title={
          data.navHistory.length > 0
            ? `NAV 추이 (${data.navHistory[0].date} ~ ${data.navHistory[data.navHistory.length - 1].date} 수익률)`
            : "NAV 추이"
        }
      >
        <NavChart data={data.navHistory} />
      </Card>

      <BenchmarkCandlesGrid candles={data.benchmarkCandles} />

      <MarketBreadthCard breadth={data.breadth} sentiment={data.sentiment} distributionRally={data.distributionRally} />

      <DaTrendCard data={data.daTrend} />

      <PhaseTrendCard data={data.phaseTrend} />

      <NewHighsLowsTable rows={data.newHighsLows} />

      <GateFunnelCard rows={data.gateFunnel} />

      <CandidatesTable rows={data.candidates} />

      <SectorBreakdownTable rows={data.sectorBreakdown} indexRs={data.indexRs} />

      <ThemeLeadershipCard data={data.themeLeadership} />

      <HoldingsTable rows={data.holdings} />

      <RecentTradesTable rows={data.recentTrades} />

      <AlphaDecayCard data={data.alphaDecay} />

      <LadderCard data={data.ladder} />
    </div>
  );
}
