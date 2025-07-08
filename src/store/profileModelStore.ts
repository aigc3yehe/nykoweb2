import { atom } from 'jotai'
import { modelsApi } from '../services/api/models'
import { userStateAtom } from './loginStore'
import type { FetchModelDto } from '../services/api/types'

// 时间分组类型
export interface TimeGroup {
  groupKey: string
  groupLabel: string
  models: FetchModelDto[]
}

// 个人模型状态
export interface ProfileModelsState {
  publishedGroups: TimeGroup[]
  likedGroups: TimeGroup[]
  totalPublished: number
  totalLiked: number
  pageSize: number
  publishedCurrentPage: number
  likedCurrentPage: number
  publishedHasMore: boolean
  likedHasMore: boolean
  isLoading: boolean
  error: string | null
  lastFetch: number | null
}

const initialState: ProfileModelsState = {
  publishedGroups: [],
  likedGroups: [],
  totalPublished: 0,
  totalLiked: 0,
  pageSize: 10,
  publishedCurrentPage: 1,
  likedCurrentPage: 1,
  publishedHasMore: true,
  likedHasMore: true,
  isLoading: false,
  error: null,
  lastFetch: null
}

export const profileModelsAtom = atom<ProfileModelsState>(initialState)

const CACHE_DURATION = 5 * 60 * 1000

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

const groupModelsByTime = (models: FetchModelDto[]): TimeGroup[] => {
  const groups: { [key: string]: FetchModelDto[] } = {}
  models.forEach(model => {
    if (!model.created_at) return // 跳过没有创建时间的项目
    const createdDate = new Date(model.created_at)
    const dateKey = createdDate.toDateString()
    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(model)
  })
  return Object.entries(groups)
    .map(([dateKey, models]) => ({
      groupKey: dateKey,
      groupLabel: getTimeGroupLabel(new Date(dateKey)),
      models: models.sort((a, b) => {
        const aTime = a.created_at ? new Date(a.created_at).getTime() : 0
        const bTime = b.created_at ? new Date(b.created_at).getTime() : 0
        return bTime - aTime
      })
    }))
    .sort((a, b) => new Date(b.groupKey).getTime() - new Date(a.groupKey).getTime())
}

// 合并分组数据
const mergeGroupedModels = (existingGroups: TimeGroup[], newGroups: TimeGroup[]): TimeGroup[] => {
  const groupsMap = new Map<string, FetchModelDto[]>()
  
  // 添加现有模型
  existingGroups.forEach(group => {
    groupsMap.set(group.groupKey, [...group.models])
  })
  
  // 添加新模型，避免重复
  newGroups.forEach(group => {
    const existing = groupsMap.get(group.groupKey) || []
    const existingIds = new Set(existing.map(item => item.model_id))
    const newItems = group.models.filter(item => !existingIds.has(item.model_id))
    groupsMap.set(group.groupKey, [...existing, ...newItems])
  })
  
  // 重新分组并排序
  const allModels: FetchModelDto[] = []
  groupsMap.forEach(models => {
    allModels.push(...models)
  })
  
  return groupModelsByTime(allModels)
}

export const fetchPublishedModelsAtom = atom(
  null,
  async (get, set, options: { reset?: boolean } = {}) => {
    const userState = get(userStateAtom)
    const currentState = get(profileModelsAtom)
    if (!userState.isAuthenticated || !userState.user) {
      console.warn('ProfileModels: User not authenticated')
      return
    }
    const { reset = false } = options
    const now = Date.now()
    
    // 缓存检查（仅在重置时检查）
    if (reset) {
      const cacheValid = currentState.lastFetch &&
        (now - currentState.lastFetch) < CACHE_DURATION &&
        currentState.publishedGroups.length > 0
      if (cacheValid) {
        console.log('ProfileModels: Using cached published models')
        return currentState.publishedGroups
      }
    }
    
    const currentPage = reset ? 1 : currentState.publishedCurrentPage
    
    set(profileModelsAtom, {
      ...currentState,
      isLoading: true,
      error: null
    })
    
    try {
      const params = {
        // user_did: userState.user.tokens.did,
        page: currentPage,
        page_size: currentState.pageSize,
        order: 'created_at' as const,
        desc: 'desc' as const
      }
      const response = await modelsApi.getModelsList(params)
      const models = response.models || []
      const newGroups = groupModelsByTime(models)
      
      const hasMore = models.length === currentState.pageSize && (currentPage * currentState.pageSize) < (response.total_count || 0)
      const finalGroups = reset ? newGroups : mergeGroupedModels(currentState.publishedGroups, newGroups)
      
      set(profileModelsAtom, {
        ...currentState,
        publishedGroups: finalGroups,
        totalPublished: response.total_count || 0,
        publishedCurrentPage: currentPage + 1,
        publishedHasMore: hasMore,
        isLoading: false,
        error: null,
        lastFetch: now
      })
      return finalGroups
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch models'
      set(profileModelsAtom, {
        ...currentState,
        isLoading: false,
        error: errorMessage
      })
      throw error
    }
  }
)

export const fetchLikedModelsAtom = atom(
  null,
  async (get, set, options: { reset?: boolean } = {}) => {
    const userState = get(userStateAtom)
    const currentState = get(profileModelsAtom)
    if (!userState.isAuthenticated || !userState.user) {
      console.warn('ProfileModels: User not authenticated')
      return
    }
    const { reset = false } = options
    
    set(profileModelsAtom, {
      ...currentState,
      isLoading: true,
      error: null
    })
    
    try {
      // TODO: 获取用户点赞的模型API
      const likedGroups: TimeGroup[] = []
      set(profileModelsAtom, {
        ...currentState,
        likedGroups,
        totalLiked: 0,
        likedCurrentPage: 1,
        likedHasMore: false,
        isLoading: false,
        error: null
      })
      return likedGroups
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch liked models'
      set(profileModelsAtom, {
        ...currentState,
        isLoading: false,
        error: errorMessage
      })
      throw error
    }
  }
)

// 加载更多模型
export const loadMorePublishedModelsAtom = atom(
  null,
  async (get, set) => {
    const currentState = get(profileModelsAtom)
    if (currentState.publishedHasMore && !currentState.isLoading) {
      console.log('ProfileModels: Loading more published models')
      return set(fetchPublishedModelsAtom, { reset: false })
    }
  }
)

export const refreshProfileModelsAtom = atom(
  null,
  async (_, set) => {
    return Promise.all([
      set(fetchPublishedModelsAtom, { reset: true }),
      set(fetchLikedModelsAtom, { reset: true })
    ])
  }
)

export const resetProfileModelsAtom = atom(
  null,
  (_, set) => {
    set(profileModelsAtom, initialState)
  }
) 