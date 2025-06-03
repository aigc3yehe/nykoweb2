import { atom } from "jotai";
import { SOURCE_TYPE } from "../types/api.type";

// 定义数据类型
export type McTopToken = {
  id: number | string;
  name: string;
  token_symbol: string;
  token_address: string;
  token_base_uri: string;
  mc_eth: string;
  mc_usd: string; // UI中展示的值
  source: SOURCE_TYPE;
};

// 定义API响应类型
interface TopTokensResponse {
  message: string;
  data: McTopToken[];
}

// 定义状态接口
interface TokenMarqueeState {
  isLoading: boolean;
  error: string | null;
  tokens: McTopToken[];
  lastSuccessTime: number | null; // 添加上次成功加载的时间戳
}

// 初始状态
const initialState: TokenMarqueeState = {
  isLoading: false,
  error: null,
  tokens: [],
  lastSuccessTime: null,
};

// 创建全局状态 atom
export const tokenMarqueeStateAtom = atom<TokenMarqueeState>(initialState);

// 获取顶部币种数据
export const fetchTopTokens = atom(
  null,
  async (get, set) => {
    // 获取当前状态
    const currentState = get(tokenMarqueeStateAtom);
    
    // 标记加载状态，但保留现有数据
    set(tokenMarqueeStateAtom, {
      ...currentState,
      isLoading: true,
      error: null,
    });

    try {
      const response = await fetch('/studio-api/dashboard/model/top_mc', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`
        }
      });

      if (!response.ok) {
        throw new Error('error: ' + response.statusText);
      }

      const result: TopTokensResponse = await response.json();
      
      // 验证返回的数据是否有效
      if (!result.data || result.data.length === 0) {
        throw new Error('empty data');
      }

      // 更新状态，记录成功加载的时间
      set(tokenMarqueeStateAtom, {
        isLoading: false,
        error: null,
        tokens: result.data,
        lastSuccessTime: Date.now(),
      });

      return result.data;
    } catch (error) {
      // 处理错误
      const errorMessage =
        error instanceof Error ? error.message : "get top tokens error";
        
      // 如果有缓存数据，继续使用它
      if (currentState.tokens.length > 0) {
        set(tokenMarqueeStateAtom, {
          ...currentState,
          isLoading: false,
          error: errorMessage, // 仍然记录错误，但不会影响显示
        });
      } else {
        // 没有缓存数据时，设置错误状态
        set(tokenMarqueeStateAtom, {
          ...currentState,
          isLoading: false,
          error: errorMessage,
        });
      }

      console.error("Failed to fetch top tokens:", error);
      // 不抛出错误，让组件优雅降级
    }
  }
);