import { atom } from 'jotai'
import { modelsApi } from '../services/api/models'
import type { UpdateModelRequest, FetchModelDto } from '../services/api'
import { userStateAtom } from './loginStore'

// 模型编辑表单状态
export interface ModelEditForm {
  name: string
  description: string
  cover: string
  tags: string[]
}

// 原始模型数据，用于比较变化
export interface OriginalModelData {
  name: string
  description: string
  cover: string
  tags: string[]
}

// 模型编辑状态
export interface ModelEditState {
  form: ModelEditForm
  originalData: OriginalModelData | null
  isLoading: boolean
  error: string | null
  isUpdating: boolean
  updateError: string | null
}

// 初始表单状态
const initialForm: ModelEditForm = {
  name: '',
  description: '',
  cover: '',
  tags: []
}

// 初始编辑状态
const initialState: ModelEditState = {
  form: initialForm,
  originalData: null,
  isLoading: false,
  error: null,
  isUpdating: false,
  updateError: null
}

// 模型编辑状态原子
export const modelEditAtom = atom<ModelEditState>(initialState)

// 初始化编辑表单的原子
export const initEditFormAtom = atom(
  null,
  (_, set, model: FetchModelDto) => {
    const formData = {
      name: model.name || '',
      description: model.description || '',
      cover: model.cover || '',
      tags: model.tags || []
    }

    set(modelEditAtom, {
      ...initialState,
      form: formData,
      originalData: formData // 保存原始数据用于比较
    })
  }
)

// 更新表单字段的原子
export const updateEditFormAtom = atom(
  null,
  (_, set, updates: Partial<ModelEditForm>) => {
    set(modelEditAtom, prev => ({
      ...prev,
      form: { ...prev.form, ...updates }
    }))
  }
)

// 重置编辑表单的原子
export const resetEditFormAtom = atom(
  null,
  (_, set) => {
    set(modelEditAtom, initialState)
  }
)

// 比较字段变化的辅助函数
const getChangedFields = (current: ModelEditForm, original: OriginalModelData): Partial<UpdateModelRequest> => {
  const changes: Partial<UpdateModelRequest> = {}

  // 比较 name
  if (current.name.trim() !== original.name.trim()) {
    changes.name = current.name.trim()
  }

  // 比较 description
  if (current.description.trim() !== original.description.trim()) {
    changes.description = current.description.trim() || undefined
  }

  // 比较 cover
  if (current.cover !== original.cover) {
    // 如果当前是空字符串，明确发送空字符串表示清空封面图片
    // 如果当前有图片URL，发送图片URL
    changes.cover = current.cover
  }

  // 比较 tags
  const currentTags = current.tags || []
  const originalTags = original.tags || []
  if (JSON.stringify(currentTags) !== JSON.stringify(originalTags)) {
    // 如果当前是空数组，明确发送空数组表示清空标签
    // 如果当前有标签，发送标签数组
    changes.tags = currentTags
  }

  return changes
}

// 更新模型的原子
export const updateModelAtom = atom(
  null,
  async (get, set, { modelId, onSuccess }: { modelId: number; onSuccess?: () => void }) => {
    const state = get(modelEditAtom)
    const userState = get(userStateAtom)

    // 检查用户是否已登录
    if (!userState.isAuthenticated || !userState.userDetails?.did) {
      set(modelEditAtom, prev => ({
        ...prev,
        updateError: 'User not authenticated'
      }))
      return false
    }

    // 检查必填字段
    if (!state.form.name.trim()) {
      set(modelEditAtom, prev => ({
        ...prev,
        updateError: 'Name is required'
      }))
      return false
    }

    // 检查是否有字段变化
    if (!state.originalData) {
      set(modelEditAtom, prev => ({
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

    set(modelEditAtom, prev => ({
      ...prev,
      isUpdating: true,
      updateError: null
    }))

    try {
      const updateRequest: UpdateModelRequest = {
        user: userState.userDetails.did,
        ...changedFields
      }

      const success = await modelsApi.updateModel(modelId, updateRequest)

      if (success) {
        set(modelEditAtom, prev => ({
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
      const errorMessage = error instanceof Error ? error.message : 'Failed to update model'

      set(modelEditAtom, prev => ({
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
    set(modelEditAtom, prev => ({
      ...prev,
      updateError: null
    }))
  }
)

// 验证表单的原子
export const validateEditFormAtom = atom(
  (get) => {
    const state = get(modelEditAtom)
    const errors: string[] = []

    if (!state.form.name.trim()) {
      errors.push('Name is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
)
