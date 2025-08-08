import { atom } from 'jotai'
import { workflowsApi } from '../services/api/workflows'
import { userStateAtom } from './loginStore'
import type { WorkflowDto } from '../services/api'

// 时间分组类型
export interface TimeGroup {
  groupKey: string
  groupLabel: string
  workflows: WorkflowDto[]
}

// 个人工作流状态
export interface ProfileWorkflowsState {
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

// 初始状态
const initialState: ProfileWorkflowsState = {
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

// 个人工作流状态atom
export const profileWorkflowsAtom = atom<ProfileWorkflowsState>(initialState)

// 缓存有效期：5分钟
const CACHE_DURATION = 5 * 60 * 1000

// 时间分组工具函数
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
    // 超过30天，使用具体日期格式：19 Nov 2024
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }
}

// 分组工具函数（Liked 优先使用 liked_at）
const groupWorkflowsByTime = (workflows: WorkflowDto[]): TimeGroup[] => {
  const groups: { [key: string]: WorkflowDto[] } = {}

  workflows.forEach(workflow => {
    const ts = (workflow as any).liked_at || workflow.created_at
    if (!ts) return // 跳过没有时间的项目
    const createdDate = new Date(ts as any)
    const dateKey = createdDate.toDateString() // 用于分组的key

    if (!groups[dateKey]) {
      groups[dateKey] = []
    }
    groups[dateKey].push(workflow)
  })

  // 转换为TimeGroup数组并按时间排序
  return Object.entries(groups)
    .map(([dateKey, workflows]) => ({
      groupKey: dateKey,
      groupLabel: getTimeGroupLabel(new Date(dateKey)),
      workflows: workflows.sort((a, b) => {
        const aTs = (a as any).liked_at || a.created_at
        const bTs = (b as any).liked_at || b.created_at
        const aTime = aTs ? new Date(aTs as any).getTime() : 0
        const bTime = bTs ? new Date(bTs as any).getTime() : 0
        return bTime - aTime
      })
    }))
    .sort((a, b) =>
      new Date(b.groupKey).getTime() - new Date(a.groupKey).getTime()
    )
}

// 合并分组数据
const mergeGroupedWorkflows = (existingGroups: TimeGroup[], newGroups: TimeGroup[]): TimeGroup[] => {
  const groupsMap = new Map<string, WorkflowDto[]>()

  // 添加现有工作流
  existingGroups.forEach(group => {
    groupsMap.set(group.groupKey, [...group.workflows])
  })

  // 添加新工作流，避免重复
  newGroups.forEach(group => {
    const existing = groupsMap.get(group.groupKey) || []
    const existingIds = new Set(existing.map(item => item.workflow_id))
    const newItems = group.workflows.filter(item => !existingIds.has(item.workflow_id))
    groupsMap.set(group.groupKey, [...existing, ...newItems])
  })

  // 重新分组并排序
  const allWorkflows: WorkflowDto[] = []
  groupsMap.forEach(workflows => {
    allWorkflows.push(...workflows)
  })

  return groupWorkflowsByTime(allWorkflows)
}

// 获取用户发布的工作流
export const fetchPublishedWorkflowsAtom = atom(
  null,
  async (get, set, options: { reset?: boolean } = {}) => {
    const userState = get(userStateAtom)
    const currentState = get(profileWorkflowsAtom)

    // 检查用户登录状态
    if (!userState.isAuthenticated || !userState.user) {
      console.warn('ProfileWorkflows: User not authenticated')
      return
    }

    const { reset = false } = options

    // 检查缓存（仅在重置时检查）
    if (reset) {
      const now = Date.now()
      const cacheValid = currentState.lastFetch &&
                        (now - currentState.lastFetch) < CACHE_DURATION &&
                        currentState.publishedGroups.length > 0

      if (cacheValid) {
        console.log('ProfileWorkflows: Using cached published workflows')
        return currentState.publishedGroups
      }
    }

    const currentPage = reset ? 1 : currentState.publishedCurrentPage

    console.log('ProfileWorkflows: Fetching published workflows')

    // 设置加载状态
    set(profileWorkflowsAtom, {
      ...currentState,
      isLoading: true,
      error: null
    })

    try {
      // 调用API获取用户的工作流
      const params = {
        user: userState.user.tokens.did, // 添加用户did参数
        page: currentPage,
        page_size: currentState.pageSize,
        order: 'created_at' as const,
        desc: 'desc' as const
      }

      const response = await workflowsApi.getWorkflowsList(params)
      const workflows = response.workflows || []

      // 按时间分组
      const newGroups = groupWorkflowsByTime(workflows)

      const hasMore = workflows.length === currentState.pageSize && (currentPage * currentState.pageSize) < (response.total_count || 0)
      const finalGroups = reset ? newGroups : mergeGroupedWorkflows(currentState.publishedGroups, newGroups)

      console.log('ProfileWorkflows: Loaded and grouped', workflows.length, 'workflows into', newGroups.length, 'groups')

      set(profileWorkflowsAtom, {
        ...currentState,
        publishedGroups: finalGroups,
        totalPublished: response.total_count || 0,
        publishedCurrentPage: currentPage + 1,
        publishedHasMore: hasMore,
        isLoading: false,
        error: null,
        lastFetch: Date.now()
      })

      return finalGroups
    } catch (error) {
      console.error('ProfileWorkflows: Failed to fetch published workflows:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch workflows'

      set(profileWorkflowsAtom, {
        ...currentState,
        isLoading: false,
        error: errorMessage
      })

      throw error
    }
  }
)

// 获取用户点赞的工作流
export const fetchLikedWorkflowsAtom = atom(
  null,
  async (get, set, options: { reset?: boolean } = {}) => {
    const userState = get(userStateAtom)
    const currentState = get(profileWorkflowsAtom)

    // 检查用户登录状态
    if (!userState.isAuthenticated || !userState.user) {
      console.warn('ProfileWorkflows: User not authenticated')
      return
    }

    const { reset = false } = options
    console.log('reset', reset)


    console.log('ProfileWorkflows: Fetching liked workflows')

    // 设置加载状态
    set(profileWorkflowsAtom, {
      ...currentState,
      isLoading: true,
      error: null
    })

    try {
      const { reset = false } = options
      const currentPage = reset ? 1 : currentState.likedCurrentPage

      const response = await workflowsApi.getUserLikedWorkflows({
        page: currentPage,
        page_size: currentState.pageSize,
        order: 'created_at',
        desc: 'desc',
        user: userState.user.tokens.did
      })

      const workflows = response.workflows || []
      const newGroups = groupWorkflowsByTime(workflows)

      const accumulatedCount = (currentPage - 1) * currentState.pageSize + workflows.length
      const hasMore = accumulatedCount < (response.total_count || 0)
      const finalGroups = reset ? newGroups : mergeGroupedWorkflows(currentState.likedGroups, newGroups)

      set(profileWorkflowsAtom, {
        ...currentState,
        likedGroups: finalGroups,
        totalLiked: response.total_count || 0,
        likedCurrentPage: currentPage + 1,
        likedHasMore: hasMore,
        isLoading: false,
        error: null,
        lastFetch: Date.now()
      })

      return finalGroups
    } catch (error) {
      console.error('ProfileWorkflows: Failed to fetch liked workflows:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch liked workflows'

      set(profileWorkflowsAtom, {
        ...currentState,
        isLoading: false,
        error: errorMessage
      })

      throw error
    }
  }
)

// 加载更多发布的工作流
export const loadMorePublishedWorkflowsAtom = atom(
  null,
  async (get, set) => {
    const currentState = get(profileWorkflowsAtom)
    if (currentState.publishedHasMore && !currentState.isLoading) {
      console.log('ProfileWorkflows: Loading more published workflows')
      return set(fetchPublishedWorkflowsAtom, { reset: false })
    }
  }
)

// 刷新数据
export const refreshProfileWorkflowsAtom = atom(
  null,
  async (_, set) => {
    return Promise.all([
      set(fetchPublishedWorkflowsAtom, { reset: true }),
      set(fetchLikedWorkflowsAtom, { reset: true })
    ])
  }
)

// 重置状态
export const resetProfileWorkflowsAtom = atom(
  null,
  (_, set) => {
    set(profileWorkflowsAtom, initialState)
  }
)