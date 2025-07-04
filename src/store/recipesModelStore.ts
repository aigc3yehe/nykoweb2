import { atom } from 'jotai'
import { modelsApi } from '../services/api/models'
import type { FetchModelDto } from '../services/api/types'

// 模型列表状态
export interface RecipesModelsState {
  items: FetchModelDto[]
  totalCount: number
  page: number
  pageSize: number
  order: 'created_at' | 'updated_at' | 'usage'
  desc: 'desc' | 'asc'
  isLoading: boolean
  error: string | null
  hasMore: boolean
  lastFetch: number | null
}

// 初始状态
const initialState: RecipesModelsState = {
  items: [],
  totalCount: 0,
  page: 1,
  pageSize: 20,
  order: 'created_at',
  desc: 'desc',
  isLoading: false,
  error: null,
  hasMore: true,
  lastFetch: null
}

// 模型列表状态atom
export const recipesModelsAtom = atom<RecipesModelsState>(initialState)

// 缓存有效期：2分钟
const CACHE_DURATION = 2 * 60 * 1000

// 获取模型列表的atom
export const fetchRecipesModelsAtom = atom(
  null,
  async (get, set, options: {
    reset?: boolean
    order?: 'created_at' | 'updated_at' | 'usage'
    desc?: 'desc' | 'asc'
  } = {}) => {
    const currentState = get(recipesModelsAtom)

    const {
      reset = false,
      order = currentState.order,
      desc = currentState.desc
    } = options

    // 如果是新的排序条件，重置状态
    const shouldReset = reset ||
                       order !== currentState.order ||
                       desc !== currentState.desc

    // 检查缓存（仅在重置且参数相同时使用缓存）
    const now = Date.now()
    const cacheValid = shouldReset &&
                      currentState.lastFetch &&
                      (now - currentState.lastFetch) < CACHE_DURATION &&
                      order === currentState.order &&
                      desc === currentState.desc

    if (cacheValid && currentState.items.length > 0) {
      console.log('RecipesModels: Using cached data')
      return currentState.items
    }

    const newPage = shouldReset ? 1 : currentState.page
    const existingItems = shouldReset ? [] : currentState.items

    console.log('RecipesModels: Fetching page', newPage, shouldReset ? '(reset)' : '(load more)', { order, desc })

    // 设置加载状态
    set(recipesModelsAtom, {
      ...currentState,
      isLoading: true,
      error: null,
      page: newPage,
      order,
      desc,
      items: existingItems
    })

    try {
      // 构建查询参数
      const params: any = {
        page: newPage,
        page_size: currentState.pageSize,
        order,
        desc,
        view: true // 只获取公开可见的模型
      }

      // 调用新的 API
      const response = await modelsApi.getModelsList(params)

      const newItems = response.models || []
      const totalCount = response.total_count || 0
      const allItems = shouldReset ? newItems : [...existingItems, ...newItems]
      const hasMore = allItems.length < totalCount

      console.log('RecipesModels: Loaded', newItems.length, 'items, total:', allItems.length, '/', totalCount, 'hasMore:', hasMore)

      set(recipesModelsAtom, {
        ...currentState,
        items: allItems,
        totalCount,
        page: newPage + 1,
        order,
        desc,
        isLoading: false,
        error: null,
        hasMore: hasMore,
        lastFetch: shouldReset ? now : currentState.lastFetch
      })

      return allItems
    } catch (error) {
      console.error('RecipesModels: Failed to fetch models:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch models'

      set(recipesModelsAtom, {
        ...currentState,
        isLoading: false,
        error: errorMessage
      })

      throw error
    }
  }
)

// 加载更多模型
export const loadMoreRecipesModelsAtom = atom(
  null,
  async (get, set) => {
    const currentState = get(recipesModelsAtom)

    if (currentState.hasMore && !currentState.isLoading) {
      console.log('RecipesModels: Loading more...', 'page', currentState.page)
      return set(fetchRecipesModelsAtom, { reset: false })
    } else {
      console.log('RecipesModels: Cannot load more -',
        currentState.hasMore ? 'already loading' : 'no more items')
    }
  }
)

// 刷新模型列表
export const refreshRecipesModelsAtom = atom(
  null,
  async (_, set) => {
    return set(fetchRecipesModelsAtom, { reset: true })
  }
)

// 重置模型列表
export const resetRecipesModelsAtom = atom(
  null,
  (_, set) => {
    set(recipesModelsAtom, initialState)
  }
)