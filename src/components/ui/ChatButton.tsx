import React from 'react'
import { useAtom } from 'jotai'
import { chatSidebarAtom } from '../../store/chatSidebarStore'
import { useChatSidebar } from '../../hooks/useChatSidebar'
import ChatBtnIcon from '../../assets/web2/chatbtn.svg'

const ChatButton: React.FC = () => {
  const [chatSidebar] = useAtom(chatSidebarAtom)
  const { openChat } = useChatSidebar()

  // 判断是否在workflow或model详情页
  const isDetailPage = (() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname
      return path.startsWith('/workflow/') || path.startsWith('/model/')
    }
    return false
  })()

  // 当侧边栏打开时，不显示聊天按钮
  if (chatSidebar.isOpen) {
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