import { Barlow_Condensed } from "next/font/google";
import "./briefing.css";
import { GlossaryProvider } from "@/components/briefing/GlossaryProvider";

// 브리핑 헤딩 전용 폰트 — 원본(친구쪽 전략실 브리핑)이 쓰던 Barlow Condensed. 이 라우트에만
// 스코프(CSS 변수로 노출)해서 메인 대시보드 폰트 설정과 안 섞이게 한다.
const briefingHeading = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-briefing-heading",
});

export default function BriefingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={briefingHeading.variable}>
      <GlossaryProvider>{children}</GlossaryProvider>
    </div>
  );
}
