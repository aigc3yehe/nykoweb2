import { atom } from 'jotai';

// 话题云数据项接口
export interface TopicCloudItem {
  tag: string;
  value: number;
}

// 话题云状态接口
export interface TopicCloudState {
  topics: TopicCloudItem[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number;
}

// API响应接口
interface TopicCloudResponse {
  message: string;
  data: TopicCloudItem[];
}

// 初始状态
const initialState: TopicCloudState = {
  topics: [],
  isLoading: false,
  error: null,
  lastFetchTime: 0,
};

// 话题云状态原子
export const topicCloudAtom = atom<TopicCloudState>(initialState);

// 获取话题云数据的异步原子
export const fetchTopicCloud = atom(
  null,
  async (get, set) => {
    const currentState = get(topicCloudAtom);
    
    // 如果正在加载，跳过重复请求
    if (currentState.isLoading) {
      console.log('[TopicCloud] Already loading, skipping request');
      return;
    }

    console.log('[TopicCloud] Starting fetch for topic cloud data');
    set(topicCloudAtom, {
      ...currentState,
      isLoading: true,
      error: null,
    });

    try {
      const response = await fetch('/studio-api/infofi/aicc/creativity_topic', {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[TopicCloud] API request failed:', response.status, errorText);
        throw new Error(`Failed to fetch topic cloud: ${response.status} ${errorText}`);
      }

      const result: TopicCloudResponse = await response.json();
      console.log('[TopicCloud] ✅ Raw API Response:', result);
      
      // 打印详细的tags数据
      if (result.data && Array.isArray(result.data)) {
        console.log('[TopicCloud] 📊 Tags Data Details:');
        console.log('Total tags received:', result.data.length);
        result.data.forEach((tag, index) => {
          console.log(`Tag ${index + 1}:`, {
            tag: tag.tag,
            value: tag.value,
            type: typeof tag.value
          });
        });
      }

      // 只取前10个并按value排序
      const sortedTopics = (result.data || [])
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);
        
      console.log('[TopicCloud] 🏆 Top 10 Sorted Topics:', sortedTopics);

      set(topicCloudAtom, {
        topics: sortedTopics,
        isLoading: false,
        error: null,
        lastFetchTime: Date.now(),
      });

    } catch (error) {
      console.error('[TopicCloud] ❌ Fetch error:', error);
      set(topicCloudAtom, {
        ...currentState,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
);

// 重置话题云状态
export const resetTopicCloud = atom(
  null,
  (_, set) => {
    console.log('[TopicCloud] Resetting state');
    set(topicCloudAtom, initialState);
  }
); 