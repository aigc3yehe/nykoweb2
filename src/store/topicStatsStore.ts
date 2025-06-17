import { atom } from 'jotai';

// 统计数据接口定义
export interface StatsData {
  mindshare: {
    current: number;
    change24h: number;
    history: Array<{ date: string; value: number; }>;
  };
  creators: {
    current: number;
    change24h: number;
    history: Array<{ date: string; value: number; }>;
  };
  posts: {
    current: number;
    change24h: number;
    history: Array<{ date: string; value: number; }>;
  };
}

// API响应接口
interface MindshareCurrentResponse {
  success: boolean;
  data: {
    mindshare: number;
    mindshare_diff_24h: number;
    update_time: string;
  };
}

interface MindshareHistoryResponse {
  success: boolean;
  data: Array<{
    mindshare: number;
    date: string;
    update_time: string;
  }>;
}

interface TweetsCurrentResponse {
  success: boolean;
  data: {
    current_count: number;
    change_24h: number;
    update_time: string;
  };
}

interface TweetsHistoryResponse {
  success: boolean;
  data: Array<{
    tweet_count: number;
    date: string;
    update_time: string;
  }>;
}

interface AuthorsCurrentResponse {
  success: boolean;
  data: {
    current_count: number;
    change_24h: number;
    update_time: string;
  };
}

interface AuthorsHistoryResponse {
  success: boolean;
  data: Array<{
    author_count: number;
    date: string;
    update_time: string;
  }>;
}

// 主状态接口
export interface TopicStatsState {
  currentTopic: string;
  statsData: StatsData | null;
  isLoading: boolean;
  error: string | null;
}

// 初始状态
const initialState: TopicStatsState = {
  currentTopic: '',
  statsData: null,
  isLoading: false,
  error: null,
};

// 基础状态原子
export const topicStatsAtom = atom<TopicStatsState>(initialState);

// 数值格式化工具函数
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }
  return num.toString();
};

const formatPercentage = (num: number): string => {
  return num.toFixed(2) + '%';
};

// 获取项目slug的函数
const getProjectSlug = async (topicName: string): Promise<string | null> => {
  try {
    const response = await fetch(`/studio-api/tags?name=${encodeURIComponent(topicName.toLowerCase())}`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
      }
    });

    if (!response.ok) {
      console.warn(`[topicStatsStore] Failed to get project slug for ${topicName}: ${response.status}`);
      return null;
    }

    const result = await response.json();
    console.log('[topicStatsStore] Project slug response:', result);
    
    if (result.data && result.data.slug) {
      return result.data.slug;
    }
    
    console.warn(`[topicStatsStore] No slug found for topic: ${topicName}`);
    return null;
  } catch (error) {
    console.warn(`[topicStatsStore] Error getting project slug for ${topicName}:`, error);
    return null;
  }
};

// 时间处理函数 - 处理历史数据并确保30个数据点
const processTimeData = (data: Array<{ date: string; value: number; update_time: string; }>): Array<{ date: string; value: number; }> => {
  console.log('[processTimeData] 原始数据:', data);
  
  if (data.length === 0) {
    console.log('[processTimeData] 数据为空，返回30个占位点');
    return ensureThirtyDataPoints([]);
  }
  
  // 1. 使用 update_time 而不是 date，并格式化为 M-D 格式（使用UTC时间）
  const processedData = data.map(item => {
    const updateDate = new Date(item.update_time);
    // 使用 UTC 时间而不是本地时间
    const month = updateDate.getUTCMonth() + 1; // 不补零
    const day = updateDate.getUTCDate(); // 不补零
    const formattedDate = `${month}-${day}`;
    
    console.log(`[processTimeData] 处理数据点: update_time=${item.update_time} -> UTC日期=${updateDate.toISOString().split('T')[0]} -> 格式化日期=${formattedDate}, value=${item.value}`);
    
    return {
      date: formattedDate,
      value: item.value,
      originalUpdateTime: item.update_time
    };
  });
  
  console.log('[processTimeData] 处理后的数据:', processedData);
  
  // 2. 按日期分组，如果同一日期有多个值，取最新的值
  const groupedData = new Map<string, { value: number; updateTime: string }>();
  
  processedData.forEach(item => {
    const existing = groupedData.get(item.date);
    if (!existing || new Date(item.originalUpdateTime) > new Date(existing.updateTime)) {
      groupedData.set(item.date, { 
        value: item.value, 
        updateTime: item.originalUpdateTime 
      });
      console.log(`[processTimeData] 分组数据: 日期=${item.date}, 值=${item.value}, 时间=${item.originalUpdateTime}`);
    }
  });
  
  // 3. 转换回数组格式并按时间排序
  const result = Array.from(groupedData.entries())
    .map(([date, data]) => ({ date, value: data.value, updateTime: data.updateTime }))
    .sort((a, b) => new Date(a.updateTime).getTime() - new Date(b.updateTime).getTime())
    .map(({ date, value }) => ({ date, value }));
  
  console.log('[processTimeData] 排序后的结果:', result);
  
  // 4. 确保有30个数据点，不足时前补0
  const finalResult = ensureThirtyDataPoints(result);
  console.log('[processTimeData] 最终结果 (30个点):', finalResult);
  
  return finalResult;
};

// 确保30个数据点的函数 - 不足时前补0
const ensureThirtyDataPoints = (data: Array<{ date: string; value: number; }>): Array<{ date: string; value: number; }> => {
  console.log(`[ensureThirtyDataPoints] 输入数据长度: ${data.length}`);
  
  if (data.length >= 30) {
    // 如果超过30个点，取最后30个
    console.log('[ensureThirtyDataPoints] 数据超过30个，取最后30个');
    return data.slice(-30);
  }
  
  // 如果不足30个点，前面补0
  const paddingCount = 30 - data.length;
  const paddingData: Array<{ date: string; value: number; }> = [];
  
  console.log(`[ensureThirtyDataPoints] 需要补充 ${paddingCount} 个占位点`);
  
  for (let i = 0; i < paddingCount; i++) {
    paddingData.push({
      date: `1-1`, // 使用 1-1 作为占位符日期
      value: 0
    });
  }
  
  const result = [...paddingData, ...data];
  console.log(`[ensureThirtyDataPoints] 最终数据长度: ${result.length}`);
  console.log('[ensureThirtyDataPoints] 最终数据:', result);
  
  return result;
};

// 获取统计数据的主函数
export const fetchTopicStats = atom(
  null,
  async (get, set, topicName: string) => {
    const state = get(topicStatsAtom);
    
    // 如果正在加载相同的topic，直接返回
    if (state.isLoading && state.currentTopic === topicName) {
      return;
    }

    set(topicStatsAtom, {
      ...state,
      currentTopic: topicName,
      isLoading: true,
      error: null,
    });

    try {
      console.log('[topicStatsStore] Fetching stats for topic:', topicName);
      
      // 1. 获取项目slug
      const slug = await getProjectSlug(topicName);
      
      if (!slug) {
        console.log(`[topicStatsStore] No slug available for topic: ${topicName}, skipping stats fetch`);
        set(topicStatsAtom, {
          currentTopic: topicName,
          statsData: {
            mindshare: { current: 0, change24h: 0, history: [] },
            creators: { current: 0, change24h: 0, history: [] },
            posts: { current: 0, change24h: 0, history: [] },
          },
          isLoading: false,
          error: null,
        });
        return;
      }

      console.log('[topicStatsStore] Got project slug:', slug);

      // 2. 并行获取所有数据
      const baseUrl = '/infofi-api';
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_INFOFI_BEARER_TOKEN}`,
      };

      const [
        mindshareCurrentRes,
        mindshareHistoryRes,
        tweetsCurrentRes,
        tweetsHistoryRes,
        authorsCurrentRes,
        authorsHistoryRes,
      ] = await Promise.all([
        fetch(`${baseUrl}/api/projects/${slug}/mindshare/current`, { headers }),
        fetch(`${baseUrl}/api/projects/${slug}/mindshare/history`, { headers }),
        fetch(`${baseUrl}/api/projects/${slug}/stats/tweets/current`, { headers }),
        fetch(`${baseUrl}/api/projects/${slug}/stats/tweets/history`, { headers }),
        fetch(`${baseUrl}/api/projects/${slug}/stats/authors/current`, { headers }),
        fetch(`${baseUrl}/api/projects/${slug}/stats/authors/history`, { headers }),
      ]);

      // 3. 解析响应
      const mindshareCurrentData: MindshareCurrentResponse = await mindshareCurrentRes.json();
      const mindshareHistoryData: MindshareHistoryResponse = await mindshareHistoryRes.json();
      const tweetsCurrentData: TweetsCurrentResponse = await tweetsCurrentRes.json();
      const tweetsHistoryData: TweetsHistoryResponse = await tweetsHistoryRes.json();
      const authorsCurrentData: AuthorsCurrentResponse = await authorsCurrentRes.json();
      const authorsHistoryData: AuthorsHistoryResponse = await authorsHistoryRes.json();

      // 打印所有响应数据到控制台
      console.log('[topicStatsStore] Mindshare Current:', mindshareCurrentData);
      console.log('[topicStatsStore] Mindshare History:', mindshareHistoryData);
      console.log('[topicStatsStore] Tweets Current:', tweetsCurrentData);
      console.log('[topicStatsStore] Tweets History:', tweetsHistoryData);
      console.log('[topicStatsStore] Authors Current:', authorsCurrentData);
      console.log('[topicStatsStore] Authors History:', authorsHistoryData);

      // 4. 构建统计数据
      const statsData: StatsData = {
        mindshare: {
          current: mindshareCurrentData.success ? mindshareCurrentData.data.mindshare : 0,
          change24h: mindshareCurrentData.success ? mindshareCurrentData.data.mindshare_diff_24h : 0,
          history: processTimeData(
            mindshareHistoryData.success 
              ? mindshareHistoryData.data.map(item => ({ date: item.date, value: item.mindshare, update_time: item.update_time }))
              : []
          ),
        },
        creators: {
          current: authorsCurrentData.success ? authorsCurrentData.data.current_count : 0,
          change24h: authorsCurrentData.success ? authorsCurrentData.data.change_24h : 0,
          history: processTimeData(
            authorsHistoryData.success 
              ? authorsHistoryData.data.map(item => ({ date: item.date, value: item.author_count, update_time: item.update_time }))
              : []
          ),
        },
        posts: {
          current: tweetsCurrentData.success ? tweetsCurrentData.data.current_count : 0,
          change24h: tweetsCurrentData.success ? tweetsCurrentData.data.change_24h : 0,
          history: processTimeData(
            tweetsHistoryData.success 
              ? tweetsHistoryData.data.map(item => ({ date: item.date, value: item.tweet_count, update_time: item.update_time }))
              : []
          ),
        },
      };

      console.log('[topicStatsStore] Final stats data:', statsData);

      set(topicStatsAtom, {
        currentTopic: topicName,
        statsData,
        isLoading: false,
        error: null,
      });

    } catch (error) {
      console.warn('[topicStatsStore] Error fetching stats:', error);
      set(topicStatsAtom, {
        currentTopic: topicName,
        statsData: {
          mindshare: { current: 0, change24h: 0, history: [] },
          creators: { current: 0, change24h: 0, history: [] },
          posts: { current: 0, change24h: 0, history: [] },
        },
        isLoading: false,
        error: null, // 不设置错误，避免显示错误信息
      });
    }
  }
);

// 导出格式化函数供组件使用
export { formatNumber, formatPercentage }; 