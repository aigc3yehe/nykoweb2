import React, { useState, useRef } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { useI18n } from '../../hooks/useI18n'
import BgLogo from '../../assets/web2/workflow_setting.svg'
import CoverSelectIcon from '../../assets/web2/cover_select.svg'
import CloseIcon from '../../assets/web2/close.svg'
import PublishIcon from '../../assets/web2/publish.svg'
import { workflowFormAtom, updateWorkflowFormAtom, createWorkflowAtom, isCreatingWorkflowAtom, createWorkflowErrorAtom } from '../../store/workflowBuilderStore'
import { userStateAtom } from '../../store/loginStore'
import { uploadFileToS3 } from '../../store/imagesStore'

const PublishSidebar: React.FC = () => {
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
        setSuccessMessage('Workflow created successfully!')
        
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

  return (
    <aside className="w-[19.375rem] flex flex-col justify-between p-6 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* 底部背景logo */}
      <img src={BgLogo} alt="bg-logo" className="absolute left-0 bottom-0 w-[13.125rem] h-[18.9375rem] pointer-events-none select-none" style={{zIndex:0}} />
      {/* 信息区 */}
      <div className="flex flex-col gap-6 relative z-10 w-full">
        {/* Workflow Name */}
        <div className="flex flex-col gap-2 w-full">
          <span className="font-lexend font-semibold text-[1.5rem] leading-[100%] text-[#1F2937] dark:text-white">Workflow</span>
          <input
            className={`w-full border rounded-[0.625rem] px-3 py-3 text-[#1F2937] dark:text-white font-lexend text-base outline-none transition-colors ${nameFocus ? 'border-[#0900FF]' : 'border-[#E5E7EB] dark:border-gray-600'} bg-white dark:bg-gray-800`}
            placeholder={t('workflow.namePlaceholder')} // en: name / zh: 名称
            value={workflowForm.name}
            onChange={e => updateWorkflowForm({ name: e.target.value })}
            onFocus={() => setNameFocus(true)}
            onBlur={() => setNameFocus(false)}
            style={{ fontSize: '1rem' }}
          />
        </div>
        {/* Description */}
        <div className="flex flex-col gap-2 w-full">
          <span className="font-lexend font-normal text-sm leading-[100%] text-[#1F2937] dark:text-white">Description</span>
          <textarea
            className={`w-full h-[7.5rem] border rounded-[0.625rem] px-3 py-3 text-[#1F2937] dark:text-white font-lexend text-base outline-none resize-none transition-colors ${descFocus ? 'border-[#0900FF]' : 'border-[#E5E7EB] dark:border-gray-600'} bg-white dark:bg-gray-800`}
            placeholder={t('workflow.descriptionPlaceholder')} // en: Describe your Workflow / zh: 描述你的工作流
            value={workflowForm.description}
            onChange={e => updateWorkflowForm({ description: e.target.value })}
            onFocus={() => setDescFocus(true)}
            onBlur={() => setDescFocus(false)}
            style={{ fontSize: '1rem' }}
          />
        </div>
        {/* Cover Image */}
        <div className="flex flex-col gap-2 w-full">
          <span className="font-lexend font-normal text-sm leading-[100%] text-[#1F2937] dark:text-white">{t('workflow.coverImage')}</span>
          {cover && coverUrl ? (
            <div className="relative w-full">
              <img
                src={coverUrl}
                alt="cover"
                className="w-full rounded-[0.625rem] object-cover"
              />
              <button
                type="button"
                className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-white bg-opacity-80 rounded-full hover:bg-gray-100"
                onClick={handleRemoveCover}
              >
                <img src={CloseIcon} alt="Remove" className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div
              className={`w-full h-[7.9375rem] border border-dashed rounded-[0.625rem] flex flex-col items-center justify-center gap-1.5 px-6 py-10 relative transition-colors cursor-pointer ${
                isDragOver 
                  ? 'border-[#0900FF] bg-blue-50' 
                  : 'border-[#E5E7EB] hover:border-[#0900FF]'
              }`}
              style={{ borderWidth: '1px', borderStyle: 'dashed', borderRadius: '0.625rem' }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <img src={CoverSelectIcon} alt="select" className="w-8 h-[1.9375rem] mb-2" />
              <span className="font-lexend font-normal text-xs leading-[100%] text-[#9CA3AF] text-center">
                {isDragOver ? 'Drop image here' : t('workflow.uploadCover')}
              </span>
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
      {/* 下方内容：Publish按钮 */}
      <div className="relative z-10 mt-6">
        {/* 成功提示 */}
        {successMessage && (
          <div className="mb-3 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <span className="text-green-600 dark:text-green-400 text-sm font-lexend">{successMessage}</span>
          </div>
        )}
        
        {/* 错误提示 */}
        {createWorkflowError && (
          <div className="mb-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <span className="text-red-600 dark:text-red-400 text-sm font-lexend">{createWorkflowError}</span>
          </div>
        )}
        
        <button
          onClick={handlePublish}
          disabled={isCreatingWorkflow || isUploading || !workflowForm.name.trim() || !userState.isAuthenticated}
          className="w-full flex items-center justify-center gap-1.5 rounded-[6px] py-3 bg-[#0900FF] hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {isCreatingWorkflow || isUploading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <img src={PublishIcon} alt="Publish" className="w-5 h-5" style={{ width: '1.25rem', height: '1.25rem' }} />
          )}
          <span className="font-lexend font-normal text-lg leading-[100%] text-white" style={{ fontSize: '1.125rem' }}>
            {isCreatingWorkflow ? t('workflow.publishing') : t('workflow.publish')} {/* en: Publishing... / Publish / zh: 发布中... / 发布 */}
          </span>
        </button>
      </div>
    </aside>
  )
}

export default PublishSidebar