import { useAtom, useSetAtom } from 'jotai'
import { openChatSidebar } from '../store/chatSidebarStore'
import { userStateAtom, showLoginModalAtom } from '../store/loginStore'

/**
 * 聊天侧边栏操作 Hook
 * 提供统一的聊天打开逻辑，包含登录状态检查
 */
export const useChatSidebar = () => {
  const [userState] = useAtom(userStateAtom)
  const openSidebar = useSetAtom(openChatSidebar)
  const showLoginModal = useSetAtom(showLoginModalAtom)

  /**
   * 打开聊天侧边栏
   * 如果用户未登录，则显示登录模态框
   */
  const openChat = () => {
    if (!userState.isAuthenticated) {
      // 用户未登录，显示登录模态框
      showLoginModal()
    } else {
      // 用户已登录，打开聊天侧边栏
      openSidebar()
    }
  }

  return {
    openChat,
    isAuthenticated: userState.isAuthenticated
  }
}