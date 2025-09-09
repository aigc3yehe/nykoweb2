import { atom } from "jotai";

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
  virtualsStakedAddress: string;
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
      price: "$0",
      description: "For Starter",
      features: [
        {
          title: "10 Credits Every Day",
          supported: true,
        },
        {
          title: "Use Generator and Cases to create images and videos",
          supported: true,
        },
        {
          title: "Use Builder to save generative templates",
          supported: true,
        },
      ],
      staked: 0,
    },
    {
      id: "premium",
      name: "Plus",
      price: "$19",
      description: "For Expert-Level AI Players",
      features: [
        {
          title: "2,500 Credits Every Month",
          supported: true,
        },
        {
          title: "Everything included in Free plan",
          supported: true,
        },
        {
          title: "Test models in both Generator and Builder",
          supported: true,
        },
        {
          title: "Join MAVAE VIP community",
          supported: true,
        },
      ],
      buttonText: "Subscribe",
      tips: "*You can cancel your subscription at any time",
      staked: 75_000,
    },
    {
      id: "premium_plus",
      name: "Pro",
      price: "$49",
      description: "For Revolutionary AI Creators",
      features: [
        {
          title: "8,000 Credits Every Month",
          supported: true,
        },
        {
          title: "Everything included in Free&Plus plan",
          supported: true,
        },
        {
          title: "API access is available upon request",
          supported: true,
        },
        {
          title: "Schedule an online session with MAVAE team, available once a week.",
          supported: true,
        },
      ],
      buttonText: "Subscribe",
      tips: "*You can cancel your subscription at any time",
      staked: 300_000,
    },
  ],
  currentPlanId: "free",
  isLoading: false,
  error: null,
  stakeConfig: {
    nikoTokenAddress: "0x129966d7D25775b57E3C5b13b2E1c2045FBc4926",
    contractAddrss: "0xb1542ce040f0d0b9ce6958cbdda40905b4a7551a",
    virtualsStakedAddress: "0x37C589356A4e49aD8174808039869Dd18a288458"
  },
};

// 创建定价状态原子
export const pricingAtom = atom<PricingState>(initialState);

// 从账户状态同步角色/计划
// export const syncPlanWithAccount = atom(null, (get, set) => {
//   //const accountState = get(userStateAtom);
//   //const pricingState = get(pricingAtom);
//
//   // 根据用户角色设置当前计划
//   // if (accountState.userDetails?.role === "premium") {
//   //   set(pricingAtom, {
//   //     ...pricingState,
//   //     currentPlanId: "premium",
//   //   });
//   // } else {
//   //   set(pricingAtom, {
//   //     ...pricingState,
//   //     currentPlanId: "free",
//   //   });
//   // }
// });

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

// 新增：支付方式类型定义
export type PaymentMethod = 'stripe' | 'hel'

// 新增：支付方式选择状态
export const selectedPaymentMethodAtom = atom<PaymentMethod>('stripe')

// 新增：支付方式下拉菜单显示状态
export const showPaymentDropdownAtom = atom<boolean>(false)

// 创建翻译后的定价数据的辅助函数
// 用法示例：
// const { t } = useI18n();
// const translatedPlans = createTranslatedPricingPlans(t);
// 然后在组件中使用translatedPlans
export const createTranslatedPricingPlans = (t: (key: string) => string) => [
  {
    id: "free",
    name: t('pricing.free'),
    price: "$0",
    description: t('pricing.forStarter'),
    features: [
      {
        title: t('pricing.tenCreditsEveryDay'),
        supported: true,
      },
      {
        title: t('pricing.useGeneratorAndCases'),
        supported: true,
      },
      {
        title: t('pricing.useBuilderToSaveTemplates'),
        supported: true,
      },
    ],
    staked: 0,
  },
  {
    id: "premium",
    name: t('pricing.plus'),
    price: "$19",
    description: t('pricing.forExpertLevelAIPlayers'),
    features: [
      {
        title: t('pricing.twoThousandFiveHundredCreditsEveryMonth'),
        supported: true,
      },
      {
        title: t('pricing.everythingIncludedInFree'),
        supported: true,
      },
      {
        title: t('pricing.testModelsInGeneratorAndBuilder'),
        supported: true,
      },
      {
        title: t('pricing.joinMAVAEVIPCommunity'),
        supported: true,
      },
    ],
    buttonText: t('pricing.subscribe'),
    tips: t('pricing.cancelSubscriptionTip'),
    staked: 75_000,
  },
  {
    id: "premium_plus",
    name: t('pricing.pro'),
    price: "$49",
    description: t('pricing.forRevolutionaryAICreators'),
    features: [
      {
        title: t('pricing.eightThousandCreditsEveryMonth'),
        supported: true,
      },
      {
        title: t('pricing.everythingIncludedInFreeAndPlus'),
        supported: true,
      },
      {
        title: t('pricing.apiAccessAvailable'),
        supported: true,
      },
      {
        title: t('pricing.scheduleOnlineSession'),
        supported: true,
      },
    ],
    buttonText: t('pricing.subscribe'),
    tips: t('pricing.cancelSubscriptionTip'),
    staked: 300_000,
  },
];
