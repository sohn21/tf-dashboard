import Link from "next/link";
import { mockData } from "@/lib/mockData";
import { getDashboardData } from "@/lib/kv";
import { CyclicalCard } from "@/components/dashboard/CyclicalCard";

// 2026-11-17: cycleVI(타짱 방식 한국 시클리컬 가치투자) 전용 페이지 — 메인·브리핑엔 전체 경기 국면만 남기고
// 업종 국면·A 후보·관심 종목·검토 신호·연습계좌를 여기로 옮김(사용자 요청). 데이터는 같은 KV blob 의 cyclical.
export default async function CycleVI() {
  const live = await getDashboardData();
  const data = live ?? mockData;
  return (
    <div className="wrap">
      <div>
        <h1>cycleVI — 한국 시클리컬 가치투자</h1>
        <div className="subtitle">
          업데이트: {data.generatedAt} · 표시 전용, 매매 규칙과 무관 · <Link href="/">메인</Link> · <Link href="/briefing">브리핑</Link>
          {!live && " · 예시 데이터 (아직 실데이터 없음)"}
        </div>
      </div>
      <CyclicalCard data={data.cyclical} />
    </div>
  );
}
