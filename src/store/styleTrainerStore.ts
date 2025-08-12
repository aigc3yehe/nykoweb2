import { atom } from 'jotai'
import { modelsApi } from '../services/api/models'
import { uploadFileToS3 } from './imagesStore'
import { userStateAtom } from './loginStore'
import type { CreateModelRequest, CreateModelResponse } from '../services/api/types'

// 模型创建表单数据接口
export interface StyleTrainerFormData {
  name: string
  description: string
  style: string
  referenceImages: string[]
  cover: string
}

// 图片上传状态接口
export interface ImageUploadState {
  isUploading: boolean
  progress: number
  error: string | null
  uploadedUrls: string[]
  totalFilesToUpload: number // 本次上传的文件总数
  currentUploadIndex: number // 当前正在上传的文件索引
}

// 模型创建状态接口
export interface ModelCreationState {
  isCreating: boolean
  error: string | null
  success: boolean
}

// 通知状态接口
export interface ToastNotification {
  message: string
  severity: 'success' | 'error' | 'info' | 'warning'
  open: boolean
}

// 初始状态
const initialFormData: StyleTrainerFormData = {
  name: '',
  description: '',
  style: '',
  referenceImages: [],
  cover: ''
}

const initialImageUploadState: ImageUploadState = {
  isUploading: false,
  progress: 0,
  error: null,
  uploadedUrls: [],
  totalFilesToUpload: 0,
  currentUploadIndex: 0
}

const initialModelCreationState: ModelCreationState = {
  isCreating: false,
  error: null,
  success: false
}

const initialToastState: ToastNotification = {
  message: '',
  severity: 'info',
  open: false
}

// 状态原子
export const styleTrainerFormAtom = atom<StyleTrainerFormData>(initialFormData)
export const imageUploadStateAtom = atom<ImageUploadState>(initialImageUploadState)
export const modelCreationStateAtom = atom<ModelCreationState>(initialModelCreationState)
export const toastNotificationAtom = atom<ToastNotification>(initialToastState)

// 更新表单数据的action
export const updateStyleTrainerFormAtom = atom(
  null,
  (get, set, updates: Partial<StyleTrainerFormData>) => {
    const currentForm = get(styleTrainerFormAtom)
    set(styleTrainerFormAtom, { ...currentForm, ...updates })
  }
)

// 更新图片上传状态的action
export const updateImageUploadStateAtom = atom(
  null,
  (get, set, updates: Partial<ImageUploadState>) => {
    const currentState = get(imageUploadStateAtom)
    set(imageUploadStateAtom, { ...currentState, ...updates })
  }
)

// 显示通知的action
export const showToastAtom = atom(
  null,
  (_, set, { message, severity }: { message: string; severity: 'success' | 'error' | 'info' | 'warning' }) => {
    set(toastNotificationAtom, {
      message,
      severity,
      open: true
    })
    
    // 自动关闭通知
    setTimeout(() => {
      set(toastNotificationAtom, (prev) => ({
        ...prev,
        open: false
      }))
    }, 5000)
  }
)

// 上传图片的异步action
export const uploadImagesAtom = atom(
  null,
  async (get, set, files: File[]): Promise<string[]> => {
    const totalFiles = files.length
    
    set(updateImageUploadStateAtom, {
      isUploading: true,
      progress: 0,
      error: null,
      totalFilesToUpload: totalFiles,
      currentUploadIndex: 0
    })
    
    try {
      const uploadedUrls: string[] = []
      let completedUploads = 0
      
      // 串行上传所有文件
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        
        // 更新当前上传索引
        set(updateImageUploadStateAtom, {
          currentUploadIndex: i + 1
        })
        
        try {
          const url = await uploadFileToS3(file)
          uploadedUrls.push(url)
          
          completedUploads++
          const progress = Math.round((completedUploads / totalFiles) * 100)
          
          set(updateImageUploadStateAtom, {
            progress,
            uploadedUrls: [...uploadedUrls]
          })
        } catch (error) {
          console.error('Error uploading file:', file.name, error)
          // 继续处理其他文件
        }
      }
      
      set(updateImageUploadStateAtom, {
        isUploading: false,
        progress: 100,
        totalFilesToUpload: 0,
        currentUploadIndex: 0
      })
      
      // 更新表单中的参考图片
      const currentForm = get(styleTrainerFormAtom)
      set(styleTrainerFormAtom, {
        ...currentForm,
        referenceImages: [...currentForm.referenceImages, ...uploadedUrls]
      })
      
      set(showToastAtom, {
        message: `Successfully uploaded ${uploadedUrls.length} image(s)`,
        severity: 'success'
      })
      
      return uploadedUrls
    } catch (error) {
      console.error('Upload process failed:', error)
      
      set(updateImageUploadStateAtom, {
        isUploading: false,
        error: error instanceof Error ? error.message : 'Failed to upload images',
        totalFilesToUpload: 0,
        currentUploadIndex: 0
      })
      
      set(showToastAtom, {
        message: 'Failed to upload images',
        severity: 'error'
      })
      
      throw error
    }
  }
)

// 移除单个图片的action
export const removeImageAtom = atom(
  null,
  (get, set, imageUrl: string) => {
    const currentForm = get(styleTrainerFormAtom)
    const currentUploadState = get(imageUploadStateAtom)
    
    const updatedReferenceImages = currentForm.referenceImages.filter(url => url !== imageUrl)
    const updatedUploadedUrls = currentUploadState.uploadedUrls.filter(url => url !== imageUrl)
    
    set(styleTrainerFormAtom, {
      ...currentForm,
      referenceImages: updatedReferenceImages
    })
    
    set(imageUploadStateAtom, {
      ...currentUploadState,
      uploadedUrls: updatedUploadedUrls
    })
  }
)

// 移除所有图片的action
export const removeAllImagesAtom = atom(
  null,
  (get, set) => {
    const currentForm = get(styleTrainerFormAtom)
    
    set(styleTrainerFormAtom, {
      ...currentForm,
      referenceImages: []
    })
    
    set(imageUploadStateAtom, initialImageUploadState)
  }
)

// 创建模型的异步action
export const createModelAtom = atom(
  null,
  async (get, set, navigate?: (path: string) => void): Promise<CreateModelResponse | null> => {
    const userState = get(userStateAtom)
    
    // 检查用户登录状态
    if (!userState.isAuthenticated || !userState.user?.tokens?.did) {
      const errorMessage = 'User not authenticated or user ID not available'
      set(modelCreationStateAtom, {
        isCreating: false,
        error: errorMessage,
        success: false
      })
      set(showToastAtom, {
        message: errorMessage,
        severity: 'error'
      })
      return null
    }
    
    set(modelCreationStateAtom, {
      isCreating: true,
      error: null,
      success: false
    })
    
    try {
      const form = get(styleTrainerFormAtom)
      
      // 验证必填字段
      if (!form.name.trim()) {
        throw new Error('Model name is required')
      }
      if (form.referenceImages.length === 0) {
        throw new Error('At least one reference image is required')
      }
      
      const request: CreateModelRequest = {
        name: form.name.trim(),
        user: userState.user.tokens.did,
        description: form.description.trim() || undefined,
        cover: form.cover || undefined,
        urls: form.referenceImages,
        //tags: [], // 默认标签
        //params: {
        //  type: 'style_training'
        //}
      }
      
      const response = await modelsApi.createModel(request)
      
      set(modelCreationStateAtom, {
        isCreating: false,
        error: null,
        success: true
      })
      
      set(showToastAtom, {
        message: 'Model created successfully!',
        severity: 'success'
      })
      
      // 创建成功后重置表单
      set(styleTrainerFormAtom, initialFormData)
      set(imageUploadStateAtom, initialImageUploadState)
      
      // 如果返回的 model_id 不为空且不为0，则跳转到模型详情页面
      if (response?.model_id && response.model_id !== 0 && navigate) {
        // 这里不处理语言前缀，由调用方传入 navigate 时自行构造语言化路径
        navigate(`/model/${response.model_id}`)
      }
      
      return response
    } catch (error) {
      console.error('Failed to create model:', error)
      
      const errorMessage = error instanceof Error ? error.message : 'Failed to create model'
      
      set(modelCreationStateAtom, {
        isCreating: false,
        error: errorMessage,
        success: false
      })
      
      set(showToastAtom, {
        message: errorMessage,
        severity: 'error'
      })
      
      return null
    }
  }
)

// 重置所有状态的action
export const resetStyleTrainerAtom = atom(
  null,
  (_, set) => {
    set(styleTrainerFormAtom, initialFormData)
    set(imageUploadStateAtom, initialImageUploadState)
    set(modelCreationStateAtom, initialModelCreationState)
    set(toastNotificationAtom, initialToastState)
  }
)

// 获取当前表单验证状态的计算原子
export const formValidationAtom = atom((get) => {
  const form = get(styleTrainerFormAtom)
  
  return {
    isNameValid: form.name.trim().length > 0,
    isStyleValid: form.style.trim().length > 0,
    hasImages: form.referenceImages.length > 0,
    isFormValid: form.name.trim().length > 0 && 
                 form.referenceImages.length > 0
  }
})

// 获取当前状态摘要的计算原子
export const styleTrainerStatusAtom = atom((get) => {
  const imageUploadState = get(imageUploadStateAtom)
  const modelCreationState = get(modelCreationStateAtom)
  const formValidation = get(formValidationAtom)
  
  return {
    isUploading: imageUploadState.isUploading,
    isCreating: modelCreationState.isCreating,
    isBusy: imageUploadState.isUploading || modelCreationState.isCreating,
    canCreate: formValidation.isFormValid && !imageUploadState.isUploading && !modelCreationState.isCreating,
    uploadProgress: imageUploadState.progress,
    uploadedCount: imageUploadState.uploadedUrls.length,
    hasErrors: !!imageUploadState.error || !!modelCreationState.error
  }
})