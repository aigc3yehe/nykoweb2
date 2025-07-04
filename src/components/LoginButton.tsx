import React, {useEffect, useRef, useState} from "react";
import {usePrivy, useLogin, useWallets} from "@privy-io/react-auth";
import styles from "./LoginButton.module.css";
import GoldIcon from "../assets/gold.svg";
import PlanPlusIcon from "../assets/plan_plus.svg";
import { useAtom, useSetAtom } from "jotai";
import {
  accountAtom,
  setUser,
  logout as logoutAction, setPlan,
} from "../store/accountStore";
import {createUser, PLAN_TYPE} from "../services/userService";
import { showAccountPopupAtom } from "../store/accountPopupStore";
import { Twitter } from "../store/imageStore.ts";
import { useCreateWallet } from "@privy-io/react-auth";
import {getStakedInfo, stakeStateAtom} from "../store/stakeStore.ts";
import {pricingAtom} from "../store/pricingStore.ts";

interface LoginButtonProps {
  className?: string;
}

const LoginButton: React.FC<LoginButtonProps> = ({ className }) => {
  const { authenticated } = usePrivy();
  const [pricingState] = useAtom(pricingAtom);
  const { stakeConfig } = pricingState;
  const [accountState] = useAtom(accountAtom);
  const { walletAddress, twitter, plan, linked_wallet} = accountState;
  const setUserData = useSetAtom(setUser);
  const showAccountPopup = useSetAtom(showAccountPopupAtom);
  const accountRef = useRef<HTMLDivElement>(null);
  const logoutStore = useSetAtom(logoutAction);
  const setPlanAction = useSetAtom(setPlan);
  const { createWallet } = useCreateWallet();
  const [stakeState] = useAtom(stakeStateAtom);
  const [, fetchStakedInfo] = useAtom(getStakedInfo);
  const { wallets } = useWallets();
  const [checkPlan, setCheckPlan] = useState(false);

  useEffect(() => {
    if (checkPlan) {
      console.log("Check plan", checkPlan);
      const wallet = wallets.find(
          (wallet) => wallet.walletClientType === "privy"
      );
      if (wallet) {
        fetchStakedInfo({
          contract: stakeConfig.contractAddrss as `0x${string}`,
          user: wallet.address as `0x${string}`,
        });
      }
    } else {
      console.log("Check plan", checkPlan);
    }
  }, [fetchStakedInfo, stakeConfig.contractAddrss, wallets, checkPlan]);

  const { login } = useLogin({
    onComplete: async ({ user, isNewUser }) => {
      console.log("login success", user);

      // 如果有用户信息，则调用用户创建API
      if (user) {
        try {
          // 准备用户数据
          const userData = {
            did: user.id,
            address: user.wallet?.address,
            username: user.twitter?.username,
            subject: user.twitter?.subject,
            name: user.twitter?.name,
            profilePictureUrl: user.twitter?.profilePictureUrl,
          };

          if (!user.wallet?.address) {
            try {
              const result = await createWallet({ createAdditional: false });
              userData.address = result.address;
            } catch (error) {
              console.error("Privy create wallet failed:", error);
            }
          }

          // 调用创建用户API
          await createUser();
          console.log("user update or create success");

          // 特别处理新用户
          if (isNewUser) {
            console.log("new user", user);
            // 这里可以添加新用户的其他初始化逻辑
          }
        } catch (error) {
          console.error("user update or create failed:", error);
        }
        // 请求一下会员状态
        setCheckPlan(true);
        // 更新全局用户状态
        setUserData(user);
      }
    },
    onError: (error) => {
      console.error("login failed", error);
    },
  });

  useEffect(() => {
    if (stakeState?.amount == 0 &&
        stakeState?.unstakeTime == 0) {
      setPlanAction("Free");
    } else {
      setPlanAction("Premium");
    }
  }, [stakeState, setPlanAction]);

  // 格式化钱包地址，显示前4位和后4位
  const formatAddress = (address: string | null) => {
    if (!address || address.length < 10) return address || "";
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const formatName = (x: Twitter | null, address: string | null) => {
    if (!x) return formatAddress(address);
    if (x.name) return x.name;
    if (x.username) return x.username;
    return formatAddress(address);
  };



  const logout = () => {
    console.log("logout success");
    logoutStore();
  };

  const handleLogin = async () => {
    try {
      // 使用Twitter作为OAuth提供者
      // await initOAuth({ provider: 'twitter' });
      login();
    } catch (error) {
      console.error("login Twitter failed:", error);
    }
  };

  // 处理账户点击
  const handleAccountClick = () => {
    // 获取当前元素位置
    const position = accountRef.current?.getBoundingClientRect() || null;

    // 显示弹窗
    showAccountPopup({
      userData: {
        name: twitter?.name || undefined,
        username: twitter?.username || undefined,
        profilePictureUrl: twitter?.profilePictureUrl || undefined,
        walletAddress: walletAddress || undefined,
        plan: plan,
        linked_wallet: linked_wallet ? linked_wallet : undefined,
      },
      anchorPosition: position,
      onLogout: logout,
    });
  };

  // 用户已登录，显示账户信息
  if (authenticated) {
    return (
      <div className={styles.loggedInContainer}>
        {/* Credits显示 */}
        {/* <div className={styles.creditsContainer}>
          <span className={styles.creditsAmount}>{formatNumber(credits)}</span>
          <span className={styles.creditsLabel}>Credits</span>
        </div> */}

        {/* 账户显示 */}
        <div
          ref={accountRef}
          className={styles.accountContainer}
          onClick={handleAccountClick}
        >
          {plan === PLAN_TYPE.PREMIUM && (
              <img src={GoldIcon} alt="Account" className={styles.goldIcon} />
          )}
          {plan === PLAN_TYPE.PREMIUM_PLUS && (
              <img src={PlanPlusIcon} alt="Account" className={styles.goldIcon} />
          )}
          <img
            src={twitter?.profilePictureUrl || ""}
            alt="Twitter Avatar"
            className={styles.avatarIcon}
          />
          <span className={styles.accountAddress}>
            {formatName(twitter, walletAddress)}
          </span>
        </div>
      </div>
    );
  }

  // 用户未登录，显示登录选项
  return (
    <div className={styles.loginContainer}>
      {/* Twitter登录按钮 */}
      <button
        className={`${styles.loginButton} ${className}`}
        onClick={handleLogin}
        // disabled={loading}
      >
        {/* {loading ? "Logining..." : "Login"} */}
        Log in
      </button>
    </div>
  );
};

export default LoginButton;
