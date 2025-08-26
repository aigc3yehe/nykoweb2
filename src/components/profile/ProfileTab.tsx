import React from 'react'

type ProfileTab = 'published' | 'liked'

interface ProfileTabProps {
  activeTab: ProfileTab
  onTabChange: (tab: ProfileTab) => void
}

const ProfileTab: React.FC<ProfileTabProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: 'published' as ProfileTab, label: 'Published' },
    { key: 'liked' as ProfileTab, label: 'Liked' }
  ]

  return (
    <div className="w-full h-10 flex items-center justify-between border-b border-line-subtle dark:border-line-subtle-dark"> {/* width: full, height: 40px, justify-content: space-between, border-bottom: 1px solid #E2E4E8 */}
      {/* 左侧Tab按钮 */}
      <div className="flex gap-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`
              h-10 flex items-center gap-2.5 py-2 relative
              font-switzer font-semibold text-base leading-6
              ${activeTab === tab.key 
                ? 'text-text-main dark:text-text-main-dark' 
                : 'text-text-secondary dark:text-text-secondary-dark'
              }
            `}
          >
            {/* 文本 */}
            <span className="h-6 font-switzer font-semibold text-base leading-6"> {/* height: 24px, font-size: 16px, line-height: 24px */}
              {tab.label}
            </span>
            
            {/* 选中状态的下划线指示条 */}
            {activeTab === tab.key && (
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-text-main dark:bg-text-main-dark rounded-xl"></div>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

export default ProfileTab
