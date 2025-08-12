import React, { useState, useRef } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import { useLang } from '../../hooks/useLang'
import BgLogo from '../../assets/web2/workflow_setting.svg'
import CoverSelectIcon from '../../assets/web2/cover_select.svg'
import CloseIcon from '../../assets/web2/close.svg'
import PublishIcon from '../../assets/web2/publish.svg'
import { uploadFileToS3 } from '../../store/imagesStore'
import {
  styleTrainerFormAtom,
  updateStyleTrainerFormAtom,
  modelCreationStateAtom,
  createModelAtom,
  styleTrainerStatusAtom
} from '../../store/styleTrainerStore'

const TrainerSidebar: React.FC = () => {
  const navigate = useNavigate()
  useLang()
  const [formData] = useAtom(styleTrainerFormAtom)
  const [, updateForm] = useAtom(updateStyleTrainerFormAtom)
  const [modelCreationState] = useAtom(modelCreationStateAtom)
  const [, createModel] = useAtom(createModelAtom)
  const [status] = useAtom(styleTrainerStatusAtom)
  
  const [nameFocus, setNameFocus] = useState(false)
  const [descFocus, setDescFocus] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 处理文件上传的通用函数
  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    setIsUploading(true)
    try {
      const url = await uploadFileToS3(file)
      updateForm({ cover: url })
    } catch (error) {
      console.error('封面上传失败:', error)
      alert('封面上传失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0])
    }
  }

  const handleRemoveCover = () => {
    updateForm({ cover: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // 拖拽处理函数
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFileUpload(files[0])
    }
  }

  // 创建模型
  const handleCreateModel = async () => {
    try {
      await createModel(navigate)
    } catch (error) {
      console.error('模型创建失败:', error)
    }
  }

  return (
    <aside className="w-[19.375rem] flex flex-col justify-between p-6 border-r relative overflow-hidden" style={{ borderColor: '#F3F4F6', background: '#fff' }}>
      {/* 底部背景logo */}
      <img src={BgLogo} alt="bg-logo" className="absolute left-0 bottom-0 w-[13.125rem] h-[18.9375rem] pointer-events-none select-none" style={{zIndex:0}} />
      {/* 信息区 */}
      <div className="flex flex-col gap-6 relative z-10 w-full">
        {/* Style Name */}
        <div className="flex flex-col gap-2 w-full">
          <span className="font-lexend font-semibold text-[1.5rem] leading-[100%] text-[#1F2937]">Style</span>
          <input
            className={`w-full border rounded-[0.625rem] px-3 py-3 text-[#1F2937] font-lexend text-base outline-none transition-colors ${nameFocus ? 'border-[#0900FF]' : 'border-[#E5E7EB]'}`}
            placeholder="style name"
            value={formData.name}
            onChange={e => updateForm({ name: e.target.value })}
            onFocus={() => setNameFocus(true)}
            onBlur={() => setNameFocus(false)}
            style={{ fontSize: '1rem' }}
          />
        </div>
        {/* Description */}
        <div className="flex flex-col gap-2 w-full">
          <span className="font-lexend font-normal text-sm leading-[100%] text-[#1F2937]">Description</span>
          <textarea
            className={`w-full h-[7.5rem] border rounded-[0.625rem] px-3 py-3 text-[#1F2937] font-lexend text-base outline-none resize-none transition-colors ${descFocus ? 'border-[#0900FF]' : 'border-[#E5E7EB]'}`}
            placeholder="Describe your style"
            value={formData.description}
            onChange={e => updateForm({ description: e.target.value })}
            onFocus={() => setDescFocus(true)}
            onBlur={() => setDescFocus(false)}
            style={{ fontSize: '1rem' }}
          />
        </div>
        {/* Cover Image */}
        <div className="flex flex-col gap-2 w-full">
          <span className="font-lexend font-normal text-sm leading-[100%] text-[#1F2937]">Cover Image</span>
          {formData.cover ? (
            <div className="relative w-full">
              <img
                src={formData.cover}
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
            <button
              type="button"
              className={`w-full h-[7.9375rem] border border-dashed rounded-[0.625rem] flex flex-col items-center justify-center gap-1.5 px-6 py-10 relative transition-colors ${
                isDragOver 
                  ? 'border-[#0900FF] bg-blue-50 dark:bg-blue-900/20' 
                  : 'border-[#E5E7EB] hover:border-[#0900FF]'
              }`}
              style={{ borderWidth: '1px', borderStyle: 'dashed', borderRadius: '0.625rem' }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              disabled={isUploading}
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-6 h-6 border-2 border-[#0900FF] border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-lexend font-normal text-xs leading-[100%] text-[#9CA3AF] text-center">上传中...</span>
                </div>
              ) : (
                <>
                  <img src={CoverSelectIcon} alt="select" className="w-8 h-[1.9375rem] mb-2" />
                  <span className="font-lexend font-normal text-xs leading-[100%] text-[#9CA3AF] text-center">
                    {isDragOver ? '释放以上传' : 'Click to upload Or drag here'}
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
            </button>
          )}
        </div>
      </div>
      {/* 下方内容：Start Training按钮 */}
      <div className="relative z-10 mt-6">
        <button
          className={`w-full flex items-center justify-center gap-1.5 rounded-[6px] py-3 transition-colors ${
            !status.canCreate
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-[#0900FF] hover:bg-blue-800'
          }`}
          onClick={handleCreateModel}
          disabled={!status.canCreate}
        >
          {modelCreationState.isCreating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="font-lexend font-normal text-lg leading-[100%] text-white" style={{ fontSize: '1.125rem' }}>
                创建中...
              </span>
            </>
          ) : (
            <>
              <img src={PublishIcon} alt="Train" className="w-5 h-5" style={{ width: '1.25rem', height: '1.25rem' }} />
              <span className="font-lexend font-normal text-lg leading-[100%] text-white" style={{ fontSize: '1.125rem' }}>
                Start Training
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  )
}

export default TrainerSidebar