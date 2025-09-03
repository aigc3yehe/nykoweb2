import React, { useState, useEffect, useRef } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import UploadIcon from '../assets/mavae/upload.svg'
import UploadIconDark from '../assets/mavae/dark/upload.svg'
import GptIcon from '../assets/mavae/gpt.svg'
import GptIconDark from '../assets/mavae/dark/gpt.svg'
//import GeminiIcon from '../assets/mavae/gemini.svg'
//import GeminiIconDark from '../assets/mavae/dark/gemini.svg'
import Gemini2Icon from '../assets/mavae/gemini2.svg'
import Gemini2IconDark from '../assets/mavae/dark/gemini2.svg'
import KlingIcon from '../assets/mavae/klingai.svg'
import KlingIconDark from '../assets/mavae/dark/klingai.svg'
//import MidjourneyIcon from '../assets/mavae/midjourney.svg'
//import MidjourneyIconDark from '../assets/mavae/dark/midjourney.svg'

import StyleImageDeleteIcon from '../assets/mavae/style_image_delete.svg'
import StyleImageDeleteIconDark from '../assets/mavae/dark/style_image_delete.svg'
import ThemeAdaptiveIcon from '../components/ui/ThemeAdaptiveIcon'
import {
  availableModelsAtom,
  isLoadingProvidersAtom,
  providersErrorAtom,
  selectedModelAtom,
  availableInputTypesAtom,
  availableOutputTypesAtom,
  selectedInputTypeAtom,
  workflowFormAtom,
  fetchAiProvidersAtom,
  selectModelAtom,
  updateWorkflowFormAtom,
  createWorkflowAtom,
  isCreatingWorkflowAtom,
  createWorkflowErrorAtom
} from '../store/workflowBuilderStore'
import { uploadFileToS3 } from '../store/imagesStore'
import { userStateAtom } from '../store/loginStore'
import { useLang, withLangPrefix } from '../hooks/useLang'

const WorkflowBuilder: React.FC = () => {
  const navigate = useNavigate()
  const lang = useLang()

  // Store状态
  const [availableModels] = useAtom(availableModelsAtom)
  const [isLoadingProviders] = useAtom(isLoadingProvidersAtom)
  const [providersError] = useAtom(providersErrorAtom)
  const [selectedModel] = useAtom(selectedModelAtom)
  const [availableInputTypes] = useAtom(availableInputTypesAtom)
  const [availableOutputTypes] = useAtom(availableOutputTypesAtom)
  const [selectedInputType, setSelectedInputType] = useAtom(selectedInputTypeAtom)
  const [workflowForm] = useAtom(workflowFormAtom)
  const [userState] = useAtom(userStateAtom)

  // Store actions
  const [, fetchAiProviders] = useAtom(fetchAiProvidersAtom)
  const [, selectModel] = useAtom(selectModelAtom)
  const [, updateWorkflowForm] = useAtom(updateWorkflowFormAtom)
  const [, createWorkflow] = useAtom(createWorkflowAtom)
  const [isCreatingWorkflow] = useAtom(isCreatingWorkflowAtom)
  const [createWorkflowError] = useAtom(createWorkflowErrorAtom)

  // 本地状态
  const [cover, setCover] = useState<File | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [refImage, setRefImage] = useState<File | null>(null)
  const [refImageUrl, setRefImageUrl] = useState<string | null>(null)
  const [, setNameFocus] = useState(false)
  const [, setDescFocus] = useState(false)
  const [, setPromptFocus] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingRefImage, setIsUploadingRefImage] = useState(false)
  const [, setIsDragOver] = useState(false)
  const [, setIsDragOverRefImage] = useState(false)
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const refImageInputRef = useRef<HTMLInputElement>(null)

  // 获取模型名称的用户友好显示文本
  const getModelDisplayName = (modelName: string) => {
    switch (modelName) {
      case 'gpt-image-1-vip':
        return 'GPT Image'
      case 'flux-kontext-pro':
        return 'FLUX Kontext'
      case 'StableDiffusionXL':
        return 'Stable Diffusion XL'
      case 'kling-video-v1':
        return 'Kling V2'
      case 'pollo-kling':
        return 'Kling V2 (Pollo)'
      case 'pollo-veo3':
        return 'Google VEO3 (Pollo)'
      default:
        return modelName
    }
  }

  // 输入类型显示文本映射
  const getInputTypeDisplayText = (type: string) => {
    switch (type) {
      case 'image':
        return 'Reference Image'
      case 'text':
        return 'Additional Prompt'
      case 'image,text':
        return 'Reference Image + Additional Prompt'
      // 也保持对已转换格式的支持
      case 'Image':
        return 'Reference Image'
      case 'Text':
        return 'Additional Prompt'
      case 'Image + Text':
        return 'Reference Image + Additional Prompt'
      default:
        return type
    }
  }

  // 输出类型显示文本映射
  const getOutputTypeDisplayText = (type: string) => {
    switch (type) {
      case 'image':
        return 'Image'
      case 'text':
        return 'Text'
      case 'video':
        return 'Video'
      default:
        return type.charAt(0).toUpperCase() + type.slice(1)
    }
  }

  // 根据提供商名称获取对应的图标
  const getProviderIcon = (provider: string) => {
    const providerLower = provider.toLowerCase()
    if (providerLower.includes('gpt')) {
      return { light: GptIcon, dark: GptIconDark }
    } else if (providerLower.includes('kling')) {
      return { light: KlingIcon, dark: KlingIconDark }
    } else if (providerLower.includes('veo')) {
      return { light: Gemini2Icon, dark: Gemini2IconDark }
    } else {
      return { light: GptIcon, dark: GptIconDark }
    }
  }

  // 组件挂载时获取AI提供商数据
  useEffect(() => {
    fetchAiProviders()
  }, [fetchAiProviders])

  // 点击外部关闭下拉菜单
  useEffect(() => {
    if (!isModelDropdownOpen) return
    const handleClick = () => {
      setIsModelDropdownOpen(false)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [isModelDropdownOpen])

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      console.error('Please select an image file')
      return
    }

    setCover(file)
    setCoverUrl(URL.createObjectURL(file))

    // 上传封面图片到S3
    try {
      setIsUploading(true)
      const uploadedUrl = await uploadFileToS3(file)
      updateWorkflowForm({ cover: uploadedUrl })
    } catch (error) {
      console.error('Failed to upload cover image:', error)
    } finally {
      setIsUploading(false)
    }
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      await handleFileUpload(files[0])
    }
  }

  const handleRemoveCover = () => {
    setCover(null)
    setCoverUrl(null)
    updateWorkflowForm({ cover: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Reference Image 相关函数
  const handleRefImageUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      console.error('Please select an image file')
      return
    }

    setRefImage(file)
    setRefImageUrl(URL.createObjectURL(file))

    try {
      setIsUploadingRefImage(true)
      const uploadedUrl = await uploadFileToS3(file)
      // 只保留最后一次上传的参考图，替换而不是追加
      updateWorkflowForm({ referenceImages: [uploadedUrl] })
    } catch (error) {
      console.error('Failed to upload reference image:', error)
      // 如果上传失败，清除图片
      handleRemoveRefImage()
    } finally {
      setIsUploadingRefImage(false)
    }
  }

  const handleRefImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleRefImageUpload(e.target.files[0])
    }
  }

  const handleRefImageDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverRefImage(true)
  }

  const handleRefImageDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverRefImage(false)
  }

  const handleRefImageDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverRefImage(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      await handleRefImageUpload(files[0])
    }
  }

  const handleRemoveRefImage = () => {
    setRefImage(null)
    setRefImageUrl(null)
    // 清空 referenceImages 数组
    updateWorkflowForm({ referenceImages: [] })
    if (refImageInputRef.current) refImageInputRef.current.value = ''
  }

  const handleBuilder = async () => {
    // 检查用户是否已登录
    if (!userState.isAuthenticated || !userState.userDetails?.did) {
      console.error('User not authenticated or missing user ID')
      return
    }

    const userId = userState.userDetails.did

    try {
      const result = await createWorkflow(userId)
      if (result && result.workflow_id) {
        // 创建成功，显示成功提示
        setSuccessMessage('Workflow created successfully!')

        // 重置本地状态
        setCover(null)
        setCoverUrl(null)
        setRefImage(null)
        setRefImageUrl(null)

        // 延迟跳转到工作流详情页
        setTimeout(() => {
          navigate(withLangPrefix(lang, `/workflow/${result.workflow_id}`))
        }, 1500)
      }
    } catch (error) {
      console.error('Failed to create workflow:', error)
    }
  }



  // 如果正在加载，显示加载状态
  if (isLoadingProviders) {
    return (
      <div className="flex items-center justify-center h-full w-full p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-link-default dark:border-link-default-dark mx-auto mb-4"></div>
          <span className="font-switzer text-sm text-text-secondary dark:text-text-secondary-dark">Loading AI providers...</span>
        </div>
      </div>
    )
  }

  // 如果加载出错，显示错误状态
  if (providersError) {
    return (
      <div className="flex items-center justify-center h-full w-full p-8">
        <div className="text-center">
          <span className="font-switzer text-sm text-red-500">Error: {providersError}</span>
          <button
            onClick={() => fetchAiProviders()}
            className="mt-4 px-4 py-2 bg-link-default dark:bg-link-default-dark text-white rounded-lg hover:bg-link-pressed dark:hover:bg-link-pressed transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* 移动端标题 */}
      <div className="lg:hidden h-16 flex items-center gap-6 p-4 bg-secondary dark:bg-secondary-dark">
        <span className="font-switzer font-bold text-2xl leading-8 text-text-main dark:text-text-main-dark">Builder</span>
      </div>

      {/* 三个组件容器 */}
      <div className="flex-1 flex flex-col lg:flex-row items-start justify-center gap-6 md:p-4 lg:p-8 lg:pt-6">
        {/* PC端容器 */}
        <div className="hidden lg:flex w-full max-w-[84.5rem] flex-row items-start justify-center gap-6">
          {/* 成功提示 */}
          {successMessage && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg z-50">
              <span className="text-green-600 dark:text-green-400 text-sm font-lexend">{successMessage}</span>
            </div>
          )}

          {/* 错误提示 */}
          {createWorkflowError && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg z-50">
              <span className="text-red-600 dark:text-red-400 text-sm font-lexend">{createWorkflowError}</span>
            </div>
          )}

          {/* Display 组件 */}
          <div className="w-[22.5rem] max-w-[22.5rem] flex flex-col gap-6 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-secondary dark:bg-secondary-dark p-6">
            {/* 标题组件 */}
            <div className="h-6 flex items-center gap-2.5">
              {/* 序号 */}
              <div className="w-6 h-6 flex items-center justify-center gap-2.5 rounded-full bg-link-default dark:bg-link-default-dark">
                <span className="font-roboto font-bold text-base leading-6 text-center text-white">1</span>
              </div>
              {/* 标题 */}
              <span className="font-switzer font-bold text-xl leading-6 text-text-main dark:text-text-main-dark">Case Info</span>
            </div>

            {/* Name 输入框组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <div className="flex items-center gap-1">
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">Case Name</span>
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-red-500">*</span>
              </div>
              {/* 输入框 */}
              <input
                className="w-[19.5rem] h-10 pt-0 pr-3 pb-0 pl-3 gap-2 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-tertiary dark:bg-tertiary-dark font-switzer font-medium text-sm leading-[100%] align-middle text-text-main dark:text-text-main-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-link-default dark:focus:ring-link-default-dark focus:border-transparent"
                placeholder="A name matches its features"
                value={workflowForm.name}
                onChange={(e) => updateWorkflowForm({ name: e.target.value })}
                onFocus={() => setNameFocus(true)}
                onBlur={() => setNameFocus(false)}
              />
            </div>

            {/* Description 输入框组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">Description</span>
              {/* 输入框 */}
              <textarea
                className="w-[19.5rem] h-[6.75rem] pt-3 pr-3 pb-3 pl-3 gap-2 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-tertiary dark:bg-tertiary-dark font-switzer font-medium text-sm leading-[100%] align-middle text-text-main dark:text-text-main-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark resize-none focus:outline-none focus:ring-2 focus:ring-link-default dark:focus:ring-link-default-dark focus:border-transparent"
                placeholder="How can we use it to make the most of this case's features?"
                value={workflowForm.description}
                onChange={(e) => updateWorkflowForm({ description: e.target.value })}
                onFocus={() => setDescFocus(true)}
                onBlur={() => setDescFocus(false)}
              />
            </div>

            {/* Cover Image 组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">Cover Image</span>
              {/* 图片上传组件 */}
              {cover && coverUrl ? (
                <div className="relative w-[8.125rem] h-[8.125rem] gap-1 rounded-[0.625rem]">
                  <img
                    src={coverUrl}
                    alt="cover"
                    className="w-full h-full object-cover rounded-[0.625rem]"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-white bg-opacity-80 rounded-full hover:bg-gray-100"
                    onClick={handleRemoveCover}
                  >
                    <ThemeAdaptiveIcon
                      lightIcon={StyleImageDeleteIcon}
                      darkIcon={StyleImageDeleteIconDark}
                      alt="Remove"
                      size="sm"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
              ) : (
                <div
                  className={`w-[8.125rem] h-[8.125rem] pt-10 pr-6.5 pb-10 pl-6.5 gap-1 rounded-[0.625rem] border border-dashed border-line-subtle dark:border-line-subtle-dark flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-link-default dark:hover:border-link-default-dark ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  onClick={isUploading ? undefined : () => fileInputRef.current?.click()}
                  onDragOver={isUploading ? undefined : handleDragOver}
                  onDragLeave={isUploading ? undefined : handleDragLeave}
                  onDrop={isUploading ? undefined : handleDrop}
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-link-default dark:border-link-default-dark"></div>
                  ) : (
                    <div className="w-8 h-[1.9375rem]">
                      <ThemeAdaptiveIcon
                        lightIcon={UploadIcon}
                        darkIcon={UploadIconDark}
                        alt="Upload"
                        size="lg"
                        className='w-8 h-8'
                      />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Builder 组件 */}
          <div className="w-[22.5rem] max-w-[22.5rem] flex flex-col gap-6 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-secondary dark:bg-secondary-dark p-6">
            {/* 标题组件 */}
            <div className="h-6 flex items-center gap-2.5">
              {/* 序号 */}
              <div className="w-6 h-6 flex items-center justify-center gap-2.5 rounded-full bg-link-default dark:bg-link-default-dark">
                <span className="font-roboto font-bold text-base leading-6 text-center text-white">2</span>
              </div>
              {/* 标题 */}
              <span className="font-switzer font-bold text-xl leading-6 text-text-main dark:text-text-main-dark">Workflow</span>
            </div>

            {/* Input Type 组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <div className="flex items-center gap-1">
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">User Input</span>
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-red-500">*</span>
              </div>
              {/* 输入类型选择 */}
              <div className="w-[19.5rem] flex flex-wrap gap-2">
                {availableInputTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedInputType(type)}
                    className={`h-10 px-4 rounded-full border font-switzer text-sm leading-5 text-center align-middle transition-colors whitespace-nowrap ${selectedInputType === type
                      ? 'border-text-main dark:border-text-main-dark font-semibold text-text-main dark:text-text-main-dark'
                      : 'border-line-subtle dark:border-line-subtle-dark font-normal text-text-secondary dark:text-text-secondary-dark'
                      }`}
                  >
                    {getInputTypeDisplayText(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Model 组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <div className="flex items-center gap-1">
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">Models</span>
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-red-500">*</span>
              </div>
              {/* Model 选择 */}
              <div className="w-[19.5rem] flex flex-col gap-2">
                {availableModels.map(model => (
                  <button
                    key={`${model.provider}-${model.name}`}
                    onClick={() => selectModel(model.name)}
                    className={`w-[19.5rem] h-10 pr-2 pl-2 flex items-center gap-1 rounded-full border transition-colors ${selectedModel === model.name
                      ? 'border-text-main dark:border-text-main-dark'
                      : 'border-line-subtle dark:border-line-subtle-dark'
                      }`}
                  >
                    <div className="h-5 flex items-center gap-1">
                      <ThemeAdaptiveIcon
                        lightIcon={getProviderIcon(model.provider).light}
                        darkIcon={getProviderIcon(model.provider).dark}
                        alt={model.name}
                        size="sm"
                      />
                      <span className={`font-switzer text-sm leading-5 ${selectedModel === model.name
                        ? 'font-semibold text-text-main dark:text-text-main-dark'
                        : 'font-normal text-text-secondary dark:text-text-secondary-dark'
                        }`}>
                        {getModelDisplayName(model.name)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt 组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <div className="flex items-center gap-1">
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">Case Prompt</span>
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-red-500">*</span>
              </div>
              {/* 输入框 */}
              <textarea
                className="w-[19.5rem] h-[6.75rem] pt-3 pr-3 pb-3 pl-3 gap-2 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-tertiary dark:bg-tertiary-dark font-switzer font-medium text-sm leading-[100%] align-middle text-text-main dark:text-text-main-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark resize-none focus:outline-none focus:ring-2 focus:ring-link-default dark:focus:ring-link-default-dark focus:border-transparent"
                placeholder="This is the system prompt for this case. Each time the case runs, this set of prompts will be used."
                value={workflowForm.prompt}
                onChange={(e) => updateWorkflowForm({ prompt: e.target.value })}
                onFocus={() => setPromptFocus(true)}
                onBlur={() => setPromptFocus(false)}
              />
            </div>

            {/* Reference Image 组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">Case Reference Image</span>
              {/* 图片上传组件 */}
              {refImage && refImageUrl ? (
                <div className="relative w-[8.125rem] h-[8.125rem] gap-1 rounded-[0.625rem]">
                  <img
                    src={refImageUrl}
                    alt="ref"
                    className="w-full h-full object-cover rounded-[0.625rem]"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-white bg-opacity-80 rounded-full hover:bg-gray-100"
                    onClick={handleRemoveRefImage}
                  >
                    <ThemeAdaptiveIcon
                      lightIcon={StyleImageDeleteIcon}
                      darkIcon={StyleImageDeleteIconDark}
                      alt="Remove"
                      size="sm"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
              ) : (
                <div
                  className={`w-[8.125rem] h-[8.125rem] pt-10 pr-6.5 pb-10 pl-6.5 gap-1 rounded-[0.625rem] border border-dashed border-line-subtle dark:border-line-subtle-dark flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-link-default dark:hover:border-link-default-dark ${isUploadingRefImage ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  onClick={isUploadingRefImage ? undefined : () => refImageInputRef.current?.click()}
                  onDragOver={isUploadingRefImage ? undefined : handleRefImageDragOver}
                  onDragLeave={isUploadingRefImage ? undefined : handleRefImageDragLeave}
                  onDrop={isUploadingRefImage ? undefined : handleRefImageDrop}
                >
                  {isUploadingRefImage ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-link-default dark:border-link-default-dark"></div>
                  ) : (
                    <div className="w-8 h-[1.9375rem]">
                      <ThemeAdaptiveIcon
                        lightIcon={UploadIcon}
                        darkIcon={UploadIconDark}
                        alt="Upload"
                        size="lg"
                        className='w-8 h-8'
                      />
                    </div>
                  )}
                  <input
                    ref={refImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleRefImageChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Output 组件 */}
          <div className="w-[22.5rem] max-w-[22.5rem] flex flex-col gap-6 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-secondary dark:bg-secondary-dark p-6">
            {/* 标题组件 */}
            <div className="h-6 flex items-center gap-2.5">
              {/* 序号 */}
              <div className="w-6 h-6 flex items-center justify-center gap-2.5 rounded-full bg-link-default dark:bg-link-default-dark">
                <span className="font-roboto font-bold text-base leading-6 text-center text-white">3</span>
              </div>
              {/* 标题 */}
              <span className="font-switzer font-bold text-xl leading-6 text-text-main dark:text-text-main-dark">Case Output</span>
            </div>

            {/* Type 组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-secondary dark:text-text-secondary-dark">Case Output</span>
              {/* 输出类型选择 */}
              <div className="w-[19.5rem] h-10 flex gap-2">
                {availableOutputTypes.map(type => (
                  <button
                    key={type}
                    className="w-[6.167rem] h-10 rounded-full border font-switzer text-sm leading-5 text-center align-middle border-text-main dark:border-text-main-dark font-semibold text-text-main dark:text-text-main-dark"
                    disabled
                  >
                    {getOutputTypeDisplayText(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Builder 按钮 */}
            <button
              onClick={handleBuilder}
              disabled={isCreatingWorkflow || isUploading || isUploadingRefImage || !workflowForm.name.trim() || !userState.isAuthenticated}
              className="w-[19.5rem] h-12 pr-4 pl-4 rounded-full bg-link-default dark:bg-link-default-dark font-switzer font-medium text-sm leading-5 text-center text-white hover:bg-link-pressed dark:hover:bg-link-pressed-dark transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isCreatingWorkflow ? 'Creating...' : 'Save The Workflow'}
            </button>
          </div>
        </div>

        {/* 移动端容器 */}
        <div className="lg:hidden w-full flex flex-col px-4 gap-6 bg-secondary dark:bg-secondary-dark">
          {/* 成功提示 */}
          {successMessage && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <span className="text-green-600 dark:text-green-400 text-sm font-lexend">{successMessage}</span>
            </div>
          )}

          {/* 错误提示 */}
          {createWorkflowError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <span className="text-red-600 dark:text-red-400 text-sm font-lexend">{createWorkflowError}</span>
            </div>
          )}

          {/* Display 组件 - 移动端 */}
          <div className="w-full flex flex-col gap-6">
            {/* 标题组件 */}
            <div className="h-6 flex items-center gap-2.5">
              {/* 序号 */}
              <div className="w-6 h-6 flex items-center justify-center gap-2.5 rounded-full bg-link-default dark:bg-link-default-dark">
                <span className="font-roboto font-bold text-base leading-6 text-center text-white">1</span>
              </div>
              {/* 标题 */}
              <span className="font-switzer font-bold text-xl leading-6 text-text-main dark:text-text-main-dark">Case Info</span>
            </div>

            {/* Name 输入框组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <div className="flex items-center gap-1">
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">Case Name</span>
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-red-500">*</span>
              </div>
              {/* 输入框 */}
              <input
                className="w-full h-10 pt-0 pr-3 pb-0 pl-3 gap-2 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-tertiary dark:bg-tertiary-dark font-switzer font-medium text-sm leading-[100%] align-middle text-text-main dark:text-text-main-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-link-default dark:focus:ring-link-default-dark focus:border-transparent"
                placeholder="A name matches its features"
                value={workflowForm.name}
                onChange={(e) => updateWorkflowForm({ name: e.target.value })}
                onFocus={() => setNameFocus(true)}
                onBlur={() => setNameFocus(false)}
              />
            </div>

            {/* Description 输入框组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">Description</span>
              {/* 输入框 */}
              <textarea
                className="w-full h-[6.75rem] pt-3 pr-3 pb-3 pl-3 gap-2 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-tertiary dark:bg-tertiary-dark font-switzer font-medium text-sm leading-[100%] align-middle text-text-main dark:text-text-main-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark resize-none focus:outline-none focus:ring-2 focus:ring-link-default dark:focus:ring-link-default-dark focus:border-transparent"
                placeholder="How can we use it to make the most of this case's features?"
                value={workflowForm.description}
                onChange={(e) => updateWorkflowForm({ description: e.target.value })}
                onFocus={() => setDescFocus(true)}
                onBlur={() => setDescFocus(false)}
              />
            </div>

            {/* Cover Image 组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">Cover Image</span>
              {/* 图片上传组件 */}
              {cover && coverUrl ? (
                <div className="relative w-[8.125rem] h-[8.125rem] gap-1 rounded-[0.625rem]">
                  <img
                    src={coverUrl}
                    alt="cover"
                    className="w-full h-full object-cover rounded-[0.625rem]"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-white bg-opacity-80 rounded-full hover:bg-gray-100"
                    onClick={handleRemoveCover}
                  >
                    <ThemeAdaptiveIcon
                      lightIcon={StyleImageDeleteIcon}
                      darkIcon={StyleImageDeleteIconDark}
                      alt="Remove"
                      size="sm"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
              ) : (
                <div
                  className={`w-[8.125rem] h-[8.125rem] pt-10 pr-6.5 pb-10 pl-6.5 gap-1 rounded-[0.625rem] border border-dashed border-line-subtle dark:border-line-subtle-dark flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-link-default dark:hover:border-link-default-dark ${isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  onClick={isUploading ? undefined : () => fileInputRef.current?.click()}
                  onDragOver={isUploading ? undefined : handleDragOver}
                  onDragLeave={isUploading ? undefined : handleDragLeave}
                  onDrop={isUploading ? undefined : handleDrop}
                >
                  {isUploading ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-link-default dark:border-link-default-dark"></div>
                  ) : (
                    <div className="w-8 h-[1.9375rem]">
                      <ThemeAdaptiveIcon
                        lightIcon={UploadIcon}
                        darkIcon={UploadIconDark}
                        alt="Upload"
                        size="lg"
                        className='w-8 h-8'
                      />
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Builder 组件 - 移动端 */}
          <div className="w-full flex flex-col gap-6">
            {/* 标题组件 */}
            <div className="h-6 flex items-center gap-2.5">
              {/* 序号 */}
              <div className="w-6 h-6 flex items-center justify-center gap-2.5 rounded-full bg-link-default dark:bg-link-default-dark">
                <span className="font-roboto font-bold text-base leading-6 text-center text-white">2</span>
              </div>
              {/* 标题 */}
              <span className="font-switzer font-bold text-xl leading-6 text-text-main dark:text-text-main-dark">Workflow</span>
            </div>

            {/* Input Type 组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <div className="flex items-center gap-1">
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">User Input</span>
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-red-500">*</span>
              </div>
              {/* 输入类型选择 */}
              <div className="w-full flex flex-wrap gap-2">
                {availableInputTypes.map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedInputType(type)}
                    className={`h-10 px-4 rounded-full border font-switzer text-sm leading-5 text-center align-middle transition-colors whitespace-nowrap ${selectedInputType === type
                      ? 'border-text-main dark:border-text-main-dark font-semibold text-text-main dark:text-text-main-dark'
                      : 'border-line-subtle dark:border-line-subtle-dark font-normal text-text-secondary dark:text-text-secondary-dark'
                      }`}
                  >
                    {getInputTypeDisplayText(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Model 组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <div className="flex items-center gap-1">
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">Models</span>
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-red-500">*</span>
              </div>
              {/* Model 选择 */}
              <div className="w-full flex flex-col gap-2">
                {availableModels.map(model => (
                  <button
                    key={`${model.provider}-${model.name}`}
                    onClick={() => selectModel(model.name)}
                    className={`w-full h-10 pr-2 pl-2 flex items-center gap-1 rounded-full border transition-colors ${selectedModel === model.name
                      ? 'border-text-main dark:border-text-main-dark'
                      : 'border-line-subtle dark:border-line-subtle-dark'
                      }`}
                  >
                    <div className="h-5 flex items-center gap-1">
                      <ThemeAdaptiveIcon
                        lightIcon={getProviderIcon(model.provider).light}
                        darkIcon={getProviderIcon(model.provider).dark}
                        alt={model.name}
                        size="sm"
                      />
                      <span className={`font-switzer text-sm leading-5 ${selectedModel === model.name
                        ? 'font-semibold text-text-main dark:text-text-main-dark'
                        : 'font-normal text-text-secondary dark:text-text-secondary-dark'
                        }`}>
                        {getModelDisplayName(model.name)}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt 组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <div className="flex items-center gap-1">
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">Case Prompt</span>
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-red-500">*</span>
              </div>
              {/* 输入框 */}
              <textarea
                className="w-full h-[6.75rem] pt-3 pr-3 pb-3 pl-3 gap-2 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-tertiary dark:bg-tertiary-dark font-switzer font-medium text-sm leading-[100%] align-middle text-text-main dark:text-text-main-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark resize-none focus:outline-none focus:ring-2 focus:ring-link-default dark:focus:ring-link-default-dark focus:border-transparent"
                placeholder="This is the system prompt for this case. Each time the case runs, this set of prompts will be used."
                value={workflowForm.prompt}
                onChange={(e) => updateWorkflowForm({ prompt: e.target.value })}
                onFocus={() => setPromptFocus(true)}
                onBlur={() => setPromptFocus(false)}
              />
            </div>

            {/* Reference Image 组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">Case Reference Image</span>
              {/* 图片上传组件 */}
              {refImage && refImageUrl ? (
                <div className="relative w-[8.125rem] h-[8.125rem] gap-1 rounded-[0.625rem]">
                  <img
                    src={refImageUrl}
                    alt="ref"
                    className="w-full h-full object-cover rounded-[0.625rem]"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-white bg-opacity-80 rounded-full hover:bg-gray-100"
                    onClick={handleRemoveRefImage}
                  >
                    <ThemeAdaptiveIcon
                      lightIcon={StyleImageDeleteIcon}
                      darkIcon={StyleImageDeleteIconDark}
                      alt="Remove"
                      size="sm"
                      className="w-5 h-5"
                    />
                  </button>
                </div>
              ) : (
                <div
                  className={`w-[8.125rem] h-[8.125rem] pt-10 pr-6.5 pb-10 pl-6.5 gap-1 rounded-[0.625rem] border border-dashed border-line-subtle dark:border-line-subtle-dark flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-link-default dark:hover:border-link-default-dark ${isUploadingRefImage ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  onClick={isUploadingRefImage ? undefined : () => refImageInputRef.current?.click()}
                  onDragOver={isUploadingRefImage ? undefined : handleRefImageDragOver}
                  onDragLeave={isUploadingRefImage ? undefined : handleRefImageDragLeave}
                  onDrop={isUploadingRefImage ? undefined : handleRefImageDrop}
                >
                  {isUploadingRefImage ? (
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-link-default dark:border-link-default-dark"></div>
                  ) : (
                    <div className="w-8 h-[1.9375rem]">
                      <ThemeAdaptiveIcon
                        lightIcon={UploadIcon}
                        darkIcon={UploadIconDark}
                        alt="Upload"
                        size="lg"
                        className='w-8 h-8'
                      />
                    </div>
                  )}
                  <input
                    ref={refImageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleRefImageChange}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Output 组件 - 移动端 */}
          <div className="w-full flex flex-col gap-6 pb-8">
            {/* 标题组件 */}
            <div className="h-6 flex items-center gap-2.5">
              {/* 序号 */}
              <div className="w-6 h-6 flex items-center justify-center gap-2.5 rounded-full bg-link-default dark:bg-link-default-dark">
                <span className="font-roboto font-bold text-base leading-6 text-center text-white">3</span>
              </div>
              {/* 标题 */}
              <span className="font-switzer font-bold text-xl leading-6 text-text-main dark:text-text-main-dark">Case Output</span>
            </div>

            {/* Type 组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-secondary dark:text-text-secondary-dark">Case Output</span>
              {/* 输出类型选择 */}
              <div className="w-[19.5rem] h-10 flex gap-2">
                {availableOutputTypes.map(type => (
                  <button
                    key={type}
                    className="w-[6.167rem] h-10 rounded-full border font-switzer text-sm leading-5 text-center align-middle border-text-main dark:border-text-main-dark font-semibold text-text-main dark:text-text-main-dark"
                    disabled
                  >
                    {getOutputTypeDisplayText(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Builder 按钮 */}
            <button
              onClick={handleBuilder}
              disabled={isCreatingWorkflow || isUploading || isUploadingRefImage || !workflowForm.name.trim() || !userState.isAuthenticated}
              className="w-full h-12 pr-4 pl-4 rounded-full bg-link-default dark:bg-link-default-dark font-switzer font-medium text-sm leading-5 text-center text-white hover:bg-link-pressed dark:hover:bg-link-pressed-dark transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {isCreatingWorkflow ? 'Creating...' : 'Save The Workflow'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WorkflowBuilder