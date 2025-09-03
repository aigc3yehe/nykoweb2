import React from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { userStateAtom, showLoginModalAtom } from '../../store/loginStore'
import { useEffect } from 'react'
import { useI18n } from '../../hooks/useI18n'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean // 是否需要登录，默认为true
}

/**
 * 路由保护组件
 * 用于统一拦截需要登录的页面
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true 
}) => {
  const [userState] = useAtom(userStateAtom)
  const showLoginModal = useSetAtom(showLoginModalAtom)
  const { t } = useI18n()

  useEffect(() => {
    // 如果需要认证但用户未登录，显示登录模态框
    if (requireAuth && !userState.isAuthenticated && !userState.isLoading) {
      showLoginModal()
    }
  }, [requireAuth, userState.isAuthenticated, userState.isLoading, showLoginModal])

  // 如果不需要认证，直接渲染子组件
  if (!requireAuth) {
    return <>{children}</>
  }

  // 如果正在加载用户状态，显示加载状态
  if (userState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] bg-secondary dark:bg-secondary-dark">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-link-default dark:border-link-default-dark border-t-transparent rounded-full animate-spin"></div>
          <p className="text-text-secondary dark:text-text-secondary-dark text-sm font-switzer">
            {t('auth.verifyingLogin')} {/* 正在验证登录状态... / Verifying login status... */}
          </p>
        </div>
      </div>
    )
  }

  // 如果用户已登录，渲染子组件
  if (userState.isAuthenticated) {
    return <>{children}</>
  }

  // 如果用户未登录，显示提示信息
  return (
    <div className="flex items-center justify-center min-h-[400px] bg-secondary dark:bg-secondary-dark">
      <div className="text-center space-y-4 p-8 max-w-md mx-auto">
        <div className="w-16 h-16 mx-auto bg-brand-accent dark:bg-brand-accent rounded-full flex items-center justify-center">
          <svg 
            className="w-8 h-8 text-link-default dark:text-link-default-dark" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-text-main dark:text-text-main-dark font-switzer">
          {t('auth.loginRequired')} {/* 需要登录 / Login Required */}
        </h3>
        <p className="text-text-secondary dark:text-text-secondary-dark text-sm font-switzer">
          {t('auth.pleaseLogin')} {/* 请登录后访问此页面 / Please log in to access this page */}
        </p>
        <button
          onClick={() => showLoginModal()}
          className="inline-flex items-center px-4 py-2 bg-link-default dark:bg-link-default-dark hover:bg-link-pressed dark:hover:bg-link-pressed-dark text-text-inverse dark:text-text-inverse-dark text-sm font-medium rounded-lg transition-colors duration-200 font-switzer"
        >
          {t('auth.loginNow')} {/* 立即登录 / Login Now */}
        </button>
      </div>
    </div>
  )
}

export default ProtectedRoute