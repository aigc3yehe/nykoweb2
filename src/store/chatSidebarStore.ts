import { atom } from 'jotai'

// 聊天侧边栏状态
export interface ChatSidebarState {
  isOpen: boolean
  isConnected: boolean
  isInQueue: boolean
  hasError: boolean
}

// 初始状态
const initialState: ChatSidebarState = {
  isOpen: false,
  isConnected: false,
  isInQueue: false,
  hasError: false
}

// 聊天侧边栏原子状态
export const chatSidebarAtom = atom<ChatSidebarState>(initialState)

// 打开聊天侧边栏
export const openChatSidebar = atom(
  null,
  (get, set) => {
    const state = get(chatSidebarAtom)
    set(chatSidebarAtom, {
      ...state,
      isOpen: true
    })
  }
)

// 关闭聊天侧边栏
export const closeChatSidebar = atom(
  null,
  (get, set) => {
    const state = get(chatSidebarAtom)
    set(chatSidebarAtom, {
      ...state,
      isOpen: false
    })
  }
)

// 更新连接状态
export const updateConnectionStatus = atom(
  null,
  (get, set, params: { isConnected: boolean; isInQueue: boolean; hasError: boolean }) => {
    const state = get(chatSidebarAtom)
    set(chatSidebarAtom, {
      ...state,
      ...params
    })
  }
) 