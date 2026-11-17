import Link from "next/link";
import { mockData } from "@/lib/mockData";
import { getCycleviBoard, getDashboardData } from "@/lib/kv";
import { Card } from "@/components/dashboard/Card";
import { MacroPhase, PaperAccount, ReviewSignals } from "@/components/dashboard/CyclicalCard";
import { CandidatesTabs, IndicatorPanel, IndustriesFull, MacroChart, QuarterGrid } from "@/components/cyclevi/BoardSections";

// 2026-11-17: cycleVI(타짱 방식 한국 시클리컬 가치투자) 전용 페이지. 메인·브리핑엔 전체 경기 국면만 남기고 나머지를 여기로.
// 같은 날 사용자 요청으로 시클리컬 보드(Claude Artifact)의 내용 전부 — 경기 차트·업종 표 전 컬럼·분기 합계·선행지표·후보 전 등급 — 추가.
// 검토 신호·연습계좌는 메인 KV(cyclical, 매일 갱신), 보드 데이터는 cyclevi:latest(월 1회 보드 갱신분, 크론이 매일 다시 올림).
export default async function CycleVI() {
  const [live, board] = await Promise.all([getDashboardData(), getCycleviBoard()]);
  const data = live ?? mockData;
  const c = data.cyclical;
  return (
    <div className="wrap">
      <div>
        <h1>cycleVI — 한국 시클리컬 가치투자</h1>
        <div className="subtitle">
          업데이트: {data.generatedAt}{board && ` · 보드 데이터 ${board.dataDate}`} · 표시 전용, 매매 규칙과 무관 · <Link href="/">메인</Link> · <Link href="/briefing">브리핑</Link>
          {!live && " · 예시 데이터 (아직 실데이터 없음)"}
        </div>
      </div>

      <Card title="전체 경기 국면">
        <p className="label-sm ink-muted" style={{ marginTop: 0 }}>
          통계청 경기종합지수 순환변동치로 책의 4국면(회복·호황·후퇴·불황)을 근사했습니다. 선행지수는 앞으로의 방향, 동행지수는 지금 경기입니다. 100 이상이면 추세보다 위, 3개월 전보다 오르면 상승으로 봅니다.
        </p>
        <MacroPhase m={c?.macro} />
        {board && <MacroChart b={board} />}
      </Card>

      <Card title="관심 종목 검토 신호">
        <ReviewSignals review={c?.review} />
      </Card>

      <Card title="연습계좌">
        <PaperAccount p={c?.paper} />
      </Card>

      {board && (
        <>
          <Card title="업종 불황도">
            <p className="label-sm ink-muted" style={{ marginTop: 0 }}>
              적자 비율이 높은 업종부터 나열합니다. 영업이익 합계가 바닥을 지나 다시 늘고, 출하가 늘면 회복 초입에 가깝습니다. 국면은 최근 3개월과 그 전 3개월의 출하·제품 가격 방향으로 근사했습니다.
            </p>
            <IndustriesFull rows={board.industries} />
          </Card>

          <Card title="업종 분기 영업이익 합계">
            <p className="label-sm ink-muted" style={{ marginTop: 0 }}>
              업종 안 상장사 영업이익을 분기마다 더한 값(억 원)입니다. 실적이 절반 이상 들어온 분기만 그립니다. 업종마다 세로 눈금이 다릅니다. 막대에 마우스를 올리면 흑자 기업 비율이 보입니다.
            </p>
            <QuarterGrid b={board} />
          </Card>

          <Card title="선행지표: 가격·스프레드·출하">
            <p className="label-sm ink-muted" style={{ marginTop: 0 }}>
              실적 발표보다 먼저 움직이는 지표입니다(한국은행 ECOS 월간, 2020=100). 제품 가격이 원재료보다 빨리 오르면 스프레드(마진의 방향)가 벌어집니다.
            </p>
            <IndicatorPanel b={board} />
          </Card>

          <Card title="매수 후보 (스크리너)">
            <p className="label-sm ink-muted" style={{ marginTop: 0, lineHeight: 1.6 }}>
              A 전환 조짐 = 적자 뒤 최근 2분기 연속 영업흑자. 매집 신호 = 내부자·자사주·외부 5%가 최근 12개월에 사 모은 회사(등급 무관). B = 2년 이상 연속 적자(아직 바닥 진행). C = 지금 적자.
              관심 종목 = 리포트 대상이라 순위와 상관없이 따로 보는 종목. 최근 분기는 DART 잠정실적·분기보고서로 먼저 채웁니다. 자본잠식 기업과 우선주는 뺐습니다.
              순서는 EV 기준 피크 이익수익률 = 과거 최고 영업이익 ÷ EV(시총 + 이자 붙는 부채 − 현금·단기 금융자산). EV가 0 이하면 &quot;순현금&gt;시총&quot;으로 맨 위.
            </p>
            <CandidatesTabs rows={board.candidates} />
          </Card>

          <Card title="지표 정의와 한계">
            <dl className="label-sm" style={{ lineHeight: 1.7, margin: 0 }}>
              <dt><b>적자 비율</b></dt><dd>업종 상장사 중 최근 4분기 영업이익 합계가 마이너스인 회사 비율입니다.</dd>
              <dt><b>PSR 5년 위치</b></dt><dd>지금 PSR이 지난 5년 연말 PSR 범위에서 어디인지(0 = 최저, 1 = 최고). 0 아래면 5년 최저보다 쌉니다. 과거 PSR은 PBR×BPS×주식수/매출로 다시 계산했습니다.</dd>
              <dt><b>하루 거래대금(백만)</b></dt><dd>최근 60거래일 거래대금(종가×거래량) 중앙값. 50백만(5천만 원) 미만은 노란색 — 하루에 거래대금의 20%만 사고판다고 보면 1,000만 원을 사는 데 하루 넘게 걸리는 수준입니다. 표시만 하고 후보에서 빼지는 않습니다.</dd>
              <dt><b>피크 이익수익률(EV 기준)</b></dt><dd>과거 최고 영업이익 ÷ EV. EV = 시가총액 + 이자 붙는 부채 − 현금·단기 금융자산(DART 최근 분기말, 장기 금융자산은 보수적으로 안 뺌). EV가 0 이하면 &quot;순현금&gt;시총&quot;. ★ = 관심 종목.</dd>
              <dt><b>10년 위치</b></dt><dd>최근 120개월 범위에서 지금 값의 위치(0 = 최저, 1 = 최고).</dd>
              <dt><b>국면(근사)</b></dt><dd>책의 8단계 사이클을 최근 3개월 vs 직전 3개월의 출하·가격 방향(±1% 이내는 횡보)으로 근사했습니다. 출하 자료가 없는 업종은 가격만 봅니다.</dd>
              <dt><b>전체 경기 국면</b></dt><dd>순환변동치가 100 이상이고 3개월 전보다 오르면 호황, 내리면 후퇴, 100 미만에서 오르면 회복, 내리면 불황. 3개월 변화가 ±0.2 이내면 직전 국면 유지. 100 위에서 2개월 연속 오르지 않으면 &quot;정점 근접 조짐&quot;.</dd>
              <dt><b>매집 신호</b></dt><dd>최근 12개월 DART 공시에서 장내매수·매도만 셉니다(증여·수증·상속 제외, 중복 보고는 한 번). 매집 = 순매수 0.5% 이상, 장내매수 3건 이상 순매수, 자사주 취득·소각, 외부 5% 매수 중 하나. 반대 = 순매도 0.5% 이상, 자사주 처분, 유상증자·CB·BW·EB.</dd>
              <dt><b>한계</b></dt><dd>제품 가격은 생산자물가지수라 실제 거래가와 다를 수 있습니다. 조선은 가격 지표, 해운은 운임 외 수량 지표가 없습니다. 원본: cycleVI scripts/screen_cyclical.py · indicators.py · build_board.py.</dd>
            </dl>
          </Card>
        </>
      )}
    </div>
  );
}
