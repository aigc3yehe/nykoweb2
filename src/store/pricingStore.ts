import { atom } from "jotai";
import { accountAtom } from "./accountStore";

// 定义功能项类型
export interface PricingFeature {
  title: string;
  subtitle?: string;
  supported: boolean;
  link?: string;
}

// Define stake token on chain config
export interface StakeConfig {
  nikoTokenAddress: string;
  contractAddrss: string;
}

// 定义价格套餐类型
export interface PricingPlan {
  id: string;
  name: string;
  price: string;
  description: string;
  features: PricingFeature[];
  buttonText?: string;
  tips?: string;
  staked: number;
}

// 定义定价状态接口
export interface PricingState {
  plans: PricingPlan[];
  currentPlanId: string;
  isLoading: boolean;
  error: string | null;
  stakeConfig: StakeConfig;
}

// 初始定价状态
const initialState: PricingState = {
  plans: [
    {
      id: "free",
      name: "Free",
      price: "0 $NYKO",
      description: "For starter",
      features: [
        {
          title: "100 Credits Every Week",
          subtitle: "On Website",
          supported: true,
        },
        {
          title: "Not Eligible For Primedata Rewards",
          supported: false,
        },
      ],
      staked: 0,
    },
    {
      id: "premium",
      name: "Premium",
      price: "75,000 $NYKO",
      description: "For expert-level AI players",
      features: [
        {
          title: "2,500 Credits Every Week",
          subtitle: "On Website",
          supported: true,
        },
        {
          title: "Eligible For Primedata Rewards",
          supported: true,
        },
      ],
      buttonText: "Stake to Subscribe",
      tips: "*You can unstake to cancel your subscription. Withdrawable after a 7-day cooldown",
      staked: 75_000,
    },
    {
      id: "premiumPlus",
      name: "Premium+",
      price: "300,000 $NYKO",
      description: "For Revolutionary AI creators",
      features: [
        {
          title: "12,000 Credits Every Week",
          subtitle: "On Website & X",
          supported: true,
        },
        {
          title: "Eligible for Primedata Rewards",
          supported: true,
        },
        {
          title: "Access to Premium+ Creators Channel",
          supported: true,
        },
        {
          title: "Voting Rights for Sponsorships",
          supported: true,
        },
      ],
      buttonText: "Stake to Subscribe",
      tips: "*You can unstake to cancel your subscription. Withdrawable after a 7-day cooldown",
      staked: 300_000,
    },
  ],
  currentPlanId: "free",
  isLoading: false,
  error: null,
  stakeConfig: {
    nikoTokenAddress: "0x129966d7D25775b57E3C5b13b2E1c2045FBc4926",
    contractAddrss: "0xb1542ce040f0d0b9ce6958cbdda40905b4a7551a",
  },
};

// 创建定价状态原子
export const pricingAtom = atom<PricingState>(initialState);

// 从账户状态同步角色/计划
export const syncPlanWithAccount = atom(null, (get, set) => {
  const accountState = get(accountAtom);
  const pricingState = get(pricingAtom);

  // 根据用户角色设置当前计划
  if (accountState.role === "premium") {
    set(pricingAtom, {
      ...pricingState,
      currentPlanId: "premium",
    });
  } else {
    set(pricingAtom, {
      ...pricingState,
      currentPlanId: "free",
    });
  }
});

export const setOperationLoading = atom(
  null,
  (get, set, isLoading: boolean) => {
    const pricingState = get(pricingAtom);
    set(pricingAtom, {
      ...pricingState,
      isLoading,
    });
  }
);
