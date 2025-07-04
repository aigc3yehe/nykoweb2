import { atom } from 'jotai'

export type Theme = 'light' | 'dark'

export const themeAtom = atom<Theme>('light')

export const toggleThemeAtom = atom(
  null,
  (get, set) => {
    const currentTheme = get(themeAtom)
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    set(themeAtom, newTheme)
    // 更新HTML class
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    // 保存到localStorage
    localStorage.setItem('theme', newTheme)
  }
)

// 初始化主题
export const initThemeAtom = atom(
  null,
  (_, set) => {
    const savedTheme = localStorage.getItem('theme') as Theme
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    const theme = savedTheme || systemTheme
    set(themeAtom, theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }
)