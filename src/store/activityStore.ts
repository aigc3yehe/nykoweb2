import { atom } from 'jotai';
// import { accountAtom } from './accountStore';

// 定义活动类型
export interface Activity {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  reward: string;
  isActive: boolean;
  isParticipating?: boolean;
  progress?: number;
}

// 定义活动状态接口
export interface ActivityState {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
}

// 初始活动状态
const initialState: ActivityState = {
  activities: [
    {
      id: 'activity-1',
      name: 'Image Generation Challenge',
      description: 'Create unique AI-generated images and share them on X with the #NykoS1 hashtag to earn rewards.',
      startDate: '2023-09-15T00:00:00Z',
      endDate: '2023-10-15T23:59:59Z',
      reward: '100 $NYKO per selected image',
      isActive: true,
      isParticipating: false,
      progress: 0
    },
    {
      id: 'activity-2',
      name: 'Model Training Competition',
      description: 'Train a custom model with our platform and submit it for review. The best models will be featured and rewarded.',
      startDate: '2023-09-20T00:00:00Z',
      endDate: '2023-10-20T23:59:59Z',
      reward: '5,000 $NYKO',
      isActive: true,
      isParticipating: true,
      progress: 40
    },
    {
      id: 'activity-3',
      name: 'Community Feedback Program',
      description: 'Provide valuable feedback on our platform features and earn rewards for helping us improve.',
      startDate: '2023-09-10T00:00:00Z',
      endDate: '2023-10-10T23:59:59Z',
      reward: '50-500 $NYKO based on contribution',
      isActive: false,
      isParticipating: false,
      progress: 0
    }
  ],
  isLoading: false,
  error: null
};

// 创建活动状态原子
export const activityAtom = atom<ActivityState>(initialState);

// 获取活动列表
export const fetchActivities = atom(
  null,
  async (get, set) => {
    const activityState = get(activityAtom);
    // const accountState = get(accountAtom);
    
    // 设置加载状态
    set(activityAtom, {
      ...activityState,
      isLoading: true,
      error: null
    });
    
    try {
      // 这里将来会添加实际的API调用
      console.log('Fetching activities');
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新状态
      set(activityAtom, {
        ...activityState,
        activities: activityState.activities,
        isLoading: false
      });
      
      return activityState.activities;
    } catch (error) {
      // 处理错误
      set(activityAtom, {
        ...activityState,
        isLoading: false,
        error: (error as Error).message
      });
      
      return [];
    }
  }
);

// 参与活动
export const joinActivity = atom(
  null,
  async (get, set, activityId: string) => {
    const activityState = get(activityAtom);
    
    // 设置加载状态
    set(activityAtom, {
      ...activityState,
      isLoading: true,
      error: null
    });
    
    try {
      // 模拟API调用
      console.log(`Joining activity: ${activityId}`);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 更新活动参与状态
      const updatedActivities = activityState.activities.map(activity => 
        activity.id === activityId 
          ? { ...activity, isParticipating: true } 
          : activity
      );
      
      // 更新状态
      set(activityAtom, {
        ...activityState,
        activities: updatedActivities,
        isLoading: false
      });
      
      return true;
    } catch (error) {
      // 处理错误
      set(activityAtom, {
        ...activityState,
        isLoading: false,
        error: (error as Error).message
      });
      
      return false;
    }
  }
);

// 更新活动进度
export const updateActivityProgress = atom(
  null,
  (get, set, { activityId, progress }: { activityId: string; progress: number }) => {
    const activityState = get(activityAtom);
    
    // 更新活动进度
    const updatedActivities = activityState.activities.map(activity => 
      activity.id === activityId 
        ? { ...activity, progress } 
        : activity
    );
    
    // 更新状态
    set(activityAtom, {
      ...activityState,
      activities: updatedActivities
    });
  }
);

// 获取用户参与的活动
export const getUserActivities = atom(
  (get) => {
    const activityState = get(activityAtom);
    return activityState.activities.filter(activity => activity.isParticipating);
  }
);
