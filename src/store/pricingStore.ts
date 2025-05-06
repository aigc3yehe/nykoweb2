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
  defaultAmoount: number;
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
          title: "Up to 5 images per day",
          subtitle: "On Website",
          supported: true,
        },
        {
          title: "Model training",
          supported: false,
        },
        {
          title: "Not eligible for Primedata rewards",
          supported: false,
        },
      ],
    },
    {
      id: "premium",
      name: "Premium",
      price: "75,000 $NYKO",
      description: "For expert-level AI players",
      features: [
        {
          title: "Unlimited images per day.",
          subtitle: "On Website & X",
          supported: true,
        },
        {
          title: "1 Model Training Available",
          subtitle: "Application Required",
          supported: true,
          link: "https://discord.com/channels/1368843355362164786/1368986279319961600"
        },
        {
          title: "eligible for Primedata rewards",
          supported: true,
        },
      ],
      buttonText: "Stake to Subscribe",
      tips: "*You can unstake to cancel your subscription. Withdrawable after a 7-day cooldown",
    },
  ],
  currentPlanId: "free",
  isLoading: false,
  error: null,
  stakeConfig: {
    nikoTokenAddress: "0x129966d7D25775b57E3C5b13b2E1c2045FBc4926",
    contractAddrss: "0xb1542ce040f0d0b9ce6958cbdda40905b4a7551a",
    defaultAmoount: 75_000,
  },
};

// 创建定价状态原子
export const pricingAtom = atom<PricingState>(initialState);

// 获取当前计划
export const getCurrentPlan = atom((get) => {
  const pricingState = get(pricingAtom);
  const plans = pricingState.plans;
  const currentPlanId = pricingState.currentPlanId;

  return plans.find((plan) => plan.id === currentPlanId) || plans[0];
});

// 检查是否为当前计划
export const isPlanCurrent = atom((get) => (planId: string) => {
  const pricingState = get(pricingAtom);
  return pricingState.currentPlanId === planId;
});

// 订阅计划
export const subscribeToPlan = atom(null, async (get, set, planId: string) => {
  const pricingState = get(pricingAtom);

  // 设置加载状态
  set(pricingAtom, {
    ...pricingState,
    isLoading: true,
    error: null,
  });

  try {
    // 这里将来会添加实际的订阅逻辑，例如API调用
    console.log(`Subscribing to plan: ${planId}`);

    // 模拟API调用延迟
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 更新当前计划
    set(pricingAtom, {
      ...pricingState,
      currentPlanId: planId,
      isLoading: false,
    });

    return true;
  } catch (error) {
    // 处理错误
    set(pricingAtom, {
      ...pricingState,
      isLoading: false,
      error: (error as Error).message,
    });

    return false;
  }
});

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
