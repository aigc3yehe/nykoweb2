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

// 时间处理函数 - 将UTC时间转换为本地时间并靠近整点
const processTimeData = (data: Array<{ date: string; value: number; }>): Array<{ date: string; value: number; }> => {
  if (data.length === 0) return [];
  
  // 1. 转换时间并靠近整点
  const processedData = data.map(item => {
    // 解析UTC时间
    const utcDate = new Date(item.date);
    
    // 转换为本地时间
    const localDate = new Date(utcDate.getTime());
    
    // 靠近整点处理
    const minutes = localDate.getMinutes();
    
    // 如果分钟数>=30，向上取整到下一个小时；否则向下取整到当前小时
    if (minutes >= 30) {
      localDate.setHours(localDate.getHours() + 1);
    }
    localDate.setMinutes(0);
    localDate.setSeconds(0);
    localDate.setMilliseconds(0);
    
    // 格式化为 YYYY-MM-DD HH:00 格式
    const formattedDate = localDate.toISOString().slice(0, 13) + ':00';
    
    return {
      date: formattedDate,
      value: item.value,
      originalDate: item.date
    };
  });
  
  // 2. 按处理后的时间分组，如果同一时间点有多个值，取最高值
  const groupedData = new Map<string, number>();
  
  processedData.forEach(item => {
    const existingValue = groupedData.get(item.date);
    if (existingValue === undefined || item.value > existingValue) {
      groupedData.set(item.date, item.value);
    }
  });
  
  // 3. 转换回数组格式并排序
  const result = Array.from(groupedData.entries())
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // 4. 填充缺失数据点
  return fillMissingDataPoints(result);
};

// 数据填充函数 - 处理缺失数据点
const fillMissingDataPoints = (data: Array<{ date: string; value: number; }>): Array<{ date: string; value: number; }> => {
  if (data.length === 0) return [];
  
  const filledData: Array<{ date: string; value: number; }> = [];
  
  for (let i = 0; i < data.length; i++) {
    const current = data[i];
    filledData.push(current);
    
    // 如果当前值为0且有前面的数据，使用前面最近的非零值
    if (current.value === 0 && filledData.length > 1) {
      const lastNonZero = filledData.slice(0, -1).reverse().find(item => item.value > 0);
      if (lastNonZero) {
        filledData[filledData.length - 1] = { ...current, value: lastNonZero.value };
      }
    }
  }
  
  return filledData;
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
      const baseUrl = 'http://43.153.40.155:4004';
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
              ? mindshareHistoryData.data.map(item => ({ date: item.date, value: item.mindshare }))
              : []
          ),
        },
        creators: {
          current: authorsCurrentData.success ? authorsCurrentData.data.current_count : 0,
          change24h: authorsCurrentData.success ? authorsCurrentData.data.change_24h : 0,
          history: processTimeData(
            authorsHistoryData.success 
              ? authorsHistoryData.data.map(item => ({ date: item.date, value: item.author_count }))
              : []
          ),
        },
        posts: {
          current: tweetsCurrentData.success ? tweetsCurrentData.data.current_count : 0,
          change24h: tweetsCurrentData.success ? tweetsCurrentData.data.change_24h : 0,
          history: processTimeData(
            tweetsHistoryData.success 
              ? tweetsHistoryData.data.map(item => ({ date: item.date, value: item.tweet_count }))
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