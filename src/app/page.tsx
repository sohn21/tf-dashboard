import { mockData } from "@/lib/mockData";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { NavChart } from "@/components/dashboard/NavChart";
import { BacktestSummaryCard } from "@/components/dashboard/BacktestSummaryCard";
import { MarketBreadthCard } from "@/components/dashboard/MarketBreadthCard";
import { NewHighsLowsTable } from "@/components/dashboard/NewHighsLowsTable";
import { GateFunnelCard } from "@/components/dashboard/GateFunnelCard";
import { CandidatesTable } from "@/components/dashboard/CandidatesTable";
import { SectorBreakdownTable } from "@/components/dashboard/SectorBreakdownTable";
import { HoldingsTable } from "@/components/dashboard/HoldingsTable";
import { RecentTradesTable } from "@/components/dashboard/RecentTradesTable";
import { AlphaDecayCard } from "@/components/dashboard/AlphaDecayCard";
import { Card } from "@/components/dashboard/Card";

export default function Home() {
  const data = mockData;

  return (
    <div className="wrap">
      <div>
        <h1>페이퍼 트레이딩 대시보드</h1>
        <div className="subtitle">최근 신호: {data.signalsDate}</div>
      </div>

      <SummaryCard summary={data.summary} regimeHistory={data.regimeHistory} />

      <Card title="NAV 추이">
        <NavChart data={data.navHistory} />
      </Card>

      <BacktestSummaryCard data={data.backtest} />

      <MarketBreadthCard breadth={data.breadth} sentiment={data.sentiment} distributionRally={data.distributionRally} />

      <NewHighsLowsTable rows={data.newHighsLows} />

      <GateFunnelCard rows={data.gateFunnel} />

      <CandidatesTable rows={data.candidates} />

      <SectorBreakdownTable rows={data.sectorBreakdown} indexRs={data.indexRs} />

      <HoldingsTable rows={data.holdings} />

      <RecentTradesTable rows={data.recentTrades} />

      <AlphaDecayCard data={data.alphaDecay} />
    </div>
  );
}
