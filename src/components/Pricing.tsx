import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAtom, useSetAtom } from "jotai";
import styles from "./Pricing.module.css";
import StakeGrid from "../assets/stake_grid.svg";
import QuestionIcon from "../assets/question.svg";
import FaqsGridIcon from "../assets/faqs_grid.svg";
import SubNormalIcon from "../assets/sub_normal.svg";
import SubDisableIcon from "../assets/sub_disable.svg";
import AddNormalIcon from "../assets/add_normal.svg";
import AddDisableIcon from "../assets/add_disable.svg";
import { pricingAtom, setOperationLoading } from "../store/pricingStore";
import { useLogin, usePrivy, useWallets } from "@privy-io/react-auth";
import { base } from "viem/chains";
import { createWalletClient, custom, Hex, parseEther } from "viem";
import NikoTokenLockerAbi from "../abi/INikoTokenLocker.json";
import ERC20Abi from "../abi/IERC20.json";
import { showToastAtom } from "../store/imagesStore";
import { getStakedInfo, stakeStateAtom } from "../store/stakeStore";
import { publicClient } from "../providers/wagmiConfig";
import { alchemyStateAtom, getTokensForOwner } from "../store/alchemyStore";
import {
  queryStakedToken,
  chargeCredit,
  updatePlan,
} from "../services/userService";
import { Link } from "react-router-dom";
import { CuBuyConfig } from "../utils/plan";
import PlanCard from "./PlanCard";

// 定义价格套餐类型
const Pricing: React.FC = () => {
  const [pricingState] = useAtom(pricingAtom);
  const { authenticated } = usePrivy();
  const { plans, isLoading, stakeConfig } = pricingState;
  const { wallets } = useWallets();
  const showToast = useSetAtom(showToastAtom);
  const [stakeState] = useAtom(stakeStateAtom);
  const [, fetchStakedInfo] = useAtom(getStakedInfo);
  const setOperationLoadingFn = useSetAtom(setOperationLoading);
  const [alchemyState] = useAtom(alchemyStateAtom);
  const [, fetchTokens] = useAtom(getTokensForOwner);
  const { user } = usePrivy();
  const [currentPlan, setCurrentPlan] = useState("free");
  const [buyCuLoading, setBuyCuLoading] = useState(false);

  const [purchaseQuantity, setPurchaseQuantity] = useState(1); // 添加购买数量状态

  // 处理数量增减的函数
  const handleDecrease = () => {
    if (purchaseQuantity > 1) {
      setPurchaseQuantity(purchaseQuantity - 1);
    }
  };

  const handleIncrease = () => {
    if (purchaseQuantity < 10) {
      setPurchaseQuantity(purchaseQuantity + 1);
    }
  };

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
  }, [fetchStakedInfo, stakeConfig, wallets]);

  useEffect(() => {
    if (stakeState?.amount == 0) {
      setCurrentPlan("free");
    } else if (stakeState?.amount >= plans[2].staked) {
      setCurrentPlan("premiumPlus");
    } else {
      setCurrentPlan("premium");
    }
  }, [stakeState, plans]);

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
        contentRef.current.scrollTop =
          startScrollTop + scrollRatio * scrollHeight;
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
      return createWalletClient({
        account: wallet.address as Hex,
        chain: base,
        transport: custom(privyProvider),
      });
    }
  }, [wallets]);

  const { login } = useLogin();

  // Login by Twitter
  const handleLogin = () => {
    try {
      login();
    } catch (error) {
      console.error("login Twitter failed:", error);
    }
  };

  // Buy training slots
  const handleBuy = async () => {
    if (buyCuLoading) return;
    // 这里添加购买逻辑
    console.log(`Buy ${purchaseQuantity} CUs`);
    const ethAmount = purchaseQuantity * CuBuyConfig.price;
    try {
      setBuyCuLoading(true);
      const client = await walletClient;
      const tx = await client?.sendTransaction({
        to: CuBuyConfig.treasure as `0x${string}`,
        value: parseEther(ethAmount.toString()),
      });
      await chargeCredit({ tx_hash: tx });
      showToast({
        message: `Buy successful: ${tx}`,
        severity: "success",
      });
      setBuyCuLoading(false);
    } catch (error) {
      console.error("Buy CUs failed:", error);
      showToast({
        message: `Buy failed: ${(error as Error)?.message || "Unknown error"}`,
        severity: "error",
      });
      setBuyCuLoading(false);
    }
  };

  // Subscribe to plan by staking $NYKO
  const handleSubscribe = async (planId: string) => {
    if (!authenticated) {
      handleLogin();
      return;
    }
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
        const plan = plans.find((plan) => plan.id === planId);
        if (!plan) {
          console.error("Plan not found");
          showToast({
            message: "Plan not found",
            severity: "error",
          });
          setOperationLoadingFn(false);
          return;
        }
        const nikoBalance =
          alchemyState.tokens?.tokens?.find((token) => token.symbol === "NYKO")
            ?.balance || "0";
        const needStakedAmont = plan.staked - Number(stakeState?.amount);
        if (Number(nikoBalance) < needStakedAmont) {
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
          if (!nikoToken || Number(nikoToken.balance || 0) < needStakedAmont) {
            showToast({
              message: `Not enough $NYKO token to stake, need ${needStakedAmont} $NYKO, current ${
                nikoToken?.balance || 0
              } $NYKO`,
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
        if ((allowance as bigint) < parseEther(needStakedAmont.toString())) {
          await client.writeContract({
            address: stakeConfig.nikoTokenAddress as `0x${string}`,
            abi: ERC20Abi,
            functionName: "approve",
            args: [
              stakeConfig.contractAddrss as `0x${string}`,
              parseEther(needStakedAmont.toString()),
            ],
          });
        }
        const data = await client.writeContract({
          address: stakeConfig.contractAddrss as `0x${string}`,
          abi: NikoTokenLockerAbi,
          functionName: "stake",
          args: [parseEther(needStakedAmont.toString())],
        });

        await fetchStakedInfo({
          contract: stakeConfig.contractAddrss as `0x${string}`,
          user: client?.account?.address as `0x${string}`,
        });

        try {
          await queryStakedToken({ did: user?.id || "" });
          await updatePlan({ did: user?.id || "" });
        } catch (error) {
          console.error("Update plan failed:", error);
        }

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
  // Unstake or claim staked $NYKO
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
          try {
            await queryStakedToken({ did: user?.id || "" });
            await updatePlan({ did: user?.id || "" });
          } catch (error) {
            console.error("Update plan failed:", error);
          }
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
                <h1 className={styles.title}>Stake to Subscribe</h1>
                <p className={styles.subtitle}>
                  Upgrade to gain access to Premium features
                  <Link
                    target="_blank"
                    to={`https://flaunch.gg/base/coin`}
                    className="m-1"
                  >
                    Bug $NYKO
                  </Link>
                </p>
              </div>

              <div className={styles.plansContainer}>
                {/* Free */}
                <PlanCard
                  plan={plans[0]}
                  currentPlan={currentPlan}
                  handleSubscribe={handleSubscribe}
                  handleOperation={handleOperation}
                  isLoading={isLoading}
                />
                {/* Premium */}
                <PlanCard
                  plan={plans[1]}
                  currentPlan={currentPlan}
                  handleSubscribe={handleSubscribe}
                  handleOperation={handleOperation}
                  isLoading={isLoading}
                  showStake={
                    stakeState.amount < plans[1].staked &&
                    stakeState.unstakeTime == 0
                  }
                  showUnstake={
                    stakeState.amount >= plans[1].staked &&
                    stakeState.amount < plans[2].staked
                  }
                  showPendingClaim={
                    stakeState.pendingClaim >= plans[1].staked &&
                    stakeState.pendingClaim < plans[2].staked
                  }
                  showClaim={
                    stakeState.pendingClaim >= plans[1].staked &&
                    stakeState.pendingClaim < plans[2].staked &&
                    stakeState?.unstakeTime < Math.floor(Date.now() / 1000)
                  }
                  pendingClaim={stakeState.pendingClaim}
                  unstakeTime={stakeState.unstakeTime}
                />
                {/* Premium Plus */}
                <PlanCard
                  plan={{
                    ...plans[2],
                    buttonText:
                      stakeState.amount >= plans[1].staked
                        ? "Upgrade to Premium+"
                        : plans[2].buttonText,
                  }}
                  currentPlan={currentPlan}
                  handleSubscribe={handleSubscribe}
                  handleOperation={handleOperation}
                  isLoading={isLoading}
                  showStake={
                    stakeState.amount < plans[2].staked &&
                    stakeState.unstakeTime == 0
                  }
                  showUnstake={stakeState.amount >= plans[2].staked}
                  showPendingClaim={stakeState.pendingClaim >= plans[2].staked}
                  showClaim={
                    stakeState.pendingClaim >= plans[2].staked &&
                    stakeState?.unstakeTime < Math.floor(Date.now() / 1000)
                  }
                  pendingClaim={stakeState.pendingClaim}
                  unstakeTime={stakeState.unstakeTime}
                />
              </div>

              {/* quit buy nyko */}
              <div className="pt-5 pb-5 pl-7 pr-7 gap-1.5 flex justify-between items-center bg-gradient-to-r from-[rgba(255,106,0,0.2)] via-[rgba(31,41,55,0.2)] to-[rgba(82,84,181,0.2)] rounded border border-[#3741514D] backdrop-blur-[20px] gap-[20px]">
                <div className="font-['Jura'] font-bold text-[20px] leading-[120%] align-middle capitalize bg-gradient-to-r from-[#6366F1] to-[#FF6A00] bg-clip-text text-transparent">
                  Get Additional Credits <span className="text-white">✨</span>
                </div>

                <div className="flex items-center gap-[20px]">
                  <span className="font-['Jura'] font-normal text-[20px] leading-[100%] align-middle capitalize text-white">
                    {CuBuyConfig.price} ETH ={" "}
                    {CuBuyConfig.amount.toLocaleString()} Credits
                  </span>

                  <div className="flex items-center gap-[6px]">
                    <button
                      onClick={handleDecrease}
                      className="w-[2.5rem] h-[2.0625rem] flex items-center justify-center"
                    >
                      <img
                        src={
                          purchaseQuantity <= 1 ? SubDisableIcon : SubNormalIcon
                        }
                        alt="Decrease"
                        className="w-full h-full"
                      />
                    </button>

                    <div className="w-[56px] h-[2.0625rem] gap-[8px] py-[8px] px-[14px] rounded-[4px] border border-[#37415180] flex items-center justify-center">
                      <span className="font-['Jura'] font-medium text-[14px] leading-[100%] text-center align-middle text-white">
                        {purchaseQuantity}
                      </span>
                    </div>

                    <button
                      onClick={handleIncrease}
                      className="w-[2.5rem] h-[2.0625rem] flex items-center justify-center"
                    >
                      <img
                        src={
                          purchaseQuantity >= 10
                            ? AddDisableIcon
                            : AddNormalIcon
                        }
                        alt="Increase"
                        className="w-full h-full"
                      />
                    </button>
                  </div>

                  <button
                    onClick={handleBuy}
                    className="gap py-[0.375rem] px-[1.875rem] rounded bg-[#6366F1] font-['Jura'] font-bold text-[16px] leading-[100%] text-center align-middle text-black"
                    disabled={buyCuLoading}
                  >
                    {buyCuLoading ? "BUYING..." : "BUY"}
                  </button>
                </div>
              </div>
              {/* sponsor */}
              {/* <div
                className="w-full h-[7.8125rem] gap-[0.375rem] py-[1.5rem] px-[1.875rem] rounded border border-[#3741514D] backdrop-blur-[20px] flex flex-col"
                style={{
                  backgroundImage: `url('/sponsor.png')`,
                  backgroundSize: "100% 100%",
                  backgroundPosition: "left top",
                  backgroundRepeat: "no-repeat",
                }}
              >
                <div className="flex justify-between items-center">
                  <span className="font-['Jura'] font-bold text-[1.875rem] leading-[100%] align-middle capitalize text-white">
                    Apply for NYKO Creator Sponsor !
                  </span>
                  <button
                    onClick={}
                    className="gap py-[0.375rem] px-[1.875rem] rounded bg-white font-['Jura'] font-bold text-[1rem] leading-[100%] text-center align-middle text-black"
                  >
                    APPLY
                  </button>
                </div>
                <div className="mt-2">
                  <span className="font-['Jura'] font-normal text-[0.875rem] leading-[130%] align-middle capitalize text-white block">
                    want to create more on Nyko?
                  </span>
                  <span className="font-['Jura'] font-normal text-[0.875rem] leading-[130%] align-middle capitalize text-white block">
                    you can now apply for the nyko AI cerativity fund.
                  </span>
                </div>
              </div> */}
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
                    <h3 className={styles.faqQuestion}>What is NYKO?</h3>
                    <p className={styles.faqAnswer}>
                      NYKO includes an Agent and application platform, as well
                      as the AI creativity tokenization contract. The Agent and
                      application platform are responsible for making the
                      generation and application of creativity simple, while the
                      creativity tokenization contract handles launching,
                      binding, and revenue distribution.
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
                      I like this image style, how can I generate one?
                    </h3>
                    <p className={styles.faqAnswer}>
                      Click the "Generate" button, just like traditional image
                      generation apps. Or simply tell Niyoko that you want to
                      generate an image.
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
                      Will staking $NYKO burn it?
                    </h3>
                    <p className={styles.faqAnswer}>
                      The $NYKO used in the Stake to Subscribe system won’t be
                      burned—you can withdraw it at any time.
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
