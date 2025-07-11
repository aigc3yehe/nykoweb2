import { atom } from 'jotai'
import { modelsApi } from '../services/api/models'
import type { FetchModelDto } from '../services/api/types'

// 模型详情状态
export interface ModelDetailState {
  model: FetchModelDto | null
  isLoading: boolean
  error: string | null
}

// 初始状态
const initialState: ModelDetailState = {
  model: null,
  isLoading: false,
  error: null
}

// 模型详情状态atom
export const modelDetailAtom = atom<ModelDetailState>(initialState)

// 获取模型详情
export const fetchModelDetailAtom = atom(
  null,
  async (get, set, params: { modelId: number; refresh?: boolean }) => {
    const { modelId, refresh = false } = params

    // 设置加载状态
    set(modelDetailAtom, {
      ...get(modelDetailAtom),
      isLoading: true,
      error: null
    })

    try {
      // 调用API获取模型详情
      const response = await modelsApi.getModelById(modelId, refresh)
      
      set(modelDetailAtom, {
        model: response,
        isLoading: false,
        error: null
      })

      return response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch model details'
      
      set(modelDetailAtom, {
        ...get(modelDetailAtom),
        isLoading: false,
        error: errorMessage
      })

      throw error
    }
  }
)

// 清除模型详情状态
export const clearModelDetailAtom = atom(
  null,
  (_, set) => {
    set(modelDetailAtom, initialState)
  }
) 