import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSetAtom } from 'jotai'
import avatarSvg from '../../assets/Avatar.svg'
import AvatarIcon from '../../assets/mavae/avatar.svg'
import AvatarIconDark from '../../assets/mavae/dark/avatar.svg'
import CreateIcon from '../../assets/mavae/create.svg'
import CreateIconDark from '../../assets/mavae/dark/create.svg'
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
//import GeminiIcon from '../../assets/mavae/gemini.svg'
//import GeminiIconDark from '../../assets/mavae/dark/gemini.svg'
import Gemini2Icon from '../../assets/mavae/gemini2.svg'
import Gemini2IconDark from '../../assets/mavae/dark/gemini2.svg'
import KlingIcon from '../../assets/mavae/klingai.svg'
import KlingIconDark from '../../assets/mavae/dark/klingai.svg'
//import MidjourneyIcon from '../../assets/mavae/midjourney.svg'
//import MidjourneyIconDark from '../../assets/mavae/dark/midjourney.svg'
import WorkflowEditIcon from '../../assets/mavae/Workflow_Edit.svg'
import WorkflowEditIconDark from '../../assets/mavae/dark/Workflow_Edit.svg'
import WorkflowDeleteIcon from '../../assets/mavae/Workflow_Delete.svg'
import WorkflowDeleteIconDark from '../../assets/mavae/dark/Workflow_Delete.svg'
import { useChatSidebar } from '../../hooks/useChatSidebar'
import { toggleLikeWorkflowAtom, workflowDetailAtom } from '../../store/workflowDetailStore'
import { useI18n } from '../../hooks/useI18n'
import { useLang } from '../../hooks/useLang'
import { addToastAtom } from '../../store/toastStore'
import { shareCurrentPage } from '../../utils/share'
import { sendMessage } from '../../store/assistantStore'
import { userStateAtom } from '../../store/loginStore'
import { useAtom } from 'jotai'
import ThemeAdaptiveIcon from '../ui/ThemeAdaptiveIcon'
import {WorkflowDto} from "../../services/api";

interface WorkflowInfoProps {
  workflow: WorkflowDto
  className?: string
}

const WorkflowInfo: React.FC<WorkflowInfoProps> = ({ workflow, className = '' }) => {
  const navigate = useNavigate()
  const { openChat } = useChatSidebar()
  const toggleLikeWorkflow = useSetAtom(toggleLikeWorkflowAtom)
  const { t } = useI18n()
  const lang = useLang()
  const addToast = useSetAtom(addToastAtom)
  const sendMessageAction = useSetAtom(sendMessage)
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
  const [userState] = useAtom(userStateAtom)
  const [workflowDetailState] = useAtom(workflowDetailAtom)

  // 获取用户头像
  const getAvatarUrl = () => {
    if (workflow?.user?.avatar) {
      return workflow.user.avatar
    }
    return avatarSvg
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

  // 获取类型对应的图标
  const getTypeIcon = (type: string, provider?: string) => {
    switch (type.toLowerCase().trim()) {
      case 'image':
        return { light: PictureIcon, dark: PictureIconDark }
      default:
        // 如果有提供商信息，使用提供商图标
        if (provider) {
          return getProviderIcon(provider)
        }
        return { light: GptIcon, dark: GptIconDark }
    }
  }

  // 渲染类型标签
  const renderTypeTags = (types: string[], _typeName: string, provider?: string) => {
    if (!types || types.length === 0) return null

    return (
      <div className="flex items-center gap-2">
        {types.map((type, index) => {
          const typeIcon = getTypeIcon(type, provider)
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
  const renderBuilderStep = (step: number, title: string, types: string[], provider?: string) => {
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
            {renderTypeTags(types, title, provider)}
          </div>
        </div>
      </div>
    )
  }

  // 获取用户显示名称
  const getDisplayName = () => {
    if (workflow?.user?.name) {
      return workflow.user.name
    }
    return "Anonymous"
  }

  const handleUseNow = () => {
    // 1. 打开右侧聊天窗口（包含登录检查）
    // 2. 发送消息：I want to use this workflow.
    openChat()
    sendMessageAction('I want to use this workflow.')
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
    navigate(`/${lang}/workflow/${workflow.workflow_id}/edit`)
  }

  // 处理删除按钮点击
  const handleDelete = () => {
    // TODO: 显示删除确认对话框
    console.log('Delete workflow:', workflow.workflow_id)
  }

  // 判断是否显示编辑和删除按钮
  const shouldShowEditDelete = () => {
    // 检查用户是否已登录
    if (!userState.isAuthenticated || !userState.user) {
      return false
    }

    // 检查工作流是否存在
    if (!workflow || !workflowDetailState.workflow) {
      return false
    }

    const currentUserDid = userState.user.tokens.did
    const workflowAuthorDid = workflow.user?.did || workflowDetailState.workflow.user?.did

    // 当前用户是该工作流的作者
    if (currentUserDid === workflowAuthorDid) {
      return true
    }

    // 检查当前用户是否为管理员
    // 这里假设用户角色信息存储在 userDetails 中
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
          {workflow.name}
        </h1>

        {/* 移动端 - 点赞和分析按钮行 */}
        <div className="flex items-center gap-6 h-5 md:hidden">
          {/* 点赞按钮 */}
          <button
            onClick={() => workflow && toggleLikeWorkflow(workflow.workflow_id)}
            className="flex items-center gap-1 h-5 rounded"
          >
            <ThemeAdaptiveIcon
              lightIcon={workflow?.is_liked ? LikedIcon : LikeOutlineIcon}
              darkIcon={workflow?.is_liked ? LikedIconDark : LikeOutlineIconDark}
              alt="Like"
              size="lg"
            />
            <span className={`font-switzer font-medium text-sm leading-5 ${workflow?.is_liked
                ? 'text-[#F6465D]'
                : 'text-text-secondary dark:text-text-secondary-dark'
              }`}>
              {typeof workflow?.like_count === 'number' ? workflow.like_count : 0}
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
          {/* Description第一行*/}
          <div className="flex items-center h-5">
            <span className="font-switzer font-medium text-sm leading-5 text-text-main dark:text-text-main-dark">
              Description
            </span>
          </div>

          {/* Description第二行：内容 */}
          <div className="flex flex-col gap-1">
            <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-800">
              <p
                className={`font-switzer font-medium text-xs leading-5 text-text-secondary dark:text-text-secondary-dark ${isDescriptionExpanded ? '' : 'line-clamp-2'
                  }`}
              >
                {workflow.description || 'No description available'}
              </p>
            </div>

            {/* Prompt第三行：展开/收起按钮 */}
            {workflow.prompt && workflow.prompt.length > 100 && (
              <button
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="font-switzer font-medium text-xs leading-5 text-link-default dark:text-link-default-dark self-start"
              >
                {isDescriptionExpanded ? 'Show less' : 'Show more'}
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
            {renderBuilderStep(1, 'Input', workflow.input_type ? workflow.input_type.split(',').map((t: string) => t.trim()) : [])}

            {/* 第二行：Model */}
            {renderBuilderStep(2, 'Model', workflow.model ? [workflow.model] : [], workflow.provider)}

            {/* 第三行：Output */}
            {renderBuilderStep(3, 'Output', workflow.output_type ? workflow.output_type.split(',').map((t: string) => t.trim()) : [])}
          </div>
        </div>
      </div>

      {/* 下半部分：按钮组 */}
      <div className="flex flex-col gap-3 w-full md:w-[26.625rem]">
        {/* 第一行：主要按钮 */}
        <div className="flex items-center gap-3 h-10 w-full">
          {/* Create With this Agent Case按钮 */}
          <button
            onClick={handleUseNow}
            className="flex items-center justify-center gap-1 h-10 px-4 rounded-full bg-link-default dark:bg-link-default-dark hover:bg-link-pressed dark:hover:bg-link-pressed-dark transition-colors flex-1 md:flex-none"
          >
            <ThemeAdaptiveIcon
              lightIcon={CreateIcon}
              darkIcon={CreateIconDark}
              alt="Create"
              size="lg"
            />
            <span className="font-switzer font-medium text-sm leading-5 text-white">
              Create With this Agent Case
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
            onClick={() => workflow && toggleLikeWorkflow(workflow.workflow_id)}
            className="hidden md:flex items-center gap-1 h-5 rounded"
          >
            <ThemeAdaptiveIcon
              lightIcon={workflow?.is_liked ? LikedIcon : LikeOutlineIcon}
              darkIcon={workflow?.is_liked ? LikedIconDark : LikeOutlineIconDark}
              alt="Like"
              size="lg"
            />
            <span className={`font-switzer font-medium text-sm leading-5 ${workflow?.is_liked
                ? 'text-[#F6465D]'
                : 'text-text-secondary dark:text-text-secondary-dark'
              }`}>
              {typeof workflow?.like_count === 'number' ? workflow.like_count : 0}
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

export default WorkflowInfo
