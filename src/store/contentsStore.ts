import { atom } from 'jotai'
import { contentsApi } from '../services/api/contents'
import { userStateAtom } from './loginStore'

// 内容项类型
export interface ContentItem {
  content_id: number
  source_id?: number
  flag?: string
  version?: number
  task_id?: string
  url?: string
  width?: number
  height?: number
  state?: number // 0: 等待, 1: 成功, 2: 失败
  public?: number // 0: 私有, 1: 公开, -1: 管理员隐藏
  user?: {
    did?: string
    name?: string
    avatar?: string
    email?: string
  }
  source?: 'model' | 'workflow'
  is_liked?: boolean
  type?: 'image' | 'video' | 'audio' | 'text'
  like_count?: number
  created_at?: string
}

// 内容列表响应
export interface ContentsListResponse {
  contents?: ContentItem[]
  total_count?: number
}

// 排序字段类型
export type ContentOrderType = 'created_at' | 'updated_at' | 'id' | 'like_count'

// 内容状态过滤
export type ContentStateFilter = 'success' | 'pending' | 'failed'

// 内容类型过滤
export type ContentTypeFilter = 'image' | 'video' | 'audio' | 'text' | 'all'

// 内容列表状态
export interface ContentsState {
  items: ContentItem[]
  totalCount: number
  page: number
  pageSize: number
  order: ContentOrderType
  desc: 'desc' | 'asc'
  typeFilter: ContentTypeFilter
  isLoading: boolean
  error: string | null
  hasMore: boolean
  lastFetch: number | null
  source: 'model' | 'workflow'
  source_id: number
}

// 初始状态
const initialState: ContentsState = {
  items: [],
  totalCount: 0,
  page: 1,
  pageSize: 20,
  order: 'created_at',
  desc: 'desc',
  typeFilter: 'all',
  isLoading: false,
  error: null,
  hasMore: true,
  lastFetch: null,
  source: 'model',
  source_id: 0
}

// 内容列表状态atom
export const contentsAtom = atom<ContentsState>(initialState)

// 缓存有效期：2分钟
const CACHE_DURATION = 2 * 60 * 1000

/**
 * 获取内容列表的atom
 * @param options.disableCache 是否禁用缓存，true 时每次都强制请求接口
 */
export const fetchContentsAtom = atom(
  null,
  async (get, set, options: {
    reset?: boolean
    typeFilter?: ContentTypeFilter
    order?: ContentOrderType
    desc?: 'desc' | 'asc'
    source?: 'model' | 'workflow'
    source_id?: number
    disableCache?: boolean
    silentRefresh?: boolean // 新增：静默刷新标志
  } = {}) => {
    //const userState = get(userStateAtom)
    const currentState = get(contentsAtom)

    const {
      reset = false,
      typeFilter = currentState.typeFilter,
      order = currentState.order,
      desc = currentState.desc,
      source,
      source_id,
      disableCache = false,
      silentRefresh = false
    } = options

    // 如果是新的筛选条件，重置状态
    const shouldReset = reset ||
                       typeFilter !== currentState.typeFilter ||
                       order !== currentState.order ||
                       desc !== currentState.desc ||
                       source !== currentState.source ||
                       source_id !== currentState.source_id

    // 检查缓存（仅在重置且参数相同时使用缓存）
    const now = Date.now()
    const cacheValid = shouldReset && // 只有重置时才考虑缓存
                      !disableCache &&
                      currentState.lastFetch &&
                      (now - currentState.lastFetch) < CACHE_DURATION &&
                      typeFilter === currentState.typeFilter &&
                      order === currentState.order &&
                      desc === currentState.desc &&
                      source === currentState.source &&
                      source_id === currentState.source_id

    console.log('Contents: Cache check -', {
      shouldReset,
      cacheValid,
      hasExistingData: currentState.items.length > 0,
      willUseCache: cacheValid && currentState.items.length > 0
    })

    if (cacheValid && currentState.items.length > 0) {
      console.log('Contents: Using cached data')
      return currentState.items
    }

    // 静默刷新时获取第1页，其他情况按原逻辑
    const newPage = shouldReset ? 1 : (silentRefresh ? 1 : currentState.page)
    const existingItems = shouldReset ? [] : currentState.items

    console.log('Contents: Fetching page', newPage, shouldReset ? '(reset)' : (silentRefresh ? '(silent refresh)' : '(load more)'), { typeFilter })

    // 设置加载状态
    set(contentsAtom, {
      ...currentState,
      isLoading: true,
      error: null,
      page: newPage,
      typeFilter,
      order,
      desc,
      source: source || currentState.source,
      source_id: source_id || currentState.source_id, 
      items: existingItems
    })

    try {
      // 构建查询参数
      const params: any = {
        page: newPage,
        page_size: currentState.pageSize,
        order,
        desc,
        view: true, // 只获取公开可见的内容
        state: 'success' // 只获取生成成功的内容
      }

      // 添加类型过滤（除了 'all'）
      if (typeFilter !== 'all') {
        params.type = typeFilter
      }
      // 新增：透传 source/source_id
      if (source) params.source = source
      if (source_id) params.source_id = source_id

      // 调用API
      const response = await contentsApi.getContentsList(params)

      const newItems = response.contents || []
      const totalCount = response.total_count || 0
      
      // 合并内容时进行去重
      let allItems: ContentItem[]
      if (shouldReset) {
        allItems = newItems
      } else if (silentRefresh) {
        // 静默刷新：将新内容（第1页）与现有内容合并并去重
        const existingIds = new Set(existingItems.map(item => item.content_id))
        const uniqueNewItems = newItems.filter(item => !existingIds.has(item.content_id))
        console.log('Contents: Silent refresh - existing:', existingItems.length, 'new:', newItems.length, 'unique new:', uniqueNewItems.length)
        allItems = [...uniqueNewItems, ...existingItems]
      } else {
        // 普通加载更多：直接追加到后面
        allItems = [...existingItems, ...newItems]
      }
      
      const hasMore = allItems.length < totalCount

      console.log('Contents: Loaded', newItems.length, 'items, total:', allItems.length, '/', totalCount, 'hasMore:', hasMore)

      set(contentsAtom, {
        ...currentState,
        items: allItems,
        totalCount,
        page: silentRefresh ? currentState.page : (newPage + 1), // 静默刷新时保持当前页码，其他情况准备下一页
        typeFilter,
        order,
        desc,
        source: source || currentState.source,
        source_id: source_id || currentState.source_id,
        isLoading: false,
        error: null,
        hasMore: hasMore,
        lastFetch: shouldReset ? now : currentState.lastFetch // 只有重置时才更新缓存时间
      })

      return allItems
    } catch (error) {
      console.error('Contents: Failed to fetch contents:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch contents'

      set(contentsAtom, {
        ...currentState,
        isLoading: false,
        error: errorMessage
      })

      throw error
    }
  }
)

// 按类型筛选内容
export const filterContentsByTypeAtom = atom(
  null,
  async (_, set, typeFilter: ContentTypeFilter) => {
    return set(fetchContentsAtom, { reset: true, typeFilter })
  }
)

// 加载更多内容
export const loadMoreContentsAtom = atom(
  null,
  async (get, set) => {
    const currentState = get(contentsAtom)

    if (currentState.hasMore && !currentState.isLoading) {
      console.log('Contents: Loading more...', 'page', currentState.page)
      return set(fetchContentsAtom, { reset: false })
    } else {
      console.log('Contents: Cannot load more -',
        currentState.hasMore ? 'already loading' : 'no more items')
    }
  }
)

// 刷新内容列表
export const refreshContentsAtom = atom(
  null,
  async (_, set) => {
    return set(fetchContentsAtom, { reset: true })
  }
)

// 重置内容列表
export const resetContentsAtom = atom(
  null,
  (_, set) => {
    set(contentsAtom, initialState)
  }
)

// 点赞内容
export const likeContentAtom = atom(
  null,
  async (get, set, contentId: number, isLiked: boolean) => {
    const userState = get(userStateAtom)

    if (!userState.isAuthenticated) {
      throw new Error('User not authenticated')
    }

    try {
      await contentsApi.likeContent(contentId, { is_liked: isLiked })

      // 更新本地状态
      const currentState = get(contentsAtom)
      const updatedItems = currentState.items.map(item => {
        if (item.content_id === contentId) {
          return {
            ...item,
            is_liked: isLiked,
            like_count: isLiked
              ? (item.like_count || 0) + 1
              : Math.max((item.like_count || 0) - 1, 0)
          }
        }
        return item
      })

      set(contentsAtom, {
        ...currentState,
        items: updatedItems
      })

      return true
    } catch (error) {
      console.error('Failed to like content:', error)
      throw error
    }
  }
)