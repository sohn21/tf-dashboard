import type { ProtectionRules } from "@/lib/types";

export function ProtectionRulesCard({ rules }: { rules: ProtectionRules | null | undefined }) {
  if (!rules) return <p className="ink-muted">보호 룰 데이터 없음</p>;
  return (
    <>
      <div>
        {rules.lockTiers.map((tier) => (
          <div
            key={tier.gainPct}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "4px 0",
              borderBottom: "1px dashed var(--border)",
              fontSize: 12.5,
            }}
          >
            <span>+{tier.gainPct}% 도달</span>
            <span>
              스톱 → <b>+{tier.lockPct}%</b>
            </span>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 10 }}>
        {`O'Neill ${rules.oneillHoldBdays}거래일 홀드룰 — 진입 후 ${rules.oneillTriggerBdays}거래일 내 +${rules.oneillThresholdPct.toFixed(0)}% 이상 급등하면 최소 ${rules.oneillHoldBdays}거래일 보유(조기 익절 방지).`}
      </p>
    </>
  );
}
