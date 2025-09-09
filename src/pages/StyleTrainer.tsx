import React, { useRef, useState } from 'react'
import { useAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import CloseIcon from '../assets/web2/close.svg'
import StyleImageDeleteIcon from '../assets/mavae/style_image_delete.svg'
import StyleImageDeleteIconDark from '../assets/mavae/dark/style_image_delete.svg'
import UploadIcon from '../assets/mavae/upload.svg'
import UploadIconDark from '../assets/mavae/dark/upload.svg'
import StyleCheckIcon from '../assets/mavae/style_check.svg'
import StyleCheckIconDark from '../assets/mavae/dark/style_check.svg'
import StyleAddIcon from '../assets/mavae/style_add.svg'
import StyleAddIconDark from '../assets/mavae/dark/style_add.svg'
import StyleRemoveIcon from '../assets/mavae/style_remove.svg'
import StyleRemoveIconDark from '../assets/mavae/dark/style_remove.svg'
import ThemeAdaptiveIcon from '../components/ui/ThemeAdaptiveIcon'
import { useI18n } from '../hooks/useI18n'

import {
  styleTrainerFormAtom,
  imageUploadStateAtom,
  uploadImagesAtom,
  removeImageAtom,
  removeAllImagesAtom,
  styleTrainerStatusAtom,
  updateStyleTrainerFormAtom,
  createModelAtom,
  modelCreationStateAtom
} from '../store/styleTrainerStore'
import { uploadFileToS3 } from '../store/imagesStore'

const MAX_IMAGES = 30

const StyleTrainer: React.FC = () => {
  const navigate = useNavigate()
  const { t } = useI18n()
  const [formData] = useAtom(styleTrainerFormAtom)
  const [imageUploadState] = useAtom(imageUploadStateAtom)
  const [status] = useAtom(styleTrainerStatusAtom)
  const [, uploadImages] = useAtom(uploadImagesAtom)
  const [, removeImage] = useAtom(removeImageAtom)
  const [, removeAllImages] = useAtom(removeAllImagesAtom)
  const [, updateForm] = useAtom(updateStyleTrainerFormAtom)
  const [, createModel] = useAtom(createModelAtom)
  const [modelCreationState] = useAtom(modelCreationStateAtom)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverFileInputRef = useRef<HTMLInputElement>(null)

  // 封面图片上传相关状态
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [, setIsDragOverCover] = useState(false)

  // 上传图片到S3
  const handleRefImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files).slice(0, MAX_IMAGES - formData.referenceImages.length)
      try {
        await uploadImages(files)
      } catch (err) {
        console.error('Upload failed:', err)
      }
    }
  }

  // 处理封面图片上传
  const handleCoverImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleCoverFileUpload(e.target.files[0])
    }
  }

  // 封面图片上传处理函数
  const handleCoverFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(t('styleTrainer.pleaseSelectAnImageFile'))
      return
    }

    setIsUploadingCover(true)
    try {
      const url = await uploadFileToS3(file)
      updateForm({ cover: url })
    } catch (error) {
      console.error('封面上传失败:', error)
      alert(t('styleTrainer.failedToUploadCoverImage'))
    } finally {
      setIsUploadingCover(false)
    }
  }

  // 封面图片拖拽处理函数
  const handleCoverDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverCover(true)
  }

  const handleCoverDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverCover(false)
  }

  const handleCoverDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOverCover(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      await handleCoverFileUpload(files[0])
    }
  }

  // 处理开始训练
  const handleStartTraining = async () => {
    if (!status.canCreate) {
      console.error(t('styleTrainer.failedToStartTraining'))
      return
    }

    try {
      await createModel(navigate)
    } catch (error) {
      console.error(t('styleTrainer.failedToCreateModel'), error)
    }
  }

  // 移除所有图片
  const handleRemoveAll = () => {
    removeAllImages()
  }

  // 移除单张图片
  const handleRemoveOne = (imageUrl: string) => {
    removeImage(imageUrl)
  }



  // 上传成功后的内容 - 在主内容区域显示
  const renderUploadedContent = () => (
    <div className="flex w-full flex-col gap-6">
      {/* 图片集展示区域 */}
      <div className="grid grid-cols-2 gap-5 lg:grid-cols-6" style={{ gap: '1.25rem' }}>
        {formData.referenceImages.map((url) => (
          <div key={url} className="relative w-[7.5rem] h-[7.5rem] rounded-xl bg-[#E8E8E8] overflow-hidden group" style={{ width: '7.5rem', height: '7.5rem', borderRadius: '0.75rem' }}>
            <img src={url} alt="uploaded" className="w-full h-full object-cover" style={{ borderRadius: '0.75rem' }} />
            <div className="absolute inset-0 bg-black/10 flex items-start justify-end p-1">
              <button className="w-6 h-6 flex items-center justify-center" onClick={() => handleRemoveOne(url)}>
                <ThemeAdaptiveIcon
                  lightIcon={StyleImageDeleteIcon}
                  darkIcon={StyleImageDeleteIconDark}
                  alt="remove"
                  size="sm"
                  className="w-6 h-6"
                />
              </button>
            </div>
          </div>
        ))}

        {/* 添加图片按钮 - 放在图片列表最后 */}
        <div
          className="w-[7.5rem] h-[7.5rem] rounded-xl border border-dashed border-line-subtle dark:border-line-subtle-dark flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-link-default dark:hover:border-link-default-dark"
          style={{ width: '7.5rem', height: '7.5rem', borderRadius: '0.75rem' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-8 h-[1.9375rem]">
            <ThemeAdaptiveIcon
              lightIcon={UploadIcon}
              darkIcon={UploadIconDark}
              alt="Upload"
              size="lg"
              className='w-8 h-8'
            />
          </div>
        </div>
      </div>

      {/* Builder 按钮 */}
      <div className="w-full flex items-center justify-center">
        <button
          className="w-full h-12 pr-4 pl-4 rounded-full bg-link-default dark:bg-link-default-dark font-switzer font-medium text-sm leading-5 text-center text-white hover:bg-link-pressed dark:hover:bg-link-pressed-dark transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
          disabled={!status.canCreate || modelCreationState.isCreating || modelCreationState.isTraining}
          onClick={handleStartTraining}
        >
          {modelCreationState.isCreating ? t('styleTrainer.creating') :
            modelCreationState.isTraining ? t('styleTrainer.training') : t('styleTrainer.startTraining')}
        </button>
      </div>
    </div>
  )

  // 上传为空时的界面
  const renderEmptyUploadContent = () => (
    <div className="w-full flex flex-col items-center gap-8">
      {/* 第一个区域：三张图片 */}
      <div className="w-[22.375rem] h-[10.9375rem] relative">
        {/* 第一张图片 */}
        <div className="absolute w-[6.625rem] h-[8.875rem] top-[1.6875rem] left-[0.375rem] rounded-xl bg-secondary dark:bg-secondary-dark border-[0.375rem] border-white">
          <img src="/upload1.png" alt="upload1" className="w-full h-full object-cover rounded-lg" />
        </div>
        {/* 第二张图片 - 层级最高 */}
        <div className="absolute w-[8.5625rem] h-[10.1875rem] top-[0.375rem] left-[6.875rem] rounded-xl bg-secondary dark:bg-secondary-dark border-[0.375rem] border-white z-10">
          <img src="/upload2.png" alt="upload2" className="w-full h-full object-cover rounded-lg" />
        </div>
        {/* 第三张图片 */}
        <div className="absolute w-[6.625rem] h-[8.875rem] top-[1.6875rem] left-[15.375rem] rounded-xl bg-secondary dark:bg-secondary-dark border-[0.375rem] border-white">
          <img src="/upload3.png" alt="upload3" className="w-full h-full object-cover rounded-lg" />
        </div>
      </div>

      {/* 第二个区域：文本提示 */}
      <div className="flex flex-col items-center gap-[0.875rem]">
        {/* 第一行文本 */}
        <div className="text-center px-5 md:px-0">
          <span className="font-lexend font-semibold text-2xl leading-[100%] text-text-main dark:text-text-main-dark">
            {t('styleTrainer.upload10MoreImages')}
          </span>
        </div>
        {/* 第二行：提示列表 - 移动端一行一个 */}
        <div className="flex flex-col items-center gap-4 md:flex-row md:gap-4">
          <div className="flex items-center gap-2 h-5">
            <ThemeAdaptiveIcon
              lightIcon={StyleCheckIcon}
              darkIcon={StyleCheckIconDark}
              alt="check"
              size="sm"
            />
            <span className="font-lexend font-normal text-sm leading-[140%] text-text-secondary dark:text-text-secondary-dark">
              {t('styleTrainer.consistentStyle')}
            </span>
          </div>
          <div className="flex items-center gap-2 h-5">
            <ThemeAdaptiveIcon
              lightIcon={StyleCheckIcon}
              darkIcon={StyleCheckIconDark}
              alt="check"
              size="sm"
            />
            <span className="font-lexend font-normal text-sm leading-[140%] text-text-secondary dark:text-text-secondary-dark">
              {t('styleTrainer.distinctFeatures')}
            </span>
          </div>
          <div className="flex items-center gap-2 h-5">
            <ThemeAdaptiveIcon
              lightIcon={StyleCheckIcon}
              darkIcon={StyleCheckIconDark}
              alt="check"
              size="sm"
            />
            <span className="font-lexend font-normal text-sm leading-[140%] text-text-secondary dark:text-text-secondary-dark">
              {t('styleTrainer.showDiversity')}
            </span>
          </div>
          <div className="flex items-center gap-2 h-5">
            <ThemeAdaptiveIcon
              lightIcon={StyleCheckIcon}
              darkIcon={StyleCheckIconDark}
              alt="check"
              size="sm"
            />
            <span className="font-lexend font-normal text-sm leading-[140%] text-text-secondary dark:text-text-secondary-dark">
              {t('styleTrainer.clearNoWatermark')}
            </span>
          </div>
        </div>
      </div>

      {/* 第三个区域：上传按钮 */}
      <div className="flex items-center justify-center">
        <button
          className="h-12 flex items-center gap-2 rounded-full px-6 bg-[#0DA3A31A] hover:bg-[#0DA3A333] transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <ThemeAdaptiveIcon
            lightIcon={StyleAddIcon}
            darkIcon={StyleAddIconDark}
            alt="upload"
            size="lg"
          />
          <span className="font-switzer font-medium text-base leading-6 text-[#0DA3A3]">
            {t('styleTrainer.uploadImages')}
          </span>
        </button>
      </div>

      {/* 第四个区域：Builder 按钮 */}
      <div className="w-full flex items-center justify-center">
        <button
          className="w-full h-12 pr-4 pl-4 rounded-full bg-link-default dark:bg-link-default-dark font-switzer font-medium text-sm leading-5 text-center text-white hover:bg-link-pressed dark:hover:bg-link-pressed-dark transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
          disabled={!status.canCreate || modelCreationState.isCreating || modelCreationState.isTraining}
          onClick={handleStartTraining}
        >
          {modelCreationState.isCreating ? t('styleTrainer.creating') :
            modelCreationState.isTraining ? t('styleTrainer.training') : t('styleTrainer.startTraining')}
        </button>
      </div>
    </div>
  )

  return (
    <div className="flex h-full w-full">
      {/* PC端布局 */}
      <div className="hidden lg:flex w-full pt-6 pr-8 pb-8 pl-8 gap-6">
        {/* Display 组件 - 与 WorkflowBuilder 相同 */}
        <div className="w-[22.5rem] max-w-[22.5rem] flex flex-col gap-6 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-secondary dark:bg-secondary-dark p-6 h-fit">
          {/* 标题组件 */}
          <div className="h-6 flex items-center gap-2.5">
            {/* 序号 */}
            <div className="w-6 h-6 flex items-center justify-center gap-2.5 rounded-full bg-link-default dark:bg-link-default-dark">
              <span className="font-roboto font-bold text-base leading-6 text-center text-white">1</span>
            </div>
            {/* 标题 */}
            <span className="font-switzer font-bold text-xl leading-6 text-text-main dark:text-text-main-dark">{t('styleTrainer.display')}</span>
          </div>

          {/* Style Name 输入框组件 */}
          <div className="flex flex-col gap-1">
            {/* 标题 */}
            <div className="flex items-center gap-1">
              <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">{t('styleTrainer.name')}</span>
              <span className="font-switzer font-normal text-sm leading-5 align-middle text-red-500">*</span>
            </div>
            {/* 输入框 */}
            <input
              className="w-[19.5rem] h-10 pt-0 pr-3 pb-0 pl-3 gap-2 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-tertiary dark:bg-tertiary-dark font-switzer font-medium text-sm leading-[100%] align-middle text-text-main dark:text-text-main-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-link-default dark:focus:ring-link-default-dark focus:border-transparent"
              placeholder={t('styleTrainer.styleNamePlaceholder')}
              value={formData.name}
              onChange={(e) => updateForm({ name: e.target.value })}
            />
          </div>

          {/* Description 输入框组件 */}
          <div className="flex flex-col gap-1">
            {/* 标题 */}
            <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">{t('styleTrainer.description')}</span>
            {/* 输入框 */}
            <textarea
              className="w-[19.5rem] h-[6.75rem] pt-3 pr-3 pb-3 pl-3 gap-2 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-tertiary dark:bg-tertiary-dark font-switzer font-medium text-sm leading-[100%] align-middle text-text-main dark:text-text-main-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark resize-none focus:outline-none focus:ring-2 focus:ring-link-default dark:focus:ring-link-default-dark focus:border-transparent"
              placeholder={t('styleTrainer.describeYourStyle')}
              value={formData.description}
              onChange={(e) => updateForm({ description: e.target.value })}
            />
          </div>

          {/* Cover Image 组件 */}
          <div className="flex flex-col gap-1">
            {/* 标题 */}
            <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">{t('styleTrainer.coverImage')}</span>
            {/* 图片上传组件 */}
            {formData.cover ? (
              <div className="relative w-[8.125rem] h-[8.125rem] gap-1 rounded-[0.625rem]">
                <img
                  src={formData.cover}
                  alt="cover"
                  className="w-full h-full object-cover rounded-[0.625rem]"
                />
                <button
                  type="button"
                  className="absolute top-2 right-2 w-6 h-6 flex items-center justify-center bg-white bg-opacity-80 rounded-full hover:bg-gray-100"
                  onClick={() => updateForm({ cover: '' })}
                >
                  <img src={CloseIcon} alt="Remove" className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div
                className={`w-[8.125rem] h-[8.125rem] pt-10 pr-6.5 pb-10 pl-6.5 gap-1 rounded-[0.625rem] border border-dashed border-line-subtle dark:border-line-subtle-dark flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-link-default dark:hover:border-link-default-dark ${isUploadingCover ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                onClick={isUploadingCover ? undefined : () => coverFileInputRef.current?.click()}
                onDragOver={isUploadingCover ? undefined : handleCoverDragOver}
                onDragLeave={isUploadingCover ? undefined : handleCoverDragLeave}
                onDrop={isUploadingCover ? undefined : handleCoverDrop}
              >
                {isUploadingCover ? (
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
                  ref={coverFileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverImageChange}
                />
              </div>
            )}
          </div>
        </div>

        {/* Builder 组件 - 占满剩余宽度 */}
        <div className="flex-1 flex flex-col gap-6 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-secondary dark:bg-secondary-dark p-6 h-fit relative">
          {/* 标题组件 */}
          <div className="h-6 flex items-center gap-6">
            <div className="flex items-center gap-2.5">
              {/* 序号 */}
              <div className="w-6 h-6 flex items-center justify-center gap-2.5 rounded-full bg-link-default dark:bg-link-default-dark">
                <span className="font-roboto font-bold text-base leading-6 text-center text-white">2</span>
              </div>
              {/* 标题 */}
              <span className="font-switzer font-bold text-xl leading-6 text-text-main dark:text-text-main-dark">{t('styleTrainer.styleTrainerBuilder')}</span>
            </div>
            {/* Remove All 按钮 */}
            {formData.referenceImages.length > 0 && (
              <button
                className="flex items-center gap-1 px-1 rounded-[0.375rem] hover:bg-gray-50"
                style={{ height: '1.125rem', gap: '0.25rem' }}
                onClick={handleRemoveAll}
              >
                <ThemeAdaptiveIcon
                  lightIcon={StyleRemoveIcon}
                  darkIcon={StyleRemoveIconDark}
                  alt="remove all"
                  size="sm"
                  className="w-4 h-4"
                />
                <span className="font-switzer font-medium text-sm leading-[100%] text-text-main dark:text-text-main-dark">{t('styleTrainer.removeAll')}</span>
              </button>
            )}
          </div>

          {/* 根据状态显示不同内容 */}
          {formData.referenceImages.length > 0 ? (
            renderUploadedContent()
          ) : (
            renderEmptyUploadContent()
          )}

          {/* 上传中蒙版 - 只覆盖Builder组件的内容区域 */}
          {status.isUploading && (
            <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: '#FFFFFFB2', backdropFilter: 'blur(20px)' }}>
              <div className="flex flex-col items-center w-[27.375rem] h-[3.125rem] gap-5">
                <span className="font-lexend font-normal text-2xl leading-[100%] text-[#1F2937]">{t('styleTrainer.uploading')} {imageUploadState.currentUploadIndex}/{imageUploadState.totalFilesToUpload}</span>
                <div className="w-[27.375rem] h-1.5 rounded-[1.875rem] bg-[#E5E7EB] overflow-hidden">
                  <div className="h-full rounded-[1.875rem] bg-[#0900FF] transition-all" style={{ width: `${status.uploadProgress}%` }}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 移动端布局 - 类似 WorkflowBuilder 的结构 */}
      <div className="lg:hidden w-full flex flex-col bg-secondary dark:bg-secondary-dark">
        {/* 移动端标题 */}
        <div className="h-16 flex items-center p-4">
          <span className="font-switzer font-bold text-2xl leading-8 text-text-main dark:text-text-main-dark">{t('styleTrainer.styleTrainer')}</span>
        </div>

        {/* 移动端内容区域 */}
        <div className="flex flex-col px-4 gap-6 pb-8">
          {/* Display 组件 - 移动端 */}
          <div className="w-full flex flex-col gap-6">
            {/* 标题组件 */}
            <div className="h-6 flex items-center gap-2.5">
              {/* 序号 */}
              <div className="w-6 h-6 flex items-center justify-center gap-2.5 rounded-full bg-link-default dark:bg-link-default-dark">
                <span className="font-roboto font-bold text-base leading-6 text-center text-white">1</span>
              </div>
              {/* 标题 */}
              <span className="font-switzer font-bold text-xl leading-6 text-text-main dark:text-text-main-dark">{t('styleTrainer.display')}</span>
            </div>

            {/* Style Name 输入框组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <div className="flex items-center gap-1">
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">{t('styleTrainer.name')}</span>
                <span className="font-switzer font-normal text-sm leading-5 align-middle text-red-500">*</span>
              </div>
              {/* 输入框 */}
              <input
                className="w-full h-10 pt-0 pr-3 pb-0 pl-3 gap-2 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-tertiary dark:bg-tertiary-dark font-switzer font-medium text-sm leading-[100%] align-middle text-text-main dark:text-text-main-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-link-default dark:focus:ring-link-default-dark focus:border-transparent"
                placeholder={t('styleTrainer.styleNamePlaceholder')}
                value={formData.name}
                onChange={(e) => updateForm({ name: e.target.value })}
              />
            </div>

            {/* Description 输入框组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">{t('styleTrainer.description')}</span>
              {/* 输入框 */}
              <textarea
                className="w-full h-[6.75rem] pt-3 pr-3 pb-3 pl-3 gap-2 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-tertiary dark:bg-tertiary-dark font-switzer font-medium text-sm leading-[100%] align-middle text-text-main dark:text-text-main-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark resize-none focus:outline-none focus:ring-2 focus:ring-link-default dark:focus:ring-link-default-dark focus:border-transparent"
                placeholder={t('styleTrainer.describeYourStyle')}
                value={formData.description}
                onChange={(e) => updateForm({ description: e.target.value })}
              />
            </div>

            {/* Cover Image 组件 */}
            <div className="flex flex-col gap-1">
              {/* 标题 */}
              <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">{t('styleTrainer.coverImage')}</span>
              {/* 图片上传组件 */}
              {formData.cover ? (
                <div className="relative w-[8.125rem] h-[8.125rem] gap-1 rounded-[0.625rem]">
                  <img
                    src={formData.cover}
                    alt="cover"
                    className="w-full h-full object-cover rounded-[0.625rem]"
                  />
                  <button
                    type="button"
                    className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center bg-white bg-opacity-80 rounded-full hover:bg-gray-100"
                    onClick={() => updateForm({ cover: '' })}
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
                  className={`w-[8.125rem] h-[8.125rem] pt-10 pr-6.5 pb-10 pl-6.5 gap-1 rounded-[0.625rem] border border-dashed border-line-subtle dark:border-line-subtle-dark flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-link-default dark:hover:border-link-default-dark ${isUploadingCover ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  onClick={isUploadingCover ? undefined : () => coverFileInputRef.current?.click()}
                  onDragOver={isUploadingCover ? undefined : handleCoverDragOver}
                  onDragLeave={isUploadingCover ? undefined : handleCoverDragLeave}
                  onDrop={isUploadingCover ? undefined : handleCoverDrop}
                >
                  {isUploadingCover ? (
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
                    ref={coverFileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverImageChange}
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
              <span className="font-switzer font-bold text-xl leading-6 text-text-main dark:text-text-main-dark">{t('styleTrainer.styleTrainerBuilder')}</span>
            </div>

            {/* 根据状态显示不同内容 */}
            {formData.referenceImages.length > 0 ? (
              <div className="flex w-full flex-col gap-6">
                {/* 图片集展示区域 - 移动端一行3张 */}
                <div className="grid grid-cols-3 gap-5" style={{ gap: '1.25rem' }}>
                  {formData.referenceImages.map((url) => (
                    <div key={url} className="relative w-full aspect-square rounded-xl bg-[#E8E8E8] overflow-hidden group" style={{ borderRadius: '0.75rem' }}>
                      <img src={url} alt="uploaded" className="w-full h-full object-cover" style={{ borderRadius: '0.75rem' }} />
                      <div className="absolute inset-0 bg-black/10 flex items-start justify-end p-1">
                        <button className="w-6 h-6 flex items-center justify-center" onClick={() => handleRemoveOne(url)}>
                          <ThemeAdaptiveIcon
                            lightIcon={StyleImageDeleteIcon}
                            darkIcon={StyleImageDeleteIconDark}
                            alt="remove"
                            size="sm"
                            className="w-6 h-6"
                          />
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* 添加图片按钮 - 放在图片列表最后 */}
                  <div
                    className="w-full aspect-square rounded-xl border border-dashed border-line-subtle dark:border-line-subtle-dark flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-link-default dark:hover:border-link-default-dark"
                    style={{ borderRadius: '0.75rem' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="w-8 h-[1.9375rem]">
                      <ThemeAdaptiveIcon
                        lightIcon={UploadIcon}
                        darkIcon={UploadIconDark}
                        alt="Upload"
                        size="lg"
                        className='w-8 h-8'
                      />
                    </div>
                  </div>
                </div>

                {/* Builder 按钮 */}
                <div className="w-full flex items-center justify-center">
                  <button
                    className="w-full h-12 pr-4 pl-4 rounded-full bg-link-default dark:bg-link-default-dark font-switzer font-medium text-sm leading-5 text-center text-white hover:bg-link-pressed dark:hover:bg-link-pressed-dark transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
                    disabled={!status.canCreate || modelCreationState.isCreating || modelCreationState.isTraining}
                    onClick={handleStartTraining}
                  >
                    {modelCreationState.isCreating ? t('styleTrainer.creating') :
                      modelCreationState.isTraining ? t('styleTrainer.training') : t('styleTrainer.startTraining')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full flex flex-col items-center gap-8">
                {/* 第二个区域：文本提示 */}
                <div className="flex flex-col items-start gap-[0.875rem]">
                  {/* 第一行文本 */}
                  <div className="md:px-0">
                    <span className="font-lexend font-semibold text-2xl leading-[100%] text-text-main dark:text-text-main-dark">
                      {t('styleTrainer.upload10MoreImages')}
                    </span>
                  </div>
                  {/* 第二行：提示列表 - 移动端左对齐 */}
                  <div className="flex flex-col items-start gap-4 md:flex-row md:gap-4">
                    <div className="flex items-center gap-2 h-5">
                      <ThemeAdaptiveIcon
                        lightIcon={StyleCheckIcon}
                        darkIcon={StyleCheckIconDark}
                        alt="check"
                        size="sm"
                      />
                      <span className="font-lexend font-normal text-sm leading-[140%] text-text-secondary dark:text-text-secondary-dark">
                        {t('styleTrainer.consistentStyle')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 h-5">
                      <ThemeAdaptiveIcon
                        lightIcon={StyleCheckIcon}
                        darkIcon={StyleCheckIconDark}
                        alt="check"
                        size="sm"
                      />
                      <span className="font-lexend font-normal text-sm leading-[140%] text-text-secondary dark:text-text-secondary-dark">
                        {t('styleTrainer.distinctFeatures')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 h-5">
                      <ThemeAdaptiveIcon
                        lightIcon={StyleCheckIcon}
                        darkIcon={StyleCheckIconDark}
                        alt="check"
                        size="sm"
                      />
                      <span className="font-lexend font-normal text-sm leading-[140%] text-text-secondary dark:text-text-secondary-dark">
                        {t('styleTrainer.showDiversity')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 h-5">
                      <ThemeAdaptiveIcon
                        lightIcon={StyleCheckIcon}
                        darkIcon={StyleCheckIconDark}
                        alt="check"
                        size="sm"
                      />
                      <span className="font-lexend font-normal text-sm leading-[140%] text-text-secondary dark:text-text-secondary-dark">
                        {t('styleTrainer.clearNoWatermark')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 第三个区域：上传按钮 */}
                <div className="flex items-center justify-center">
                  <button
                    className="h-12 flex items-center gap-2 rounded-full px-6 bg-[#0DA3A31A] hover:bg-[#0DA3A333] transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ThemeAdaptiveIcon
                      lightIcon={StyleAddIcon}
                      darkIcon={StyleAddIconDark}
                      alt="upload"
                      size="lg"
                    />
                    <span className="font-switzer font-medium text-base leading-6 text-[#0DA3A3]">
                      {t('styleTrainer.uploadImages')}
                    </span>
                  </button>
                </div>

                {/* 第四个区域：Builder 按钮 */}
                <div className="w-full flex items-center justify-center">
                  <button
                    className="w-full h-12 pr-4 pl-4 rounded-full bg-link-default dark:bg-link-default-dark font-switzer font-medium text-sm leading-5 text-center text-white hover:bg-link-pressed dark:hover:bg-link-pressed-dark transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-500 disabled:cursor-not-allowed"
                    disabled={!status.canCreate || modelCreationState.isCreating || modelCreationState.isTraining}
                    onClick={handleStartTraining}
                  >
                    {modelCreationState.isCreating ? t('styleTrainer.creating') :
                      modelCreationState.isTraining ? t('styleTrainer.training') : t('styleTrainer.startTraining')}
                  </button>
                </div>
              </div>
            )}

            {/* 上传中蒙版 - 覆盖在内容之上 */}
            {status.isUploading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center" style={{ background: '#FFFFFFB2', backdropFilter: 'blur(20px)' }}>
                <div className="flex flex-col items-center w-[27.375rem] h-[3.125rem] gap-5">
                  <span className="font-lexend font-normal text-2xl leading-[100%] text-[#1F2937]">{t('styleTrainer.uploading')} {imageUploadState.currentUploadIndex}/{imageUploadState.totalFilesToUpload}</span>
                  <div className="w-[27.375rem] h-1.5 rounded-[1.875rem] bg-[#E5E7EB] overflow-hidden">
                    <div className="h-full rounded-[1.875rem] bg-[#0900FF] transition-all" style={{ width: `${status.uploadProgress}%` }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* 隐藏的文件输入 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleRefImageChange}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default StyleTrainer