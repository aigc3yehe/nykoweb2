import React, { useEffect, useState } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { userStateAtom, initUserStateAtom, logoutAtom } from '../store/loginStore'
import ProfileWorkflowsList from '../components/profile/ProfileWorkflowsList'
import ProfileModelsList from '../components/profile/ProfileModelsList'
import ProfileContentsList from '../components/profile/ProfileContentsList'
import { cn } from '../utils/cn'

// Tab 类型
type ProfileTab = 'published' | 'liked'

// 内容类型过滤器
type ContentTypeFilter = 'workflows' | 'models' | 'images' | 'videos'

const Profile: React.FC = () => {
  const [userState] = useAtom(userStateAtom)
  const initUserState = useSetAtom(initUserStateAtom)
  const logout = useSetAtom(logoutAtom)

  // 本地状态
  const [activeTab, setActiveTab] = useState<ProfileTab>('published')
  const [selectedFilter, setSelectedFilter] = useState<ContentTypeFilter>('workflows')

  // 初始化用户状态
  useEffect(() => {
    initUserState()
  }, [initUserState])

  // 退出登录处理
  const handleLogout = () => {
    logout()
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

  const { user } = userState

  // Tab 选项
  const tabOptions = [
    { id: 'published' as ProfileTab, label: 'Published' },
    { id: 'liked' as ProfileTab, label: 'Liked' }
  ]

  // 内容类型过滤选项
  const filterOptions = [
    { id: 'workflows' as ContentTypeFilter, label: 'Workflows' },
    { id: 'models' as ContentTypeFilter, label: 'Models' },
    { id: 'images' as ContentTypeFilter, label: 'Images' },
    { id: 'videos' as ContentTypeFilter, label: 'Videos' }
  ]

  // 渲染列表内容
  const renderListContent = () => {
    if (selectedFilter === 'workflows') {
      return <ProfileWorkflowsList tab={activeTab} />
    }
    if (selectedFilter === 'models') {
      return <ProfileModelsList tab={activeTab} />
    }
    if (selectedFilter === 'images') {
      return <ProfileContentsList type="image" tab={activeTab} />
    }
    if (selectedFilter === 'videos') {
      return <ProfileContentsList type="video" tab={activeTab} />
    }
    return null
  }

  return (
    <div className="flex flex-col gap-3 md:gap-[1.875rem] p-5 md:p-6"> {/* 移动端: gap 12px, padding 20px; PC端: gap 30px, padding 24px */}

      {/* 用户信息区域 */}
      <div
        className="h-[3.375rem] md:h-[5.875rem] pt-3 pb-3" // 移动端: 54px, PC端: 94px
      >
        <div className="h-full flex items-center justify-between">
          {/* 左侧：用户信息 */}
          <div className="flex items-center gap-[0.875rem]"> {/* gap: 14px */}

            {/* 用户头像 - 移动端54*54px, PC端70*70px */}
            <div className="w-[3.375rem] h-[3.375rem] md:w-[4.375rem] md:h-[4.375rem] rounded-full bg-[#E5E7EB] overflow-hidden flex items-center justify-center flex-shrink-0">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 text-2xl font-medium">
                  {user.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </div>

            {/* 用户信息文本 */}
            <div className="flex flex-col gap-[0.375rem]"> {/* gap: 6px */}

              {/* 用户名 */}
              <h1 className="font-lexend font-semibold text-[1.25rem] md:text-[1.5rem] leading-[120%] text-[#1F2937] dark:text-white">
                {user.name || 'Unknown User'}
              </h1>

              {/* 邮箱 */}
              <p className="font-lexend font-normal text-sm leading-[120%] text-[#6B7280] dark:text-gray-400">
                {user.email || 'No email provided'}
              </p>
            </div>
          </div>

          {/* 右侧：退出登录按钮 */}
          <button
            onClick={handleLogout}
            className="h-10 px-4 bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800 text-white rounded-md transition-colors font-lexend text-sm"
          >
            Log out
          </button>
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1">
        <div className="flex flex-col gap-3 md:gap-5"> {/* gap: 20px 移动端 gap: 12px*/}

          {/* 第一行：Tabs */}
          <div className="w-full">
            {/* 桌面端 - 单行布局 */}
            <div className="hidden md:flex items-center border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-8"> {/* gap: 32px */}
                {tabOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setActiveTab(option.id)}
                    className={cn(
                      "h-[2.375rem] md:h-11 px-0 pb-3 relative transition-colors", // 移动端: 38px, PC端: 44px
                      "font-lexend text-[1.125rem] md:text-[1.25rem] leading-none", // 移动端: 18px, PC端: 20px
                      activeTab === option.id
                        ? "font-medium text-design-main-text dark:text-design-dark-main-text"
                        : "font-normal text-design-medium-gray dark:text-design-dark-medium-gray hover:text-design-dark-gray dark:hover:text-design-dark-dark-gray"
                    )}
                  >
                    {option.label}
                    {/* 选中下划线 */}
                    {activeTab === option.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-design-main-blue dark:bg-design-dark-main-blue" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* 移动端 - 上下两行布局 */}
            <div className="md:hidden space-y-[0.875rem]"> {/* gap: 14px */}
              <div className="flex items-center gap-8"> {/* gap: 32px */}
                {tabOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setActiveTab(option.id)}
                    className={cn(
                      "h-[2.375rem] md:h-11 px-0 pb-3 relative transition-colors", // 移动端: 38px, PC端: 44px
                      "font-lexend text-[1.125rem] md:text-[1.25rem] leading-none", // 移动端: 18px, PC端: 20px
                      activeTab === option.id
                        ? "font-medium text-design-main-text dark:text-design-dark-main-text"
                        : "font-normal text-design-medium-gray dark:text-design-dark-medium-gray"
                    )}
                  >
                    {option.label}
                    {/* 选中下划线 */}
                    {activeTab === option.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-design-main-blue dark:bg-design-dark-main-blue" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 第二行：内容类型过滤器 */}
          <div className="flex items-center gap-1 md:gap-2 md:justify-start justify-between"> {/* 移动端：平分间距，PC端：gap 8px */}
            {filterOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedFilter(option.id)}
                className={cn(
                  "h-[2.125rem] px-4 rounded-md transition-colors flex-1 md:flex-none", // 移动端平分宽度
                  selectedFilter === option.id
                    ? "bg-design-main-blue dark:bg-design-dark-main-blue"
                    : "bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
              >
                <span className={cn(
                  "font-lexend font-normal text-sm leading-none",
                  selectedFilter === option.id
                    ? "text-white"
                    : "text-design-dark-gray dark:text-design-dark-dark-gray"
                )}>
                  {option.label}
                </span>
              </button>
            ))}
          </div>

          {/* 第三行：列表区域 */}
          <div className="flex-1">
            {renderListContent()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile