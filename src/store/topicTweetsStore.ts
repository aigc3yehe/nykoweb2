import { atom } from 'jotai';

// 推文数据接口
export interface Tweet {
  author_name: string;
  author_username: string;
  publish_date: string;
  content: string;
  tweet_id: string;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  retweet_count: number | null;
  author_twitter: {
    name: string;
    subject: string;
    username: string;
    profile_picture_url: string;
  };
}

// API响应接口
interface TweetsResponse {
  success: boolean;
  data: Tweet[];
}

// 推文状态接口
export interface TopicTweetsState {
  currentTopic: string;
  tweets: Tweet[];
  isLoading: boolean;
  error: string | null;
  lastFetchTime: number;
}

// 初始状态
const initialState: TopicTweetsState = {
  currentTopic: '',
  tweets: [],
  isLoading: false,
  error: null,
  lastFetchTime: 0,
};

// 基础状态原子
export const topicTweetsAtom = atom<TopicTweetsState>(initialState);

// 缓存时长：24小时
const CACHE_DURATION = 24 * 60 * 60 * 1000;

// 数值格式化函数
export const formatCount = (count: number | null): string => {
  if (count === null || count === undefined) {
    return '0';
  }
  if (count >= 1000000) {
    return (count / 1000000).toFixed(1) + 'M';
  } else if (count >= 1000) {
    return (count / 1000).toFixed(1) + 'k';
  }
  return count.toString();
};

// 时间格式化函数
export const formatPublishDate = (dateString: string): string => {
  try {
    // 如果日期字符串没有年份，默认为今年
    let processedDateString = dateString;
    if (!dateString.includes('2024') && !dateString.includes('2023') && !dateString.includes('2025')) {
      // 检查是否是 MM/DD 格式，如果是则添加当前年份
      if (/^\d{1,2}\/\d{1,2}$/.test(dateString.trim())) {
        const currentYear = new Date().getFullYear();
        processedDateString = `${dateString}/${currentYear}`;
      }
    }
    
    const publishDate = new Date(processedDateString);
    const now = new Date();
    const diffMs = now.getTime() - publishDate.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      // 24小时内显示相对时间
      if (diffHours < 1) {
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        return `${diffMinutes}m`;
      } else {
        return `${Math.floor(diffHours)}h`;
      }
    } else {
      // 超过24小时显示实际时间（不显示年份，只显示月/日）
      const month = String(publishDate.getMonth() + 1).padStart(2, '0');
      const day = String(publishDate.getDate()).padStart(2, '0');
      return `${month}/${day}`;
    }
  } catch (error) {
    return dateString;
  }
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
      console.warn(`[topicTweetsStore] Failed to get project slug for ${topicName}: ${response.status}`);
      return null;
    }

    const result = await response.json();
    console.log('[topicTweetsStore] Project slug response:', result);
    
    if (result.data && result.data.slug) {
      return result.data.slug;
    }
    
    console.warn(`[topicTweetsStore] No slug found for topic: ${topicName}`);
    return null;
  } catch (error) {
    console.warn(`[topicTweetsStore] Error getting project slug for ${topicName}:`, error);
    return null;
  }
};

// 获取推文数据的主函数
export const fetchTopicTweets = atom(
  null,
  async (get, set, topicName: string) => {
    const state = get(topicTweetsAtom);
    
    // 如果正在加载相同的topic，直接返回
    if (state.isLoading && state.currentTopic === topicName) {
      return;
    }

    // 检查缓存是否有效
    const now = Date.now();
    const isCacheValid = state.currentTopic === topicName && 
                        state.lastFetchTime > 0 && 
                        (now - state.lastFetchTime) < CACHE_DURATION &&
                        state.tweets.length > 0;

    if (isCacheValid) {
      console.log('[topicTweetsStore] Using cached tweets for:', topicName);
      return;
    }

    set(topicTweetsAtom, {
      ...state,
      currentTopic: topicName,
      isLoading: true,
      error: null,
    });

    try {
      console.log('[topicTweetsStore] Fetching tweets for topic:', topicName);
      
      // 1. 获取项目slug
      const slug = await getProjectSlug(topicName);
      
      if (!slug) {
        console.log(`[topicTweetsStore] No slug available for topic: ${topicName}, skipping tweets fetch`);
        set(topicTweetsAtom, {
          currentTopic: topicName,
          tweets: [],
          isLoading: false,
          error: null,
          lastFetchTime: now,
        });
        return;
      }

      console.log('[topicTweetsStore] Got project slug:', slug);

      // 2. 获取推文数据
      const baseUrl = 'http://43.153.40.155:4004';
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_INFOFI_BEARER_TOKEN}`,
      };

      const response = await fetch(`${baseUrl}/api/projects/${slug}/tweets/recent`, { headers });

      if (!response.ok) {
        console.warn(`[topicTweetsStore] Failed to fetch tweets: ${response.status}`);
        set(topicTweetsAtom, {
          currentTopic: topicName,
          tweets: [],
          isLoading: false,
          error: null,
          lastFetchTime: now,
        });
        return;
      }

      const tweetsData: TweetsResponse = await response.json();
      console.log('[topicTweetsStore] Tweets response:', tweetsData);

      const tweets = tweetsData.success ? tweetsData.data : [];

      set(topicTweetsAtom, {
        currentTopic: topicName,
        tweets,
        isLoading: false,
        error: null,
        lastFetchTime: now,
      });

    } catch (error) {
      console.warn('[topicTweetsStore] Error fetching tweets:', error);
      set(topicTweetsAtom, {
        currentTopic: topicName,
        tweets: [],
        isLoading: false,
        error: null, // 不设置错误，避免显示错误信息
        lastFetchTime: now,
      });
    }
  }
); 