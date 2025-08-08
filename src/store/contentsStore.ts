import { atom } from 'jotai'
import { contentsApi } from '../services/api/contents'
import { userStateAtom } from './loginStore'
import type {ContentQueryParams} from "../services/api";

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

// 基础内容列表状态
export interface BaseContentsState {
  items: ContentItem[]
  totalCount: number
  page: number
  pageSize: number
  order: ContentOrderType
  desc: 'desc' | 'asc'
  isLoading: boolean
  error: string | null
  hasMore: boolean
  lastFetch: number | null
}

// Inspiration Feed 状态
export interface InspirationFeedState extends BaseContentsState {
  typeFilter: ContentTypeFilter
}

// Model Gallery 状态
export interface ModelGalleryState extends BaseContentsState {
  modelId: number
}

// Workflow Gallery 状态
export interface WorkflowGalleryState extends BaseContentsState {
  workflowId: number
}

// Profile Image 状态
export interface ProfileImageState extends BaseContentsState {
  imageGroups: TimeGroup[]
}

// Profile Video 状态
export interface ProfileVideoState extends BaseContentsState {
  videoGroups: TimeGroup[]
}

// Liked Image 状态
export interface LikedImageState extends BaseContentsState {
  imageGroups: TimeGroup[]
}

// Liked Video 状态
export interface LikedVideoState extends BaseContentsState {
  videoGroups: TimeGroup[]
}

// 时间分组接口
export interface TimeGroup {
  groupKey: string
  groupLabel: string
  contents: ContentItem[]
}

// 获取时间分组标签
const getTimeGroupLabel = (date: Date): string => {
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays === 0) {
    return 'Today'
  } else if (diffDays === 1) {
    return '1 Day ago'
  } else if (diffDays <= 7) {
    return `${diffDays} Days ago`
  } else if (diffDays <= 14) {
    return '1 Week ago'
  } else if (diffDays <= 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks} Weeks ago`
  } else {
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }
}

// 按时间分组内容（默认使用 created_at）
const groupContentsByTime = (contents: ContentItem[]): TimeGroup[] => {
  const groups: { [key: string]: ContentItem[] } = {}
  contents.forEach(item => {
    if (!item.created_at) return
    const createdDate = new Date(item.created_at)
    const dateKey = createdDate.toDateString()
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(item)
  })
  return Object.entries(groups)
    .map(([dateKey, contents]) => ({
      groupKey: dateKey,
      groupLabel: getTimeGroupLabel(new Date(dateKey)),
      contents: contents.sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
        return bTime - aTime
      })
    }))
    .sort((a, b) => new Date(b.groupKey).getTime() - new Date(a.groupKey).getTime())
}

// 合并分组数据
const mergeGroupedContents = (existingGroups: TimeGroup[], newGroups: TimeGroup[]): TimeGroup[] => {
  const groupMap = new Map<string, TimeGroup>()
  existingGroups.forEach(group => {
    groupMap.set(group.groupKey, group)
  })
  
  newGroups.forEach(newGroup => {
    const oldGroup = groupMap.get(newGroup.groupKey)
    if (!oldGroup) {
      groupMap.set(newGroup.groupKey, newGroup)
    } else {
      const oldIds = new Set(oldGroup.contents.map(c => c.content_id))
      const mergedContents = [...oldGroup.contents]
      newGroup.contents.forEach(item => {
        if (!oldIds.has(item.content_id)) {
          mergedContents.push(item)
        }
      })
      groupMap.set(newGroup.groupKey, {
        ...oldGroup,
        contents: mergedContents.sort((a, b) => {
          const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
          const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
          return bTime - aTime
        })
      })
    }
  })

  return Array.from(groupMap.values()).sort(
    (a, b) => new Date(b.groupKey).getTime() - new Date(a.groupKey).getTime()
  )
}

// 初始状态
const createInitialState = <T extends BaseContentsState>(): T => ({
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
} as unknown as T)

// 三个独立的状态 atom
export const inspirationFeedAtom = atom<InspirationFeedState>({
  ...createInitialState<BaseContentsState>(),
  typeFilter: 'all'
})

export const modelGalleryAtom = atom<ModelGalleryState>({
  ...createInitialState<BaseContentsState>(),
  modelId: 0
})

export const workflowGalleryAtom = atom<WorkflowGalleryState>({
  ...createInitialState<BaseContentsState>(),
  workflowId: 0
})

// Profile 页面的独立状态 atom
export const profileImageAtom = atom<ProfileImageState>({
  ...createInitialState<BaseContentsState>(),
  imageGroups: []
})

export const profileVideoAtom = atom<ProfileVideoState>({
  ...createInitialState<BaseContentsState>(),
  videoGroups: []
})

// Liked 页面的独立状态 atom
export const likedImageAtom = atom<LikedImageState>({
  ...createInitialState<BaseContentsState>(),
  imageGroups: []
})

export const likedVideoAtom = atom<LikedVideoState>({
  ...createInitialState<BaseContentsState>(),
  videoGroups: []
})

// 缓存有效期：2分钟
const CACHE_DURATION = 2 * 60 * 1000

// Inspiration Feed 的 fetch atom
export const fetchInspirationFeedAtom = atom(
  null,
  async (get, set, options: {
    reset?: boolean
    typeFilter?: ContentTypeFilter
    order?: ContentOrderType
    desc?: 'desc' | 'asc'
    disableCache?: boolean
  } = {}) => {
    const currentState = get(inspirationFeedAtom)

    const {
      reset = false,
      typeFilter = currentState.typeFilter,
      order = currentState.order,
      desc = currentState.desc,
      disableCache = false
    } = options

    // 如果是新的筛选条件，重置状态
    const shouldReset = reset ||
        typeFilter !== currentState.typeFilter ||
        order !== currentState.order ||
        desc !== currentState.desc

    // 检查缓存 - 只有在重置且缓存有效时才使用缓存
    const now = Date.now()
    const cacheValid = shouldReset && // 只有重置时才考虑缓存
        !disableCache &&
        currentState.lastFetch &&
        (now - currentState.lastFetch) < CACHE_DURATION &&
        typeFilter === currentState.typeFilter &&
        order === currentState.order &&
        desc === currentState.desc

    console.log('InspirationFeed: Cache check -', {
      shouldReset,
      cacheValid,
      hasExistingData: currentState.items.length > 0,
      willUseCache: cacheValid && currentState.items.length > 0
    })

    if (cacheValid && currentState.items.length > 0) {
      console.log('InspirationFeed: Using cached data')
      return currentState.items
    }

    const newPage = shouldReset ? 1 : currentState.page
    const existingItems = shouldReset ? [] : currentState.items

    console.log('InspirationFeed: Fetching page', newPage, shouldReset ? '(reset)' : '(load more)', { typeFilter })

    // 设置加载状态
    set(inspirationFeedAtom, {
      ...currentState,
      isLoading: true,
      error: null,
      page: newPage,
      typeFilter,
      order,
      desc,
      items: existingItems
    })

    try {
      // 构建查询参数
      const params: ContentQueryParams = {
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

      // 调用API
      const response = await contentsApi.getContentsList(params)

      const newItems = response.contents || []
      const totalCount = response.total_count || 0
      const allItems = shouldReset ? newItems : [...existingItems, ...newItems]
      const hasMore = allItems.length < totalCount

      console.log('InspirationFeed: Loaded', newItems.length, 'items, total:', allItems.length, '/', totalCount, 'hasMore:', hasMore)

      set(inspirationFeedAtom, {
        ...currentState,
        items: allItems,
        totalCount,
        page: newPage + 1,
        typeFilter,
        order,
        desc,
        isLoading: false,
        error: null,
        hasMore: hasMore,
        lastFetch: shouldReset ? now : currentState.lastFetch
      })

      return allItems
    } catch (error) {
      console.error('InspirationFeed: Failed to fetch contents:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch contents'

      set(inspirationFeedAtom, {
        ...currentState,
        isLoading: false,
        error: errorMessage
      })

      throw error
    }
  }
)

// Model Gallery 的 fetch atom
export const fetchModelGalleryAtom = atom(
  null,
  async (get, set, options: {
    reset?: boolean
    modelId: number
    order?: ContentOrderType
    desc?: 'desc' | 'asc'
    disableCache?: boolean
  }) => {
    const currentState = get(modelGalleryAtom)

    const {
      reset = false,
      modelId,
      order = currentState.order,
      desc = currentState.desc,
      disableCache = false
    } = options

    // 如果是新的模型ID，重置状态
    const shouldReset = reset || modelId !== currentState.modelId

    // 检查缓存 - 只有在重置且缓存有效时才使用缓存
    const now = Date.now()
    const cacheValid = shouldReset && // 只有重置时才考虑缓存
        !disableCache &&
        currentState.lastFetch &&
        (now - currentState.lastFetch) < CACHE_DURATION &&
        modelId === currentState.modelId &&
        order === currentState.order &&
        desc === currentState.desc

    console.log('ModelGallery: Cache check -', {
      shouldReset,
      cacheValid,
      hasExistingData: currentState.items.length > 0,
      willUseCache: cacheValid && currentState.items.length > 0,
      modelId
    })

    if (cacheValid && currentState.items.length > 0) {
      console.log('ModelGallery: Using cached data')
      return currentState.items
    }

    const newPage = shouldReset ? 1 : currentState.page
    const existingItems = shouldReset ? [] : currentState.items

    console.log('ModelGallery: Fetching page', newPage, shouldReset ? '(reset)' : '(load more)', { modelId })

    // 设置加载状态
    set(modelGalleryAtom, {
      ...currentState,
      isLoading: true,
      error: null,
      page: newPage,
      modelId,
      order,
      desc,
      items: existingItems
    })

    try {
      // 构建查询参数
      const params: ContentQueryParams = {
        page: newPage,
        page_size: currentState.pageSize,
        order,
        desc,
        view: true,
        state: 'success',
        source: 'model',
        source_id: modelId
      }

      // 调用API
      const response = await contentsApi.getContentsList(params)

      const newItems = response.contents || []
      const totalCount = response.total_count || 0
      const allItems = shouldReset ? newItems : [...existingItems, ...newItems]
      const hasMore = allItems.length < totalCount

      console.log('ModelGallery: Loaded', newItems.length, 'items, total:', allItems.length, '/', totalCount, 'hasMore:', hasMore, 'modelId:', modelId)

      set(modelGalleryAtom, {
        ...currentState,
        items: allItems,
        totalCount,
        page: newPage + 1,
        modelId,
        order,
        desc,
        isLoading: false,
        error: null,
        hasMore: hasMore,
        lastFetch: shouldReset ? now : currentState.lastFetch
      })

      return allItems
    } catch (error) {
      console.error('ModelGallery: Failed to fetch contents:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch contents'

      set(modelGalleryAtom, {
        ...currentState,
        isLoading: false,
        error: errorMessage
      })

      throw error
    }
  }
)

// Workflow Gallery 的 fetch atom
export const fetchWorkflowGalleryAtom = atom(
  null,
  async (get, set, options: {
    reset?: boolean
    workflowId: number
    order?: ContentOrderType
    desc?: 'desc' | 'asc'
    disableCache?: boolean
  }) => {
    const currentState = get(workflowGalleryAtom)

    const {
      reset = false,
      workflowId,
      order = currentState.order,
      desc = currentState.desc,
      disableCache = false
    } = options

    // 如果是新的工作流ID，重置状态
    const shouldReset = reset || workflowId !== currentState.workflowId

    // 检查缓存 - 只有在重置且缓存有效时才使用缓存
    const now = Date.now()
    const cacheValid = shouldReset && // 只有重置时才考虑缓存
        !disableCache &&
        currentState.lastFetch &&
        (now - currentState.lastFetch) < CACHE_DURATION &&
        workflowId === currentState.workflowId &&
        order === currentState.order &&
        desc === currentState.desc

    console.log('WorkflowGallery: Cache check -', {
      shouldReset,
      cacheValid,
      hasExistingData: currentState.items.length > 0,
      willUseCache: cacheValid && currentState.items.length > 0,
      workflowId
    })

    if (cacheValid && currentState.items.length > 0) {
      console.log('WorkflowGallery: Using cached data')
      return currentState.items
    }

    const newPage = shouldReset ? 1 : currentState.page
    const existingItems = shouldReset ? [] : currentState.items

    console.log('WorkflowGallery: Fetching page', newPage, shouldReset ? '(reset)' : '(load more)', { workflowId })

    // 设置加载状态
    set(workflowGalleryAtom, {
      ...currentState,
      isLoading: true,
      error: null,
      page: newPage,
      workflowId,
      order,
      desc,
      items: existingItems
    })

    try {
      // 构建查询参数
      const params: ContentQueryParams = {
        page: newPage,
        page_size: currentState.pageSize,
        order,
        desc,
        view: true,
        state: 'success',
        source: 'workflow',
        source_id: workflowId
      }

      // 调用API
      const response = await contentsApi.getContentsList(params)

      const newItems = response.contents || []
      const totalCount = response.total_count || 0
      const allItems = shouldReset ? newItems : [...existingItems, ...newItems]
      const hasMore = allItems.length < totalCount

      console.log('WorkflowGallery: Loaded', newItems.length, 'items, total:', allItems.length, '/', totalCount, 'hasMore:', hasMore, 'workflowId:', workflowId)

      set(workflowGalleryAtom, {
        ...currentState,
        items: allItems,
        totalCount,
        page: newPage + 1,
        workflowId,
        order,
        desc,
        isLoading: false,
        error: null,
        hasMore: hasMore,
        lastFetch: shouldReset ? now : currentState.lastFetch
      })

      return allItems
    } catch (error) {
      console.error('WorkflowGallery: Failed to fetch contents:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch contents'

      set(workflowGalleryAtom, {
        ...currentState,
        isLoading: false,
        error: errorMessage
      })

      throw error
    }
  }
)

// Profile Image 的 fetch atom
export const fetchProfileImageAtom = atom(
  null,
  async (get, set, options: {
    reset?: boolean
    order?: ContentOrderType
    desc?: 'desc' | 'asc'
    disableCache?: boolean
  } = {}) => {
    const userState = get(userStateAtom)
    const currentState = get(profileImageAtom)

    if (!userState.isAuthenticated || !userState.user) {
      console.warn('ProfileImage: User not authenticated')
      return
    }

    const {
      reset = false,
      order = currentState.order,
      desc = currentState.desc,
      disableCache = false
    } = options

    // 如果是新的排序条件，重置状态
    const shouldReset = reset ||
        order !== currentState.order ||
        desc !== currentState.desc

    // 检查缓存 - 只有在重置且缓存有效时才使用缓存
    const now = Date.now()
    const cacheValid = shouldReset && // 只有重置时才考虑缓存
        !disableCache &&
        currentState.lastFetch &&
        (now - currentState.lastFetch) < CACHE_DURATION &&
        order === currentState.order &&
        desc === currentState.desc

    console.log('ProfileImage: Cache check -', {
      shouldReset,
      cacheValid,
      hasExistingData: currentState.imageGroups.length > 0,
      willUseCache: cacheValid && currentState.imageGroups.length > 0
    })

    if (cacheValid && currentState.imageGroups.length > 0) {
      console.log('ProfileImage: Using cached data')
      return currentState.imageGroups
    }

    const newPage = shouldReset ? 1 : currentState.page
    const existingGroups = shouldReset ? [] : currentState.imageGroups

    console.log('ProfileImage: Fetching page', newPage, shouldReset ? '(reset)' : '(load more)')

    // 设置加载状态
    set(profileImageAtom, {
      ...currentState,
      isLoading: true,
      error: null,
      page: newPage,
      order,
      desc,
      imageGroups: existingGroups
    })

    try {
      // 构建查询参数
      const params: ContentQueryParams = {
        page: newPage,
        page_size: currentState.pageSize,
        order,
        desc,
        type: 'image',
        user: userState.user.tokens.did, // 如果需要获取当前用户的内容
      }

      // 调用API
      const response = await contentsApi.getContentsList(params)

      const newItems = response.contents || []
      const totalCount = response.total_count || 0
      const newGroups = groupContentsByTime(newItems)
      const allGroups = shouldReset ? newGroups : mergeGroupedContents(existingGroups, newGroups)
      const hasMore = allGroups.length > 0 && newItems.length === currentState.pageSize

      console.log('ProfileImage: Loaded', newItems.length, 'items, total groups:', allGroups.length, 'hasMore:', hasMore)

      set(profileImageAtom, {
        ...currentState,
        imageGroups: allGroups,
        totalCount,
        page: newPage + 1,
        order,
        desc,
        isLoading: false,
        error: null,
        hasMore: hasMore,
        lastFetch: shouldReset ? now : currentState.lastFetch
      })

      return allGroups
    } catch (error) {
      console.error('ProfileImage: Failed to fetch contents:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch contents'

      set(profileImageAtom, {
        ...currentState,
        isLoading: false,
        error: errorMessage
      })

      throw error
    }
  }
)

// Profile Video 的 fetch atom
export const fetchProfileVideoAtom = atom(
  null,
  async (get, set, options: {
    reset?: boolean
    order?: ContentOrderType
    desc?: 'desc' | 'asc'
    disableCache?: boolean
  } = {}) => {
    const userState = get(userStateAtom)
    const currentState = get(profileVideoAtom)

    if (!userState.isAuthenticated || !userState.user) {
      console.warn('ProfileVideo: User not authenticated')
      return
    }

    const {
      reset = false,
      order = currentState.order,
      desc = currentState.desc,
      disableCache = false
    } = options

    // 如果是新的排序条件，重置状态
    const shouldReset = reset ||
        order !== currentState.order ||
        desc !== currentState.desc

    // 检查缓存 - 只有在重置且缓存有效时才使用缓存
    const now = Date.now()
    const cacheValid = shouldReset && // 只有重置时才考虑缓存
        !disableCache &&
        currentState.lastFetch &&
        (now - currentState.lastFetch) < CACHE_DURATION &&
        order === currentState.order &&
        desc === currentState.desc

    console.log('ProfileVideo: Cache check -', {
      shouldReset,
      cacheValid,
      hasExistingData: currentState.videoGroups.length > 0,
      willUseCache: cacheValid && currentState.videoGroups.length > 0
    })

    if (cacheValid && currentState.videoGroups.length > 0) {
      console.log('ProfileVideo: Using cached data')
      return currentState.videoGroups
    }

    const newPage = shouldReset ? 1 : currentState.page
    const existingGroups = shouldReset ? [] : currentState.videoGroups

    console.log('ProfileVideo: Fetching page', newPage, shouldReset ? '(reset)' : '(load more)')

    // 设置加载状态
    set(profileVideoAtom, {
      ...currentState,
      isLoading: true,
      error: null,
      page: newPage,
      order,
      desc,
      videoGroups: existingGroups
    })

    try {
      // 构建查询参数
      const params: ContentQueryParams = {
        page: newPage,
        page_size: currentState.pageSize,
        order,
        desc,
        type: 'video',
        user: userState.user.tokens.did, // 如果需要获取当前用户的内容
      }

      // 调用API
      const response = await contentsApi.getContentsList(params)

      const newItems = response.contents || []
      const totalCount = response.total_count || 0
      const newGroups = groupContentsByTime(newItems)
      const allGroups = shouldReset ? newGroups : mergeGroupedContents(existingGroups, newGroups)
      const hasMore = allGroups.length > 0 && newItems.length === currentState.pageSize

      console.log('ProfileVideo: Loaded', newItems.length, 'items, total groups:', allGroups.length, 'hasMore:', hasMore)

      set(profileVideoAtom, {
        ...currentState,
        videoGroups: allGroups,
        totalCount,
        page: newPage + 1,
        order,
        desc,
        isLoading: false,
        error: null,
        hasMore: hasMore,
        lastFetch: shouldReset ? now : currentState.lastFetch
      })

      return allGroups
    } catch (error) {
      console.error('ProfileVideo: Failed to fetch contents:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch contents'

      set(profileVideoAtom, {
        ...currentState,
        isLoading: false,
        error: errorMessage
      })

      throw error
    }
  }
)

// Liked Image 的 fetch atom
export const fetchLikedImageAtom = atom(
  null,
  async (get, set, options: {
    reset?: boolean
    order?: ContentOrderType
    desc?: 'desc' | 'asc'
    disableCache?: boolean
  } = {}) => {
    const userState = get(userStateAtom)
    const currentState = get(likedImageAtom)

    if (!userState.isAuthenticated) {
      console.warn('LikedImage: User not authenticated')
      return
    }

    const {
      reset = false,
      order = currentState.order,
      desc = currentState.desc,
      disableCache = false
    } = options

    const shouldReset = reset || order !== currentState.order || desc !== currentState.desc

    const now = Date.now()
    const cacheValid = shouldReset &&
      !disableCache &&
      currentState.lastFetch &&
      (now - currentState.lastFetch) < CACHE_DURATION &&
      order === currentState.order &&
      desc === currentState.desc

    if (cacheValid && currentState.imageGroups.length > 0) {
      return currentState.imageGroups
    }

    const newPage = shouldReset ? 1 : currentState.page
    const existingGroups = shouldReset ? [] : currentState.imageGroups

    set(likedImageAtom, {
      ...currentState,
      isLoading: true,
      error: null,
      page: newPage,
      order,
      desc,
      imageGroups: existingGroups
    })

    try {
      const response = await contentsApi.getUserLikedContents({
        page: newPage,
        page_size: currentState.pageSize,
        order,
        desc,
        type: 'image'
      })

      const newItems = response.contents || []
      // Liked 列表优先使用 liked_at 进行分组，其次回退到 created_at，再次回退当前时间
      const itemsForGrouping = newItems.map(item => {
        const ts = item.liked_at || item.created_at || new Date().toISOString()
        return { ...item, created_at: ts }
      })
      const totalCount = response.total_count || 0
      const newGroups = groupContentsByTime(itemsForGrouping)
      const allGroups = shouldReset ? newGroups : mergeGroupedContents(existingGroups, newGroups)
      const hasMore = newItems.length === currentState.pageSize

      set(likedImageAtom, {
        ...currentState,
        imageGroups: allGroups,
        totalCount,
        page: newPage + 1,
        order,
        desc,
        isLoading: false,
        error: null,
        hasMore,
        lastFetch: shouldReset ? now : currentState.lastFetch
      })

      return allGroups
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch liked images'
      set(likedImageAtom, {
        ...currentState,
        isLoading: false,
        error: errorMessage
      })
      throw error
    }
  }
)

// Liked Video 的 fetch atom
export const fetchLikedVideoAtom = atom(
  null,
  async (get, set, options: {
    reset?: boolean
    order?: ContentOrderType
    desc?: 'desc' | 'asc'
    disableCache?: boolean
  } = {}) => {
    const userState = get(userStateAtom)
    const currentState = get(likedVideoAtom)

    if (!userState.isAuthenticated) {
      console.warn('LikedVideo: User not authenticated')
      return
    }

    const {
      reset = false,
      order = currentState.order,
      desc = currentState.desc,
      disableCache = false
    } = options

    const shouldReset = reset || order !== currentState.order || desc !== currentState.desc

    const now = Date.now()
    const cacheValid = shouldReset &&
      !disableCache &&
      currentState.lastFetch &&
      (now - currentState.lastFetch) < CACHE_DURATION &&
      order === currentState.order &&
      desc === currentState.desc

    if (cacheValid && currentState.videoGroups.length > 0) {
      return currentState.videoGroups
    }

    const newPage = shouldReset ? 1 : currentState.page
    const existingGroups = shouldReset ? [] : currentState.videoGroups

    set(likedVideoAtom, {
      ...currentState,
      isLoading: true,
      error: null,
      page: newPage,
      order,
      desc,
      videoGroups: existingGroups
    })

    try {
      const response = await contentsApi.getUserLikedContents({
        page: newPage,
        page_size: currentState.pageSize,
        order,
        desc,
        type: 'video'
      })

      const newItems = response.contents || []
      // Liked 列表优先使用 liked_at 进行分组，其次回退到 created_at，再次回退当前时间
      const itemsForGrouping = newItems.map(item => {
        const ts = item.liked_at || item.created_at || new Date().toISOString()
        return { ...item, created_at: ts }
      })
      const totalCount = response.total_count || 0
      const newGroups = groupContentsByTime(itemsForGrouping)
      const allGroups = shouldReset ? newGroups : mergeGroupedContents(existingGroups, newGroups)
      const hasMore = newItems.length === currentState.pageSize

      set(likedVideoAtom, {
        ...currentState,
        videoGroups: allGroups,
        totalCount,
        page: newPage + 1,
        order,
        desc,
        isLoading: false,
        error: null,
        hasMore,
        lastFetch: shouldReset ? now : currentState.lastFetch
      })

      return allGroups
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch liked videos'
      set(likedVideoAtom, {
        ...currentState,
        isLoading: false,
        error: errorMessage
      })
      throw error
    }
  }
)

// 加载更多 Liked Image 内容
export const loadMoreLikedImageAtom = atom(
  null,
  async (get, set) => {
    const currentState = get(likedImageAtom)
    if (currentState.hasMore && !currentState.isLoading) {
      return set(fetchLikedImageAtom, { reset: false })
    }
  }
)

// 加载更多 Liked Video 内容
export const loadMoreLikedVideoAtom = atom(
  null,
  async (get, set) => {
    const currentState = get(likedVideoAtom)
    if (currentState.hasMore && !currentState.isLoading) {
      return set(fetchLikedVideoAtom, { reset: false })
    }
  }
)

// 兼容性：保留原有的 atom 名称，但指向新的实现
export const contentsAtom = inspirationFeedAtom
export const fetchContentsAtom = fetchInspirationFeedAtom

// 按类型筛选内容（用于 InspirationFeed）
export const filterContentsByTypeAtom = atom(
  null,
  async (_, set, typeFilter: ContentTypeFilter) => {
    return set(fetchInspirationFeedAtom, { reset: true, typeFilter })
  }
)

// 加载更多内容（用于 InspirationFeed）
export const loadMoreContentsAtom = atom(
  null,
  async (get, set) => {
    const currentState = get(inspirationFeedAtom)

    if (currentState.hasMore && !currentState.isLoading) {
      console.log('InspirationFeed: Loading more...', 'page', currentState.page, 'typeFilter:', currentState.typeFilter)
      return set(fetchInspirationFeedAtom, { 
        reset: false, 
        typeFilter: currentState.typeFilter 
      })
    } else {
      console.log('InspirationFeed: Cannot load more -',
          currentState.hasMore ? 'already loading' : 'no more items')
    }
  }
)

// 刷新内容列表（用于 InspirationFeed）
export const refreshContentsAtom = atom(
  null,
  async (_, set) => {
    return set(fetchInspirationFeedAtom, { reset: true })
  }
)

// 加载更多 Profile Image 内容
export const loadMoreProfileImageAtom = atom(
  null,
  async (get, set) => {
    const currentState = get(profileImageAtom)

    if (currentState.hasMore && !currentState.isLoading) {
      console.log('ProfileImage: Loading more...', 'page', currentState.page)
      return set(fetchProfileImageAtom, { reset: false })
    } else {
      console.log('ProfileImage: Cannot load more -',
          currentState.hasMore ? 'already loading' : 'no more items')
    }
  }
)

// 加载更多 Profile Video 内容
export const loadMoreProfileVideoAtom = atom(
  null,
  async (get, set) => {
    const currentState = get(profileVideoAtom)

    if (currentState.hasMore && !currentState.isLoading) {
      console.log('ProfileVideo: Loading more...', 'page', currentState.page)
      return set(fetchProfileVideoAtom, { reset: false })
    } else {
      console.log('ProfileVideo: Cannot load more -',
          currentState.hasMore ? 'already loading' : 'no more items')
    }
  }
)

// 重置内容列表
export const resetContentsAtom = atom(
  null,
  (_, set) => {
    set(inspirationFeedAtom, createInitialState<InspirationFeedState>())
    set(modelGalleryAtom, createInitialState<ModelGalleryState>())
    set(workflowGalleryAtom, createInitialState<WorkflowGalleryState>())
    set(profileImageAtom, createInitialState<ProfileImageState>())
    set(profileVideoAtom, createInitialState<ProfileVideoState>())
    set(likedImageAtom, createInitialState<LikedImageState>())
    set(likedVideoAtom, createInitialState<LikedVideoState>())
  }
)

// 点赞内容（通用，可以用于所有三个场景）
export const likeContentAtom = atom(
  null,
  async (get, set, contentId: number, isLiked: boolean) => {
    const userState = get(userStateAtom)

    if (!userState.isAuthenticated) {
      throw new Error('User not authenticated')
    }

    try {
      await contentsApi.likeContent(contentId, { is_liked: isLiked })

      // 更新所有三个状态中的对应内容
      const updateItems = (items: ContentItem[]) => 
        items.map(item => {
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

      // 更新 InspirationFeed
      const inspirationState = get(inspirationFeedAtom)
      set(inspirationFeedAtom, {
        ...inspirationState,
        items: updateItems(inspirationState.items)
      })

      // 更新 ModelGallery
      const modelState = get(modelGalleryAtom)
      set(modelGalleryAtom, {
        ...modelState,
        items: updateItems(modelState.items)
      })

      // 更新 WorkflowGallery
      const workflowState = get(workflowGalleryAtom)
      set(workflowGalleryAtom, {
        ...workflowState,
        items: updateItems(workflowState.items)
      })

      // 更新 ProfileImage
      const profileImageState = get(profileImageAtom)
      set(profileImageAtom, {
        ...profileImageState,
        imageGroups: profileImageState.imageGroups.map(group => ({
          ...group,
          contents: updateItems(group.contents)
        }))
      })

      // 更新 ProfileVideo
      const profileVideoState = get(profileVideoAtom)
      set(profileVideoAtom, {
        ...profileVideoState,
        videoGroups: profileVideoState.videoGroups.map(group => ({
          ...group,
          contents: updateItems(group.contents)
        }))
      })

      return true
    } catch (error) {
      console.error('Failed to like content:', error)
      throw error
    }
  }
)