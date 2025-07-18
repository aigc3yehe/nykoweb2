import { atom } from 'jotai'
import { dashboardApi } from '../services/api/misc'
import { workflowsApi } from '../services/api/workflows'
import type { AiProviderDto, CreateWorkflowRequest, CreateWorkflowResponse, AIProvider, AIModel } from '../services/api/types'

// 扩展的模型类型，包含provider信息
export interface ModelWithProvider {
  name: string
  provider: string
  support_input_types: string[]
  support_output_types: string[]
}

// AI提供商和模型数据
export const aiProvidersAtom = atom<AiProviderDto[]>([])
export const availableModelsAtom = atom<ModelWithProvider[]>([])
export const isLoadingProvidersAtom = atom(false)
export const providersErrorAtom = atom<string | null>(null)

// 选中的模型
export const selectedModelAtom = atom<string>('')

// 输入输出类型选项
export const availableInputTypesAtom = atom<string[]>([])
export const availableOutputTypesAtom = atom<string[]>([])

// 用户选择的输入输出类型
export const selectedInputTypeAtom = atom<string>('Image')
export const selectedOutputTypeAtom = atom<string>('Image')

// 工作流创建状态
export const isCreatingWorkflowAtom = atom(false)
export const createWorkflowErrorAtom = atom<string | null>(null)

// 工作流表单数据
export const workflowFormAtom = atom({
  name: '',
  description: '',
  prompt: '',
  referenceImages: [] as string[],
  cover: ''
})

// 获取AI提供商列表的异步action
export const fetchAiProvidersAtom = atom(
  null,
  async (_, set) => {
    set(isLoadingProvidersAtom, true)
    set(providersErrorAtom, null)
    
    try {
      const providers = await dashboardApi.getAiProviders()
      set(aiProvidersAtom, providers)
      
      // 将所有模型平铺成一个列表，并附加provider信息
      const allModels: ModelWithProvider[] = []
      providers.forEach(provider => {
        provider.models.forEach(model => {
          allModels.push({
            name: model.name,
            provider: provider.name,
            support_input_types: model.support_input_types,
            support_output_types: model.support_output_types
          })
        })
      })
      set(availableModelsAtom, allModels)
      
      // 设置默认选择
      if (allModels.length > 0) {
        const defaultModel = allModels[0]
        set(selectedModelAtom, defaultModel.name)
        set(availableInputTypesAtom, defaultModel.support_input_types)
        set(availableOutputTypesAtom, defaultModel.support_output_types)
        
        // 设置默认输入输出类型
        if (defaultModel.support_input_types.length > 0) {
          set(selectedInputTypeAtom, defaultModel.support_input_types[0])
        }
        if (defaultModel.support_output_types.length > 0) {
          set(selectedOutputTypeAtom, defaultModel.support_output_types[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch AI providers:', error)
      set(providersErrorAtom, error instanceof Error ? error.message : 'Failed to fetch AI providers')
    } finally {
      set(isLoadingProvidersAtom, false)
    }
  }
)

// 选择模型的action
export const selectModelAtom = atom(
  null,
  (get, set, modelName: string) => {
    const availableModels = get(availableModelsAtom)
    const model = availableModels.find(m => m.name === modelName)
    
    if (model) {
      set(selectedModelAtom, modelName)
      set(availableInputTypesAtom, model.support_input_types)
      set(availableOutputTypesAtom, model.support_output_types)
      
      // 重置输入输出类型选择
      if (model.support_input_types.length > 0) {
        set(selectedInputTypeAtom, model.support_input_types[0])
      }
      if (model.support_output_types.length > 0) {
        set(selectedOutputTypeAtom, model.support_output_types[0])
      }
    }
  }
)

// 更新工作流表单数据的action
export const updateWorkflowFormAtom = atom(
  null,
  (get, set, updates: Partial<{ name: string; description: string; prompt: string; referenceImages: string[]; cover: string }>) => {
    const currentForm = get(workflowFormAtom)
    set(workflowFormAtom, { ...currentForm, ...updates })
  }
)

// 创建工作流的异步action
export const createWorkflowAtom = atom(
  null,
  async (get, set, userId: string): Promise<CreateWorkflowResponse | null> => {
    set(isCreatingWorkflowAtom, true)
    set(createWorkflowErrorAtom, null)
    
    try {
      const form = get(workflowFormAtom)
      const selectedModelName = get(selectedModelAtom)
      const availableModels = get(availableModelsAtom)
      const selectedModel = availableModels.find(m => m.name === selectedModelName)
      const inputType = get(selectedInputTypeAtom)
      const outputType = get(selectedOutputTypeAtom)
      
      // 验证必填字段
      if (!form.name.trim()) {
        throw new Error('Workflow name is required')
      }
      if (!selectedModel) {
        throw new Error('Model selection is required')
      }
      
      const request: CreateWorkflowRequest = {
        name: form.name,
        description: form.description,
        user: userId,
        prompt: form.prompt,
        input_type: [inputType],
        output_type: [outputType],
        provider: selectedModel.provider as AIProvider, // 类型转换
        model: selectedModel.name as AIModel, // 类型转换
        reference_images: form.referenceImages,
        cover: form.cover || undefined
      }
      
      const response = await workflowsApi.createWorkflow(request)
      
      // 创建成功后重置表单
      set(workflowFormAtom, {
        name: '',
        description: '',
        prompt: '',
        referenceImages: [],
        cover: ''
      })
      
      return response
    } catch (error) {
      console.error('Failed to create workflow:', error)
      set(createWorkflowErrorAtom, error instanceof Error ? error.message : 'Failed to create workflow')
      return null
    } finally {
      set(isCreatingWorkflowAtom, false)
    }
  }
)

// 获取当前选中的模型信息
export const currentModelAtom = atom((get) => {
  const availableModels = get(availableModelsAtom)
  const selectedModelName = get(selectedModelAtom)
  
  return availableModels.find(m => m.name === selectedModelName) || null
})