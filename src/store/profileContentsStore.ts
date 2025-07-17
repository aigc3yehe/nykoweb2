import { atom } from 'jotai'
import { contentsApi } from '../services/api/contents'
import { userStateAtom } from './loginStore'
import type { ContentItem } from '../services/api/types'

export type ContentType = 'image' | 'video'

export interface TimeGroup {
  groupKey: string
  groupLabel: string
  contents: ContentItem[]
}

export interface ProfileContentsState {
  imageGroups: TimeGroup[]
  videoGroups: TimeGroup[]
  totalImages: number
  totalVideos: number
  imagePageSize: number
  videoPageSize: number
  imageCurrentPage: number
  videoCurrentPage: number
  imageHasMore: boolean
  videoHasMore: boolean
  isLoading: boolean
  error: string | null
  lastFetchImage: number | null
  lastFetchVideo: number | null
}

const initialState: ProfileContentsState = {
  imageGroups: [],
  videoGroups: [],
  totalImages: 0,
  totalVideos: 0,
  imagePageSize: 10,
  videoPageSize: 10,
  imageCurrentPage: 1,
  videoCurrentPage: 1,
  imageHasMore: true,
  videoHasMore: true,
  isLoading: false,
  error: null,
  lastFetchImage: null,
  lastFetchVideo: null
}

export const profileContentsAtom = atom<ProfileContentsState>(initialState)

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

const groupContentsByTime = (contents: ContentItem[]): TimeGroup[] => {
  const groups: { [key: string]: ContentItem[] } = {}
  contents.forEach(item => {
    if (!item.created_at) return // 跳过没有创建时间的项目
    const createdDate = new Date(item.created_at)
    const dateKey = createdDate.toDateString() // 统一用 toDateString()
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

// 合并分组数据，保证老 group/contents 的引用不变
const mergeGroupedContents = (existingGroups: TimeGroup[], newGroups: TimeGroup[]): TimeGroup[] => {
  // 先把现有 group 放到 map
  const groupMap = new Map<string, TimeGroup>()
  existingGroups.forEach(group => {
    groupMap.set(group.groupKey, group)
  })
  
  // 合并新 group
  newGroups.forEach(newGroup => {
    const oldGroup = groupMap.get(newGroup.groupKey)
    if (!oldGroup) {
      // 新 group，直接加
      groupMap.set(newGroup.groupKey, newGroup)
    } else {
      // 已有 group，合并 contents
      const oldIds = new Set(oldGroup.contents.map(c => c.content_id))
      const mergedContents = [...oldGroup.contents]
      newGroup.contents.forEach(item => {
        if (!oldIds.has(item.content_id)) {
          mergedContents.push(item)
        }
      })
      // 只新建 contents 数组，group 对象复用
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

  // 排序
  return Array.from(groupMap.values()).sort(
    (a, b) => new Date(b.groupKey).getTime() - new Date(a.groupKey).getTime()
  )
}

export const fetchProfileContentsAtom = atom(
  null,
  async (get, set, options: { type: ContentType, reset?: boolean } ) => {
    const userState = get(userStateAtom)
    const currentState = get(profileContentsAtom)
    if (!userState.isAuthenticated || !userState.user) {
      console.warn('ProfileContents: User not authenticated')
      return
    }
    const { type, reset = false } = options
    const now = Date.now()
    const isImage = type === 'image'
    
    // 缓存检查（仅在重置时检查）
    if (reset) {
      const cacheValid = ((isImage && currentState.lastFetchImage && (now - currentState.lastFetchImage) < CACHE_DURATION && currentState.imageGroups.length > 0) ||
        (!isImage && currentState.lastFetchVideo && (now - currentState.lastFetchVideo) < CACHE_DURATION && currentState.videoGroups.length > 0))
      if (cacheValid) {
        console.log('ProfileContents: Using cached', type)
        return isImage ? currentState.imageGroups : currentState.videoGroups
      }
    }
    
    const currentPage = reset ? 1 : (isImage ? currentState.imageCurrentPage : currentState.videoCurrentPage)
    const pageSize = isImage ? currentState.imagePageSize : currentState.videoPageSize
    
    set(profileContentsAtom, {
      ...currentState,
      isLoading: true,
      error: null
    })
    
    try {
      const params: any = {
        //user: userState.user.tokens.did,
        page: currentPage,
        page_size: pageSize,
        type
      }
      const response = await contentsApi.getContentsList(params)
      const items = response.contents || []
      const newGroups = groupContentsByTime(items)
      
      const hasMore = items.length === pageSize && (currentPage * pageSize) < (response.total_count || 0)
      
      if (isImage) {
        const finalGroups = reset ? newGroups : mergeGroupedContents(currentState.imageGroups, newGroups)
        set(profileContentsAtom, {
          ...currentState,
          imageGroups: finalGroups,
          totalImages: response.total_count || 0,
          imageCurrentPage: currentPage + 1,
          imageHasMore: hasMore,
          isLoading: false,
          error: null,
          lastFetchImage: now
        })
        return finalGroups
      } else {
        const finalGroups = reset ? newGroups : mergeGroupedContents(currentState.videoGroups, newGroups)
        set(profileContentsAtom, {
          ...currentState,
          videoGroups: finalGroups,
          totalVideos: response.total_count || 0,
          videoCurrentPage: currentPage + 1,
          videoHasMore: hasMore,
          isLoading: false,
          error: null,
          lastFetchVideo: now
        })
        return finalGroups
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch contents'
      set(profileContentsAtom, {
        ...currentState,
        isLoading: false,
        error: errorMessage
      })
      throw error
    }
  }
)

// 加载更多内容
export const loadMoreProfileContentsAtom = atom(
  null,
  async (get, set, type: ContentType) => {
    const currentState = get(profileContentsAtom)
    const hasMore = type === 'image' ? currentState.imageHasMore : currentState.videoHasMore
    
    if (hasMore && !currentState.isLoading) {
      console.log('ProfileContents: Loading more', type)
      return set(fetchProfileContentsAtom, { type, reset: false })
    }
  }
)

export const resetProfileContentsAtom = atom(
  null,
  (_, set) => {
    set(profileContentsAtom, initialState)
  }
) 