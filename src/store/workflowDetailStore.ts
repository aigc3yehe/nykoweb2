import { atom } from 'jotai'
import { workflowsApi } from '../services/api/workflows'
import type { WorkflowDto } from '../services/api/types'
import { userStateAtom } from './loginStore'

// 工作流详情状态
export interface WorkflowDetailState {
  workflow: WorkflowDto | null
  isLoading: boolean
  error: string | null
}

// 工作流详情原子
export const workflowDetailAtom = atom<WorkflowDetailState>({
  workflow: null,
  isLoading: false,
  error: null
})

// 获取工作流详情的原子
export const fetchWorkflowDetailAtom = atom(
  null,
  async (get, set, { workflowId, refresh = false }: { workflowId: number; refresh?: boolean }) => {
    set(workflowDetailAtom, prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const workflow = await workflowsApi.getWorkflowById(workflowId, refresh)
      set(workflowDetailAtom, {
        workflow: workflow,
        isLoading: false,
        error: null
      })

      // 已登录，静默刷新点赞状态
      const userState = get(userStateAtom)
      if (userState.isAuthenticated) {
        try {
          const like = await workflowsApi.getWorkflowLikeStatus(workflowId)
          set(workflowDetailAtom, prev => ({
            ...prev,
            workflow: prev.workflow ? { ...prev.workflow, is_liked: like.is_liked } : prev.workflow
          }))
        } catch (e) {
          // 静默失败
          console.warn('Failed to refresh workflow like status silently:', e)
        }
      }
      return workflow
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch workflow detail'
      set(workflowDetailAtom, prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage
      }))
      throw error
    }
  }
)

// 清除工作流详情的原子
export const clearWorkflowDetailAtom = atom(
  null,
  (_, set) => {
    set(workflowDetailAtom, {
      workflow: null,
      isLoading: false,
      error: null
    })
  }
)

// 点赞/取消点赞（乐观更新）
export const toggleLikeWorkflowAtom = atom(
  null,
  async (get, set, workflowId: number) => {
    const state = get(workflowDetailAtom)
    if (!state.workflow) return

    const isLiked = !!state.workflow.is_liked
    const currentCount = state.workflow.like_count || 0

    // 乐观更新
    set(workflowDetailAtom, prev => ({
      ...prev,
      workflow: prev.workflow
        ? {
            ...prev.workflow,
            is_liked: !isLiked,
            like_count: !isLiked ? currentCount + 1 : Math.max(currentCount - 1, 0)
          }
        : prev.workflow
    }))

    try {
      await workflowsApi.likeWorkflow(workflowId, { is_liked: !isLiked })
    } catch (e) {
      // 回滚
      set(workflowDetailAtom, prev => ({
        ...prev,
        workflow: prev.workflow
          ? {
              ...prev.workflow,
              is_liked: isLiked,
              like_count: currentCount
            }
          : prev.workflow
      }))
      throw e
    }
  }
)