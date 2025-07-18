import React, { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { initThemeAtom } from '../../store/themeStore'
import { initLanguageAtom } from '../../store/i18nStore'
import Header from './Header'
import Sidebar from './Sidebar'
import MainContent from './MainContent'
import ChatButton from '../ui/ChatButton'
import ChatSidebar from './ChatSidebar'
import PublishSidebar from './PublishSidebar'
import TrainerSidebar from './TrainerSidebar.tsx'
import { useLocation } from 'react-router-dom'

interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const initTheme = useSetAtom(initThemeAtom)
  const initLanguage = useSetAtom(initLanguageAtom)
  const location = useLocation()

  useEffect(() => {
    initTheme()
    initLanguage()
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* 顶部标题栏 */}
      <Header />

      <div className="flex flex-1 overflow-hidden relative">
        {/* 左侧边栏：WorkflowBuilder页面时显示新PublishSidebar，否则显示原Sidebar */}
        {location.pathname === '/workflow/builder' ? (
          <PublishSidebar />
        ) : location.pathname === '/style/trainer' ? (
          <TrainerSidebar />
        ):(
          <Sidebar />
        )}

        {/* 主内容区 */}
        <MainContent>
          {children}
        </MainContent>

        {/* 聊天按钮 */}
        <ChatButton />

        {/* 聊天侧边栏 */}
        <ChatSidebar />
      </div>
    </div>
  )
}

export default AppLayout