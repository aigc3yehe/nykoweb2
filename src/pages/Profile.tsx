import React, { useEffect } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { userStateAtom, initUserStateAtom } from '../store/loginStore'

const Profile: React.FC = () => {
  const [userState] = useAtom(userStateAtom)
  const initUserState = useSetAtom(initUserStateAtom)

  // 初始化用户状态
  useEffect(() => {
    initUserState()
  }, [initUserState])

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

  return (
    <div className="flex flex-col gap-[1.875rem] p-6"> {/* gap: 30px, padding: 24px */}
      
      {/* 用户信息区域 */}
      <div 
        className="h-[5.875rem] pt-3 pb-3 rounded-[0.625rem] bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700"
        style={{ height: '5.875rem' }} // height: 94px
      >
        <div className="h-full flex items-center gap-[0.875rem] px-6"> {/* gap: 14px */}
          
          {/* 用户头像 - 70*70px */}
          <div className="w-[4.375rem] h-[4.375rem] rounded-full bg-[#E5E7EB] overflow-hidden flex items-center justify-center flex-shrink-0">
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
          <div className="flex flex-col gap-[0.375rem] flex-1"> {/* gap: 6px */}
            
            {/* 用户名 */}
            <h1 className="font-lexend font-semibold text-[1.5rem] leading-[120%] text-[#1F2937] dark:text-white">
              {user.name || 'Unknown User'}
            </h1>

            {/* 邮箱 */}
            <p className="font-lexend font-normal text-[0.875rem] leading-[120%] text-[#6B7280] dark:text-gray-400">
              {user.email || 'No email provided'}
            </p>
          </div>
        </div>
      </div>

      {/* 占位区域 */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-[0.625rem] shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>More profile information coming soon...</p>
        </div>
      </div>
    </div>
  )
}

export default Profile 