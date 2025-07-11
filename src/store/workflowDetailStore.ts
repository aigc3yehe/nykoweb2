import { atom } from 'jotai'
import { workflowsApi } from '../services/api/workflows'
import type { WorkflowDto } from '../services/api/types'

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
  async (_, set, { workflowId, refresh = false }: { workflowId: number; refresh?: boolean }) => {
    set(workflowDetailAtom, prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const workflow = await workflowsApi.getWorkflowById(workflowId, refresh)
      set(workflowDetailAtom, {
        workflow: {
          ...workflow,
          tags: [
            "tag1",
            "tag2",
            "tag3"
          ],
        },
        isLoading: false,
        error: null
      })
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