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

// 新增：项目信息接口
export interface ProjectInfo {
  point_boost: number; // 对积分的加成
  twitter: Twitter;
  slug: string;
  links: {
    [key: string]: string; // 完整URL
  };
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
  projectInfo: ProjectInfo | null; // 新增缓存字段
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
  projectInfo: ProjectInfo | null; // 新增项目信息
  aiccList: AICCItem[];
  contentsList: ContentItem[];
  contentsPage: number;
  contentsPageSize: number;
  contentsHasMore: boolean;
  isLoading: boolean;
  isLoadingContents: boolean;
  isLoadingProjectInfo: boolean; // 新增加载状态
  error: string | null;
  cacheMap: Map<string, TopicCache>;
}

// 缓存时长
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟

// 初始状态
const initialState: TopicState = {
  currentTopic: '',
  topicInfo: null,
  projectInfo: null, // 新增初始值
  aiccList: [],
  contentsList: [],
  contentsPage: 1,
  contentsPageSize: 30,
  contentsHasMore: true,
  isLoading: false,
  isLoadingContents: false,
  isLoadingProjectInfo: false, // 新增初始值
  error: null,
  cacheMap: new Map(),
};

// 创建带调试的状态原子
const baseTopicAtom = atom<TopicState>(initialState);

// 请求防重复Map - 改进为支持取消
const ongoingRequests = new Map<string, { promise: Promise<any>; controller: AbortController }>();

// 取消指定topic的所有进行中请求
const cancelTopicRequests = (tag: string) => {
  const keysToCancel = Array.from(ongoingRequests.keys()).filter(key => key.includes(tag));
  keysToCancel.forEach(key => {
    const request = ongoingRequests.get(key);
    if (request) {
      console.log('[topicStore] 🚫 Cancelling request:', key);
      request.controller.abort();
      ongoingRequests.delete(key);
    }
  });
};

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

// 主要状态原子 - 改进状态保护机制
export const topicAtom = atom(
  (get) => get(baseTopicAtom),
  (get, set, update: Partial<TopicState> | ((prevState: TopicState) => TopicState)) => {
    const oldState = get(baseTopicAtom);
    const newState = typeof update === 'function' ? update(oldState) : { ...oldState, ...update };
    
    // 🛡️ 改进的保护机制：只在非主动切换topic时保护数据
    const isTopicSwitch = oldState.currentTopic !== newState.currentTopic && newState.currentTopic !== '';
    const shouldProtectData = !isTopicSwitch && oldState.aiccList.length > 0 && newState.aiccList.length === 0 && !newState.isLoading;
    
    if (shouldProtectData) {
      console.warn('⚠️  [topicAtom] PROTECTING AICC DATA - preventing accidental data loss:', {
        oldTopic: oldState.currentTopic,
        newTopic: newState.currentTopic,
        oldCount: oldState.aiccList.length,
        newCount: newState.aiccList.length
      });
      newState.aiccList = oldState.aiccList;
    }
    
    // 🧹 主动清理：切换topic时清理相关数据
    if (isTopicSwitch) {
      console.log('[topicAtom] 🔄 Topic switch detected, clearing data:', {
        from: oldState.currentTopic,
        to: newState.currentTopic
      });
      
      // 取消之前topic的进行中请求
      if (oldState.currentTopic) {
        cancelTopicRequests(oldState.currentTopic);
      }
      
      // 清理非缓存的临时数据，但保留缓存
      newState.aiccList = [];
      newState.contentsList = [];
      newState.projectInfo = null;
      newState.contentsPage = 1;
      newState.contentsHasMore = true;
      newState.error = null;
    }
    
    // 只在关键数据变化时记录日志
    const aiccChanged = oldState.aiccList.length !== newState.aiccList.length;
    const contentsChanged = oldState.contentsList.length !== newState.contentsList.length;
    const projectInfoChanged = !!oldState.projectInfo !== !!newState.projectInfo;
    const topicChanged = oldState.currentTopic !== newState.currentTopic;
    
    if (aiccChanged || contentsChanged || projectInfoChanged || topicChanged) {
      console.log('[topicAtom] 📊 State update:', {
        topic: oldState.currentTopic === newState.currentTopic ? newState.currentTopic : `${oldState.currentTopic} → ${newState.currentTopic}`,
        aicc: `${oldState.aiccList.length} → ${newState.aiccList.length}`,
        contents: `${oldState.contentsList.length} → ${newState.contentsList.length}`,
        projectInfo: `${!!oldState.projectInfo} → ${!!newState.projectInfo}`
      });
    }
    set(baseTopicAtom, newState);
  }
);

// 获取topic相关的AICC
export const fetchTopicAICC = atom(
  null,
  async (get, set, tag: string) => {
    const requestKey = `aicc-${tag}`;
    
    // 防止重复请求
    if (ongoingRequests.has(requestKey)) {
      console.log('[topicStore] AICC request already in progress for tag:', tag);
      return ongoingRequests.get(requestKey)!.promise;
    }

    const state = get(topicAtom);
    
    // 检查缓存 - 使用函数式更新确保一致性
    const cache = state.cacheMap.get(tag);
    const now = Date.now();
    if (cache && now - cache.timestamp < CACHE_DURATION) {
      console.log('[topicStore] Using cached AICC data for tag:', tag);
      
      // ✅ 修复：统一使用函数式更新，避免状态覆盖
      set(topicAtom, (prevState) => {
        // 如果当前已经在处理其他topic，不要被缓存覆盖
        if (prevState.currentTopic && prevState.currentTopic !== tag) {
          console.log('[topicStore] ⚠️ Topic changed during cache restore, skipping:', {
            cached: tag,
            current: prevState.currentTopic
          });
          return prevState;
        }
        
        return {
          ...prevState,
        currentTopic: tag,
        topicInfo: cache.topicInfo,
          projectInfo: cache.projectInfo,
        aiccList: cache.aiccList,
        contentsList: cache.contentsList,
        contentsPage: cache.contentsPage,
        contentsHasMore: cache.contentsHasMore,
        isLoading: false,
        error: null,
        };
      });
      return Promise.resolve();
    }

    console.log('[topicStore] Starting fetchTopicAICC for tag:', tag);
    
    // ✅ 修复：设置loading状态时也使用函数式更新
    set(topicAtom, (prevState) => ({ 
      ...prevState, 
      isLoading: true, 
      error: null, 
      currentTopic: tag 
    }));

    // 创建可取消的请求
    const controller = new AbortController();

    // 创建请求Promise并存储
    const requestPromise = (async () => {
      try {
        console.log('[topicStore] 🔄 Getting access token for AICC request...');
        const privyToken = await getAccessToken();
        const url = `/studio-api/infofi/aicc?tag=${encodeURIComponent(tag)}`;

        console.log('[topicStore] 📡 Making AICC request to:', url);
        
        // 使用AbortController进行请求取消
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
            [PRIVY_TOKEN_HEADER]: privyToken || '',
          },
          signal: controller.signal
        });

        console.log('[topicStore] 📊 AICC response status:', response.status, response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[topicStore] AICC request failed:', response.status, errorText);
          throw new Error(`Failed to load topic data: ${response.status} ${errorText}`);
        }

        const result: TopicAICCResponse = await response.json();
        console.log('[topicStore] ✅ AICC response SUCCESS:', result);
        
        set(topicAtom, (prevState) => {
          // ✅ 修复：检查topic是否仍然一致，避免过时请求覆盖新数据
          if (prevState.currentTopic !== tag) {
            console.log('[topicStore] ⚠️ Topic changed during AICC fetch, discarding result:', {
              fetched: tag,
              current: prevState.currentTopic
            });
            return prevState;
          }
          
          // 更新缓存
          const updatedCache: TopicCache = {
            topicInfo: { tag },
            projectInfo: prevState.projectInfo,
            aiccList: result.data || [],
            contentsList: prevState.contentsList,
            contentsPage: prevState.contentsPage,
            contentsHasMore: prevState.contentsHasMore,
            timestamp: Date.now(),
          };
          
          const newCacheMap = new Map(prevState.cacheMap);
          newCacheMap.set(tag, updatedCache);

          return {
          ...prevState,
          currentTopic: tag,
          topicInfo: { tag },
          aiccList: result.data || [],
          isLoading: false,
          error: null,
            cacheMap: newCacheMap,
          };
        });

      } catch (error) {
        // 如果是取消操作，不更新错误状态
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('[topicStore] 🚫 AICC request cancelled for tag:', tag);
          return;
        }
        
        console.error('[topicStore] ❌ AICC fetch ERROR for tag:', tag, error);
        
        set(topicAtom, (prevState) => {
          // 只在当前topic一致时才更新错误状态
          if (prevState.currentTopic !== tag) {
            return prevState;
          }
          
          return {
          ...prevState,
          currentTopic: tag,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          };
        });
      } finally {
        // 清除正在进行的请求标记
        ongoingRequests.delete(requestKey);
      }
    })();

    // 存储正在进行的请求
    ongoingRequests.set(requestKey, { promise: requestPromise, controller });
    
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
      return ongoingRequests.get(requestKey)!.promise;
    }

    const state = get(topicAtom);
    
    if (!reset && !state.contentsHasMore) return;

    console.log('[topicStore] Starting fetchTopicContents for tag:', tag, 'reset:', reset);
    
    // ✅ 修复：使用函数式更新设置loading状态
    set(topicAtom, (prevState) => ({ 
      ...prevState, 
      isLoadingContents: true,
      contentsPage: reset ? 1 : prevState.contentsPage,
      currentTopic: tag
    }));

    // 创建可取消的请求
    const controller = new AbortController();

    // 创建请求Promise并存储
    const requestPromise = (async () => {
      try {
        const page = reset ? 1 : state.contentsPage;
        const privyToken = await getAccessToken();
        const url = `/studio-api/infofi/aicc/contents?tag=${encodeURIComponent(tag)}&page=${page}&pageSize=${state.contentsPageSize}`;
        
        console.log('[topicStore] Making contents request to:', url);
        
        // 使用AbortController进行请求取消
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
            [PRIVY_TOKEN_HEADER]: privyToken || '',
          },
          signal: controller.signal
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
          // ✅ 修复：检查topic是否仍然一致
          if (prevState.currentTopic !== tag) {
            console.log('[topicStore] ⚠️ Topic changed during contents fetch, discarding result:', {
              fetched: tag,
              current: prevState.currentTopic
            });
            return prevState;
          }
          
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

          // 更新缓存
          const updatedCache: TopicCache = {
            topicInfo: prevState.topicInfo,
            projectInfo: prevState.projectInfo,
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
        // 如果是取消操作，不更新错误状态
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('[topicStore] 🚫 Contents request cancelled for tag:', tag);
          return;
        }
        
        set(topicAtom, (prevState) => {
          // 只在当前topic一致时才更新错误状态
          if (prevState.currentTopic !== tag) {
            return prevState;
          }
          
          return {
          ...prevState,
          currentTopic: tag,
          isLoadingContents: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          };
        });
      } finally {
        // 清除正在进行的请求标记
        ongoingRequests.delete(requestKey);
      }
    })();

    // 存储正在进行的请求
    ongoingRequests.set(requestKey, { promise: requestPromise, controller });
    
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

// 主动切换到新topic，清理旧数据
export const switchToTopic = atom(
  null,
  (get, set, newTopic: string) => {
    const currentState = get(topicAtom);
    
    if (currentState.currentTopic === newTopic) {
      console.log('[switchToTopic] Already on topic:', newTopic);
      return;
    }
    
    console.log('[switchToTopic] 🔄 Switching topic:', {
      from: currentState.currentTopic,
      to: newTopic
    });
    
    // 取消之前topic的所有请求
    if (currentState.currentTopic) {
      cancelTopicRequests(currentState.currentTopic);
    }
    
    // 立即清理显示数据，设置新topic
    set(topicAtom, (prevState) => ({
      ...prevState,
      currentTopic: newTopic,
      aiccList: [],
      contentsList: [],
      projectInfo: null,
      topicInfo: null,
      contentsPage: 1,
      contentsHasMore: true,
      isLoading: false,
      isLoadingContents: false,
      isLoadingProjectInfo: false,
      error: null,
    }));
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

// 获取项目信息
export const fetchProjectInfo = atom(
  null,
  async (get, set, tag: string) => {
    const requestKey = `projectInfo-${tag}`;
    
    // 防止重复请求
    if (ongoingRequests.has(requestKey)) {
      console.log('[topicStore] Project info request already in progress for tag:', tag);
      return ongoingRequests.get(requestKey)!.promise;
    }

    const state = get(topicAtom);
    
    // 检查缓存
    const cache = state.cacheMap.get(tag);
    const now = Date.now();
    if (cache && cache.projectInfo && now - cache.timestamp < CACHE_DURATION) {
      console.log('[topicStore] Using cached project info for tag:', tag);
      
      // ✅ 修复：使用函数式更新恢复缓存
      set(topicAtom, (prevState) => {
        // 如果当前已经在处理其他topic，不要被缓存覆盖
        if (prevState.currentTopic && prevState.currentTopic !== tag) {
          console.log('[topicStore] ⚠️ Topic changed during project info cache restore, skipping:', {
            cached: tag,
            current: prevState.currentTopic
          });
          return prevState;
        }
        
        return {
          ...prevState,
          projectInfo: cache.projectInfo,
          isLoadingProjectInfo: false,
        };
      });
      return Promise.resolve();
    }

    console.log('[topicStore] Starting fetchProjectInfo for tag:', tag);
    
    // ✅ 修复：使用函数式更新设置loading状态
    set(topicAtom, (prevState) => ({ 
      ...prevState, 
      isLoadingProjectInfo: true 
    }));

    // 创建可取消的请求
    const controller = new AbortController();
    
    // 创建请求Promise并存储
    const requestPromise = (async () => {
      try {
        const privyToken = await getAccessToken();
        const url = `/studio-api/tags?name=${encodeURIComponent(tag)}`;
        
        console.log('[topicStore] Making project info request to:', url, 'with tag:', tag);
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
            [PRIVY_TOKEN_HEADER]: privyToken || '',
          },
          signal: controller.signal
        });

        console.log('[topicStore] Project info response status:', response.status, response.ok);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('[topicStore] Project info request failed:', response.status, errorText);
          throw new Error(`Failed to load project info: ${response.status} ${errorText}`);
        }

        const result: { message: string; data: ProjectInfo } = await response.json();
        console.log('[topicStore] ✅ Project info response SUCCESS:', result);
        
        set(topicAtom, (prevState) => {
          // ✅ 修复：检查当前topic，避免过时数据覆盖
          if (prevState.currentTopic && prevState.currentTopic !== tag) {
            console.log('[topicStore] ⚠️ Topic changed during project info fetch, discarding result:', {
              fetched: tag,
              current: prevState.currentTopic
            });
            return prevState;
          }
          
          console.log('[topicStore] 🔄 Updating state with ProjectInfo, preserving existing data:', {
            aiccCount: prevState.aiccList.length,
            contentsCount: prevState.contentsList.length,
            hasProjectInfo: !!result.data
          });
          
          // 更新缓存
          const existingCache = prevState.cacheMap.get(tag);
          const updatedCache: TopicCache = {
            topicInfo: existingCache?.topicInfo || prevState.topicInfo,
            projectInfo: result.data,
            aiccList: existingCache?.aiccList || prevState.aiccList,
            contentsList: existingCache?.contentsList || prevState.contentsList,
            contentsPage: existingCache?.contentsPage || prevState.contentsPage,
            contentsHasMore: existingCache?.contentsHasMore ?? prevState.contentsHasMore,
            timestamp: now,
          };
          
          const newCacheMap = new Map(prevState.cacheMap);
          newCacheMap.set(tag, updatedCache);
          
          return {
            ...prevState,
            projectInfo: result.data,
            isLoadingProjectInfo: false,
            cacheMap: newCacheMap,
          };
        });

      } catch (error) {
        // 如果是取消操作，不更新错误状态
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('[topicStore] 🚫 Project info request cancelled for tag:', tag);
          return;
        }
        
        console.error('[topicStore] ❌ Project info fetch error for tag:', tag, error);
        
        set(topicAtom, (prevState) => {
          // 只在当前topic一致时才更新错误状态
          if (prevState.currentTopic && prevState.currentTopic !== tag) {
            return prevState;
          }
          
          return {
            ...prevState,
            isLoadingProjectInfo: false,
            // 不设置error，避免影响其他数据加载
          };
        });
      } finally {
        // 清除正在进行的请求标记
        ongoingRequests.delete(requestKey);
      }
    })();

    // 存储正在进行的请求
    ongoingRequests.set(requestKey, { promise: requestPromise, controller });
    
    return requestPromise;
  }
);

// 导出编码工具函数供组件使用
export { encodeTopicName, decodeTopicName }; 