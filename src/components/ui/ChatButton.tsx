import React from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { chatSidebarAtom, openChatSidebar } from '../../store/chatSidebarStore'
import ChatBtnIcon from '../../assets/web2/chatbtn.svg'

const ChatButton: React.FC = () => {
  const [chatSidebar] = useAtom(chatSidebarAtom)
  const openSidebar = useSetAtom(openChatSidebar)

  // 当侧边栏打开时，不显示聊天按钮
  if (chatSidebar.isOpen) {
    return null
  }

  return (
    <button
      onClick={() => openSidebar()}
      className="fixed bottom-7.5 right-6 z-40 w-[3.375rem] h-[3.375rem] flex items-center justify-center"
      aria-label="Open chat"
    >
      <img src={ChatBtnIcon} alt="Chat" className="w-[3.375rem] h-[3.375rem]" />
    </button>
  )
}

export default ChatButton 