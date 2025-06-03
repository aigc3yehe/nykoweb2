import { atom } from 'jotai';
import { accountAtom } from './accountStore';
import { Twitter } from './imageStore'; // 导入Twitter接口
import { PRIVY_TOKEN_HEADER } from '../utils/constants';
import { getAccessToken } from '@privy-io/react-auth';
import {FlaunchStatusResponse, ModelTokenizationStateResponse} from './tokenStore';

export enum TOKENIZATION_LAUNCHPAD_TYPE {
  FLAUNCH = 'flaunch',
  VIRTUALS = 'virtuals',
}

export interface TokenMetadata {
  description?: string;
  image?: string;
  name?: string;
  symbol?: string;
  virtuals_id?: number;
}

export interface WorkflowToken {
  id?: number;
  meme_token?: string;
  metadata?: TokenMetadata;
  network?: number;
  deployer?: string;
  launchpad?: TOKENIZATION_LAUNCHPAD_TYPE
}

export interface CommunityWorkflowToken {
  id?: number;
  state?: number;
  metadata?: TokenMetadata;
  meme_token?: string;
  network?: number;
}

// 定义Workflow接口
export interface Workflow {
  name: string;
  description: string;
  tags: string[];
  creator: string;
  id: number;
  batch: number;
  cover: string;
  usage: number;
  flag: string | null;
  public?: number; // 1 为可视, 0为由所有者设置为不可视，-1则是系统管理员设置的不可见，级别最高
  workflow_tokenization: WorkflowToken | null;
  workflow_community_tokenization: CommunityWorkflowToken[] | null;
  prompt: string | null;
  output_type: string | null;
  input_type: string | null;
  model: string | null;
  users: {
    twitter: Twitter | null;
    address: string | null;
  };
  reference_images: string[];
}

// 定义排序参数类型
export type OrderType = 'created_at' | 'usage';
export type OrderDirection = 'desc' | 'asc';

// 定义模型列表状态
interface WorkflowListState {
  workflows: Workflow[];
  totalCount: number;
  page: number;
  pageSize: number;
  order: OrderType;
  desc: OrderDirection;
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

// 初始状态
const initialState: WorkflowListState = {
  workflows: [],
  totalCount: 0,
  page: 1,
  pageSize: 30,
  order: 'created_at',
  desc: 'desc',
  isLoading: false,
  error: null,
  hasMore: true
};

// 创建模型列表原子
export const workflowListAtom = atom<WorkflowListState>(initialState);

// 获取模型列表
export const fetchWorkflows = atom(
  null,
  async (get, set, { reset = false, ownedOnly = false, order = "created_at", view = undefined }: { reset?: boolean, ownedOnly?: boolean, order?: string, view?: boolean } = {}) => {
    const state = get(workflowListAtom);
    const accountState = get(accountAtom);

    // 如果重置或者还有更多数据可加载
    if (reset || state.hasMore) {
      if (ownedOnly && reset) {
        // 重置且切换为only owner

        const ownedWorkflows = state.workflows.filter(workflow => workflow.creator == accountState.did)
        // 设置为加载中
        set(workflowListAtom, {
          ...state,
          workflows: ownedWorkflows,
          order: order as 'created_at' | 'usage',
          isLoading: true,
          error: null,
          page: 1
        });
      } else {
        // 设置为加载中
        set(workflowListAtom, {
          ...state,
          order: order as 'created_at' | 'usage',
          isLoading: true,
          error: null,
          // 如果是重置，则页码为1，否则保持当前页
          page: reset ? 1 : state.page
        });
      }

      try {
        // 构建查询参数
        const params = new URLSearchParams({
          page: reset ? '1' : state.page.toString(),
          pageSize: state.pageSize.toString(),
          order: order as 'created_at' | 'usage',
          desc: state.desc
        });

        // 如果是owned模式，添加user参数
        if (ownedOnly && accountState.did) {
          params.append('user', accountState.did);
        }

        if (view) {
          params.append('view', 'true');
        }

        // 根据owned状态选择不同的API端点
        const endpoint = '/studio-api/workflow/list/enabled';

        // 发送请求
        const response = await fetch(`${endpoint}?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`
          }
        });

        if (!response.ok) {
          throw new Error('get workflows error');
        }

        const result = await response.json();

        // 更新状态
        set(workflowListAtom, {
          ...state,
          workflows: reset ? result.data.workflows : [...state.workflows, ...result.data.workflows],
          totalCount: result.data.totalCount,
          page: reset ? 2 : state.page + 1, // 更新页码为下一页
          isLoading: false,
          error: null,
          hasMore: (reset ? 1 : state.page) * state.pageSize < result.data.totalCount // 判断是否还有更多数据
        });
      } catch (error) {
        // 错误处理
        set(workflowListAtom, {
          ...state,
          isLoading: false,
          error: (error as Error).message
        });
      }
    }
  }
);

export async function toggleViewRequest(type: string, id: number, view_value: boolean, did?: string) {
  const API_URL = type == 'image' ? "/studio-api/aigc/content/toggle_view" : "/studio-api/workflow/toggle_view";

  try {
    const privyToken = await getAccessToken();
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        [PRIVY_TOKEN_HEADER]: privyToken || "",
      },
      body: JSON.stringify({
        type,
        id,
        'public': view_value,
        user: did,
      })
    })

    if (!res.ok) {
      throw new Error(`API returned error status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 获取模型列表
export const fetchToggleWorkflowView = atom(
    null,
    async (get, _set, type: string, id: number, public_value: boolean) => {
      const accountState = get(accountAtom);

      try {
        const did = accountState.did || undefined;
        const response = await toggleViewRequest(type, id, public_value, did);
        console.log('result', response);
        return response; // 返回结果，以便在组件中使用Promise链
      } catch (error) {
        console.log(error);
        throw error; // 抛出错误以便在组件中捕获
      }
    }
);

// 重置
export const resetWorkflowList = atom(
  null,
  (_, set) => {
    set(workflowListAtom, initialState);
  }
);

// 定义模型详情接口
export interface WorkflowDetail extends Workflow {
  carousel: string[];
  created_at: string;
  workflow_vote: {
    like: number;
    dislike: number;
    state: number;
  };
}

// 创建模型详情状态原子
interface WorkflowDetailState {
  currentWorkflow: WorkflowDetail | null;
  isLoading: boolean;
  error: string | null;
}

const initialDetailState: WorkflowDetailState = {
  currentWorkflow: null,
  isLoading: false,
  error: null
};

export const workflowDetailAtom = atom<WorkflowDetailState>(initialDetailState);

// 获取模型详情
export const fetchWorkflowDetail = atom(
  null,
  async (get, set, workflowId: number, showLoading: boolean = true) => {
    set(workflowDetailAtom, {
      ...get(workflowDetailAtom),
      isLoading: showLoading,
      error: null
    });

    try {
      const response = await fetch(`/studio-api/workflow/detail?id=${workflowId}`, {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`
        }
      });

      if (!response.ok) {
        throw new Error('get error detail error');
      }

      const result = await response.json();

      // 检查是否有未完成的社区token
      const communityTokens = result.data.workflow_community_tokenization;
      if (communityTokens && communityTokens.length > 0) {
        // 查找第一个state不等于2的token
        const pendingToken = communityTokens.find((token: { state: number; }) => token.state !== 2);

        // 如果找到未完成的token，直接使用set调用fetchCommunityTokenizationState
        if (pendingToken) {
          set(fetchCommunityTokenizationState, {
            workflowId,
            workflow_tokenization_id: pendingToken.id
          });
        }
      }

      set(workflowDetailAtom, {
        currentWorkflow: result.data,
        isLoading: false,
        error: null
      });

      return result.data;
    } catch (error) {
      set(workflowDetailAtom, {
        ...get(workflowDetailAtom),
        isLoading: false,
        error: (error as Error).message
      });

      throw error;
    }
  }
);

// 清除模型详情
export const clearWorkflowDetail = atom(
  null,
  (_, set) => {
    set(workflowDetailAtom, initialDetailState);
  }
);

// 创建模型详情状态原子
interface WorkflowIdAndNameState {
  workflowId: number | null;
  workflowName: string | null;
}

const initialWorkflowIdAndNameState: WorkflowIdAndNameState = {
  workflowId: null,
  workflowName: null
};

export const workflowIdAndNameAtom = atom<WorkflowIdAndNameState>(initialWorkflowIdAndNameState);

export const setWorkflowIdAndName = atom(
  null,
  (_, set, { workflowId, workflowName }: { workflowId: number, workflowName: string }) => {
    set(workflowIdAndNameAtom, {
      workflowId,
      workflowName
    });
  }
);

export const getWorkflowIdAndName = atom(
  (get) => get(workflowIdAndNameAtom)
);

export async function editCoverRequest(workflow_id: number, url: string, did?: string) {
  const API_URL = "/studio-api/workflow/edit_cover";

  try {
    const privyToken = await getAccessToken();
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        [PRIVY_TOKEN_HEADER]: privyToken || "",
      },
      body: JSON.stringify({
        workflow_id,
        url,
        user: did,
      })
    })

    if (!res.ok) {
      throw new Error(`API returned error status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 获取模型列表
export const fetchWorkflowEditCover = atom(
    null,
    async (get, set, workflow_id: number, url: string) => {
      const accountState = get(accountAtom);

      try {
        const did = accountState.did || undefined;
        const response = await editCoverRequest(workflow_id, url, did);
        console.log('result', response);
        const result = response;
        console.log("result", result);
        if (result.data) {
          console.log('result success', result);
          const oldWorkflowDetail = get(workflowDetailAtom)
          if (oldWorkflowDetail && oldWorkflowDetail.currentWorkflow) {
            oldWorkflowDetail.currentWorkflow.cover = url
            set(workflowDetailAtom, oldWorkflowDetail);
          }
        }
        return response; // 返回结果，以便在组件中使用Promise链
      } catch (error) {
        console.log(error);
        throw error; // 抛出错误以便在组件中捕获
      }
    }
);

// 获取社区token状态的函数
export const fetchCommunityTokenizationState = atom(
    null,
    async (_get, set, { workflowId, workflow_tokenization_id }: { workflowId: number, workflow_tokenization_id: number }) => {
      if(!workflowId || !workflow_tokenization_id) {
        throw new Error("Workflow id or workflow tokenization id is required");
      }
      try {
        const params = new URLSearchParams({
          workflow_id: workflowId.toString(),
          refreshState: 'true',
          workflow_tokenization_id: workflow_tokenization_id.toString()
        });

        const response = await fetch(`/studio-api/workflow/tokenization/state?${params.toString()}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
          }
        });

        if (!response.ok) {
          throw new Error('get community tokenization state error');
        }

        const result: ModelTokenizationStateResponse = await response.json();
        const data = result.data as FlaunchStatusResponse;

        // 如果社区token已完成，重新获取模型详情
        if (data && data.state === 'completed') {
          const response = await fetch(`/studio-api/workflow/detail?id=${workflowId}`, {
              headers: {
                'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`
              }
          });

          if (!response.ok) {
            throw new Error('get error detail error');
          }

          const result = await response.json();

          set(workflowDetailAtom, {
            currentWorkflow: result.data,
            isLoading: false,
            error: null
          });

          return result.data;
        }
      } catch (error) {
        console.error(error);
      }
    }
);

// 编辑工作流请求接口
export interface EditWorkflowRequest {
  user: string;
  workflow_id: number;
  name?: string;
  description?: string;
  tags?: string[];
  token?: {
    address: string;
    launchpad: 'virtuals' | 'flaunch' | 'others';
  };
  input_type?: string[];
  output_type?: string[];
  reference_images?: string[];
}

// 编辑工作流响应接口
export interface EditWorkflowResponse {
  message: string;
  data: boolean;
}

// 编辑工作流函数
export async function editWorkflowRequest(params: EditWorkflowRequest): Promise<EditWorkflowResponse> {
  const API_URL = "/studio-api/workflow/edit";

  try {
    const privyToken = await getAccessToken();
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        [PRIVY_TOKEN_HEADER]: privyToken || "",
      },
      body: JSON.stringify(params)
    });

    if (!res.ok) {
      throw new Error(`API returned error status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 编辑工作流的原子操作
export const fetchEditWorkflow = atom(
  null,
  async (get, set, params: Omit<EditWorkflowRequest, 'user'>) => {
    const accountState = get(accountAtom);

    try {
      const did = accountState.did;
      if (!did) {
        throw new Error("User DID is required");
      }

      const response = await editWorkflowRequest({
        ...params,
        user: did
      });

      console.log('Edit workflow result:', response);

      if (response.data) {
        console.log('Workflow edited successfully', response);

        // 如果编辑成功，重新获取工作流详情
        if (params.workflow_id) {
          set(fetchWorkflowDetail, params.workflow_id, false);
        }
      }

      return response;
    } catch (error) {
      console.log(error);
      throw error;
    }
  }
);

export async function editWorkflowCarouselRequest(workflow_id: number, url: string, did?: string) {
  const API_URL = "/studio-api/workflow/edit_carousel";

  try {
    const privyToken = await getAccessToken();
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_BEARER_TOKEN}`,
        [PRIVY_TOKEN_HEADER]: privyToken || "",
      },
      body: JSON.stringify({
        workflow_id,
        url,
        user: did,
      })
    })

    if (!res.ok) {
      throw new Error(`API returned error status ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// 获取工作流轮播图编辑
export const fetchWorkflowEditCarousel = atom(
    null,
    async (get, set, workflow_id: number, url: string) => {
      const accountState = get(accountAtom);
      if(!workflow_id || !url) {
        throw new Error("Workflow id and image url are required");
      }
      try {
        const did = accountState.did || undefined;
        const response = await editWorkflowCarouselRequest(workflow_id, url, did);
        console.log('workflow carousel result', response);
        const result = response;
        console.log("workflow carousel result", result);
        if (result.data) {
          console.log('workflow carousel 设置成功', result);
          const oldWorkflowDetail = get(workflowDetailAtom)
          if (oldWorkflowDetail && oldWorkflowDetail.currentWorkflow) {
            // 更新carousel数组
            const currentCarousel = oldWorkflowDetail.currentWorkflow.carousel || [];
            let newCarousel: string[];

            if (currentCarousel.includes(url)) {
              // 如果已存在，则删除
              newCarousel = currentCarousel.filter(item => item !== url);
            } else {
              // 如果不存在，则添加
              newCarousel = [...currentCarousel, url];
            }

            oldWorkflowDetail.currentWorkflow.carousel = newCarousel;
            set(workflowDetailAtom, oldWorkflowDetail);
          }
        }
        return response; // 返回结果，以便在组件中使用Promise链
      } catch (error) {
        console.log(error);
        throw error; // 抛出错误以便在组件中捕获
      }
    }
);
