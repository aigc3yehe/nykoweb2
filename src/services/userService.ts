import { Twitter } from "../store/imageStore";
import { getAccessToken } from "@privy-io/react-auth";
import { PRIVY_TOKEN_HEADER } from "../utils/constants";

// 创建用户响应接口
export interface CreateUserResponse {
  message: string;
  data: boolean;
}

export interface UserPermission {
  generate_image?: boolean; // 是否有生成图片的权限
  create_model?: boolean; // 是否有创建模型的权限
  train_model?: boolean; // 是否有训练模型的权限
  model_tokenization?: boolean; // 是否有将模型token化的权限
  create_workflow?: boolean; // 是否有创建工作流的权限
  use_workflow?: boolean; // 是否有使用工作流的权限
}

// 查询用户响应接口
export interface QueryUserResponse {
  message: string;
  data: {
    address: string;
    did: string;
    twitter: Twitter;
    credit: number; // 查询时可用的credit点
    name?: string;
    avatar?: string;
    permission?: UserPermission;
    role?: string; // 'user' or 'adimn'
    linked_wallet?: string;
    geni?: number;
    referrals?: {
      invite_code: string;
      referrer_code?: string;
      point_reward_ratio: number;
      referrer_twitter?: {
        name: string;
        subject: string;
        username: string;
        profilePictureUrl: string;
      };
    };
    referrer_twitter?: {
      name: string;
      subject: string;
      username: string;
      profilePictureUrl: string;
    };
  };
}

export enum PLAN_TYPE {
  FREE = "free",
  PREMIUM = "premium",
  PREMIUM_PLUS = "premium_plus",
}

// 查询用户响应接口
export interface QueryPlanResponse {
  message: string;
  data: {
    sub_balance: number;
    paid_balance: number;
    plan_type: string;
    next_refresh_at: Date; // 下一次sub_balance刷新重置时间
  };
}

// 查询用户积分信息响应接口
export interface QueryPointsResponse {
  message: string;
  data: {
    points: number; // 用户在当前赛季的分数
    total_points: number; // 用户历史总分数
    geni: number;
    ef: number;
    cd: number;
    current_season_total_points: number; // 当前赛季的总分
    staked_points: number; // 用户质押的积分
  };
}

// 排行榜项目类型
export interface LeaderboardItem {
  user: string; // did
  points: number; // 当前赛季的分数
  twitter: Twitter;
  geni: number; // geni 分数
}

// 排行榜响应接口
export interface LeaderboardResponse {
  message: string;
  data: LeaderboardItem[];
}

// 创建用户
export const createUser = async (userData: {
  did: string;
  address?: string;
  username?: string;
  subject?: string;
  name?: string;
  profilePictureUrl?: string;
}): Promise<CreateUserResponse> => {
  if (!userData.did) {
    throw new Error("Create user failed, missing did");
  }
  try {
    const privyToken = await getAccessToken();
    console.debug("[PRIVY] token:", privyToken);
    const response = await fetch("/studio-api/users/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        [PRIVY_TOKEN_HEADER]: privyToken || "",
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error("Create user failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Create user failed:", error);
    throw error;
  }
};

// 查询用户
export const queryUser = async (params: {
  did: string;
  address?: string;
}): Promise<QueryUserResponse> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("did", params.did);

    if (params.address) {
      queryParams.append("address", params.address);
    }

    const response = await fetch(
      `/studio-api/users/query?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Query user failed");
    }

    const result = await response.json();
    

    
    return result;
  } catch (error) {
    console.error("Query user failed：", error);
    throw error;
  }
};

// Check user stkaed NYKO token
export const queryStakedToken = async (params: { did: string }) => {
  try {
    if (!params.did || params.did.length == 0) return;
    const queryParams = new URLSearchParams();

    queryParams.append("user", params.did);
    queryParams.append("refreshState", "true");

    const privyToken = await getAccessToken();

    const response = await fetch(
      `/studio-api/users/staked?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
          [PRIVY_TOKEN_HEADER]: privyToken || "",
        },
      }
    );

    if (!response.ok) {
      console.error("Query user staked token failed.");
    }

    return await response.json();
  } catch (error) {
    console.error("Query user staked token failed:", error);
  }
};

export const updatePlan = async (params: { did: string }) => {
  if (!params.did) return;
  try {
    const response = await fetch("/studio-api/users/plan/update", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
      },
      body: JSON.stringify({ user: params.did }),
    });

    if (!response.ok) {
      throw new Error("Update plan failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Update plan failed:", error);
  }
};

export const chargeCredit = async (params: { tx_hash?: string }) => {
  try {
    if (!params.tx_hash) return;
    const response = await fetch("/studio-api/users/plan/charge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error("Buy CU failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Buy CU failed:", error);
  }
};

export const queryUserPlan = async (params: {
  did: string;
}): Promise<QueryPlanResponse> => {
  try {
    const queryParams = new URLSearchParams();

    queryParams.append("user", params.did);
    queryParams.append("refreshState", "true");

    const privyToken = await getAccessToken();

    const response = await fetch(
      `/studio-api/users/plan?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
          [PRIVY_TOKEN_HEADER]: privyToken || "",
        },
      }
    );

    if (!response.ok) {
      console.error("Query user staked token failed.");
    }

    return await response.json();
  } catch (error) {
    console.error("Query user staked token failed:", error);
    return {
      message: "Query user plan failed",
      data: {
        sub_balance: 0,
        paid_balance: 0,
        plan_type: PLAN_TYPE.FREE,
        next_refresh_at: new Date(),
      },
    };
  }
};

export const refreshUserPlan = async (params: {
  did: string;
}): Promise<QueryPlanResponse> => {
  try {
    const privyToken = await getAccessToken();

    const response = await fetch(`/studio-api/users/plan/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        [PRIVY_TOKEN_HEADER]: privyToken || "",
      },
      body: JSON.stringify({ user: params.did, refreshState: "true" }),
    });

    if (!response.ok) {
      console.error("Query user staked token failed.");
    }

    return await response.json();
  } catch (error) {
    console.error("Query user staked token failed:", error);
    return {
      message: "Query user plan failed",
      data: {
        sub_balance: 0,
        paid_balance: 0,
        plan_type: PLAN_TYPE.FREE,
        next_refresh_at: new Date(),
      },
    };
  }
};

// 查询用户积分信息
export const queryUserPoints = async (params: {
  user: string; // 用户的did
}): Promise<QueryPointsResponse> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("user", params.user);

    const privyToken = await getAccessToken();
    const response = await fetch(
      `/studio-api/points?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
          [PRIVY_TOKEN_HEADER]: privyToken || "",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Query user points failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Query user points failed:", error);
    throw error;
  }
};

// 获取排行榜数据
export const getLeaderboard = async (params: {
  page?: number;
  pageSize?: number;
  season?: number;
}): Promise<LeaderboardResponse> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params.pageSize) {
      queryParams.append("pageSize", params.pageSize.toString());
    }
    if (params.season) {
      queryParams.append("season", params.season.toString());
    }

    const privyToken = await getAccessToken();
    const response = await fetch(
      `/studio-api/points/leaderboard?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
          [PRIVY_TOKEN_HEADER]: privyToken || "",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Get leaderboard failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Get leaderboard failed:", error);
    throw error;
  }
};

// 编辑模型请求接口
export interface EditModelRequest {
  user: string;
  model_id: number;
  name?: string;
  description?: string;
  tags?: string[];
  token?: {
    address: string;
    launchpad: 'virtuals' | 'flaunch' | 'others';
  };
}

// 编辑模型响应接口
export interface EditModelResponse {
  message: string;
  data: boolean;
}

// 编辑模型函数
export const editModelRequest = async (params: EditModelRequest): Promise<EditModelResponse> => {
  const API_URL = "/studio-api/model/edit";

  try {
    const privyToken = await getAccessToken();
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        [PRIVY_TOKEN_HEADER]: privyToken || "",
      },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      throw new Error(`API returned error status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
};

// 绑定邀请码响应接口
export interface BindReferralResponse {
  statusCode: number;
  message: string;
  data: boolean;
}

// 绑定邀请码函数
export const bindReferralCode = async (params: {
  user: string; // 用户的did
  referrer_code: string; // 邀请人的邀请码
}): Promise<BindReferralResponse> => {
  try {
    const privyToken = await getAccessToken();
    const response = await fetch("/studio-api/referral/bind", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        [PRIVY_TOKEN_HEADER]: privyToken || "",
      },
      body: JSON.stringify(params),
    });

    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || "Bind referral code failed");
    }

    return result;
  } catch (error) {
    console.error("Bind referral code failed:", error);
    throw error;
  }
};

// 获取邀请列表响应接口
export interface GetInviteListResponse {
  message: string;
  data: Array<{
    user: string; // 被邀请用户的did
    twitter: Twitter; // 被邀请用户的twitter信息
  }>;
}

// 获取邀请列表函数
export const getInviteList = async (params: {
  invite_code: string; // 邀请码
  page?: number;
  pageSize?: number;
}): Promise<GetInviteListResponse> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("invite_code", params.invite_code);
    
    if (params.page) {
      queryParams.append("page", params.page.toString());
    }
    if (params.pageSize) {
      queryParams.append("pageSize", params.pageSize.toString());
    }

    const privyToken = await getAccessToken();
    const response = await fetch(
      `/studio-api/referral/list/invite?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
          [PRIVY_TOKEN_HEADER]: privyToken || "",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Get invite list failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Get invite list failed:", error);
    throw error;
  }
};

// 根据邀请码查询用户信息响应接口
export interface GetUserByInviteCodeResponse {
  message: string;
  data: {
    user: string; // 用户的did
    twitter: Twitter; // 用户的twitter信息
  } | null;
}

// 根据邀请码查询用户信息函数
export const getUserByInviteCode = async (params: {
  invite_code: string; // 邀请码
}): Promise<GetUserByInviteCodeResponse> => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append("invite_code", params.invite_code);

    const privyToken = await getAccessToken();
    const response = await fetch(
      `/studio-api/referral/user?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
          [PRIVY_TOKEN_HEADER]: privyToken || "",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Get user by invite code failed");
    }

    return await response.json();
  } catch (error) {
    console.error("Get user by invite code failed:", error);
    throw error;
  }
};
