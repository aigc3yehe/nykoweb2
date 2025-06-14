import { atom } from 'jotai';
import { SOURCE_TYPE } from '../types/api.type';
import { Twitter } from './imageStore';
import { PRIVY_TOKEN_HEADER } from '../utils/constants';
import { getAccessToken } from '@privy-io/react-auth';

// Topic相关接口定义
export interface TopicInfo {
  tag: string;
  // 统计数据（暂时预留）
  midshare?: number;
  followers?: number;
  creators?: number;
  posts?: number;
}

export interface AICCItem {
  id: number;
  name: string;
  cover: string;
  source: SOURCE_TYPE;
  created_at: string;
  tags?: string[];
  users?: {
    twitter?: Twitter | null;
    address?: string | null;
  };
}

export interface ContentItem {
  id: number;
  source_id: number;
  source: SOURCE_TYPE;
  url: string;
  creator: string;
  width?: number;
  height?: number;
  users?: {
    twitter?: Twitter | null;
  };
  type: 'image' | 'video' | 'text' | 'audio';
}

// 缓存接口
interface TopicCache {
  topicInfo: TopicInfo | null;
  aiccList: AICCItem[];
  contentsList: ContentItem[];
  contentsPage: number;
  contentsHasMore: boolean;
  timestamp: number;
}

// 主状态接口
export interface TopicState {
  currentTopic: string;
  topicInfo: TopicInfo | null;
  aiccList: AICCItem[];
  contentsList: ContentItem[];
  contentsPage: number;
  contentsPageSize: number;
  contentsHasMore: boolean;
  isLoading: boolean;
  isLoadingContents: boolean;
  error: string | null;
  cacheMap: Map<string, TopicCache>;
}

// 缓存时长
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

// 初始状态
const initialState: TopicState = {
  currentTopic: '',
  topicInfo: null,
  aiccList: [],
  contentsList: [],
  contentsPage: 1,
  contentsPageSize: 35, // 调整为匹配API实际返回数量
  contentsHasMore: true,
  isLoading: false,
  isLoadingContents: false,
  error: null,
  cacheMap: new Map(),
};

// 创建带调试的状态原子
const baseTopicAtom = atom<TopicState>(initialState);

// 主要状态原子 - 添加调试包装
export const topicAtom = atom(
  (get) => get(baseTopicAtom),
  (get, set, update: Partial<TopicState> | ((prevState: TopicState) => TopicState)) => {
    const oldState = get(baseTopicAtom);
    const newState = typeof update === 'function' ? update(oldState) : { ...oldState, ...update };
    
    console.log('[topicAtom] State update:', {
      from: {
        currentTopic: oldState.currentTopic,
        aiccCount: oldState.aiccList.length,
        contentsCount: oldState.contentsList.length,
        isLoading: oldState.isLoading,
        isLoadingContents: oldState.isLoadingContents
      },
      to: {
        currentTopic: newState.currentTopic,
        aiccCount: newState.aiccList.length,
        contentsCount: newState.contentsList.length,
        isLoading: newState.isLoading,
        isLoadingContents: newState.isLoadingContents
      }
    });
    set(baseTopicAtom, newState);
  }
);

// 请求防重复Map
const ongoingRequests = new Map<string, Promise<any>>();



// URL编码工具函数
const encodeTopicName = (topic: string): string => {
  return encodeURIComponent(topic.trim().toLowerCase());
};

const decodeTopicName = (encodedTopic: string): string => {
  return decodeURIComponent(encodedTopic);
};

// API响应接口
interface TopicAICCResponse {
  message: string;
  data: AICCItem[];
}

interface TopicContentsResponse {
  message: string;
  data: ContentItem[];
}

// 获取topic相关的AICC
export const fetchTopicAICC = atom(
  null,
  async (get, set, tag: string) => {
    const requestKey = `aicc-${tag}`;
    
    // 防止重复请求
    if (ongoingRequests.has(requestKey)) {
      console.log('[topicStore] AICC request already in progress for tag:', tag);
      return ongoingRequests.get(requestKey);
    }

    const state = get(topicAtom);
    
    // 检查缓存
    const cache = state.cacheMap.get(tag);
    const now = Date.now();
    if (cache && now - cache.timestamp < CACHE_DURATION) {
      console.log('[topicStore] Using cached AICC data for tag:', tag);
      set(topicAtom, {
        ...state,
        currentTopic: tag,
        topicInfo: cache.topicInfo,
        aiccList: cache.aiccList,
        contentsList: cache.contentsList,
        contentsPage: cache.contentsPage,
        contentsHasMore: cache.contentsHasMore,
        isLoading: false,
        error: null,
      });
      return;
    }

    console.log('[topicStore] Starting fetchTopicAICC for tag:', tag);
    set(topicAtom, { ...state, isLoading: true, error: null, currentTopic: tag });

    // 创建请求Promise并存储
    const requestPromise = (async () => {
      try {
        const privyToken = await getAccessToken();
        const url = `/studio-api/infofi/aicc?tag=${encodeURIComponent(tag)}`;

        console.log('[topicStore] Making AICC request to:', url);
        // 使用vite.config.ts中配置的/studio-api代理
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
            [PRIVY_TOKEN_HEADER]: privyToken || '',
          }
        });

        console.log('[topicStore] AICC response status:', response.status, response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[topicStore] AICC request failed:', response.status, errorText);
          throw new Error(`Failed to load topic data: ${response.status} ${errorText}`);
        }

        const result: TopicAICCResponse = await response.json();
        console.log('[topicStore] AICC response data:', result);
        
        set(topicAtom, (prevState) => ({
          ...prevState,
          currentTopic: tag,
          topicInfo: { tag },
          aiccList: result.data || [],
          isLoading: false,
          error: null,
        }));

      } catch (error) {
        set(topicAtom, (prevState) => ({
          ...prevState,
          currentTopic: tag,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      } finally {
        // 清除正在进行的请求标记
        ongoingRequests.delete(requestKey);
      }
    })();

    // 存储正在进行的请求
    ongoingRequests.set(requestKey, requestPromise);
    
    return requestPromise;
  }
);

// 获取topic相关的内容（分页）
export const fetchTopicContents = atom(
  null,
  async (get, set, { tag, reset = false }: { tag: string; reset?: boolean }) => {
    const requestKey = `contents-${tag}-${reset ? 'reset' : 'load'}`;
    
    // 防止重复请求
    if (ongoingRequests.has(requestKey)) {
      console.log('[topicStore] Contents request already in progress for tag:', tag, 'reset:', reset);
      return ongoingRequests.get(requestKey);
    }

    const state = get(topicAtom);
    
    if (!reset && !state.contentsHasMore) return;

    console.log('[topicStore] Starting fetchTopicContents for tag:', tag, 'reset:', reset);
    set(topicAtom, { 
      ...state, 
      isLoadingContents: true,
      contentsPage: reset ? 1 : state.contentsPage
    });

    // 创建请求Promise并存储
    const requestPromise = (async () => {
      try {
        const page = reset ? 1 : state.contentsPage;
        const privyToken = await getAccessToken();
        const url = `/studio-api/infofi/aicc/contents?tag=${encodeURIComponent(tag)}&page=${page}&pageSize=${state.contentsPageSize}`;
        
        console.log('[topicStore] Making contents request to:', url);
        // 使用vite.config.ts中配置的/studio-api代理
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
            [PRIVY_TOKEN_HEADER]: privyToken || '',
          }
        });

        console.log('[topicStore] Contents response status:', response.status, response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[topicStore] Contents request failed:', response.status, errorText);
          throw new Error(`Failed to load topic contents: ${response.status} ${errorText}`);
        }

        const result: TopicContentsResponse = await response.json();
        console.log('[topicStore] Contents response data:', result);
        const newContents = result.data || [];
        
        set(topicAtom, (prevState) => {
          const contentsList = reset ? newContents : [...prevState.contentsList, ...newContents];
          const contentsPage = reset ? 2 : prevState.contentsPage + 1;
          const contentsHasMore = newContents.length >= prevState.contentsPageSize;
          
          console.log('[topicStore] contentsHasMore calculation:', {
            newContentsLength: newContents.length,
            contentsPageSize: prevState.contentsPageSize,
            hasMore: contentsHasMore,
            reset,
            totalContentsList: contentsList.length
          });

          const updatedCache: TopicCache = {
            ...prevState.cacheMap.get(tag)!,
            topicInfo: prevState.topicInfo,
            aiccList: prevState.aiccList,
            contentsList,
            contentsPage,
            contentsHasMore,
            timestamp: Date.now(),
          };

          const newCacheMap = new Map(prevState.cacheMap);
          newCacheMap.set(tag, updatedCache);

          return {
            ...prevState,
            currentTopic: tag,
            contentsList,
            contentsPage,
            contentsHasMore,
            isLoadingContents: false,
            cacheMap: newCacheMap,
          };
        });

      } catch (error) {
        set(topicAtom, (prevState) => ({
          ...prevState,
          currentTopic: tag,
          isLoadingContents: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }));
      } finally {
        // 清除正在进行的请求标记
        ongoingRequests.delete(requestKey);
      }
    })();

    // 存储正在进行的请求
    ongoingRequests.set(requestKey, requestPromise);
    
    return requestPromise;
  }
);

// 重置topic状态
export const resetTopicState = atom(
  null,
  (_, set) => {
    console.log('[resetTopicState] Resetting topic state to initial state');
    set(topicAtom, initialState);
  }
);

// 清除缓存
export const clearTopicCache = atom(
  null,
  (get, set) => {
    const state = get(topicAtom);
    console.log('[clearTopicCache] Clearing topic cache');
    set(topicAtom, {
      ...state,
      cacheMap: new Map(),
    });
  }
);

// 检查缓存是否过期
export const isCacheExpired = atom(
  (get) => {
    return (tag: string) => {
      const state = get(topicAtom);
      const cache = state.cacheMap.get(tag);
      if (!cache) return true;
      
      const now = Date.now();
      const expired = now - cache.timestamp > CACHE_DURATION;
      console.log('[isCacheExpired] Cache check for tag:', tag, 'expired:', expired);
      return expired;
    };
  }
);

// 导出编码工具函数供组件使用
export { encodeTopicName, decodeTopicName }; 