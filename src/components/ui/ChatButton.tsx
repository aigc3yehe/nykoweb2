import React, { useEffect } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useLocation } from 'react-router-dom'
import { chatSidebarAtom, closeChatSidebar } from '../../store/chatSidebarStore'
import { useChatSidebar } from '../../hooks/useChatSidebar'
import ChatIcon from '../../assets/mavae/chat.svg'
import ChatIconDark from '../../assets/mavae/dark/chat.svg'
import { useI18n } from '../../hooks/useI18n'
import { useLang } from '../../hooks/useLang'
import ThemeAdaptiveIcon from './ThemeAdaptiveIcon'

const ChatButton: React.FC = () => {
  const [chatSidebar] = useAtom(chatSidebarAtom)
  const { openChat } = useChatSidebar()
  const closeSidebar = useSetAtom(closeChatSidebar)
  const location = useLocation()
  const { t } = useI18n()
  useLang() // ensure language context ties to URL

  // 判断是否在需要隐藏聊天按钮的页面
  const shouldHideChatButton = (() => {
    const path = location.pathname
    // match /{lang}/pricing, /{lang}/workflow/builder, /{lang}/workflow/{id}/edit, /{lang}/style/trainer
    return /\/(en|zh-CN|zh-HK)\/pricing$/.test(path) ||
           /\/(en|zh-CN|zh-HK)\/workflow\/builder(\/.*)?$/.test(path) ||
           /\/(en|zh-CN|zh-HK)\/workflow\/.*\/edit$/.test(path) ||
           /\/(en|zh-CN|zh-HK)\/style\/trainer(\/.*)?$/.test(path)
  })()

  // 判断是否在workflow或model详情页
  const isDetailPage = (() => {
    const path = location.pathname
    return /\/(en|zh-CN|zh-HK)\/workflow\//.test(path) || /\/(en|zh-CN|zh-HK)\/model\//.test(path)
  })()

  // 当用户离开详情页面时，自动关闭聊天侧边栏
  useEffect(() => {
    if (chatSidebar.isOpen && !isDetailPage) {
      closeSidebar()
    }
  }, [location.pathname, chatSidebar.isOpen, isDetailPage, closeSidebar])

  // 只在详情页显示，当侧边栏打开时或在特定页面时，不显示聊天按钮
  if (!isDetailPage || chatSidebar.isOpen || shouldHideChatButton) {
    return null
  }

  return (
    <button
      onClick={openChat}
      className={`fixed bottom-6 right-6 z-40 w-16 h-16 flex items-center justify-center rounded-full bg-link-default dark:bg-link-default-dark hover:w-18 hover:h-18 active:w-12 active:h-12 transition-all duration-200 hover:shadow-[0px_8px_16px_0px_rgba(18,18,26,0.1)] hover:shadow-[0px_4px_8px_0px_rgba(18,18,26,0.2)] active:shadow-[0px_8px_16px_0px_rgba(18,18,26,0.1)] active:shadow-[0px_4px_8px_0px_rgba(18,18,26,0.2)]`}
      aria-label={t('aria.openChat')}
    >
      <div className="w-8 h-8 hover:w-9 hover:h-9 active:w-6 active:h-6 transition-all duration-200">
        <ThemeAdaptiveIcon
          lightIcon={ChatIcon}
          darkIcon={ChatIconDark}
          alt="Chat"
          size="xl"
        />
      </div>
    </button>
  )
}

export default ChatButton