import React, { useEffect, useMemo } from "react";
import { useAtom, useSetAtom } from "jotai";
import styles from "./Pricing.module.css";
import StakeGrid from "../assets/stake_grid.svg";
import PlanOkIcon from "../assets/plan_ok.svg";
import PlanNoIcon from "../assets/plan_no.svg";
import {
  pricingAtom,
  isPlanCurrent,
  // subscribeToPlan,
} from "../store/pricingStore";
import { useWallets } from "@privy-io/react-auth";
import { base } from "viem/chains";
import { createWalletClient, custom, Hex, parseEther } from "viem";
import NikoTokenLockerAbi from "../abi/INikoTokenLocker.json";
import ERC20Abi from "../abi/IERC20.json";
import { showToastAtom } from "../store/imagesStore";
import { getStakedInfo, stakeStateAtom } from "../store/stakeStore";
import { publicClient } from "../providers/wagmiConfig";

// 定义价格套餐类型
const Pricing: React.FC = () => {
  const [pricingState] = useAtom(pricingAtom);
  const [isPlanCurrentFn] = useAtom(isPlanCurrent);
  // const [, subscribe] = useAtom(subscribeToPlan);
  const { plans, isLoading, stakeConfig } = pricingState;
  const { wallets } = useWallets();
  const showToast = useSetAtom(showToastAtom);
  const [stakeState] = useAtom(stakeStateAtom);
  const [, fetchStakedInfo] = useAtom(getStakedInfo);

  useEffect(() => {
    const wallet = wallets.find(
      (wallet) => wallet.walletClientType === "privy"
    );
    if (wallet) {
      fetchStakedInfo({
        contract: stakeConfig.contractAddrss as `0x${string}`,
        user: wallet.address as `0x${string}`,
      });
    }
  }, [wallets]);

  const walletClient = useMemo(async () => {
    const wallet = wallets.find(
      (wallet) => wallet.walletClientType === "privy"
    );
    if (wallet) {
      await wallet.switchChain(base.id);
      const privyProvider = await wallet.getEthereumProvider();
      const walletClient = createWalletClient({
        account: wallet.address as Hex,
        chain: base,
        transport: custom(privyProvider),
      });
      return walletClient;
    }
  }, [wallets]);

  const handleSubscribe = async () => {
    if (!isLoading) {
      try {
        const client = await walletClient;
        if (!client) {
          console.error("Wallet client not found");
          return;
        }
        const allowance = await publicClient.readContract({
          address: stakeConfig.nikoTokenAddress as `0x${string}`,
          abi: ERC20Abi,
          functionName: "allowance",
          args: [
            client.account?.address as `0x${string}`,
            stakeConfig.contractAddrss as `0x${string}`,
          ],
        });
        console.log("allowance", allowance);
        if (
          (allowance as bigint) <
          parseEther(stakeConfig.defaultAmoount.toString())
        ) {
          await client.writeContract({
            address: stakeConfig.nikoTokenAddress as `0x${string}`,
            abi: ERC20Abi,
            functionName: "approve",
            args: [
              stakeConfig.contractAddrss as `0x${string}`,
              parseEther(stakeConfig.defaultAmoount.toString()),
            ],
          });
        }
        const data = await client.writeContract({
          address: stakeConfig.contractAddrss as `0x${string}`,
          abi: NikoTokenLockerAbi,
          functionName: "stake",
          args: [parseEther(stakeConfig.defaultAmoount.toString())],
        });

        await fetchStakedInfo({
          contract: stakeConfig.contractAddrss as `0x${string}`,
          user: client?.account?.address as `0x${string}`,
        });

        showToast({
          message: `Stake successful: ${data}`,
          severity: "success",
        });
      } catch (error) {
        showToast({
          message: `Stake failed: ${
            (error as Error)?.message || "Unknown error"
          }`,
          severity: "error",
        });
      }
    }
  };

  const handleOperation = async (operation: "unstake" | "claim") => {
    if (!isLoading) {
      try {
        const client = await walletClient;
        if (!client) {
          console.error("Wallet client not found");
          return;
        }
        const data = await client.writeContract({
          address: stakeConfig.contractAddrss as `0x${string}`,
          abi: NikoTokenLockerAbi,
          functionName: operation,
          args: [],
        });

        await fetchStakedInfo({
          contract: stakeConfig.contractAddrss as `0x${string}`,
          user: client?.account?.address as `0x${string}`,
        });

        showToast({
          message: `Unstake successful: ${data}`,
          severity: "success",
        });
      } catch (error) {
        showToast({
          message: `Unstake failed: ${
            (error as Error)?.message || "Unknown error"
          }`,
          severity: "error",
        });
      }
    }
  };

  return (
    <div className={styles.pricingPage}>
      {/* 第一区域：Plans & Pricing */}
      <div
        className={styles.plansSection}
        style={{ backgroundImage: `url(${StakeGrid})` }}
      >
        <div className={styles.plansSectionContent}>
          <div className={styles.pricingHeader}>
            <h1 className={styles.title}>PLANS & PRICING</h1>
            <p className={styles.subtitle}>
              Upgrade to gain access to Premium features
            </p>
          </div>

          <div className={styles.plansContainer}>
            {plans.map((plan) => (
              <div key={plan.id} className={styles.planCard}>
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
                        <span className={styles.featureTitle}>
                          {feature.title}
                        </span>
                        {feature.subtitle && (
                          <span className={styles.featureSubtitle}>
                            {feature.subtitle}
                          </span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                {plan.buttonText && (
                  <div className={styles.buttonContainer}>
                    <button
                      className={styles.subscribeButton}
                      onClick={() => handleSubscribe()}
                      disabled={isLoading}
                    >
                      {isLoading ? "Processing..." : plan.buttonText}
                    </button>
                    {stakeState?.amount > 0 && (
                      <button
                        className={styles.subscribeButton}
                        onClick={() => handleOperation("unstake")}
                        disabled={isLoading}
                      >
                        {isLoading ? "Processing..." : "Unstake"}
                      </button>
                    )}
                    {stakeState?.pendingClaim > 0 && (
                      <div>
                        Claim {stakeState?.pendingClaim} $NYKO after{" "}
                        {new Date(
                          stakeState?.unstakeTime * 1000
                        ).toLocaleString()}
                      </div>
                    )}
                    {stakeState?.pendingClaim > 0 &&
                      stakeState?.unstakeTime <
                        Math.floor(Date.now() / 1000) && (
                        <button
                          className={styles.subscribeButton}
                          onClick={() => handleOperation("claim")}
                          disabled={isLoading}
                        >
                          {isLoading ? "Processing..." : "Claim"}
                        </button>
                      )}

                    {plan.tips && (
                      <p className={styles.buttonNote}>{plan.tips}</p>
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
              You can upgrade to Premium by clicking the "Stake to Subscribe"
              button and following the staking instructions.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>What happens if I unstake?</h3>
            <p className={styles.faqAnswer}>
              When you unstake, your Premium subscription will be cancelled.
              Your staked tokens will be withdrawable after a 7-day cooldown
              period.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>
              What payment methods do you accept?
            </h3>
            <p className={styles.faqAnswer}>
              Our Premium plan requires staking tokens rather than traditional
              payment. You can stake directly from your connected wallet.
            </p>
          </div>
          <div className={styles.faqItem}>
            <h3 className={styles.faqQuestion}>
              Is there a minimum staking period?
            </h3>
            <p className={styles.faqAnswer}>
              There is no minimum staking period. You can unstake at any time,
              but there is a 7-day cooldown period before you can withdraw your
              tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
