import { atom } from 'jotai'
import { dashboardApi } from '../services/api/misc'

// 精选项目数据类型
export interface FeaturedItem {
  id: number
  source: 'model' | 'workflow'
  name: string
  tags: string[]
  usage: number
  like_count: number
  cover: string
  description?: string
  user: {
    did: string
    name: string
    avatar: string
    email: string
  }
}

// 精选工作流状态
export interface FeaturedWorkflowsState {
  items: FeaturedItem[]
  isLoading: boolean
  error: string | null
  lastFetch: number | null
}

// 精选模型状态
export interface FeaturedModelsState {
  items: FeaturedItem[]
  isLoading: boolean
  error: string | null
  lastFetch: number | null
}

// 精选工作流状态atom
export const featuredWorkflowsAtom = atom<FeaturedWorkflowsState>({
  items: [],
  isLoading: false,
  error: null,
  lastFetch: null
})

// 精选模型状态atom
export const featuredModelsAtom = atom<FeaturedModelsState>({
  items: [],
  isLoading: false,
  error: null,
  lastFetch: null
})

// 缓存有效期：5分钟
const CACHE_DURATION = 5 * 60 * 1000

// 获取精选工作流的atom
export const fetchFeaturedWorkflowsAtom = atom(
  null,
  async (get, set, refresh: boolean = false) => {
    const currentState = get(featuredWorkflowsAtom)

    // 检查缓存是否有效
    const now = Date.now()
    const cacheValid = currentState.lastFetch &&
                      (now - currentState.lastFetch) < CACHE_DURATION

    if (!refresh && cacheValid && currentState.items.length > 0) {
      return currentState.items
    }

    // 设置加载状态
    set(featuredWorkflowsAtom, {
      ...currentState,
      isLoading: true,
      error: null
    })

    try {
      console.log('Fetching featured workflows...')
      const items = await dashboardApi.getFeaturedWorkflows(refresh)

      set(featuredWorkflowsAtom, {
        items,
        isLoading: false,
        error: null,
        lastFetch: now
      })

      console.log('Featured workflows fetched successfully:', items.length)
      return items
    } catch (error) {
      console.error('Failed to fetch featured workflows:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch featured workflows'

      set(featuredWorkflowsAtom, {
        ...currentState,
        isLoading: false,
        error: errorMessage
      })

      throw error
    }
  }
)

// 获取精选模型的atom
export const fetchFeaturedModelsAtom = atom(
  null,
  async (get, set, refresh: boolean = false) => {
    const currentState = get(featuredModelsAtom)

    // 检查缓存是否有效
    const now = Date.now()
    const cacheValid = currentState.lastFetch &&
                      (now - currentState.lastFetch) < CACHE_DURATION

    if (!refresh && cacheValid && currentState.items.length > 0) {
      return currentState.items
    }

    // 设置加载状态
    set(featuredModelsAtom, {
      ...currentState,
      isLoading: true,
      error: null
    })

    try {
      console.log('Fetching featured models...')
      const items = await dashboardApi.getFeaturedModels(refresh)

      set(featuredModelsAtom, {
        items,
        isLoading: false,
        error: null,
        lastFetch: now
      })

      console.log('Featured models fetched successfully:', items.length)
      return items
    } catch (error) {
      console.error('Failed to fetch featured models:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch featured models'

      set(featuredModelsAtom, {
        ...currentState,
        isLoading: false,
        error: errorMessage
      })

      throw error
    }
  }
)

// 刷新精选工作流数据
export const refreshFeaturedWorkflowsAtom = atom(
  null,
  async (_, set) => {
    return set(fetchFeaturedWorkflowsAtom, true)
  }
)

// 刷新精选模型数据
export const refreshFeaturedModelsAtom = atom(
  null,
  async (_, set) => {
    return set(fetchFeaturedModelsAtom, true)
  }
)

// 清除精选数据（保留这个函数，但现在主要用于其他场景，比如数据刷新）
export const clearFeaturedDataAtom = atom(
  null,
  (_, set) => {
    set(featuredWorkflowsAtom, {
      items: [],
      isLoading: false,
      error: null,
      lastFetch: null
    })

    set(featuredModelsAtom, {
      items: [],
      isLoading: false,
      error: null,
      lastFetch: null
    })
  }
)