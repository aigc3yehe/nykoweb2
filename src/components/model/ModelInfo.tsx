import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAtom, useSetAtom } from 'jotai'
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
import CopyIcon from '../../assets/mavae/copy.svg'
import CopyIconDark from '../../assets/mavae/dark/copy.svg'
import AddIcon from '../../assets/mavae/add.svg'
import AddIconDark from '../../assets/mavae/dark/add.svg'
import FinishIcon from '../../assets/mavae/finish.svg'
import FinishIconDark from '../../assets/mavae/dark/finish.svg'
import PictureIcon from '../../assets/mavae/Picture.svg'
import PictureIconDark from '../../assets/mavae/dark/Picture.svg'
import GptIcon from '../../assets/mavae/gpt.svg'
import GptIconDark from '../../assets/mavae/dark/gpt.svg'
import { useChatSidebar } from '../../hooks/useChatSidebar'
import { modelDetailAtom, toggleLikeModelAtom } from '../../store/modelDetailStore'
import { useI18n } from '../../hooks/useI18n'
import { addToastAtom } from '../../store/toastStore'
import { shareCurrentPage } from '../../utils/share'
import { sendMessage } from '../../store/assistantStore'
import ThemeAdaptiveIcon from '../ui/ThemeAdaptiveIcon'
import { formatNumber } from '../../utils'

interface ModelInfoProps {
  className?: string
}

const ModelInfo: React.FC<ModelInfoProps> = ({ className = '' }) => {
  const [state] = useAtom(modelDetailAtom)
  const model = state.model
  const navigate = useNavigate()
  const { openChat } = useChatSidebar()
  const toggleLikeModel = useSetAtom(toggleLikeModelAtom)
  const { t } = useI18n()
  const addToast = useSetAtom(addToastAtom)
  const sendMessageAction = useSetAtom(sendMessage)
  const [isPromptExpanded, setIsPromptExpanded] = useState(false)

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

  // 渲染类型标签
  const renderTypeTags = (types: string[], typeName: string) => {
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
                  {type}
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
        background: 'bg-text-disable dark:bg-text-disable-dark',
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
      background: 'bg-text-disable dark:bg-text-disable-dark',
      textColor: 'text-white',
      cursor: 'cursor-not-allowed'
    }
  }

  // 是否ready
  const isReady = getTrainStatusText() === 'Ready'

  // 获取训练状态颜色
  const getTrainStatusClasses = () => {
    if (!model?.model_tran || model.model_tran.length === 0) {
      return 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
    }
    const latestTrain = model.model_tran[model.model_tran.length - 1]
    if (latestTrain.train_state === 2) {
      return 'bg-[#DBFFE5] dark:bg-green-900 text-[#319F43] dark:text-green-400'
    }
    if (latestTrain.train_state === 1) {
      return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
    }
    if (latestTrain.train_state === 0) {
      return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
    }
    if (latestTrain.train_state === -1) {
      return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400'
    }
    return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400'
  }

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
            <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-800">
              <p
                className={`font-switzer font-medium text-xs leading-5 text-text-secondary dark:text-text-secondary-dark ${isPromptExpanded ? '' : 'line-clamp-2'
                  }`}
              >
                {model.description || 'No description available'}
              </p>
            </div>

            {/* Description第三行：展开/收起按钮 */}
            {model.description && model.description.length > 100 && (
              <button
                onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                className="font-switzer font-medium text-xs leading-5 text-link-default dark:text-link-default-dark self-start"
              >
                {isPromptExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        </div>

        {/* 第四行：Builder信息 */}
        <div className="flex flex-col gap-2">
          <span className="font-switzer font-medium text-sm leading-5 text-text-main dark:text-text-main-dark">
            Builder
          </span>
          <div className="flex flex-col">
            {/* 第一行：Input */}
            {renderBuilderStep(1, 'Input', ['Text'])}
            
            {/* 第二行：Model */}
            {renderBuilderStep(2, 'Model', ['StableDiffusionXL'])}
            
            {/* 第三行：Output */}
            {renderBuilderStep(3, 'Output', ['Image'])}
          </div>
        </div>
      </div>

      {/* 下半部分：按钮组 */}
      <div className="flex items-center gap-3 h-10 w-full md:w-[26.625rem]">
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

        {/* PC端 - 分享按钮 */}
        <button
          onClick={handleShare}
          className="hidden md:flex items-center justify-center gap-1 h-10 px-4 rounded-full bg-quaternary dark:bg-quaternary-dark hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
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
    </div>
  )
}

export default ModelInfo
