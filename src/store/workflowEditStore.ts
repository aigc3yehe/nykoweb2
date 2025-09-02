import { atom } from 'jotai'
import { workflowsApi } from '../services/api/workflows'
import type { UpdateWorkflowRequest, WorkflowDto } from '../services/api'
import { userStateAtom } from './loginStore'

// 工作流编辑表单状态
export interface WorkflowEditForm {
  name: string
  description: string
  prompt: string
  cover: string
  referenceImages: string[]
}

// 原始工作流数据，用于比较变化
export interface OriginalWorkflowData {
  name: string
  description: string
  prompt: string
  cover: string
  referenceImages: string[]
}

// 工作流编辑状态
export interface WorkflowEditState {
  form: WorkflowEditForm
  originalData: OriginalWorkflowData | null
  isLoading: boolean
  error: string | null
  isUpdating: boolean
  updateError: string | null
}

// 初始表单状态
const initialForm: WorkflowEditForm = {
  name: '',
  description: '',
  prompt: '',
  cover: '',
  referenceImages: []
}

// 初始编辑状态
const initialState: WorkflowEditState = {
  form: initialForm,
  originalData: null,
  isLoading: false,
  error: null,
  isUpdating: false,
  updateError: null
}

// 工作流编辑状态原子
export const workflowEditAtom = atom<WorkflowEditState>(initialState)

// 初始化编辑表单的原子
export const initEditFormAtom = atom(
  null,
  (_, set, workflow: WorkflowDto) => {
    const formData = {
      name: workflow.name || '',
      description: workflow.description || '',
      prompt: workflow.prompt || '',
      cover: workflow.cover || '',
      referenceImages: workflow.reference_images || []
    }

    set(workflowEditAtom, {
      ...initialState,
      form: formData,
      originalData: formData // 保存原始数据用于比较
    })
  }
)

// 更新表单字段的原子
export const updateEditFormAtom = atom(
  null,
  (_, set, updates: Partial<WorkflowEditForm>) => {
    set(workflowEditAtom, prev => ({
      ...prev,
      form: { ...prev.form, ...updates }
    }))
  }
)

// 重置编辑表单的原子
export const resetEditFormAtom = atom(
  null,
  (_, set) => {
    set(workflowEditAtom, initialState)
  }
)

// 比较字段变化的辅助函数
const getChangedFields = (current: WorkflowEditForm, original: OriginalWorkflowData): Partial<UpdateWorkflowRequest> => {
  const changes: Partial<UpdateWorkflowRequest> = {}

  // 比较 name
  if (current.name.trim() !== original.name.trim()) {
    changes.name = current.name.trim()
  }

  // 比较 description
  if (current.description.trim() !== original.description.trim()) {
    changes.description = current.description.trim() || undefined
  }

  // 比较 prompt
  if (current.prompt.trim() !== original.prompt.trim()) {
    changes.prompt = current.prompt.trim()
  }

  // 比较 cover
  if (current.cover !== original.cover) {
    // 如果当前是空字符串，明确发送空字符串表示清空封面图片
    // 如果当前有图片URL，发送图片URL
    changes.cover = current.cover
  }

  // 比较 reference_images
  const currentRefImages = current.referenceImages || []
  const originalRefImages = original.referenceImages || []
  if (JSON.stringify(currentRefImages) !== JSON.stringify(originalRefImages)) {
    // 如果当前是空数组，明确发送空数组表示清空参考图片
    // 如果当前有图片，发送图片数组
    changes.reference_images = currentRefImages
  }

  return changes
}

// 更新工作流的原子
export const updateWorkflowAtom = atom(
  null,
  async (get, set, { workflowId, onSuccess }: { workflowId: number; onSuccess?: () => void }) => {
    const state = get(workflowEditAtom)
    const userState = get(userStateAtom)

    // 检查用户是否已登录
    if (!userState.isAuthenticated || !userState.userDetails?.did) {
      set(workflowEditAtom, prev => ({
        ...prev,
        updateError: 'User not authenticated'
      }))
      return false
    }

    // 检查必填字段
    if (!state.form.name.trim() || !state.form.prompt.trim()) {
      set(workflowEditAtom, prev => ({
        ...prev,
        updateError: 'Name and prompt are required'
      }))
      return false
    }

    // 检查是否有字段变化
    if (!state.originalData) {
      set(workflowEditAtom, prev => ({
        ...prev,
        updateError: 'Original data not available'
      }))
      return false
    }

    const changedFields = getChangedFields(state.form, state.originalData)

    // 如果没有字段变化，直接返回成功
    if (Object.keys(changedFields).length === 0) {
      if (onSuccess) {
        onSuccess()
      }
      return true
    }

    set(workflowEditAtom, prev => ({
      ...prev,
      isUpdating: true,
      updateError: null
    }))

    try {
      const updateRequest: UpdateWorkflowRequest = {
        user: userState.userDetails.did,
        ...changedFields
      }

      const success = await workflowsApi.updateWorkflow(workflowId, updateRequest)

      if (success) {
        set(workflowEditAtom, prev => ({
          ...prev,
          isUpdating: false,
          updateError: null
        }))

        // 调用成功回调
        if (onSuccess) {
          onSuccess()
        }

        return true
      } else {
        throw new Error('Update failed')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update workflow'

      set(workflowEditAtom, prev => ({
        ...prev,
        isUpdating: false,
        updateError: errorMessage
      }))

      return false
    }
  }
)

// 清除更新错误的原子
export const clearUpdateErrorAtom = atom(
  null,
  (_, set) => {
    set(workflowEditAtom, prev => ({
      ...prev,
      updateError: null
    }))
  }
)

// 验证表单的原子
export const validateEditFormAtom = atom(
  (get) => {
    const state = get(workflowEditAtom)
    const errors: string[] = []

    if (!state.form.name.trim()) {
      errors.push('Name is required')
    }

    if (!state.form.prompt.trim()) {
      errors.push('Prompt is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
)
