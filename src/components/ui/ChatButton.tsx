import React from 'react'
import { useAtom } from 'jotai'
import { useLocation } from 'react-router-dom'
import { chatSidebarAtom } from '../../store/chatSidebarStore'
import { useChatSidebar } from '../../hooks/useChatSidebar'
import ChatBtnIcon from '../../assets/web2/chatbtn.svg'
import { useI18n } from '../../hooks/useI18n'
import { useLang } from '../../hooks/useLang'

const ChatButton: React.FC = () => {
  const [chatSidebar] = useAtom(chatSidebarAtom)
  const { openChat } = useChatSidebar()
  const location = useLocation()
  const { t } = useI18n()
  useLang() // ensure language context ties to URL

  // 判断是否在需要隐藏聊天按钮的页面
  const shouldHideChatButton = (() => {
    const path = location.pathname
    // match /{lang}/pricing, /{lang}/workflow/builder, /{lang}/style/trainer
    return /\/(en|zh-CN|zh-HK)\/pricing$/.test(path) ||
           /\/(en|zh-CN|zh-HK)\/workflow\/builder(\/.*)?$/.test(path) ||
           /\/(en|zh-CN|zh-HK)\/style\/trainer(\/.*)?$/.test(path)
  })()

  // 判断是否在workflow或model详情页
  const isDetailPage = (() => {
    const path = location.pathname
    return /\/(en|zh-CN|zh-HK)\/workflow\//.test(path) || /\/(en|zh-CN|zh-HK)\/model\//.test(path)
  })()

  // 当侧边栏打开时或在特定页面时，不显示聊天按钮
  if (chatSidebar.isOpen || shouldHideChatButton) {
    return null
  }

  return (
    <button
      onClick={openChat}
      className={`fixed ${isDetailPage ? 'bottom-24' : 'bottom-7.5'} right-6 z-40 w-[3.375rem] h-[3.375rem] flex items-center justify-center`}
      aria-label={t('aria.openChat')}
    >
      <img src={ChatBtnIcon} alt="Chat" className="w-[3.375rem] h-[3.375rem]" />
    </button>
  )
}

export default ChatButton