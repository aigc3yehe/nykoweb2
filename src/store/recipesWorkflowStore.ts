import { atom } from 'jotai'
import { workflowsApi } from '../services/api/workflows'
import type { WorkflowDto } from '../services/api/types'

// 工作流列表状态
export interface RecipesWorkflowsState {
  items: WorkflowDto[]
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
const initialState: RecipesWorkflowsState = {
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

// 工作流列表状态atom
export const recipesWorkflowsAtom = atom<RecipesWorkflowsState>(initialState)

// 缓存有效期：2分钟
const CACHE_DURATION = 2 * 60 * 1000

// 获取工作流列表的atom
export const fetchRecipesWorkflowsAtom = atom(
  null,
  async (get, set, options: {
    reset?: boolean
    order?: 'created_at' | 'updated_at' | 'usage'
    desc?: 'desc' | 'asc'
  } = {}) => {
    const currentState = get(recipesWorkflowsAtom)

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
      console.log('RecipesWorkflows: Using cached data')
      return currentState.items
    }

    const newPage = shouldReset ? 1 : currentState.page
    const existingItems = shouldReset ? [] : currentState.items

    console.log('RecipesWorkflows: Fetching page', newPage, shouldReset ? '(reset)' : '(load more)', { order, desc })

    // 设置加载状态
    set(recipesWorkflowsAtom, {
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
        view: true // 只获取公开可见的工作流
      }

      // 调用新的 API
      const response = await workflowsApi.getWorkflowsList(params)

      const newItems = response.workflows || []
      const totalCount = response.total_count || 0
      const allItems = shouldReset ? newItems : [...existingItems, ...newItems]
      const hasMore = allItems.length < totalCount

      console.log('RecipesWorkflows: Loaded', newItems.length, 'items, total:', allItems.length, '/', totalCount, 'hasMore:', hasMore)

      set(recipesWorkflowsAtom, {
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
      console.error('RecipesWorkflows: Failed to fetch workflows:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch workflows'

      set(recipesWorkflowsAtom, {
        ...currentState,
        isLoading: false,
        error: errorMessage
      })

      throw error
    }
  }
)

// 加载更多工作流
export const loadMoreRecipesWorkflowsAtom = atom(
  null,
  async (get, set) => {
    const currentState = get(recipesWorkflowsAtom)

    if (currentState.hasMore && !currentState.isLoading) {
      console.log('RecipesWorkflows: Loading more...', 'page', currentState.page)
      return set(fetchRecipesWorkflowsAtom, { reset: false })
    } else {
      console.log('RecipesWorkflows: Cannot load more -',
        currentState.hasMore ? 'already loading' : 'no more items')
    }
  }
)

// 刷新工作流列表
export const refreshRecipesWorkflowsAtom = atom(
  null,
  async (_, set) => {
    return set(fetchRecipesWorkflowsAtom, { reset: true })
  }
)

// 重置工作流列表
export const resetRecipesWorkflowsAtom = atom(
  null,
  (_, set) => {
    set(recipesWorkflowsAtom, initialState)
  }
)