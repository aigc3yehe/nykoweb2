import { atom } from 'jotai'
import { modelsApi } from '../services/api/models'
import type { FetchModelDto } from '../services/api/types'
import { userStateAtom } from './loginStore'

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

      // 静默刷新点赞状态
      const userState = get(userStateAtom)
      if (userState.isAuthenticated) {
        try {
          const like = await modelsApi.getModelLikeStatus(modelId)
          set(modelDetailAtom, prev => ({
            ...prev,
            model: prev.model ? { ...prev.model, is_liked: like.is_liked } : prev.model
          }))
        } catch (e) {
          console.warn('Silent model like status refresh failed:', e)
        }
      }

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

// 点赞/取消点赞（乐观更新并同步数量，数量不小于0）
export const toggleLikeModelAtom = atom(
  null,
  async (get, set, modelId: number) => {
    const state = get(modelDetailAtom)
    if (!state.model) return

    const isLiked = !!state.model.is_liked
    const currentCount = state.model.like_count || 0

    // 乐观更新
    set(modelDetailAtom, prev => ({
      ...prev,
      model: prev.model
        ? {
            ...prev.model,
            is_liked: !isLiked,
            like_count: !isLiked ? currentCount + 1 : Math.max(currentCount - 1, 0)
          }
        : prev.model
    }))

    try {
      await modelsApi.likeModel(modelId, { is_liked: !isLiked })
    } catch (e) {
      // 回滚
      set(modelDetailAtom, prev => ({
        ...prev,
        model: prev.model
          ? {
              ...prev.model,
              is_liked: isLiked,
              like_count: currentCount
            }
          : prev.model
      }))
      throw e
    }
  }
)