import React from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { contentDetailAtom, closeContentDetailAtom, toggleLikeContentAtom } from '../../store/contentDetailStore'
import { openChatSidebar } from '../../store/chatSidebarStore'
import { clearChat, addMessage, sendMessage } from '../../store/assistantStore'
import { useNavigate, useLocation } from 'react-router-dom'
import { useLang, withLangPrefix } from '../../hooks/useLang'

// 导入图标
import modifyIcon from '../../assets/web2/modify.svg'
import animateIcon from '../../assets/web2/animate.svg'
import nolikeIcon from '../../assets/web2/nolike.svg'
import likedIcon from '../../assets/web2/liked.svg'
import closeIcon from '../../assets/web2/image_detail_close.svg'
import copyIcon from '../../assets/web2/copy.svg'
import goIcon from '../../assets/web2/go.svg'

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
          className="bg-white rounded-lg border-l border-design-bg-light-gray flex md:flex-row flex-col md:w-[62.25rem] md:h-[41.125rem] w-full h-[calc(100vh-60px)] relative overflow-y-auto overflow-x-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 左侧/上方内容区域 */}
          <div className="flex flex-col md:p-8 md:gap-6 md:w-[37.125rem] w-full p-5 gap-3">
            {/* 媒体展示区域 */}
            <div className="md:w-[33.125rem] md:h-[33.125rem] w-full aspect-square bg-design-bg-light-gray rounded-lg overflow-hidden flex items-center justify-center">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : error ? (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-red-500">{error}</span>
                </div>
              ) : (
                renderMediaContent()
              )}
            </div>

            {/* 操作按钮区域 */}
            <div className="flex items-center justify-between md:w-[33.125rem] w-full h-10">
              {/* 左侧操作按钮 */}
              <div className="flex items-center gap-2 h-10">
                {content?.type !== 'video' && (
                  <>
                    {/* Modify 按钮 */}
                    <button
                      onClick={handleModifyClick}
                      className="flex items-center justify-center size-10 md:w-auto md:gap-1 md:h-10 md:px-5 bg-design-bg-light-blue text-design-main-text rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <img src={modifyIcon} alt="Modify" className="w-4 h-4" />
                      <span className="md:block hidden font-lexend font-normal text-sm leading-none">Modify</span>
                    </button>

                    {/* Animate 按钮 */}
                    <button
                      onClick={handleAnimateClick}
                      className="flex items-center justify-center size-10 md:w-auto md:gap-1 md:h-10 md:px-5 bg-design-bg-light-blue text-design-main-text rounded-md hover:bg-blue-100 transition-colors"
                    >
                      <img src={animateIcon} alt="Animate" className="w-4 h-4" />
                      <span className="md:block hidden font-lexend font-normal text-sm leading-none">Animate</span>
                    </button>
                  </>
                )}
              </div>

              {/* 右侧按钮 */}
              <div className="flex items-center gap-2 h-10">
                {/* 点赞按钮 - 只显示点赞状态，不显示数量 */}
                <button
                  onClick={handleLikeClick}
                  className="flex items-center justify-center size-10 md:w-auto md:gap-1 md:h-10 md:px-5 bg-design-bg-light-blue rounded-md hover:bg-blue-100 transition-colors"
                >
                  <img 
                    src={content?.is_liked ? likedIcon : nolikeIcon} 
                    alt="Like" 
                    className="w-4 h-4" 
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 右侧信息区域 */}
          <div className="flex flex-col gap-3 px-5 pb-5 md:gap-6 md:pt-8 md:pr-16 md:pb-8 md:w-[25.125rem] w-full relative">
            {/* 作者信息和创建时间 */}
            <div className="flex items-center justify-between h-8">
              {/* 作者信息 */}
              <div className="flex items-center gap-1.5 h-8">
                {/* 头像 */}
                <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {content?.user?.avatar ? (
                    <img 
                      src={content.user.avatar} 
                      alt={content.user.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300" />
                  )}
                </div>
                
                {/* 作者名 */}
                <span className="font-lexend font-normal text-base leading-4 text-design-dark-gray">
                  {content?.user?.name || 'Unknown'}
                </span>
              </div>

              {/* 创建时间 */}
              <span className="font-lexend font-normal text-xs leading-4 text-design-medium-gray">
                {formatDate(content?.created_at)}
              </span>
            </div>

            {/* 详情区域 */}
            <div className="flex flex-col gap-6 flex-1">
              {/* Prompt 部分 */}
              <div className="flex flex-col gap-2">
                {/* Prompt Header */}
                <div className="flex items-center justify-between h-4">
                  <span className="font-lexend font-semibold text-sm leading-none text-design-main-text">
                    Prompt
                  </span>
                  <button
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-0.5 hover:bg-gray-100 rounded px-1 py-0.5 transition-colors"
                  >
                    <img src={copyIcon} alt="Copy" className="w-4 h-4" />
                    <span className="font-lexend font-normal text-xs leading-none text-design-dark-gray">
                      Copy
                    </span>
                  </button>
                </div>
                
                 {/* Prompt Content */}
                 <div className="w-full rounded-lg p-3 bg-design-bg-light-gray overflow-x-hidden">
                   <p className="font-lexend font-normal text-xs leading-140 text-design-dark-gray break-words whitespace-pre-wrap">
                     {content?.prompt || 'No prompt available'}
                   </p>
                 </div>
              </div>

              {/* Dimensions 部分 */}
              <div className="flex flex-col gap-2">
                {/* Dimensions Header */}
                <div className="flex items-center h-4">
                  <span className="font-lexend font-semibold text-sm leading-none text-design-main-text">
                    Dimensions
                  </span>
                </div>
                
                {/* Dimensions Content */}
                <div className="w-full rounded-lg p-3 bg-design-bg-light-gray">
                  <p className="font-lexend font-normal text-xs leading-140 text-design-dark-gray">
                    {getDimensions()}
                  </p>
                </div>
              </div>

              {/* Source 部分 */}
              <div className="flex flex-col gap-2">
                {/* Source Header */}
                <div className="flex items-center h-4">
                  <span className="font-lexend font-semibold text-sm leading-none text-design-main-text">
                    {getSourceTitle()}
                  </span>
                </div>
                {/* Source Content - 封面+name，gap 8px，封面50x50，圆角8px，背景#E8E8E8，name水平对齐 */}
                <div className="w-full rounded-lg p-3 bg-design-bg-light-gray flex items-center justify-between">
                  <div className="flex items-center gap-2 md:gap-[0.5rem]">
                    {content?.source_info?.cover ? (
                      <img
                        src={content.source_info.cover}
                        alt="cover"
                        className="w-12 h-12 rounded-lg bg-[#E8E8E8] object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-[#E8E8E8]" />
                    )}
                    <span className="font-lexend font-normal text-xs leading-140 text-design-main-text">
                      {getSourceName()}
                    </span>
                  </div>
                  <button
                    onClick={handleGoToSource}
                    className="flex items-center justify-center hover:bg-gray-200 rounded transition-colors"
                  >
                    <img src={goIcon} alt="Go" className="w-6 h-6" />
                  </button>
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