import { atom } from 'jotai'

// 侧边栏开关状态
export const sidebarOpenAtom = atom(false)

// 切换侧边栏
export const toggleSidebarAtom = atom(
  null,
  (get, set) => {
    set(sidebarOpenAtom, !get(sidebarOpenAtom))
  }
)

// 关闭侧边栏
export const closeSidebarAtom = atom(
  null,
  (_, set) => {
    set(sidebarOpenAtom, false)
  }
)

// 打开侧边栏
export const openSidebarAtom = atom(
  null,
  (_, set) => {
    set(sidebarOpenAtom, true)
  }
)