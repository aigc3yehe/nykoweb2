import React, { useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { contentDetailAtom, closeContentDetailAtom, toggleLikeContentAtom } from '../../store/contentDetailStore'
import { openChatSidebar } from '../../store/chatSidebarStore'
import { clearChat, addMessage, sendMessage } from '../../store/assistantStore'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang, withLangPrefix } from '../../hooks/useLang'
import ThemeAdaptiveIcon from '../ui/ThemeAdaptiveIcon'

// 导入图标
import modifyIcon from '../../assets/mavae/modify.svg'
import modifyIconDark from '../../assets/mavae/dark/modify.svg'
import animateIcon from '../../assets/mavae/animate.svg'
import animateIconDark from '../../assets/mavae/dark/animate.svg'
import closeIcon from '../../assets/web2/image_detail_close.svg'
import copyIcon from '../../assets/mavae/copy.svg'
import copyIconDark from '../../assets/mavae/dark/copy.svg'
import LikeIcon from '../../assets/web2/like.svg'
import LikedIcon from '../../assets/web2/liked.svg'
import PictureIcon from '../../assets/mavae/Picture_white.svg'
import AvatarIcon from '../../assets/mavae/avatar.svg'
import AvatarIconDark from '../../assets/mavae/dark/avatar.svg'
import SizeIcon from '../../assets/mavae/size.svg'
import SizeIconDark from '../../assets/mavae/dark/size.svg'

const ContentDetailModal: React.FC = () => {
  const [state] = useAtom(contentDetailAtom)
  const closeModal = useSetAtom(closeContentDetailAtom)
  const toggleLike = useSetAtom(toggleLikeContentAtom)
  const openChat = useSetAtom(openChatSidebar)
  const clearChatMessages = useSetAtom(clearChat)
  const addMessageToChat = useSetAtom(addMessage)
  const sendMessageAction = useSetAtom(sendMessage)
  const navigate = useNavigate()
  const lang = useLang()
  const location = useLocation()
  const [isPromptExpanded, setIsPromptExpanded] = useState(false)

  if (!state.isOpen) return null

  const { content, isLoading, error, id } = state

  const handleClose = () => {
    closeModal()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose()
    }
  }

  const handleLikeClick = () => {
    if (content) {
      toggleLike(id)
    }
  }

  // 检查当前是否在对应的详情页面
  const isInDetailPage = () => {
    const pathname = location.pathname

    if (content?.source === 'model' && content?.source_info?.id) {
      return /\/(en|zh-CN|zh-HK)\/model\//.test(pathname) && pathname.endsWith(`/${content.source_info.id}`)
    } else if (content?.source === 'workflow' && content?.source_info?.id) {
      return /\/(en|zh-CN|zh-HK)\/workflow\//.test(pathname) && pathname.endsWith(`/${content.source_info.id}`)
    }
    return false
  }

  // 导航到对应的详情页面
  const navigateToDetailPage = () => {
    if (!content?.source_info?.id) return

    if (content.source === 'model') {
      navigate(withLangPrefix(lang, `/model/${content.source_info.id}`))
    } else if (content.source === 'workflow') {
      navigate(withLangPrefix(lang, `/workflow/${content.source_info.id}`))
    }
  }

  const handleModifyClick = () => {
    if (!content?.url) return

    // 关闭模态框
    closeModal()

    // 如果不在对应的详情页面，先导航到详情页面
    if (!isInDetailPage()) {
      navigateToDetailPage()
    }

    // 打开聊天侧边栏
    openChat()

    // 清空聊天记录
    clearChatMessages()

    // 添加图片消息到聊天记录
    const cu = 500
    const task_id = content.task_id || ''
    const messageType = content.source === 'workflow' ? 'workflow_generate_result' : 'generate_result'

    addMessageToChat(
      'Here is the image you want to modify:',
      messageType,
      task_id,
      content.url,
      cu,
      content.width || 1024,
      content.height || 1024
    )

    // 发送修改消息
    sendMessageAction('I want to modify this image.')
  }

  const handleAnimateClick = () => {
    if (!content?.url) return

    // 关闭模态框
    closeModal()

    // 如果不在对应的详情页面，先导航到详情页面
    if (!isInDetailPage()) {
      navigateToDetailPage()
    }

    // 打开聊天侧边栏
    openChat()

    // 清空聊天记录
    clearChatMessages()

    // 添加图片消息到聊天记录
    const cu = 500
    const task_id = content.task_id || ''
    const messageType = content.source === 'workflow' ? 'workflow_generate_result' : 'generate_result'

    addMessageToChat(
      'Here is the image you want to animate:',
      messageType,
      task_id,
      content.url,
      cu,
      content.width || 1024,
      content.height || 1024
    )

    // 发送动画化消息
    sendMessageAction('I want to animate this image.')
  }

  const handleCopyPrompt = () => {
    if (content?.prompt) {
      navigator.clipboard.writeText(content.prompt)
    }
  }

  const handleGoToSource = () => {
    console.log('Go to source:', content?.source, content?.source_info?.id)
    const source_id = content?.source_info?.id
    if (content?.source === 'model') {
      navigate(withLangPrefix(lang, `/model/${source_id}`))
      closeModal()
    } else if (content?.source === 'workflow') {
      navigate(withLangPrefix(lang, `/workflow/${source_id}`))
      closeModal()
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return dateString

      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      const hours = String(date.getHours()).padStart(2, '0')
      const minutes = String(date.getMinutes()).padStart(2, '0')

      return `${year}.${month}.${day} ${hours}:${minutes}`
    } catch {
      return dateString
    }
  }

  const renderMediaContent = () => {
    if (!content?.url) {
      return (
        <div className="w-full h-full bg-design-bg-light-gray rounded-lg flex items-center justify-center">
          <span className="text-design-medium-gray">No media</span>
        </div>
      )
    }

    if (content.type === 'video') {
      return (
        <video
          src={content.url}
          className="w-full h-full object-contain rounded-lg"
          controls
          poster={content.url}
        />
      )
    } else {
      return (
        <img
          src={content.url}
          alt="Content"
          className="w-full h-full object-contain rounded-lg"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.style.backgroundColor = '#F3F4F6'
            target.src = ''
          }}
        />
      )
    }
  }

  const getSourceTitle = () => {
    return content?.source === 'workflow' ? 'Workflow' : 'Style'
  }

  const getSourceName = () => {
    return content?.source_info?.name || 'Unknown'
  }

  const getDimensions = () => {
    if (content?.width && content?.height) {
      return `${content.width} × ${content.height}`
    }
    return 'Unknown'
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-xl"
      onClick={handleOverlayClick}
    >
      {/* 外层包裹内容和关闭按钮 */}
      <div className="relative flex md:items-start items-center md:flex-row flex-col w-full h-full md:w-auto md:h-auto">
        {/* 移动端关闭按钮 */}
        <div className="block md:hidden w-full h-[60px] relative">
          <button
            onClick={handleClose}
            className="absolute right-5 top-1/2 -translate-y-1/2 size-8 rounded-[0.625rem] flex items-center justify-center hover:bg-gray-600 transition-colors z-20"
          >
            <img src={closeIcon} alt="Close" className="size-8" />
          </button>
        </div>
        {/* 内容区域 */}
        <div
          className="bg-pop-ups dark:bg-pop-ups-dark rounded-[1.25rem] flex md:flex-row flex-col md:w-[62.25rem] md:h-[41.125rem] w-full h-[calc(100vh-60px)] relative overflow-y-auto overflow-x-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 左侧/上方内容区域 */}
          <div className="flex flex-col md:p-8 md:gap-6 md:w-[37.125rem] w-full p-5 gap-3">
            {/* 媒体展示区域 */}
            <div className="md:w-[33.125rem] md:h-[33.125rem] w-full aspect-square bg-[#E8E8E8] dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center relative">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : error ? (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-red-500">{error}</span>
                </div>
              ) : (
                <>
                  {renderMediaContent()}

                  {/* 只有图片才显示遮罩层和标签 */}
                  {content?.type !== 'video' && (
                    <>
                      {/* Mask阴影区域 */}
                      <div className="absolute bottom-0 left-0 right-0 h-[3.25rem] bg-gradient-to-t from-black/72 to-transparent"></div>

                      {/* 类型标签 - 左下角 */}
                      <div className="absolute bottom-2 left-2 flex items-center p-0.5 bg-black/20 rounded">
                        <img src={PictureIcon} alt="Picture" className="w-4 h-4 min-w-4 min-h-4" />
                      </div>

                      {/* 点赞数 - 右下角 */}
                      <div className="absolute bottom-2 right-2 flex items-center gap-0.5 h-5">
                        <button
                          onClick={handleLikeClick}
                          className="flex items-center gap-0.5 h-5 transition-opacity"
                        >
                          <img
                            src={content?.is_liked ? LikedIcon : LikeIcon}
                            alt="Like"
                            className="w-3 h-3"
                          />
                          <span className={`pb-px font-switzer font-medium text-xs leading-4 text-center ${content?.is_liked ? "text-[#F6465D]" : "text-white"
                            }`}>
                            {content?.like_count || 0}
                          </span>
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* 操作按钮区域 */}
            <div className="flex items-center justify-center md:w-[33.125rem] w-full h-10">
              {/* 操作按钮 */}
              <div className="flex items-center gap-2 h-10">
                {content?.type !== 'video' && (
                  <>
                    {/* Modify 按钮 */}
                    <button
                      onClick={handleModifyClick}
                      className="flex items-center justify-center h-10 pt-3 pr-4 pb-3 pl-4 gap-1 rounded-[1.5rem] bg-quaternary dark:bg-quaternary-dark hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      <ThemeAdaptiveIcon
                        lightIcon={modifyIcon}
                        darkIcon={modifyIconDark}
                        alt="Modify"
                        className="w-4 h-4"
                      />
                      <span className="font-lexend font-normal text-sm leading-[100%] text-center text-link-default dark:text-link-default-dark">
                        Modify
                      </span>
                    </button>

                    {/* Animate 按钮 */}
                    <button
                      onClick={handleAnimateClick}
                      className="flex items-center justify-center h-10 pt-3 pr-4 pb-3 pl-4 gap-1 rounded-[1.5rem] bg-quaternary dark:bg-quaternary-dark hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      <ThemeAdaptiveIcon
                        lightIcon={animateIcon}
                        darkIcon={animateIconDark}
                        alt="Animate"
                        className="w-4 h-4"
                      />
                      <span className="font-lexend font-normal text-sm leading-[100%] text-center text-link-default dark:text-link-default-dark">
                        Animate
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 右侧信息区域 */}
          <div className="flex flex-col gap-3 px-5 pb-5 md:pl-0 md:gap-6 md:pt-8 md:pr-6 md:pb-8 w-full relative">
            {/* 作者信息和创建时间 */}
            <div className="flex items-center justify-between h-6">
              {/* 作者信息 */}
              <div className="flex items-center gap-1.5 h-6">
                {/* 头像 */}
                <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {content?.user?.avatar ? (
                    <img
                      src={content.user.avatar}
                      alt={content.user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // 判断当前是dark还是light
                        if (document.documentElement.classList.contains('dark')) {
                          (e.target as HTMLImageElement).src = AvatarIconDark
                        } else {
                          (e.target as HTMLImageElement).src = AvatarIcon
                        }
                      }}
                    />
                  ) : (
                    <ThemeAdaptiveIcon
                      lightIcon={AvatarIcon}
                      darkIcon={AvatarIconDark}
                      alt="Avatar"
                      className="w-full h-full"
                    />
                  )}
                </div>

                {/* 作者名 */}
                <span className="font-switzer font-medium text-sm leading-5 text-text-main dark:text-text-main-dark">
                  {content?.user?.name || 'Unknown'}
                </span>
              </div>

              {/* 创建时间 */}
              <span className="font-switzer font-medium text-xs leading-5 text-text-secondary dark:text-text-secondary-dark">
                {formatDate(content?.created_at)}
              </span>
            </div>

            {/* 详情区域 */}
            <div className="flex flex-col gap-6 flex-1">
              {/* Prompt 部分 */}
              <div className="flex flex-col gap-2">
                {/* Prompt第一行：标题和复制按钮 */}
                <div className="flex items-center justify-between h-5">
                  <span className="font-switzer font-medium text-sm leading-5 text-text-main dark:text-text-main-dark">
                    Prompt
                  </span>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1"
                  >
                    <ThemeAdaptiveIcon
                      lightIcon={copyIcon}
                      darkIcon={copyIconDark}
                      alt="Copy"
                      size="sm"
                    />
                    <span className="font-switzer font-medium text-xs leading-5 text-text-secondary dark:text-text-secondary-dark">
                      Copy
                    </span>
                  </button>
                </div>

                {/* Prompt第二行：内容 */}
                <div className="flex flex-col gap-1">
                  <div className="rounded-xl p-3 bg-gray-50 dark:bg-gray-800">
                    <p className={`font-switzer font-medium text-xs leading-5 text-text-secondary dark:text-text-secondary-dark break-words whitespace-pre-wrap ${isPromptExpanded ? '' : 'line-clamp-2'}`}>
                      {content?.prompt || 'No prompt available'}
                    </p>
                  </div>

                  {/* Prompt第三行：展开/收起按钮 */}
                  {content?.prompt && content.prompt.length > 100 && (
                    <button
                      onClick={() => setIsPromptExpanded(!isPromptExpanded)}
                      className="font-switzer font-medium text-xs leading-5 text-link-default dark:text-link-default-dark self-start"
                    >
                      {isPromptExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              </div>

              {/* Dimensions 部分 */}
              <div className="flex items-center justify-between h-5">
                {/* 左侧标题 */}
                <span className="font-switzer font-medium text-xs leading-5 text-text-secondary dark:text-text-secondary-dark">
                  Dimensions
                </span>

                {/* 右侧内容 */}
                <div className="flex items-center gap-1">
                  <ThemeAdaptiveIcon
                    lightIcon={SizeIcon}
                    darkIcon={SizeIconDark}
                    alt="Size"
                    size="sm"
                  />
                  <span className="font-switzer font-medium text-xs leading-5 text-text-main dark:text-text-main-dark">
                    {getDimensions()}
                  </span>
                </div>
              </div>

              {/* Source 部分 */}
              <div className="flex flex-col gap-2">
                {/* Source Header */}
                <div className="flex items-center h-4">
                  <span className="font-switzer font-medium text-sm leading-5 text-text-main dark:text-text-main-dark">
                    {getSourceTitle()}
                  </span>
                </div>
                {/* Source Content - 参考ChatInput.tsx的工作流显示样式 */}
                <div
                  className="flex items-center gap-1 h-14 p-1 rounded bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={handleGoToSource}
                >
                  {/* 封面 */}
                  <div className="w-8 h-12 rounded overflow-hidden bg-gray-200 flex-shrink-0">
                    {content?.source_info?.cover ? (
                      <img
                        src={content.source_info.cover}
                        alt="cover"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.backgroundColor = '#E8E8E8'
                            ; (e.target as HTMLImageElement).src = ''
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200" />
                    )}
                  </div>
                  {/* 名称 */}
                  <div className="flex items-center">
                    <span className="font-switzer font-normal text-xs leading-5 text-text-main dark:text-text-main-dark">
                      {getSourceName()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* PC端关闭按钮 - 内容区域外侧右上角，ml-4 mt-2，32x32 */}
        <button
          onClick={handleClose}
          className="ml-4 mt-2 size-8 flex items-center justify-center hover:bg-gray-600 rounded-[0.625rem] transition-colors z-20 hidden md:flex"
        >
          <img src={closeIcon} alt="Close" className="size-8" />
        </button>
      </div>
    </div>
  )
}

export default ContentDetailModal 