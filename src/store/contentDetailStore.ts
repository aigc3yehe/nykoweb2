import { atom } from 'jotai'
import { contentsApi } from '../services/api/contents'
import type { Content } from '../services/api/types'
import { userStateAtom, showLoginModalAtom } from './loginStore'

// 内容详情状态
export interface ContentDetailState {
  isOpen: boolean
  id: number
  content: Content | null
  isLoading: boolean
  error: string | null
}

// 初始状态
const initialState: ContentDetailState = {
  isOpen: false,
  id: 0,
  content: null,
  isLoading: false,
  error: null
}

// 内容详情状态atom
export const contentDetailAtom = atom<ContentDetailState>(initialState)

// 打开内容详情（仅当 state 为 0 时强制刷新）
export const openContentDetailAtom = atom(
  null,
  async (
    get,
    set,
    payload: number | { id: number; state?: number }
  ) => {
    const contentId = typeof payload === 'number' ? payload : payload.id
    const incomingState = typeof payload === 'number' ? undefined : payload.state
    const currentState = get(contentDetailAtom)

    // 设置加载状态
    set(contentDetailAtom, {
      ...currentState,
      isOpen: true,
      isLoading: true,
      error: null,
      id: contentId
    })

    try {
      // 只有当生成状态为 0（等待）时才强制刷新
      const shouldRefresh = incomingState === 0
      const content = await contentsApi.getContentById(contentId, shouldRefresh)

      set(contentDetailAtom, {
        ...get(contentDetailAtom),
        content: content,
        isLoading: false,
        error: null
      })

      // 已登录状态下，静默刷新点赞状态
      const userState = get(userStateAtom)
      if (userState.isAuthenticated) {
        try {
          const likeStatus = await contentsApi.getLikeStatus(contentId)
          set(contentDetailAtom, {
            ...get(contentDetailAtom),
            content: {
              ...content,
              is_liked: likeStatus.is_liked
            }
          })
        } catch (e) {
          // 静默失败，不影响详情显示
          console.warn('Silent like status refresh failed:', e)
        }
      }
    } catch (error) {
      console.error('Failed to load content detail:', error)
      set(contentDetailAtom, {
        ...get(contentDetailAtom),
        content: null,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to load content'
      })
    }
  }
)

// 关闭内容详情
export const closeContentDetailAtom = atom(
  null,
  (_, set) => {
    set(contentDetailAtom, {
      ...initialState
    })
  }
)

// 点赞操作
export const toggleLikeContentAtom = atom(
  null,
  async (get, set, contentId: number) => {
    // 登录校验：未登录则弹出登录框并中断
    const userState = get(userStateAtom)
    if (!userState.isAuthenticated) {
      set(showLoginModalAtom)
      return
    }

    const currentState = get(contentDetailAtom)
    if (!currentState.content) return

    const isCurrentlyLiked = currentState.content.is_liked
    const currentLikeCount = currentState.content.like_count || 0

    // 乐观更新UI
    set(contentDetailAtom, {
      ...currentState,
      content: {
        ...currentState.content,
        is_liked: !isCurrentlyLiked,
        like_count: isCurrentlyLiked ? currentLikeCount - 1 : currentLikeCount + 1
      }
    })

    try {
      await contentsApi.likeContent(contentId, { is_liked: !isCurrentlyLiked })
    } catch (error) {
      // 如果失败，回滚状态
      set(contentDetailAtom, {
        ...get(contentDetailAtom),
        content: {
          ...currentState.content,
          is_liked: isCurrentlyLiked,
          like_count: currentLikeCount
        }
      })
      console.error('Failed to toggle like:', error)
    }
  }
) 