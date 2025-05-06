import { atom } from 'jotai';

// 添加积分相关接口
export interface SeasonPoints {
  points: number;
  geni: number;
  ef: number;
  cd: number;
}

export interface PointsHistory {
  points?: number;
  season?: number;
}

// 定义活动状态接口
export interface ActivityState {
  isLoading: boolean;
  error: string | null;
  currentPoints: SeasonPoints | null;
  pointsHistory: PointsHistory[];
  did: string | null;
}

// 初始活动状态
const initialState: ActivityState = {
  isLoading: false,
  error: null,
  currentPoints: null,
  pointsHistory: [],
  did: null
};

// 创建活动状态原子
export const activityAtom = atom<ActivityState>(initialState);

// 获取当前赛季积分
export const fetchCurrentPoints = atom(
  null,
  async (get, set, did?: string) => {
    const activityState = get(activityAtom);

    if (!did) return null;

    set(activityAtom, {
      ...activityState,
      isLoading: true,
      error: null
    });

    try {
      const response = await fetch(`/studio-api/points?user=${did}`, {
          headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`
          }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch points');
      }

      const data = await response.json();

      const currentActivityState = get(activityAtom);
      set(activityAtom, {
        ...currentActivityState,
        currentPoints: data.data,
        isLoading: false
      });

      return data.data;
    } catch (error) {
      const currentActivityState = get(activityAtom);
      set(activityAtom, {
        ...currentActivityState,
        isLoading: false,
        error: (error as Error).message
      });

      return null;
    }
  }
);

// 获取积分历史记录
export const fetchPointsHistory = atom(
  null,
  async (get, set, did?: string) => {
    const activityState = get(activityAtom);

    if (!did) return [];

    set(activityAtom, {
      ...activityState,
      isLoading: true,
      error: null
    });

    try {
      const response = await fetch(`/studio-api/points/list?user=${did}`, {
          headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`
          }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch points history');
      }

      const data = await response.json();

      const currentActivityState = get(activityAtom);
      set(activityAtom, {
        ...currentActivityState,
        pointsHistory: data.data,
        isLoading: false
      });

      return data.data;
    } catch (error) {
      const currentActivityState = get(activityAtom);
      set(activityAtom, {
        ...currentActivityState,
        isLoading: false,
        error: (error as Error).message
      });

      return [];
    }
  }
);

// 6. 修改setUserInfo操作，在did更新时检查连接状态
export const setDid = atom(
    null,
    async (get, set, params: { did?: string }) => {
      const { did } = params;
      const activityState = get(activityAtom);
      const prevDid = activityState.did;

      // 更新用户信息
      set(activityAtom, {
        ...activityState,
        did: did || null
      });

      // 如果did从null/undefined变成有值，则检查连接状态
      if ((!prevDid || prevDid === '') && did) {
        console.log('user is login success, check connection status:', prevDid);
        set(fetchCurrentPoints);
        set(fetchPointsHistory)
      }
    }
);
