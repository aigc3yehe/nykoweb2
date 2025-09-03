import React, { useEffect, useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { userStateAtom, initUserStateAtom } from '../store/loginStore'
import ProfileWorkflowsList from '../components/profile/ProfileWorkflowsList'

import ProfileContentsList, { ProfileContentsListProps } from '../components/profile/ProfileContentsList'
import ProfileTabComponent from '../components/profile/ProfileTab'
import ProfileActions from '../components/profile/ProfileActions'
//import { cn } from '../utils/cn'

// Tab 类型
type ProfileTab = 'published' | 'liked'

// 内容类型过滤器
type ContentTypeFilter = 'images' | 'workflows'
type ProfileContentType = ProfileContentsListProps['type']

const Profile: React.FC = () => {
  const [userState] = useAtom(userStateAtom)
  const initUserState = useSetAtom(initUserStateAtom)

  // 本地状态
  const [activeTab, setActiveTab] = useState<ProfileTab>('published')
  const [selectedFilter, setSelectedFilter] = useState<ContentTypeFilter>('images')

  // 初始化用户状态
  useEffect(() => {
    initUserState()
  }, [initUserState])

  // 处理tab切换
  const handleTabChange = (newTab: ProfileTab) => {
    setActiveTab(newTab)
  }

  // 处理过滤变化
  const handleFilterChange = (newFilter: ContentTypeFilter) => {
    setSelectedFilter(newFilter)
  }

  if (!userState.isAuthenticated || !userState.user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Please log in to view your profile
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            You need to be logged in to access this page.
          </p>
        </div>
      </div>
    )
  }

  // 渲染列表内容
  const renderListContent = () => {
    if (selectedFilter === 'workflows') {
      return <ProfileWorkflowsList tab={activeTab} />
    }
    if (selectedFilter === 'images') {
      return <ProfileContentsList type={'mixed' as ProfileContentType} tab={activeTab} />
    }
    return null
  }

  return (
    <div className="w-full px-4 md:px-8 pb-10 flex flex-col md:gap-6"> {/* width: 1352px (full), padding: 32px 32px 40px 32px, gap: 24px */}
      {/* 移动端标题 */}
      <h1 className="md:hidden h-16 py-4 font-switzer font-bold text-2xl leading-8 text-text-main dark:text-text-main-dark"> {/* height: 64px, padding: 16px, font-size: 24px, line-height: 32px */}
        My Creations
      </h1>

      {/* Tab 导航 */}
      <ProfileTabComponent activeTab={activeTab} onTabChange={handleTabChange} />

      {/* 快捷操作组件 */}
      <ProfileActions activeTab={activeTab} onFilterChange={handleFilterChange} />

      {/* 内容区域 */}
      <div className="min-h-96">
        {renderListContent()}
      </div>
    </div>
  )
}

export default Profile