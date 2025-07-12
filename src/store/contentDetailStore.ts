import { atom } from 'jotai'
import { contentsApi } from '../services/api/contents'
import type { Content } from '../services/api/types'

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

// 打开内容详情
export const openContentDetailAtom = atom(
  null,
  async (get, set, contentId: number) => {
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
      // 调用API获取内容详情
      const content = await contentsApi.getContentById(contentId, true)
      
      set(contentDetailAtom, {
        ...get(contentDetailAtom),
        content: content,
        isLoading: false,
        error: null
      })
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
      // 这里需要调用点赞API，暂时注释
      // await contentsApi.toggleLike(contentId)
      console.log('Toggle like for content:', contentId)
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