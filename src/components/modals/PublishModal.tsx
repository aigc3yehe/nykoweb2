import React, { useState, useRef } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../hooks/useI18n'
import CoverSelectIcon from '../../assets/web2/cover_select.svg'
import CloseIcon from '../../assets/web2/close.svg'
import PublishIcon from '../../assets/web2/publish.svg'
import { workflowFormAtom, updateWorkflowFormAtom, createWorkflowAtom, isCreatingWorkflowAtom, createWorkflowErrorAtom } from '../../store/workflowBuilderStore'
import { userStateAtom } from '../../store/loginStore'
import { uploadFileToS3 } from '../../store/imagesStore'

interface PublishModalProps {
  isOpen: boolean
  onClose: () => void
}

const PublishModal: React.FC<PublishModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n()
  const navigate = useNavigate()
  
  // Store 状态
  const [workflowForm] = useAtom(workflowFormAtom)
  const [, updateWorkflowForm] = useAtom(updateWorkflowFormAtom)
  const [, createWorkflow] = useAtom(createWorkflowAtom)
  const [isCreatingWorkflow] = useAtom(isCreatingWorkflowAtom)
  const [createWorkflowError] = useAtom(createWorkflowErrorAtom)
  const [userState] = useAtom(userStateAtom)
  
  // 本地状态
  const [cover, setCover] = useState<File | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [nameFocus, setNameFocus] = useState(false)
  const [descFocus, setDescFocus] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  
  const handlePublish = async () => {
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
        setSuccessMessage(t('modal.workflowCreatedSuccessfully'))
        
        // 重置本地状态
        setCover(null)
        setCoverUrl(null)
        
        // 延迟跳转到工作流详情页
        setTimeout(() => {
          navigate(`/workflow/${result.workflow_id}`)
        }, 1500)
      }
    } catch (error) {
      console.error('Failed to create workflow:', error)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:hidden">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50" 
        onClick={onClose}
      />
      
      {/* 模态框内容 */}
      <div className="relative w-full bg-white dark:bg-gray-900 rounded-t-2xl max-h-[90vh] overflow-y-auto">
        {/* 拖拽指示器 */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-12 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
        </div>
        
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-full"
        >
          <img src={CloseIcon} alt="Close" className="w-5 h-5" />
        </button>

        {/* 内容区域 */}
        <div className="p-6 space-y-6">
          {/* 标题 */}
          <div className="text-center">
            <h2 className="font-lexend font-semibold text-xl text-gray-900 dark:text-white">
              {t('workflow.publish') || 'Publish Workflow'}
            </h2>
          </div>

          {/* Workflow Name */}
          <div className="space-y-2">
            <label className="font-lexend font-medium text-sm text-gray-700 dark:text-gray-300">
              {t('workflow.name') || 'Workflow Name'}
            </label>
            <input
              className={`w-full border rounded-lg px-4 py-3 text-gray-900 dark:text-white font-lexend text-base outline-none transition-colors ${
                nameFocus ? 'border-[#0900FF]' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-800`}
              placeholder={t('workflow.namePlaceholder') || 'Enter workflow name'}
              value={workflowForm.name}
              onChange={e => updateWorkflowForm({ name: e.target.value })}
              onFocus={() => setNameFocus(true)}
              onBlur={() => setNameFocus(false)}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="font-lexend font-medium text-sm text-gray-700 dark:text-gray-300">
              {t('workflow.description') || 'Description'}
            </label>
            <textarea
              className={`w-full h-24 border rounded-lg px-4 py-3 text-gray-900 dark:text-white font-lexend text-base outline-none resize-none transition-colors ${
                descFocus ? 'border-[#0900FF]' : 'border-gray-300 dark:border-gray-600'
              } bg-white dark:bg-gray-800`}
              placeholder={t('workflow.descriptionPlaceholder') || 'Describe your workflow'}
              value={workflowForm.description}
              onChange={e => updateWorkflowForm({ description: e.target.value })}
              onFocus={() => setDescFocus(true)}
              onBlur={() => setDescFocus(false)}
            />
          </div>

          {/* Cover Image */}
          <div className="space-y-2">
            <label className="font-lexend font-medium text-sm text-gray-700 dark:text-gray-300">
              {t('workflow.coverImage') || 'Cover Image'}
            </label>
            {cover && coverUrl ? (
              <div className="relative w-full">
                <img
                  src={coverUrl}
                  alt="cover"
                  className="w-full h-32 object-cover rounded-lg"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-white bg-opacity-90 rounded-full hover:bg-gray-100"
                  onClick={handleRemoveCover}
                >
                  <img src={CloseIcon} alt="Remove" className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div
                className={`w-full h-32 border border-dashed rounded-lg flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer ${
                  isDragOver 
                    ? 'border-[#0900FF] bg-blue-50 dark:bg-blue-900/20' 
                    : 'border-gray-300 dark:border-gray-600 hover:border-[#0900FF]'
                }`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {isUploading ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#0900FF] border-t-transparent rounded-full animate-spin"></div>
                    <span className="font-lexend text-xs text-gray-500 dark:text-gray-400">
                      {t('workflow.uploading') || 'Uploading...'}
                    </span>
                  </div>
                ) : (
                  <>
                    <img src={CoverSelectIcon} alt="select" className="w-8 h-8" />
                    <span className="font-lexend text-xs text-gray-500 dark:text-gray-400 text-center">
                      {isDragOver ? 'Drop image here' : t('workflow.uploadCover') || 'Click to upload or drag'}
                    </span>
                  </>
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

          {/* Publish Button */}
          <button
            onClick={handlePublish}
            disabled={isCreatingWorkflow || isUploading || !workflowForm.name.trim() || !userState.isAuthenticated}
            className="w-full flex items-center justify-center gap-2 py-4 px-6 bg-[#0900FF] hover:bg-blue-800 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {isCreatingWorkflow || isUploading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <img src={PublishIcon} alt="Publish" className="w-5 h-5" />
            )}
            <span className="font-lexend font-medium text-white">
              {isCreatingWorkflow ? (t('workflow.publishing') || 'Publishing...') : (t('workflow.publish') || 'Publish')}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default PublishModal 