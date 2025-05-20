import { PricingPlan } from "../store/pricingStore";
import styles from "./Pricing.module.css";
import PlanOkIcon from "../assets/plan_ok.svg";
import PlanNoIcon from "../assets/plan_no.svg";

const PlanCard = ({
  plan,
  currentPlan,
  handleSubscribe,
  handleOperation,
  isLoading,
  showStake,
  showUnstake,
  showPendingClaim,
  showClaim,
  pendingClaim,
  unstakeTime,
}: {
  plan: PricingPlan;
  currentPlan: string;
  handleSubscribe: (planId: string) => void;
  handleOperation: (operation: 'unstake' | 'claim') => void;
  isLoading: boolean;
  showStake?: boolean;
  showUnstake?: boolean;
  showPendingClaim?: boolean;
  showClaim?: boolean;
  pendingClaim?: number;
  unstakeTime?: number;
}) => {
  return (
    <div
      key={plan.id}
      className={`${styles.planCard} ${
        plan.id === "premium" ? styles.premium : ""
      } ${plan.id === "premiumPlus" ? styles.premiumPlus : ""}`}
    >
      <div className={styles.planCardContent}>
        <div className={styles.planTitleRow}>
          <h2 className={styles.planName}>{plan.name}</h2>
          {currentPlan === plan.id && (
            <div className={styles.currentBadge}>Current</div>
          )}
        </div>

        <div className={styles.planPrice}>{plan.price}</div>
        <div className={styles.planPeriod}>{plan.description}</div>

        <ul className={styles.featuresList}>
          {plan.features.map((feature, idx) => (
            <li
              key={idx}
              className={`${styles.featureItem} ${
                !feature.supported ? styles.unsupportedFeature : ""
              }`}
            >
              <img
                src={feature.supported ? PlanOkIcon : PlanNoIcon}
                alt={feature.supported ? "Supported" : "Not supported"}
                className={styles.featureIcon}
              />
              <div className={styles.featureTextContainer}>
                <span className={styles.featureTitle}>{feature.title}</span>
                {feature.subtitle && (
                  <span className={styles.featureSubtitle}>
                    {feature.link ? (
                      <a
                        href={feature.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.featureLink}
                      >
                        {feature.subtitle}
                      </a>
                    ) : (
                      feature.subtitle
                    )}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {plan.buttonText && (
        <div className={styles.buttonContainer}>
          {showStake && (
            <button
              className={styles.subscribeButton}
              onClick={() => handleSubscribe(plan.id)}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : plan.buttonText}
            </button>
          )}
          {showUnstake && (
            <button
              className={styles.unstakeButton}
              onClick={() => handleOperation("unstake")}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Unstake"}
            </button>
          )}
          {showPendingClaim && (
            <div className={styles.pendingButton}>
              Claim {pendingClaim} $NYKO after{" "}
              {new Date((unstakeTime || 0) * 1000)?.toLocaleString()}
            </div>
          )}
          {showClaim && (
            <button
              className={styles.claimButton}
              onClick={() => handleOperation("claim")}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Claim"}
            </button>
          )}

          {plan.tips && <p className={styles.buttonNote}>{plan.tips}</p>}
        </div>
      )}
    </div>
  );
};

export default PlanCard;
