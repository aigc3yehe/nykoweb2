import React, { useState, useRef, useEffect } from 'react'
import { useAtom } from 'jotai'
import { useI18n } from '../../hooks/useI18n'
import ModalCloseIcon from '../../assets/web2/modal_close.svg'
import CoverSelectIcon from '../../assets/web2/cover_select.svg'
import CloseIcon from '../../assets/web2/close.svg'
import { 
  styleTrainerFormAtom, 
  updateStyleTrainerFormAtom
} from '../../store/styleTrainerStore'
import { uploadFileToS3 } from '../../store/imagesStore'

interface StyleTrainerSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

const StyleTrainerSettingsModal: React.FC<StyleTrainerSettingsModalProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n()
  const [formData] = useAtom(styleTrainerFormAtom)
  const [, updateForm] = useAtom(updateStyleTrainerFormAtom)
  
  // 本地状态
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [nameFocus, setNameFocus] = useState(false)
  const [descFocus, setDescFocus] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 当模态框打开时，根据formData中的cover初始化本地状态
  useEffect(() => {
    if (isOpen) {
      // 重置本地封面状态
      setCoverUrl(null)
      
      // 如果formData中有cover，设置为本地状态
      if (formData.cover) {
        setCoverUrl(formData.cover)
      }
      
      // 重置文件输入框
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [isOpen, formData.cover])

  // 监听formData.cover的变化，同步到本地状态
  useEffect(() => {
    if (isOpen && formData.cover !== coverUrl) {
      setCoverUrl(formData.cover || null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }, [formData.cover, isOpen, coverUrl])

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      console.error('Please select an image file')
      return
    }
    
    setCoverUrl(URL.createObjectURL(file))
    
    // 上传封面图片到S3
    try {
      setIsUploading(true)
      const uploadedUrl = await uploadFileToS3(file)
      updateForm({ cover: uploadedUrl })
      // 上传成功后，更新本地状态为上传的URL
      setCoverUrl(uploadedUrl)
    } catch (error) {
      console.error('Failed to upload cover image:', error)
      // 上传失败时，清除本地状态
      setCoverUrl(null)
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
    setCoverUrl(null)
    updateForm({ cover: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleConfirm = () => {
    // 只保存样式基本信息，不开始训练
    // 关闭模态框，返回到创建页面
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end lg:hidden">
      {/* 背景遮罩 */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-70" 
        onClick={onClose}
      />
      
      {/* 关闭按钮 - 在模态框内容区域外面上面右侧居中 */}
      <button
        onClick={onClose}
        className="absolute top-6 right-4 w-6 h-6 flex items-center justify-center z-10"
      >
        <img src={ModalCloseIcon} alt="Close" className="w-6 h-6" />
      </button>
      
      {/* 模态框内容 - 高度为100% - 74px */}
      <div className="relative w-full bg-white dark:bg-gray-900 rounded-t-[10px]" style={{ height: 'calc(100% - 4.625rem)' }}>
        {/* 内容区域 */}
        <div className="h-full flex flex-col">
          {/* 可滚动内容区域 */}
          <div className="flex-1 overflow-y-auto p-6">

            {/* 表单内容 */}
            <div className="flex flex-col gap-6">
              {/* Style Name */}
              <div className="flex flex-col gap-2 w-full">
                <span className="font-lexend font-normal text-sm leading-[100%] text-[#1F2937] dark:text-white">
                  {t('style.name') || 'Style'}
                </span>
                <input
                  className={`w-full border rounded-[0.625rem] px-3 py-3 text-[#1F2937] dark:text-white font-lexend text-base outline-none transition-colors ${nameFocus ? 'border-[#0900FF]' : 'border-[#E5E7EB] dark:border-gray-600'} bg-white dark:bg-gray-800`}
                  placeholder={t('style.namePlaceholder') || 'Enter style name'}
                  value={formData.name}
                  onChange={e => updateForm({ name: e.target.value })}
                  onFocus={() => setNameFocus(true)}
                  onBlur={() => setNameFocus(false)}
                  style={{ fontSize: '1rem' }}
                />
              </div>

              {/* Description */}
              <div className="flex flex-col gap-2 w-full">
                <span className="font-lexend font-normal text-sm leading-[100%] text-[#1F2937] dark:text-white">
                  {t('style.description') || 'Description'}
                </span>
                <textarea
                  className={`w-full h-[7.5rem] border rounded-[0.625rem] px-3 py-3 text-[#1F2937] dark:text-white font-lexend text-base outline-none resize-none transition-colors ${descFocus ? 'border-[#0900FF]' : 'border-[#E5E7EB] dark:border-gray-600'} bg-white dark:bg-gray-800`}
                  placeholder={t('style.descriptionPlaceholder') || 'Describe your style'}
                  value={formData.description}
                  onChange={e => updateForm({ description: e.target.value })}
                  onFocus={() => setDescFocus(true)}
                  onBlur={() => setDescFocus(false)}
                  style={{ fontSize: '1rem' }}
                />
              </div>

              {/* Cover Image */}
              <div className="flex flex-col gap-2 w-full">
                <span className="font-lexend font-normal text-sm leading-[100%] text-[#1F2937] dark:text-white">
                  {t('style.coverImage') || 'Cover Image'}
                </span>
                {coverUrl ? (
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
                    {isUploading ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-6 h-6 border-2 border-[#0900FF] border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-lexend font-normal text-xs leading-[100%] text-[#9CA3AF] text-center">
                          {t('common.uploading') || 'Uploading...'}
                        </span>
                      </div>
                    ) : (
                      <>
                        <img src={CoverSelectIcon} alt="select" className="w-8 h-[1.9375rem] mb-2" />
                        <span className="font-lexend font-normal text-xs leading-[100%] text-[#9CA3AF] text-center">
                          {isDragOver ? 'Drop image here' : t('style.uploadCover') || 'Click to upload or drag here'}
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
            </div>
          </div>

          {/* 底部确认按钮 - 固定在底部 */}
          <div className="px-5 py-3 dark:border-gray-700 bg-white dark:bg-gray-900">
            <button
              onClick={handleConfirm}
              disabled={isUploading || !formData.name.trim()}
              className="w-full flex items-center justify-center gap-1.5 rounded-[6px] py-3 bg-[#0900FF] hover:bg-blue-800 disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : null}
              <span className="font-lexend font-normal text-lg leading-[100%] text-white" style={{ fontSize: '1.125rem' }}>
                {t('common.confirm') || 'Confirm'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StyleTrainerSettingsModal 