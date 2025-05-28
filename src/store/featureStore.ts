import { atom } from 'jotai';
import { SOURCE_TYPE } from '../types/api.type';
import { Twitter } from './imageStore';
import { PRIVY_TOKEN_HEADER } from '../utils/constants';
import { getAccessToken } from '@privy-io/react-auth';

// 定义新的 FeaturedItem 接口
export interface FeaturedItem {
  id: number;
  name: string;
  tags: string[];
  description: string;
  usage: number;
  cover: string;
  source: SOURCE_TYPE;
  users: {
    twitter: Twitter;
    address: string;
  };
}

// 定义 API 响应接口
export interface FeaturedItemsResponse {
  message: string;
  data: FeaturedItem[];
}

// 定义 Feature 列表状态
interface FeatureListState {
  features: FeaturedItem[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastFetchTime: number | null;
}

// 初始状态
const initialState: FeatureListState = {
  features: [],
  isLoading: false,
  isRefreshing: false,
  error: null,
  lastFetchTime: null
};

// 创建 Feature 列表原子
export const featureListAtom = atom<FeatureListState>(initialState);

// 获取 Featured Items 数据的 API 函数
const fetchFeaturedItemsAPI = async (): Promise<FeaturedItem[]> => {
  try {
    const privyToken = await getAccessToken();
    const response = await fetch('/studio-api/dashboard/featured', {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        [PRIVY_TOKEN_HEADER]: privyToken || '',
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch featured items: ${response.statusText}`);
    }

    const result: FeaturedItemsResponse = await response.json();
    return result.data;
  } catch (error) {
    console.error('Failed to fetch featured items:', error);
    throw error;
  }
};

// 获取 Featured Items 数据
export const fetchFeatures = atom(
  null,
  async (get, set, options?: { forceRefresh?: boolean }) => {
    const currentState = get(featureListAtom);
    const hasExistingData = currentState.features.length > 0;
    const forceRefresh = options?.forceRefresh || false;

    if (hasExistingData && !forceRefresh) {
      set(featureListAtom, {
        ...currentState,
        isRefreshing: true,
        error: null
      });
    } else {
      set(featureListAtom, {
        ...currentState,
        isLoading: true,
        isRefreshing: false,
        error: null
      });
    }

    try {
      const featuredItems = await fetchFeaturedItemsAPI();

      set(featureListAtom, {
        features: featuredItems,
        isLoading: false,
        isRefreshing: false,
        error: null,
        lastFetchTime: Date.now()
      });

    } catch (error) {
      if (hasExistingData) {
        set(featureListAtom, {
          ...currentState,
          isLoading: false,
          isRefreshing: false,
          error: (error as Error).message
        });
      } else {
        set(featureListAtom, {
          features: [],
          isLoading: false,
          isRefreshing: false,
          error: (error as Error).message,
          lastFetchTime: null
        });
      }
    }
  }
);

// 强制刷新 Features
export const refreshFeatures = atom(
  null,
  async (_, set) => {
    await set(fetchFeatures, { forceRefresh: true });
  }
);

// 检查是否需要刷新（可选：基于时间的自动刷新策略）
export const shouldRefreshFeatures = atom(
  (get) => {
    const state = get(featureListAtom);
    if (!state.lastFetchTime) return true;

    const fiveMinutes = 5 * 60 * 1000;
    return Date.now() - state.lastFetchTime > fiveMinutes;
  }
);

// 重置 Features
export const resetFeatures = atom(
  null,
  (_, set) => {
    set(featureListAtom, initialState);
  }
);