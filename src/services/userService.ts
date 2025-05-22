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
  };
}

export enum PLAN_TYPE {
  FREE = 'free',
  PREMIUM = 'premium',
  PREMIUM_PLUS = 'premium_plus',
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

    return await response.json();
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
}
