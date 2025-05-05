import React from 'react';
import { useAtom } from 'jotai';
import styles from './Pricing.module.css';
import StakeGrid from '../assets/stake_grid.svg';
import PlanOkIcon from '../assets/plan_ok.svg';
import PlanNoIcon from '../assets/plan_no.svg';
import { pricingAtom, isPlanCurrent, subscribeToPlan } from '../store/pricingStore';

// 定义价格套餐类型
const Pricing: React.FC = () => {
  const [pricingState] = useAtom(pricingAtom);
  const [isPlanCurrentFn] = useAtom(isPlanCurrent);
  const [, subscribe] = useAtom(subscribeToPlan);
  const { plans, isLoading } = pricingState;

  const handleSubscribe = (planId: string) => {
    if (!isLoading) {
      subscribe(planId);
    }
  };

  return (
    <div className={styles.pricingPage}>
      {/* 第一区域：Plans & Pricing */}
      <div className={styles.plansSection} style={{backgroundImage: `url(${StakeGrid})`}}>
        <div className={styles.plansSectionContent}>
          <div className={styles.pricingHeader}>
            <h1 className={styles.title}>PLANS & PRICING</h1>
            <p className={styles.subtitle}>
              Upgrade to gain access to Premium features
            </p>
          </div>

          <div className={styles.plansContainer}>
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={styles.planCard}
              >
                <div className={styles.planTitleRow}>
                  <h2 className={styles.planName}>{plan.name}</h2>
                  {isPlanCurrentFn(plan.id) && (
                    <div className={styles.currentBadge}>Current</div>
                  )}
                </div>

                <div className={styles.planPrice}>{plan.price}</div>
                <div className={styles.planPeriod}>{plan.description}</div>

                <ul className={styles.featuresList}>
                  {plan.features.map((feature, idx) => (
                    <li
                      key={idx}
                      className={`${styles.featureItem} ${!feature.supported ? styles.unsupportedFeature : ''}`}
                    >
                      <img
                        src={feature.supported ? PlanOkIcon : PlanNoIcon}
                        alt={feature.supported ? "Supported" : "Not supported"}
                        className={styles.featureIcon}
                      />
                      <div className={styles.featureTextContainer}>
                        <span className={styles.featureTitle}>{feature.title}</span>
                        {feature.subtitle && (
                          <span className={styles.featureSubtitle}>{feature.subtitle}</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {plan.buttonText && (
                  <div className={styles.buttonContainer}>
                    <button
                      className={styles.subscribeButton}
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={isLoading}
                    >
                      {isLoading ? 'Processing...' : plan.buttonText}
                    </button>
                    {plan.tips && (
                        <p className={styles.buttonNote}>
                          {plan.tips}
                        </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 第二区域：FAQs */}
      <div className={styles.faqSection}>
        <h2 className={styles.faqTitle}>FREQUENTLY ASKED QUESTIONS</h2>
        <div className={styles.faqItems}>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>How do I upgrade to Premium?</h3>
            <p className={styles.faqAnswer}>
              You can upgrade to Premium by clicking the "Stake to Subscribe" button and following the staking instructions.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>What happens if I unstake?</h3>
            <p className={styles.faqAnswer}>
              When you unstake, your Premium subscription will be cancelled. Your staked tokens will be withdrawable after a 7-day cooldown period.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>What payment methods do you accept?</h3>
            <p className={styles.faqAnswer}>
              Our Premium plan requires staking tokens rather than traditional payment. You can stake directly from your connected wallet.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>Is there a minimum staking period?</h3>
            <p className={styles.faqAnswer}>
              There is no minimum staking period. You can unstake at any time, but there is a 7-day cooldown period before you can withdraw your tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;