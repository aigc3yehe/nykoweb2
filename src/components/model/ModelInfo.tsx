import React, { useState, useRef, useEffect } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'
import avatarSvg from '../../assets/Avatar.svg'
import AvatarIcon from '../../assets/mavae/avatar.svg'
import AvatarIconDark from '../../assets/mavae/dark/avatar.svg'
import CreateIcon from '../../assets/mavae/create.svg'
import CreateIconDark from '../../assets/mavae/dark/create.svg'
import TrainingIcon from '../../assets/mavae/Training.svg'
import TrainingIconDark from '../../assets/mavae/dark/Training.svg'
import ShareIcon from '../../assets/mavae/share.svg'
import ShareIconDark from '../../assets/mavae/dark/share.svg'
import LikeOutlineIcon from '../../assets/mavae/Like_outline.svg'
import LikeOutlineIconDark from '../../assets/mavae/dark/Like_outline.svg'
import LikedIcon from '../../assets/mavae/Liked.svg'
import LikedIconDark from '../../assets/mavae/dark/Liked.svg'
import AddIcon from '../../assets/mavae/add.svg'
import AddIconDark from '../../assets/mavae/dark/add.svg'
import FinishIcon from '../../assets/mavae/finish.svg'
import FinishIconDark from '../../assets/mavae/dark/finish.svg'
import PictureIcon from '../../assets/mavae/Picture.svg'
import PictureIconDark from '../../assets/mavae/dark/Picture.svg'
import GptIcon from '../../assets/mavae/gpt.svg'
import GptIconDark from '../../assets/mavae/dark/gpt.svg'
import WorkflowEditIcon from '../../assets/mavae/Workflow_Edit.svg'
import WorkflowEditIconDark from '../../assets/mavae/dark/Workflow_Edit.svg'
import WorkflowDeleteIcon from '../../assets/mavae/Workflow_Delete.svg'
import WorkflowDeleteIconDark from '../../assets/mavae/dark/Workflow_Delete.svg'
import { useChatSidebar } from '../../hooks/useChatSidebar'
import { modelDetailAtom, toggleLikeModelAtom } from '../../store/modelDetailStore'
import { useI18n } from '../../hooks/useI18n'
import { useLang } from '../../hooks/useLang'
import { addToastAtom } from '../../store/toastStore'
import { shareCurrentPage } from '../../utils/share'
import { sendMessage } from '../../store/assistantStore'
import { userStateAtom } from '../../store/loginStore'
import { showDialogAtom } from '../../store/dialogStore'
import { modelsApi } from '../../services/api/models'
import ThemeAdaptiveIcon from '../ui/ThemeAdaptiveIcon'

interface ModelInfoProps {
  className?: string
}

const ModelInfo: React.FC<ModelInfoProps> = ({ className = '' }) => {
  const navigate = useNavigate()
  const [state] = useAtom(modelDetailAtom)
  const model = state.model
  const { openChat } = useChatSidebar()
  const toggleLikeModel = useSetAtom(toggleLikeModelAtom)
  const { t } = useI18n()
  const lang = useLang()
  const addToast = useSetAtom(addToastAtom)
  const sendMessageAction = useSetAtom(sendMessage)
  const showDialog = useSetAtom(showDialogAtom)
  const [userState] = useAtom(userStateAtom)
  const [isPromptExpanded, setIsPromptExpanded] = useState(false)
  const descriptionRef = useRef<HTMLParagraphElement>(null)
  const [isTextTruncated, setIsTextTruncated] = useState(false)

  // 如果没有模型数据，不渲染
  if (!model) {
    return null
  }

  // 获取用户头像
  const getAvatarUrl = () => {
    if (model?.user?.avatar) {
      return model.user.avatar
    }
    return avatarSvg
  }

  // 获取类型对应的图标
  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase().trim()) {
      case 'image':
        return { light: PictureIcon, dark: PictureIconDark }
      default:
        return { light: GptIcon, dark: GptIconDark }
    }
  }

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

  // 获取类型显示文本
  const getTypeDisplayText = (type: string, stepTitle?: string) => {
    // 如果是Models类型，进行模型名称转换
    if (stepTitle === 'Models') {
      return getModelDisplayName(type)
    }

    // 如果是Input类型，使用特殊的文案
    if (stepTitle === 'User Input') {
      switch (type.toLowerCase().trim()) {
        case 'image':
          return 'Reference Image'
        case 'text':
          return 'Additional Prompt'
        default:
          return type
      }
    }

    // 如果是Output类型，使用Builder页面的文案
    if (stepTitle === 'Case Output') {
      switch (type.toLowerCase().trim()) {
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

    // 默认返回原值
    return type
  }

  // 渲染类型标签
  const renderTypeTags = (types: string[], stepTitle?: string) => {
    if (!types || types.length === 0) return null

    return (
      <div className="flex items-center gap-2">
        {types.map((type, index) => {
          const typeIcon = getTypeIcon(type)
          return (
            <React.Fragment key={index}>
              <div className="flex items-center gap-0.5 h-5 px-1.5 py-0.5 rounded-lg border border-line-subtle dark:border-line-subtle-dark">
                <ThemeAdaptiveIcon
                  lightIcon={typeIcon.light}
                  darkIcon={typeIcon.dark}
                  alt={type}
                  size="sm"
                />
                <span className="font-switzer font-medium text-xs leading-4 text-text-main dark:text-text-main-dark">
                  {getTypeDisplayText(type, stepTitle)}
                </span>
              </div>
              {index < types.length - 1 && (
                <ThemeAdaptiveIcon
                  lightIcon={AddIcon}
                  darkIcon={AddIconDark}
                  alt="Add"
                  size="sm"
                />
              )}
            </React.Fragment>
          )
        })}
      </div>
    )
  }

  // 渲染Builder步骤
  const renderBuilderStep = (step: number, title: string, types: string[]) => {
    return (
      <div className="flex items-start gap-3">
        {/* 步骤圆圈和连接线 */}
        <div className="relative flex flex-col items-center">
          {/* 顶部连接线 - 除了第一步，其他步骤都有 */}
          {step > 1 && (
            <div className="w-px h-2 border-l border-text-disable dark:border-text-disable-dark"></div>
          )}

          {/* 圆圈 */}
          <div className="w-4 h-4 rounded-full border border-text-disable dark:border-text-disable-dark flex items-center justify-center">
            {step === 3 ? (
              <ThemeAdaptiveIcon
                lightIcon={FinishIcon}
                darkIcon={FinishIconDark}
                alt="Finish"
                size="sm"
                className="w-[0.831rem] h-[0.831rem]" // 13.3px
              />
            ) : (
              <span className="font-roboto font-bold text-[0.583rem] leading-[0.917rem] text-text-disable dark:text-text-disable-dark">
                {step}
              </span>
            )}
          </div>

          {/* 底部连接线 - 除了最后一步，其他步骤都有 */}
          {step < 3 && (
            <div className="w-px h-5 border-l border-text-disable dark:border-text-disable-dark"></div>
          )}
        </div>

        {/* 内容区域 */}
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex items-center gap-2 h-9 pb-4">
            <span className="font-switzer font-medium text-xs leading-4 text-text-secondary dark:text-text-secondary-dark">
              {title}
            </span>
            {renderTypeTags(types, title)}
          </div>
        </div>
      </div>
    )
  }

  // 获取用户显示名称
  const getDisplayName = () => {
    if (model?.user?.name) {
      return model.user.name
    }
    return "Anonymous"
  }

  // 检查文本是否被截断 - 使用真实的DOM测量
  const checkTextTruncation = () => {
    if (descriptionRef.current && !isPromptExpanded) {
      const element = descriptionRef.current

      // scrollHeight 与 clientHeight 相差超过阈值时才认为是截断
      const heightDifference = element.scrollHeight - element.clientHeight
      const truncationThreshold = 5 // 允许5px的误差范围
      const isTruncated = heightDifference > truncationThreshold

      // 如果DOM测量显示没有截断，但文本长度较长，也认为是截断的（兜底逻辑）
      const textLength = model?.description?.length || 0
      const fallbackTruncated = textLength > 150 // 如果文本超过150个字符，认为是截断的

      setIsTextTruncated(isTruncated || fallbackTruncated)
    } else if (isPromptExpanded) {
      // 展开状态下，不检测截断
      setIsTextTruncated(false)
    }
  }

  // 当组件渲染后或文本变化时检查截断状态
  useEffect(() => {
    // 使用setTimeout确保DOM完全渲染后再检查
    const timeoutId = setTimeout(checkTextTruncation, 0)
    return () => clearTimeout(timeoutId)
  }, [model?.description, isPromptExpanded])

  // 当窗口大小改变时也重新检查
  useEffect(() => {
    const handleResize = () => {
      setTimeout(checkTextTruncation, 0)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // 获取训练状态文本
  const getTrainStatusText = () => {
    if (!model?.model_tran || model.model_tran.length === 0) {
      return 'No Training'
    }
    const latestTrain = model.model_tran[model.model_tran.length - 1]
    if (latestTrain.train_state === 2) return 'Ready'
    if (latestTrain.train_state === 1) return 'Training'
    if (latestTrain.train_state === 0) return 'Queuing'
    if (latestTrain.train_state === -1) return 'Failed'
    return 'Training'
  }

  // 获取按钮显示文本
  const getButtonText = () => {
    if (!model?.model_tran || model.model_tran.length === 0) {
      return 'Create With this Agent Case'
    }
    const latestTrain = model.model_tran[model.model_tran.length - 1]
    if (latestTrain.train_state === 2) return 'Create With this Agent Case'
    if (latestTrain.train_state === 1) return 'Training'
    if (latestTrain.train_state === 0) return 'Queuing'
    if (latestTrain.train_state === -1) return 'Training Failed'
    return 'Training'
  }

  // 获取按钮样式
  const getButtonStyles = () => {
    if (!model?.model_tran || model.model_tran.length === 0) {
      return {
        background: 'bg-gray-400 dark:bg-gray-500',
        textColor: 'text-white',
        cursor: 'cursor-not-allowed'
      }
    }
    const latestTrain = model.model_tran[model.model_tran.length - 1]
    if (latestTrain.train_state === 2) {
      return {
        background: 'bg-link-default dark:bg-link-default-dark hover:bg-link-pressed dark:hover:bg-link-pressed-dark',
        textColor: 'text-white',
        cursor: 'cursor-pointer'
      }
    }
    if (latestTrain.train_state === 1 || latestTrain.train_state === 0) {
      return {
        background: 'bg-[#0DA3A3]',
        textColor: 'text-white',
        cursor: 'cursor-not-allowed'
      }
    }
    if (latestTrain.train_state === -1) {
      return {
        background: 'bg-[#CA35421F]',
        textColor: 'text-[#CA3542]',
        cursor: 'cursor-not-allowed'
      }
    }
    return {
      background: 'bg-gray-400 dark:bg-gray-500',
      textColor: 'text-white',
      cursor: 'cursor-not-allowed'
    }
  }

  // 是否ready
  const isReady = getTrainStatusText() === 'Ready'

  // 获取训练状态颜色
  const handleUseNow = () => {
    // 1. 打开右侧聊天窗口（包含登录检查）
    // 2. 发送消息：I want to generate an image.
    openChat()
    sendMessageAction('I want to generate an image.')
  }

  const handleShare = async () => {
    const success = await shareCurrentPage()
    if (success) {
      addToast({
        message: t('common.share.copied'),
        type: 'success'
      })
    } else {
      addToast({
        message: t('common.share.copyFailed'),
        type: 'error'
      })
    }
  }

  // 处理编辑按钮点击
  const handleEdit = () => {
    // 跳转到编辑页面，需要包含语言前缀
    navigate(`/${lang}/model/${model?.model_id}/edit`)
  }

  // 处理删除按钮点击
  const handleDelete = () => {
    // 显示删除确认弹窗
    showDialog({
      open: true,
      title: t('dialog.deleteModel.title'),
      message: t('dialog.deleteModel.message', { name: model.name || "" }),
      onConfirm: async () => {
        try {
          if (userState.userDetails?.did) {
            // 调用模型可见性切换API，设置为不可见
            const success = await modelsApi.updateModelVisibility(model.model_id, {
              user: userState.userDetails.did,
              visibility: false
            })

            if (success) {
              console.log('Model deleted successfully:', model.model_id)
              addToast({
                message: 'Model deleted successfully',
                type: 'success'
              })
              // 这里可以添加成功后的处理逻辑，比如跳转回列表页
            } else {
              console.error('Failed to delete model')
              addToast({
                message: 'Failed to delete model',
                type: 'error'
              })
            }
          }
          // 关闭弹窗
          showDialog({ open: false, title: '', message: '', onConfirm: () => { }, onCancel: () => { } })
        } catch (error) {
          console.error('Error deleting model:', error)
          addToast({
            message: 'Error deleting model',
            type: 'error'
          })
          // 关闭弹窗
          showDialog({ open: false, title: '', message: '', onConfirm: () => { }, onCancel: () => { } })
        }
      },
      onCancel: () => {
        // 关闭弹窗
        showDialog({ open: false, title: '', message: '', onConfirm: () => { }, onCancel: () => { } })
      },
      confirmText: t('common.delete'),
      cancelText: t('common.cancel')
    })
  }

  // 判断是否显示编辑和删除按钮
  const shouldShowEditDelete = () => {
    // 检查用户是否已登录
    if (!userState.isAuthenticated || !userState.user) {
      return false
    }

    // 检查模型是否存在
    if (!model) {
      return false
    }

    // 只允许对已经完成的模型进行操作
    if (!isReady) {
      return false
    }

    const currentUserDid = userState.user.tokens.did
    const modelAuthorDid = model.user?.did

    // 当前用户是该模型的作者
    if (currentUserDid === modelAuthorDid) {
      return true
    }

    // 检查当前用户是否为管理员
    if (userState.userDetails?.role === 'admin') {
      return true
    }

    return false
  }



  return (
    <div className={`flex flex-col justify-between md:h-[37.5rem] w-full p-6 md:p-6 pt-4 pr-4 pb-6 pl-4 md:pt-6 md:pr-6 md:pb-6 md:pl-6 gap-4 md:gap-4 ${className}`}>
      {/* 上半部分 */}
      <div className="flex flex-col gap-4 w-full">
        {/* 第一行：标题 */}
        <h1 className="font-switzer font-bold text-[2rem] leading-10 text-text-main dark:text-text-main-dark">
          {model.name}
        </h1>

        {/* 移动端 - 点赞和分享按钮行 */}
        <div className="flex items-center gap-6 h-5 md:hidden">
          {/* 点赞按钮 */}
          <button
            onClick={() => model && toggleLikeModel(model.model_id)}
            className="flex items-center gap-1 h-5 rounded"
          >
            <ThemeAdaptiveIcon
              lightIcon={model?.is_liked ? LikedIcon : LikeOutlineIcon}
              darkIcon={model?.is_liked ? LikedIconDark : LikeOutlineIconDark}
              alt="Like"
              size="lg"
            />
            <span className={`font-switzer font-medium text-sm leading-5 ${model?.is_liked
              ? 'text-[#F6465D]'
              : 'text-text-secondary dark:text-text-secondary-dark'
              }`}>
              {typeof model?.like_count === 'number' ? model.like_count : 0}
            </span>
          </button>

          {/* 分享按钮 */}
          <button
            onClick={handleShare}
            className="flex items-center gap-1 h-5 rounded-full"
          >
            <ThemeAdaptiveIcon
              lightIcon={ShareIcon}
              darkIcon={ShareIconDark}
              alt="Share"
              size="lg"
            />
            <span className="font-switzer font-medium text-sm leading-5 text-text-main dark:text-text-main-dark">
              Share
            </span>
          </button>
        </div>

        {/* 第二行：用户信息 */}
        <div className="flex items-center gap-1 h-6">
          <img
            src={getAvatarUrl()}
            alt={getDisplayName()}
            className="w-6 h-6 rounded-full flex-shrink-0"
            onError={(e) => {
              // 判断当前是dark还是light
              if (document.documentElement.classList.contains('dark')) {
                (e.target as HTMLImageElement).src = AvatarIconDark
              } else {
                (e.target as HTMLImageElement).src = AvatarIcon
              }
            }}
          />
          <span className="font-switzer font-medium text-sm leading-5 text-text-main dark:text-text-main-dark">
            {getDisplayName()}
          </span>
        </div>

        {/* 第三行：Description块 */}
        <div className="flex flex-col gap-2">
          {/* Description第一行：标题 */}
          <div className="flex items-center h-5">
            <span className="font-switzer font-medium text-sm leading-5 text-text-main dark:text-text-main-dark">
              Description
            </span>
          </div>

          {/* Description第二行：内容 */}
          <div className="flex flex-col gap-1">
            <div className="rounded-xl p-3 bg-tertiary dark:bg-tertiary-dark">
              <p
                ref={descriptionRef}
                className={`font-switzer font-medium text-xs leading-5 text-text-secondary dark:text-text-secondary-dark ${isPromptExpanded ? '' : 'line-clamp-2'
                  }`}
              >
                {model.description || 'No description available'}
              </p>

              {/* 展开/收起按钮 */}
              {model.description && (isTextTruncated || isPromptExpanded) && (
                <button
                  onClick={() => {
                    setIsPromptExpanded(!isPromptExpanded)
                  }}
                  className="font-switzer font-medium text-xs leading-5 text-link-default dark:text-link-default-dark self-start mt-2"
                >
                  {isPromptExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 第四行：Builder信息 */}
        <div className="flex flex-col gap-2">
          <span className="font-switzer font-medium text-sm leading-5 text-text-main dark:text-text-main-dark">
            Builder
          </span>
          <div className="flex flex-col">
            {/* 第一行：User Input */}
            {renderBuilderStep(1, 'User Input', ['Text'])}

            {/* 第二行：Models */}
            {renderBuilderStep(2, 'Models', ['StableDiffusionXL'])}

            {/* 第三行：Case Output */}
            {renderBuilderStep(3, 'Case Output', ['Image'])}
          </div>
        </div>
      </div>

      {/* 下半部分：按钮组 */}
      <div className="flex flex-col gap-3 w-full md:w-[26.625rem]">
        {/* 第一行：主要按钮 */}
        <div className="flex items-center gap-3 h-10 w-full">
          {/* Use Now按钮 */}
          <button
            onClick={isReady ? handleUseNow : undefined}
            disabled={!isReady}
            className={`flex items-center justify-center gap-1 h-10 px-4 rounded-full transition-colors flex-1 md:flex-none min-w-[12.5rem] ${getButtonStyles().background} ${getButtonStyles().cursor}`}
          >
            <ThemeAdaptiveIcon
              lightIcon={isReady ? CreateIcon : TrainingIcon}
              darkIcon={isReady ? CreateIconDark : TrainingIconDark}
              alt="Use"
              size="lg"
            />
            <span className={`font-switzer font-medium text-sm leading-5 ${getButtonStyles().textColor}`}>
              {getButtonText()}
            </span>
          </button>

          {/* PC端 - 编辑和删除按钮 - 仅在满足条件时显示 */}
          {shouldShowEditDelete() && (
            <>
              {/* 编辑按钮 */}
              <button
                onClick={handleEdit}
                className="hidden md:flex items-center justify-center gap-1 h-10 px-4 rounded-full bg-quaternary dark:bg-quaternary-dark hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors min-w-[7.9375rem]"
              >
                <ThemeAdaptiveIcon
                  lightIcon={WorkflowEditIcon}
                  darkIcon={WorkflowEditIconDark}
                  alt="Edit"
                  size="lg"
                  className="w-5 h-5"
                />
                <span className="font-switzer font-medium text-sm leading-5 text-text-main dark:text-text-main-dark">
                  Edit
                </span>
              </button>

              {/* 删除按钮 */}
              <button
                onClick={handleDelete}
                className="hidden md:flex items-center justify-center p-2.5 w-10 h-10 rounded-full bg-quaternary dark:bg-quaternary-dark hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                <ThemeAdaptiveIcon
                  lightIcon={WorkflowDeleteIcon}
                  darkIcon={WorkflowDeleteIconDark}
                  alt="Delete"
                  size="lg"
                  className="w-5 h-5"
                />
              </button>
            </>
          )}

          {/* PC端 - 分享按钮 */}
          <button
            onClick={handleShare}
            className="hidden md:flex items-center justify-center gap-1 h-10 px-4 rounded-full bg-quaternary dark:bg-quaternary-dark hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors min-w-24"
          >
            <ThemeAdaptiveIcon
              lightIcon={ShareIcon}
              darkIcon={ShareIconDark}
              alt="Share"
              size="lg"
            />
            <span className="font-switzer font-medium text-sm leading-5 text-text-main dark:text-text-main-dark">
              Share
            </span>
          </button>

          {/* PC端 - 点赞按钮 */}
          <button
            onClick={() => model && toggleLikeModel(model.model_id)}
            className="hidden md:flex items-center gap-1 h-5 rounded"
          >
            <ThemeAdaptiveIcon
              lightIcon={model?.is_liked ? LikedIcon : LikeOutlineIcon}
              darkIcon={model?.is_liked ? LikedIconDark : LikeOutlineIconDark}
              alt="Like"
              size="lg"
            />
            <span className={`font-switzer font-medium text-sm leading-5 ${model?.is_liked
              ? 'text-[#F6465D]'
              : 'text-text-secondary dark:text-text-secondary-dark'
              }`}>
              {typeof model?.like_count === 'number' ? model.like_count : 0}
            </span>
          </button>
        </div>

        {/* 移动端 - 编辑和删除按钮 - 仅在满足条件时显示 */}
        {shouldShowEditDelete() && (
          <div className="flex items-center gap-4 h-10 w-full md:hidden">
            {/* 编辑按钮 */}
            <button
              onClick={handleEdit}
              className="flex items-center justify-center gap-1 h-10 px-4 rounded-full bg-quaternary dark:bg-quaternary-dark hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors min-w-[7.9375rem] flex-1"
            >
              <ThemeAdaptiveIcon
                lightIcon={WorkflowEditIcon}
                darkIcon={WorkflowEditIconDark}
                alt="Edit"
                size="lg"
                className="w-5 h-5"
              />
              <span className="font-switzer font-medium text-sm leading-5 text-text-main dark:text-text-main-dark">
                Edit
              </span>
            </button>

            {/* 删除按钮 */}
            <button
              onClick={handleDelete}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-quaternary dark:bg-quaternary-dark hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <ThemeAdaptiveIcon
                lightIcon={WorkflowDeleteIcon}
                darkIcon={WorkflowDeleteIconDark}
                alt="Delete"
                size="lg"
                className="w-5 h-5"
              />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ModelInfo
