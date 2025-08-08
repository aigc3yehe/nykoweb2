/* eslint-disable @typescript-eslint/ban-ts-comment */
import { atom } from 'jotai';
import { SOURCE_TYPE } from '../types/api.type';

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
  model_id?: number;
  workflow_id?: number;
  source: SOURCE_TYPE;
  creator: string;
  version: number;
  task_id: string;
  width: number;
  height: number;
  state: number; // -1: 失败, 0: 待处理, 1: 成功
  public: number; // 1 为可见的 0是相关人员关闭了的
  is_liked?: boolean; // 当前用户是否点赞了这张图片
  like_count?: number; // 点赞数
  type: string; // 图片类型 "image" | "video"
  users: {
    twitter: Twitter | null;
    address: string | null;
  };
}

// 定义排序参数类型
export type ImageOrderType = 'created_at' | 'updated_at' | 'id' | 'like_count';
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
  pageSize: 30,
  order: 'created_at',
  desc: 'desc',
  isLoading: false,
  error: null,
  hasMore: true
};

// 创建图片列表原子
export const imageListAtom = atom<ImageListState>(initialState);

// 记录上次刷新时间
let lastRefreshTime = 0;
// 刷新间隔时间（毫秒）
const REFRESH_INTERVAL = 2 * 60 * 1000; // 2分钟

// 获取图片列表
export const fetchImages = atom(
  null,
  async (get, set, {
    reset = false,
    ownedOnly = false,
    model_id,
    workflow_id,
    state,
    view,
    order
  }: {
    reset?: boolean,
    ownedOnly?: boolean,
    model_id?: number,
    workflow_id?: number,
    state?: ImageState,
    view?: boolean,
    order?: ImageOrderType
  } = {}) => {
    const imageState = get(imageListAtom);
    //const accountState = get(accountAtom);

    // 如果重置或者还有更多数据可加载
    if (reset || imageState.hasMore) {
      if (reset && ownedOnly) {
        const ownedImages = imageState.images.filter(() => false);
        // const ownedImages = imageState.images.filter((image) => image.creator == accountState.did);
        set(imageListAtom, {
          ...imageState,
          images: ownedImages,
          isLoading: true,
          error: null,
          // 如果是重置，则页码为1，否则保持当前页
          page: 1,
          // 更新过滤条件
          model_id,
          state,
          // 更新排序参数
          order: order || imageState.order
        });
      } else {
        // 设置为加载中
        set(imageListAtom, {
          ...imageState,
          isLoading: true,
          error: null,
          // 如果是重置，则页码为1，否则保持当前页
          page: reset ? 1 : imageState.page,
          // 更新过滤条件
          model_id,
          state,
          // 更新排序参数
          order: order || imageState.order
        });
      }


      try {
        // 构建查询参数
        const params = new URLSearchParams({
          page: reset ? '1' : imageState.page.toString(),
          pageSize: imageState.pageSize.toString(),
          order: order || imageState.order,
          desc: imageState.desc
        });

        // 如果是owned模式，添加user参数
        //if (ownedOnly && accountState.did) {
        //  params.append('user', accountState.did);
        //}

        // 添加可选的model_id参数
        if (model_id !== undefined) {
          params.append('model_id', model_id.toString());
          params.append('source', SOURCE_TYPE.MODEL)
        }

        // 添加可选的workflow_id参数
        if (workflow_id !== undefined) {
          params.append('workflow_id', workflow_id.toString());
          params.append('source', SOURCE_TYPE.WORKFLOW)
        }

        // 添加可选的state参数
        if (state) {
          params.append('state', state);
        }

        if (view) {
          params.append('view', 'true');
        }



        // 发送请求
        const response = await fetch(`/studio-api/aigc/gallery?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
            //[PRIVY_TOKEN_HEADER]: privyToken || '',
          }
        });

        if (!response.ok) {
          throw new Error('Failed to Load Images');
        }

        const result = await response.json();

        // 检查是否有待处理的图片（state=0）
        const hasPendingImages = result.data.images.some((image: Image) => image.state === 0);

        // 如果有待处理的图片，并且距离上次刷新已经超过了设定的时间间隔，调用刷新接口
        const now = Date.now();
        if (hasPendingImages && (now - lastRefreshTime > REFRESH_INTERVAL)) {
          // 更新最后刷新时间
          lastRefreshTime = now;

          // 不使用await，避免阻塞主流程
          fetch('/studio-api/aigc/image/refresh', {
            headers: {
              'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`
            }
          })
            .then(refreshResponse => {
              if (refreshResponse.ok) {
                return refreshResponse.json();
              }
              console.error('refresh images failed');
            })
            .then(refreshResult => {
              console.log('refresh images success', refreshResult.data);
            })
            .catch(refreshError => {
              console.error('refresh images failed', refreshError);
            });
        }

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

// 重置
export const resetImageList = atom(
  null,
  (_, set) => {
    set(imageListAtom, initialState);
  }
);

// 定义详细图片信息接口
export interface ImageDetail {
  source_info: {
    id: number;
    name: string;
  };
  source: SOURCE_TYPE;
  users: {
    did: string;
    twitter: Twitter | null;
  };
  url: string;
  task_id: string;
  created_at: string;
  height: number;
  width: number;
  state: number;
  is_liked: boolean;
  like_count: number;
  type: string;
}

// 获取图片详情
export const fetchImageDetail = async (imageId: number): Promise<ImageDetail> => {
  try {

    const response = await fetch(`/studio-api/aigc/image?image_id=${imageId}`, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`fetchImageDetail error: ${response.statusText}`);
    }

    const result = await response.json();

    if (!result.data) {
      throw new Error('fetchImageDetail empty');
    }

    return result.data;
  } catch (error) {
    console.error('fetchImageDetail error:', error);
    throw error;
  }
};