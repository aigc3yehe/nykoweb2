import React, { useEffect, useState } from 'react'
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
import BottomBar from './BottomBar'
import StyleTrainerBottomBar from './StyleTrainerBottomBar'
import PublishModal from '../modals/PublishModal'
import SettingsModal from '../modals/SettingsModal'
import StyleTrainerSettingsModal from '../modals/StyleTrainerSettingsModal'
import { useLocation } from 'react-router-dom'

interface AppLayoutProps {
  children: React.ReactNode
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const initTheme = useSetAtom(initThemeAtom)
  const initLanguage = useSetAtom(initLanguageAtom)
  const location = useLocation()
  
  // 移动端模态框状态
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isStyleTrainerSettingsModalOpen, setIsStyleTrainerSettingsModalOpen] = useState(false)

  useEffect(() => {
    initTheme()
    initLanguage()
  }, [])

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* 顶部标题栏 */}
      <Header />

      <div className="flex flex-1 overflow-hidden relative">
        {/* 左侧边栏：移动端不显示侧边栏，PC端根据路由显示不同侧边栏 */}
         {/^\/(en|zh-CN|zh-HK)\/pricing$/.test(location.pathname) ? null : 
          /^\/(en|zh-CN|zh-HK)\/workflow\/builder$/.test(location.pathname) ? (
            <div className="hidden lg:block">
              <PublishSidebar />
            </div>
          ) : /^\/(en|zh-CN|zh-HK)\/style\/trainer$/.test(location.pathname) ? (
            <div className="hidden lg:block">
              <TrainerSidebar />
            </div>
          ) : (
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

        {/* 移动端底部栏 - WorkflowBuilder页面 */}
        {/^\/(en|zh-CN|zh-HK)\/workflow\/builder$/.test(location.pathname) && (
          <BottomBar
            onOpenSettings={() => setIsSettingsModalOpen(true)}
          />
        )}

        {/* 移动端底部栏 - StyleTrainer页面 */}
        {/^\/(en|zh-CN|zh-HK)\/style\/trainer$/.test(location.pathname) && (
          <StyleTrainerBottomBar
            onOpenSettings={() => setIsStyleTrainerSettingsModalOpen(true)}
          />
        )}

        {/* 移动端模态框 */}
        <PublishModal
          isOpen={isPublishModalOpen}
          onClose={() => setIsPublishModalOpen(false)}
        />
        <SettingsModal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
        />
        <StyleTrainerSettingsModal
          isOpen={isStyleTrainerSettingsModalOpen}
          onClose={() => setIsStyleTrainerSettingsModalOpen(false)}
        />
      </div>
    </div>
  )
}

export default AppLayout