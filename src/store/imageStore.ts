import { atom } from 'jotai';
import { accountAtom } from './accountStore';

// 定义Twitter接口
export interface Twitter {
  subject?: string;
  username?: string | null;
  name?: string | null;
  profilePictureUrl?: string | null;
}

// 定义Image接口
export interface Image {
  id: number;
  url: string | null;
  model_id: number;
  creator: string;
  version: number;
  task_id: string;
  width: number;
  height: number;
  state: number; // -1: 失败, 0: 待处理, 1: 成功
  users: {
    twitter: Twitter | null;
    address: string | null;
  };
}

// 定义排序参数类型
export type ImageOrderType = 'created_at' | 'updated_at' | 'id';
export type OrderDirection = 'desc' | 'asc';
export type ImageState = 'success' | 'pending';

// 定义图片列表状态
interface ImageListState {
  images: Image[];
  totalCount: number;
  page: number;
  pageSize: number;
  order: ImageOrderType;
  desc: OrderDirection;
  model_id?: number;
  state?: ImageState;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

// 初始状态
const initialState: ImageListState = {
  images: [],
  totalCount: 0,
  page: 1,
  pageSize: 20,
  order: 'created_at',
  desc: 'desc',
  isLoading: false,
  error: null,
  hasMore: true
};

// 创建图片列表原子
export const imageListAtom = atom<ImageListState>(initialState);

// 获取图片列表
export const fetchImages = atom(
  null,
  async (get, set, { 
    reset = false, 
    ownedOnly = false,
    model_id,
    state
  }: { 
    reset?: boolean, 
    ownedOnly?: boolean,
    model_id?: number,
    state?: ImageState
  } = {}) => {
    const imageState = get(imageListAtom);
    const accountState = get(accountAtom);
    
    // 如果重置或者还有更多数据可加载
    if (reset || imageState.hasMore) {
      // 设置为加载中
      set(imageListAtom, {
        ...imageState,
        isLoading: true,
        error: null,
        // 如果是重置，则页码为1，否则保持当前页
        page: reset ? 1 : imageState.page,
        // 更新过滤条件
        model_id,
        state
      });
      
      try {
        // 构建查询参数
        const params = new URLSearchParams({
          page: reset ? '1' : imageState.page.toString(),
          pageSize: imageState.pageSize.toString(),
          order: imageState.order,
          desc: imageState.desc
        });
        
        // 如果是owned模式，添加user参数
        if (ownedOnly && accountState.walletAddress) {
          params.append('user', accountState.walletAddress);
        }
        
        // 添加可选的model_id参数
        if (model_id !== undefined) {
          params.append('model_id', model_id.toString());
        }
        
        // 添加可选的state参数
        if (state) {
          params.append('state', state);
        }
        
        // 发送请求
        const response = await fetch(`/studio-api/model/list/gallery?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`
          }
        });
        
        if (!response.ok) {
          throw new Error('获取图片列表失败');
        }
        
        const result = await response.json();
        
        // 更新状态
        set(imageListAtom, {
          ...imageState,
          images: reset ? result.data.images : [...imageState.images, ...result.data.images],
          totalCount: result.data.totalCount,
          page: reset ? 2 : imageState.page + 1, // 更新页码为下一页
          isLoading: false,
          hasMore: (reset ? 1 : imageState.page) * imageState.pageSize < result.data.totalCount // 判断是否还有更多数据
        });
      } catch (error) {
        // 错误处理
        set(imageListAtom, {
          ...imageState,
          isLoading: false,
          error: (error as Error).message
        });
      }
    }
  }
);

// 更改排序方式
export const changeImageOrder = atom(
  null,
  (get, set, newOrder: ImageOrderType) => {
    const state = get(imageListAtom);
    
    set(imageListAtom, {
      ...state,
      order: newOrder,
      page: 1, // 重置页码
      images: [], // 清空当前图片列表
      hasMore: true // 重置是否有更多数据
    });
    
    // 重新获取数据
    get(fetchImages)({ reset: true });
  }
);

// 更改排序方向
export const changeImageOrderDirection = atom(
  null,
  (get, set, newDirection: OrderDirection) => {
    const state = get(imageListAtom);
    
    set(imageListAtom, {
      ...state,
      desc: newDirection,
      page: 1,
      images: [],
      hasMore: true
    });
    
    get(fetchImages)({ reset: true });
  }
);

// 按模型ID筛选
export const filterByModelId = atom(
  null,
  (get, set, model_id?: number) => {
    const state = get(imageListAtom);
    
    set(imageListAtom, {
      ...state,
      model_id,
      page: 1,
      images: [],
      hasMore: true
    });
    
    get(fetchImages)({ reset: true, model_id });
  }
);

// 按状态筛选
export const filterByState = atom(
  null,
  (get, set, state?: ImageState) => {
    const imageState = get(imageListAtom);
    
    set(imageListAtom, {
      ...imageState,
      state,
      page: 1,
      images: [],
      hasMore: true
    });
    
    get(fetchImages)({ reset: true, state });
  }
);

// 重置
export const resetImageList = atom(
  null,
  (get, set) => {
    set(imageListAtom, initialState);
  }
); 