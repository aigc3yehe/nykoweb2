import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import styles from "./Pricing.module.css";
import StakeGrid from "../assets/stake_grid.svg";
import PlanOkIcon from "../assets/plan_ok.svg";
import PlanNoIcon from "../assets/plan_no.svg";
import QuestionIcon from "../assets/question.svg";
import FaqsGridIcon from "../assets/faqs_grid.svg";
import {
  pricingAtom,
  isPlanCurrent,
  // subscribeToPlan,
  setOperationLoading,
} from "../store/pricingStore";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import { base } from "viem/chains";
import { createWalletClient, custom, Hex, parseEther } from "viem";
import NikoTokenLockerAbi from "../abi/INikoTokenLocker.json";
import ERC20Abi from "../abi/IERC20.json";
import { showToastAtom } from "../store/imagesStore";
import { getStakedInfo, stakeStateAtom } from "../store/stakeStore";
import { publicClient } from "../providers/wagmiConfig";
import { alchemyStateAtom, getTokensForOwner } from "../store/alchemyStore";
import { queryStakedToken } from "../services/userService";

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
  const setOperationLoadingFn = useSetAtom(setOperationLoading);
  const [alchemyState] = useAtom(alchemyStateAtom);
  const [, fetchTokens] = useAtom(getTokensForOwner);
  const { user } = usePrivy();

  // 滚动相关状态
  const [scrollHeight, setScrollHeight] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(0);

  const contentRef = useRef<HTMLDivElement>(null);
  const customScrollbarRef = useRef<HTMLDivElement>(null);

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

  // 更新滚动状态
  useEffect(() => {
    const updateScrollInfo = () => {
      if (contentRef.current) {
        setScrollHeight(contentRef.current.scrollHeight);
        setClientHeight(contentRef.current.clientHeight);
        setScrollTop(contentRef.current.scrollTop);
      }
    };

    // 初始更新
    updateScrollInfo();

    // 添加滚动事件监听器
    const container = contentRef.current;
    if (container) {
      container.addEventListener("scroll", updateScrollInfo);
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", updateScrollInfo);
      }
    };
  }, []);

  // 处理自定义滚动条拖动
  const handleScrollThumbDrag = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    const startY = e.clientY;
    const startScrollTop = scrollTop;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (contentRef.current) {
        const deltaY = moveEvent.clientY - startY;
        const scrollRatio = deltaY / clientHeight;
        const newScrollTop = startScrollTop + scrollRatio * scrollHeight;

        contentRef.current.scrollTop = newScrollTop;
        setScrollTop(contentRef.current.scrollTop);
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // 计算滚动条高度和位置
  const getScrollThumbHeight = () => {
    if (scrollHeight <= clientHeight) return 0;
    return Math.max(30, (clientHeight / scrollHeight) * clientHeight);
  };

  const getScrollThumbTop = () => {
    if (scrollHeight <= clientHeight) return 0;
    return (
      (scrollTop / (scrollHeight - clientHeight)) *
      (clientHeight - getScrollThumbHeight())
    );
  };

  // 显示自定义滚动条的条件
  const showCustomScrollbar = scrollHeight > clientHeight;

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
        setOperationLoadingFn(true);
        const client = await walletClient;
        if (!client) {
          console.error("Wallet client not found");
          showToast({
            message: "Pending initial",
            severity: "warning",
          });
          setOperationLoadingFn(false);
          return;
        }
        const nikoBalance =
          alchemyState.tokens?.tokens?.find((token) => token.symbol === "NYKO")
            ?.balance || "0";
        if (Number(nikoBalance) < stakeConfig.defaultAmoount) {
          const tokens = await fetchTokens({
            addressOrName: client.account?.address as `0x${string}`,
            options: {
              contractAddresses: [
                stakeConfig.nikoTokenAddress as `0x${string}`,
              ],
            },
          });
          const nikoToken = tokens.tokens?.find(
            (token) => token.symbol === "NYKO"
          );
          if (
            !nikoToken ||
            Number(nikoToken.balance || 0) < stakeConfig.defaultAmoount
          ) {
            showToast({
              message: `Not enough $NYKO token to stake, need ${
                stakeConfig.defaultAmoount
              } $NYKO, current ${nikoToken?.balance || 0} $NYKO`,
              severity: "error",
            });
            setOperationLoadingFn(false);
            return;
          }
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

        await queryStakedToken({ did: user?.id || "" });

        showToast({
          message: `Stake successful: ${data}`,
          severity: "success",
        });
        setOperationLoadingFn(false);
      } catch (error) {
        setOperationLoadingFn(false);
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
        setOperationLoadingFn(true);
        const client = await walletClient;
        if (!client) {
          console.error("Wallet client not found");
          showToast({
            message: "Pending initial",
            severity: "warning",
          });
          setOperationLoadingFn(false);
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

        if (operation == "unstake") {
          await queryStakedToken({ did: user?.id || "" });
        }

        showToast({
          message: `Unstake successful: ${data}`,
          severity: "success",
        });
        setOperationLoadingFn(false);
      } catch (error) {
        setOperationLoadingFn(false);
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
      <div className={styles.scrollContainer}>
        <div
          ref={contentRef}
          className={`${styles.scrollContent} ${styles.hideScrollbar}`}
        >
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
                  <div
                    key={plan.id}
                    className={`${styles.planCard} ${
                      plan.id === "premium" ? styles.premium : ""
                    }`}
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
                          className={`${styles.featureItem} ${
                            !feature.supported ? styles.unsupportedFeature : ""
                          }`}
                        >
                          <img
                            src={feature.supported ? PlanOkIcon : PlanNoIcon}
                            alt={
                              feature.supported ? "Supported" : "Not supported"
                            }
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
                        {stakeState?.amount == 0 &&
                          stakeState?.unstakeTime == 0 && (
                            <button
                              className={styles.subscribeButton}
                              onClick={() => handleSubscribe()}
                              disabled={isLoading}
                            >
                              {isLoading ? "Processing..." : plan.buttonText}
                            </button>
                          )}
                        {stakeState?.amount > 0 && (
                          <button
                            className={styles.unstakeButton}
                            onClick={() => handleOperation("unstake")}
                            disabled={isLoading}
                          >
                            {isLoading ? "Processing..." : "Unstake"}
                          </button>
                        )}
                        {stakeState?.pendingClaim > 0 && (
                          <div className={styles.pendingButton}>
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
                              className={styles.claimButton}
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
          <div
            className={styles.faqSection}
            style={{ backgroundImage: `url(${FaqsGridIcon})` }}
          >
            <div className={styles.faqContainer}>
              <div className={styles.faqHeader}>
                <h2 className={styles.faqTitle}>FAQS</h2>
                <p className={styles.faqSubtitle}>
                  What you need to know about NYKO
                </p>
              </div>

              <div className={styles.faqItems}>
                <div className={styles.faqItem}>
                  <img
                    src={QuestionIcon}
                    alt="Question"
                    className={styles.faqIcon}
                  />
                  <div className={styles.faqContent}>
                    <h3 className={styles.faqQuestion}>
                      What are compute units?
                    </h3>
                    <p className={styles.faqAnswer}>
                      Compute units are a measure of computational resources
                      used to generate images or videos. They represent the
                      processing power, memory, and time required for each
                      creation. Different tasks consume varying amounts of
                      compute units based on their complexity and output
                      quality. For example, generating a high-resolution image
                      or a longer video will use more compute units than a
                      smaller image or shorter video.
                    </p>
                  </div>
                </div>

                <div className={styles.faqItem}>
                  <img
                    src={QuestionIcon}
                    alt="Question"
                    className={styles.faqIcon}
                  />
                  <div className={styles.faqContent}>
                    <h3 className={styles.faqQuestion}>
                      What are compute units?
                    </h3>
                    <p className={styles.faqAnswer}>
                      Compute units are a measure of computational resources
                      used to generate images or videos. They represent the
                      processing power, memory, and time required for each
                      creation.
                    </p>
                  </div>
                </div>

                <div className={styles.faqItem}>
                  <img
                    src={QuestionIcon}
                    alt="Question"
                    className={styles.faqIcon}
                  />
                  <div className={styles.faqContent}>
                    <h3 className={styles.faqQuestion}>
                      What are compute units?
                    </h3>
                    <p className={styles.faqAnswer}>
                      Compute units are a measure of computational resources
                      used to generate images or videos. They represent the
                      processing power, memory, and time required for each
                      creation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 自定义滚动条 */}
        {showCustomScrollbar && (
          <div className={styles.scrollbarTrack}>
            <div
              ref={customScrollbarRef}
              className={styles.scrollbarThumb}
              style={{
                height: `${getScrollThumbHeight()}px`,
                top: `${getScrollThumbTop()}px`,
              }}
              onMouseDown={handleScrollThumbDrag}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Pricing;
