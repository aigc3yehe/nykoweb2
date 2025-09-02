import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import UploadIcon from '../assets/mavae/upload.svg'
import UploadIconDark from '../assets/mavae/dark/upload.svg'
import StyleImageDeleteIcon from '../assets/mavae/style_image_delete.svg'
import StyleImageDeleteIconDark from '../assets/mavae/dark/style_image_delete.svg'
import ThemeAdaptiveIcon from '../components/ui/ThemeAdaptiveIcon'
import { modelDetailAtom, fetchModelDetailAtom } from '../store/modelDetailStore'
import { modelEditAtom, initEditFormAtom, updateEditFormAtom, updateModelAtom } from '../store/modelEditStore'
import { uploadFileToS3 } from '../store/imagesStore'
import { userStateAtom } from '../store/loginStore'
import { useLang, withLangPrefix } from '../hooks/useLang'
import { useI18n } from '../hooks/useI18n'
import { addToastAtom } from '../store/toastStore'
import { useSetAtom, useAtom } from 'jotai'
import LeftIcon from '../assets/mavae/left.svg'
import LeftIconDark from '../assets/mavae/dark/left.svg'

const ModelEdit: React.FC = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const lang = useLang()
  const { t } = useI18n()
  const addToast = useSetAtom(addToastAtom)

  // Store状态
  const [modelDetailState] = useAtom(modelDetailAtom)
  const [modelEditState] = useAtom(modelEditAtom)
  const [userState] = useAtom(userStateAtom)
  const [, fetchModelDetail] = useAtom(fetchModelDetailAtom)
  const [, initEditForm] = useAtom(initEditFormAtom)
  const [, updateEditForm] = useAtom(updateEditFormAtom)
  const [, updateModel] = useAtom(updateModelAtom)

  // 本地状态
  const [cover, setCover] = useState<File | null>(null)
  const [coverUrl, setCoverUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 获取模型数据
  useEffect(() => {
    if (id && !modelDetailState.model) {
      // 如果没有模型数据，主动获取
      fetchModelDetail({ modelId: parseInt(id), refresh: false })
    }
  }, [id, modelDetailState.model, fetchModelDetail])

  // 初始化表单数据
  useEffect(() => {
    if (modelDetailState.model) {
      const model = modelDetailState.model

      // 初始化编辑表单
      initEditForm(model)

      // 设置封面图片URL - 从API数据中获取
      if (model.cover) {
        setCoverUrl(model.cover)
        // 同时更新表单中的cover字段
        updateEditForm({ cover: model.cover })
        // 设置本地cover状态，这样图片就能正确显示
        setCover(new File([], 'cover.jpg')) // 创建一个虚拟文件对象
      }
    }
  }, [modelDetailState.model, initEditForm, updateEditForm])

  // 检查用户权限
  useEffect(() => {
    if (modelDetailState.model && userState.user) {
      const currentUserDid = userState.user.tokens.did
      const modelAuthorDid = modelDetailState.model.user?.did

      if (currentUserDid !== modelAuthorDid && userState.userDetails?.role !== 'admin') {
        // 用户没有权限编辑此模型，重定向到详情页
        navigate(withLangPrefix(lang, `/model/${id}`))
        addToast({
          message: 'You do not have permission to edit this model',
          type: 'error'
        })
      }
    }
  }, [modelDetailState.model, userState.user, navigate, lang, id, addToast])

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      addToast({
        message: 'Please select an image file',
        type: 'error'
      })
      return
    }

    setCover(file)
    setCoverUrl(URL.createObjectURL(file))

    // 上传封面图片到S3
    try {
      setIsUploading(true)
      const uploadedUrl = await uploadFileToS3(file)
      updateEditForm({ cover: uploadedUrl })
    } catch (error) {
      console.error('Failed to upload cover image:', error)
      addToast({
        message: 'Failed to upload cover image',
        type: 'error'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await handleFileUpload(e.target.files[0])
    }
  }

  const handleRemoveCover = () => {
    setCover(null)
    setCoverUrl(null)
    // 重要：将表单中的cover字段设置为空字符串，这样在保存时能检测到变化
    updateEditForm({ cover: '' })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async () => {
    if (!id) return

    try {
      const success = await updateModel({
        modelId: parseInt(id),
        onSuccess: () => {
          addToast({
            message: 'Model updated successfully!',
            type: 'success'
          })

          // 延迟跳转回模型详情页
          setTimeout(() => {
            navigate(withLangPrefix(lang, `/model/${id}`))
          }, 1500)
        }
      })

      if (!success) {
        addToast({
          message: modelEditState.updateError || 'Failed to update model',
          type: 'error'
        })
      }
    } catch (error) {
      console.error('Failed to update model:', error)
      addToast({
        message: 'Failed to update model',
        type: 'error'
      })
    }
  }

  // 显示错误状态
  if (modelDetailState.error) {
    return (
      <div className="flex items-center justify-center h-full w-full p-8">
        <div className="text-center">
          <span className="font-switzer text-sm text-red-500 mb-4 block">Error: {modelDetailState.error}</span>
          <button
            onClick={() => id && fetchModelDetail({ modelId: parseInt(id), refresh: true })}
            className="px-4 py-2 bg-link-default dark:bg-link-default-dark text-white rounded-lg hover:bg-link-pressed dark:hover:bg-link-pressed transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (modelDetailState.isLoading || !modelDetailState.model) {
    return (
      <div className="flex items-center justify-center h-full w-full p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-link-default dark:border-link-default-dark mx-auto mb-4"></div>
          <span className="font-switzer text-sm text-text-secondary dark:text-text-secondary-dark">
            {modelDetailState.isLoading ? 'Loading model...' : 'Model not found'}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full md:pt-6 md:px-8 md:pb-8">

      {/* 移动端标题 + 返回按钮 */}
      <div className="lg:hidden h-16 flex items-center gap-2 p-4 bg-secondary dark:bg-secondary-dark">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 h-8"
          aria-label={t('pages.return')}
        >
          <ThemeAdaptiveIcon
            lightIcon={LeftIcon}
            darkIcon={LeftIconDark}
            alt={t('pages.return')}
            size="lg"
          />
        </button>
        <span className="font-switzer font-bold text-2xl leading-8 text-text-main dark:text-text-main-dark">Edit</span>
      </div>

      {/* 中间容器 */}
      <div className="md:w-[22.5rem] md:max-w-[22.5rem] mx-auto md:border md:border-line-subtle dark:border-line-subtle-dark rounded-xl bg-secondary dark:bg-secondary-dark p-6 flex flex-col gap-6">

        {/* Name 输入框组件 */}
        <div className="flex flex-col gap-1">
          {/* 标题 */}
          <div className="flex items-center gap-1">
            <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">Name</span>
            <span className="font-switzer font-normal text-sm leading-5 align-middle text-red-500">*</span>
          </div>
          {/* 输入框 */}
          <input
            className="w-full h-10 pt-0 pr-3 pb-0 pl-3 gap-2 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-tertiary dark:bg-tertiary-dark font-switzer font-medium text-sm leading-[100%] align-middle text-text-main dark:text-text-main-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-link-default dark:focus:ring-link-default-dark focus:border-transparent"
            placeholder="A name matches its features"
            value={modelEditState.form.name}
            onChange={(e) => updateEditForm({ name: e.target.value })}
          />
        </div>

        {/* Description 输入框组件 */}
        <div className="flex flex-col gap-1">
          {/* 标题 */}
          <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">Description</span>
          {/* 输入框 */}
          <textarea
            className="w-full h-[6.75rem] pt-3 pr-3 pb-3 pl-3 gap-2 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-tertiary dark:bg-tertiary-dark font-switzer font-medium text-sm leading-[100%] align-middle text-text-main dark:text-text-main-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark resize-none focus:outline-none focus:ring-2 focus:ring-link-default dark:focus:ring-link-default-dark focus:border-transparent"
            placeholder="How can we use it to make the most of this model's features?"
            value={modelEditState.form.description}
            onChange={(e) => updateEditForm({ description: e.target.value })}
          />
        </div>

        {/* Cover Image 组件 */}
        <div className="flex flex-col gap-1">
          {/* 标题 */}
          <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">Cover Image</span>
          {/* 图片上传组件 */}
          {(cover || modelEditState.form.cover) && coverUrl ? (
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

        {/* Tags 输入框组件 */}
        <div className="flex flex-col gap-1">
          {/* 标题 */}
          <span className="font-switzer font-normal text-sm leading-5 align-middle text-text-main dark:text-text-main-dark">Tags (Optional)</span>
          {/* 输入框 */}
          <input
            className="w-full h-10 pt-0 pr-3 pb-0 pl-3 gap-2 rounded-xl border border-line-subtle dark:border-line-subtle-dark bg-tertiary dark:bg-tertiary-dark font-switzer font-medium text-sm leading-[100%] align-middle text-text-main dark:text-text-main-dark placeholder:text-text-secondary dark:placeholder:text-text-secondary-dark focus:outline-none focus:ring-2 focus:ring-link-default dark:focus:ring-link-default-dark focus:border-transparent"
            placeholder="Enter tags separated by commas"
            value={modelEditState.form.tags.join(', ')}
            onChange={(e) => {
              const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
              updateEditForm({ tags })
            }}
          />
        </div>

        {/* 保存按钮 */}
        <button
          onClick={handleSave}
          disabled={modelEditState.isUpdating || isUploading || !modelEditState.form.name.trim()}
          className="w-full h-12 px-4 gap-1 rounded-full bg-link-default dark:bg-link-default-dark font-switzer font-medium text-sm leading-5 text-center text-white hover:bg-link-pressed dark:hover:bg-link-pressed transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {modelEditState.isUpdating ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default ModelEdit
