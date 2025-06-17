import { atom } from "jotai";
import { User, Google, getAccessToken } from "@privy-io/react-auth";
import {
  queryUser,
  queryUserPlan,
  refreshUserPlan,
} from "../services/userService";
import { Twitter } from "./imageStore";
import { chatAtom } from "./chatStore"; // 导入聊天状态
import { PRIVY_TOKEN_HEADER } from "../utils/constants";

export interface AccountState {
  user: User | null;
  twitter: Twitter | null;
  google: Google | null;
  walletAddress: string | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  error: string | null;
  credits: number;
  did: string | null;
  role: string | null;
  name: string | null;
  avatar: string | null;
  plan: string;
  linked_wallet: string | null;
  geni: number | null;
  referrals: {
    invite_code: string | null;
    referrer_code: string | null;
    point_reward_ratio: number;
    referrer_twitter?: Twitter | null;
  } | null;
}

// 初始账户状态
const initialState: AccountState = {
  user: null,
  twitter: null,
  google: null,
  walletAddress: null,
  isLoading: false,
  isLoggedIn: false,
  error: null,
  credits: 0,
  did: null,
  role: "user",
  name: null,
  avatar: null,
  plan: "Free",
  linked_wallet: null,
  geni: null,
  referrals: null,
};

// 创建账户状态原子
export const accountAtom = atom<AccountState>(initialState);

// 设置用户信息并查询用户数据
export const setUser = atom(null, async (get, set, user: User | null) => {
  if (!user) {
    set(accountAtom, initialState);
    return;
  }

  set(accountAtom, {
    ...get(accountAtom),
    isLoading: true,
  });

  try {
    // 获取钱包地址
    const walletAddress = user?.wallet?.address || null;
    const did = user?.id || null;

    // 如果有DID，查询用户信息
    if (did) {
      const queryParams: { did: string; address?: string } = { did };
      if (walletAddress) {
        // 如果有钱包地址，查询钱包地址
        queryParams.address = walletAddress;
      }

      try {
        const result = await queryUser(queryParams);
        const planResult = await queryUserPlan(queryParams);



        const referralsData = result.data.referrals ? {
          invite_code: result.data.referrals.invite_code,
          referrer_code: result.data.referrals.referrer_code || null,
          point_reward_ratio: result.data.referrals.point_reward_ratio,
          referrer_twitter: result.data.referrals.referrer_twitter || null
        } : null;



        set(accountAtom, {
          user,
          twitter: result.data.twitter,
          google: user?.google || null,
          walletAddress: result.data.address || walletAddress,
          isLoading: false,
          isLoggedIn: true,
          error: null,
          credits: planResult.data.sub_balance + planResult.data.paid_balance,
          did,
          role: result.data.role || "user",
          name: result.data.name || null,
          avatar: result.data.avatar || null,
          plan: planResult.data.plan_type,
          linked_wallet: result.data.linked_wallet || null,
          geni: result.data.geni || 1,
          referrals: referralsData,
        });


      } catch (error) {
        // 如果查询失败，仍使用本地用户信息
        set(accountAtom, {
          user,
          twitter: user?.twitter
            ? {
                username: user.twitter.username,
                name: user.twitter.name,
                profilePictureUrl: user.twitter.profilePictureUrl,
                subject: user.twitter.subject,
              }
            : null,
          google: user?.google || null,
          walletAddress,
          isLoading: false,
          isLoggedIn: true,
          error: (error as Error).message,
          credits: 0, // Fallback credits
          did,
          role: "user",
          name: null,
          avatar: null,
          plan: "free", // Fallback plan
          linked_wallet: null,
          geni: 1,
          referrals: null,
        });
      }
    } else {
      // 无DID的情况
      set(accountAtom, {
        user,
        twitter: user?.twitter
          ? {
              username: user.twitter.username,
              name: user.twitter.name,
              profilePictureUrl: user.twitter.profilePictureUrl,
              subject: user.twitter.subject,
            }
          : null,
        google: user?.google || null,
        walletAddress,
        isLoading: false,
        isLoggedIn: true,
        error: null,
        credits: 0,
        did,
        role: "user",
        name: null,
        avatar: null,
        plan: "Free",
        linked_wallet: null,
        geni: 0,
        referrals: null,
      });
    }
  } catch (error) {
    set(accountAtom, {
      ...get(accountAtom),
      isLoading: false,
      error: (error as Error).message,
    });
  }
});

// Atom to trigger refreshing user plan (credits and plan type)
export const refreshUserPlanAtom = atom(
  null,
  async (get, set, update?: boolean) => {
    const accountState = get(accountAtom);
    const did = accountState.did;

    if (did) {
      try {
        // Optional: set loading state if you have a specific loading indicator for this
        // set(accountAtom, (prev) => ({ ...prev, isLoading: true }));

        let planResult;
        if (update) {
          planResult = await refreshUserPlan({ did });
        } else {
          planResult = await queryUserPlan({ did });
        }

        set(accountAtom, (prev) => ({
          ...prev,
          credits: planResult.data.sub_balance + planResult.data.paid_balance,
          plan: planResult.data.plan_type,
          // isLoading: false, // Optional: clear loading state
        }));
        return planResult?.data;
      } catch (error) {
        console.error("Failed to refresh user plan:", error);
        set(accountAtom, (prev) => ({
          ...prev,
          // isLoading: false, // Optional: clear loading state
          // Optionally update an error field specific to plan refresh
          // error: `Failed to refresh credits: ${(error as Error).message}`,
        }));
      }
    }
  }
);

// 设置钱包地址
export const setWalletAddress = atom(
  null,
  (get, set, address: string | null) => {
    const state = get(accountAtom);

    set(accountAtom, {
      ...state,
      walletAddress: address,
    });
  }
);

export const setPlan = atom(null, (get, set, plan: string) => {
  const state = get(accountAtom);
  set(accountAtom, {
    ...state,
    plan: plan,
  });
});

// 设置加载状态
export const setLoading = atom(null, (get, set, isLoading: boolean) => {
  const state = get(accountAtom);

  set(accountAtom, {
    ...state,
    isLoading,
  });
});

// 设置错误状态
export const setError = atom(null, (get, set, error: string | null) => {
  const state = get(accountAtom);

  set(accountAtom, {
    ...state,
    error,
  });
});

// 设置积分
export const setCredits = atom(null, (get, set, credits: number) => {
  const state = get(accountAtom);

  set(accountAtom, {
    ...state,
    credits,
  });
});

// 登出
export const logout = atom(null, (get, set) => {
  // 重置账户状态
  set(accountAtom, initialState);

  // 获取当前聊天状态
  const chatState = get(chatAtom);

  // 如果有心跳，停止心跳
  if (chatState.heartbeatId) {
    clearInterval(chatState.heartbeatId);
  }

  // 重置聊天连接状态
  set(chatAtom, {
    ...chatState,
    connection: {
      isActive: false,
      inQueue: false,
    },
    heartbeatId: undefined,
    did: undefined, // 确保did被清除
  });
});

export const updateLinkedExternalWalletAtom = atom(
  null,
  async (get, set, address?: string) => {
    const accountState = get(accountAtom);
    try {
      if (!address) {
        throw new Error("Invalid address");
      }
      const did = accountState.did;
      if (!did) {
        throw new Error("Invalid did");
      }
      const result = await linkedWallet(did, address);
      if (result?.data) {
        set(accountAtom, {
          ...accountState,
          linked_wallet: address,
        });
        await set(refreshUserPlanAtom);
      }
    } catch (error) {
      console.error("Update linked external wallet failed:", error);
      throw error;
    }
  }
);

export const linkedWallet = async (did: string, address: string) => {
  if (!did || !address) {
    throw new Error("Invalid DID or Address");
  }
  try {
    const privyToken = await getAccessToken();
    const response = await fetch("/studio-api/users/link_wallet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        [PRIVY_TOKEN_HEADER]: privyToken || "",
      },
      body: JSON.stringify({ user: did, wallet: address }),
    });

    if (!response.ok) {
      throw new Error("Create user failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Link wallet failed:", error);
    throw error;
  }
};

// 更新邀请码信息
export const updateReferrals = atom(null, (get, set, referrals: {
  invite_code: string | null;
  referrer_code: string | null;
  point_reward_ratio: number;
} | null) => {
  const state = get(accountAtom);
  set(accountAtom, {
    ...state,
    referrals,
  });
});
