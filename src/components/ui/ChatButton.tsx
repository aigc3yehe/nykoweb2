import React from 'react'
import { useAtom } from 'jotai'
import { useLocation } from 'react-router-dom'
import { chatSidebarAtom } from '../../store/chatSidebarStore'
import { useChatSidebar } from '../../hooks/useChatSidebar'
import ChatBtnIcon from '../../assets/web2/chatbtn.svg'

const ChatButton: React.FC = () => {
  const [chatSidebar] = useAtom(chatSidebarAtom)
  const { openChat } = useChatSidebar()
  const location = useLocation()

  // 判断是否在需要隐藏聊天按钮的页面
  const shouldHideChatButton = (() => {
    const path = location.pathname
    return path === '/pricing' || 
           path === '/workflow/builder' || 
           path.startsWith('/workflow/builder') ||
           path === '/style/trainer' || 
           path.startsWith('/style/trainer')
  })()

  // 判断是否在workflow或model详情页
  const isDetailPage = (() => {
    const path = location.pathname
    return path.startsWith('/workflow/') || path.startsWith('/model/')
  })()

  // 当侧边栏打开时或在特定页面时，不显示聊天按钮
  if (chatSidebar.isOpen || shouldHideChatButton) {
    return null
  }

  return (
    <button
      onClick={openChat}
      className={`fixed ${isDetailPage ? 'bottom-24' : 'bottom-7.5'} right-6 z-40 w-[3.375rem] h-[3.375rem] flex items-center justify-center`}
      aria-label="Open chat"
    >
      <img src={ChatBtnIcon} alt="Chat" className="w-[3.375rem] h-[3.375rem]" />
    </button>
  )
}

export default ChatButton