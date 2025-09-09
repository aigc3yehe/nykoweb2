import React, { useEffect } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { loginModalAtom, hideLoginModalAtom, userStateAtom } from '../../store/loginStore'
import { authService } from '../../services/authService'
import { useI18n } from '../../hooks/useI18n'
import LoginTitleBg from '../../assets/web2/login_title_bg.svg'
import LoginClose from '../../assets/web2/login_close.svg'
import LoginLogoBg from '../../assets/web2/login_logo_bg.svg'
import Logo from '../../assets/web2/Logo.png'
import GoogleIcon from '../../assets/web2/google.svg'

const LoginModal: React.FC = () => {
  const { t } = useI18n()
  const [loginState] = useAtom(loginModalAtom)
  const [userState] = useAtom(userStateAtom)
  const hideLoginModal = useSetAtom(hideLoginModalAtom)

  // 监听用户登录态，已登录则自动关闭弹窗
  useEffect(() => {
    if (!userState.isLoading && userState.isAuthenticated && loginState.isOpen) {
      hideLoginModal()
    }
  }, [userState.isLoading, userState.isAuthenticated, loginState.isOpen, hideLoginModal])

  // 登录态未初始化时不渲染弹窗，防止闪现
  if (!loginState.isOpen || userState.isLoading) return null

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      hideLoginModal()
    }
  }

  const handleGoogleLogin = () => {
    try {
      // 使用认证服务构建 Google OAuth URL
      const googleAuthUrl = authService.getGoogleAuthUrl()
      // 跳转到 Google 登录页面
      window.location.href = googleAuthUrl
    } catch (error) {
      console.error('Failed to initiate Google login:', error)
      // 可以在这里显示错误提示
    }
  }

  return (
    <div
      className="fixed inset-0 z-1000 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      {/* 登录弹窗容器 - 宽度22.5rem，圆角0.625rem，白色背景 */}
      <div className="w-[22.5rem] rounded-[0.625rem] bg-white overflow-hidden">
        {/* 标题栏 - 高度3.125rem */}
        <div className="relative w-[22.5rem] h-[3.125rem] flex items-center justify-center">
          {/* 背景图 */}
          <img
            src={LoginTitleBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* 标题 */}
          <h2 className="relative z-10 font-lexend font-normal text-[0.875rem] leading-none text-white capitalize text-center">
            {t('modal.loginOrSignup')}
          </h2>
          {/* 关闭按钮 */}
          <button
            onClick={hideLoginModal}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 flex items-center justify-center hover:opacity-80 transition-opacity z-10"
          >
            <img src={LoginClose} alt="Close" className="w-5 h-5" />
          </button>
        </div>
        {/* Logo区域 - 宽22.5rem，高6.4375rem */}
        <div className="relative w-[22.5rem] h-[6.4375rem] flex items-center justify-center">
          {/* 背景图 */}
          <img
            src={LoginLogoBg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Logo - 6.25rem*2.6875rem */}
          <img
            src={Logo}
            alt="Logo"
            className="relative z-10 w-[6.25rem] h-[2.6875rem] object-contain"
            onError={(e) => {
              // 如果logo加载失败，显示文本占位符
              const imgElement = e.target as HTMLImageElement
              imgElement.style.display = 'none'
              const parent = imgElement.parentElement
              if (parent && !parent.querySelector('.logo-placeholder')) {
                const placeholder = document.createElement('div')
                placeholder.className = 'logo-placeholder w-[6.25rem] h-[2.6875rem] bg-gray-200 rounded flex items-center justify-center text-gray-500 text-sm relative z-10'
                placeholder.textContent = 'LOGO'
                parent.appendChild(placeholder)
              }
            }}
          />
        </div>
        {/* 内容区域 - 宽22.5rem，gap 1.25rem，padding 1.25rem */}
        <div className="w-[22.5rem] flex flex-col gap-5 p-5">
          {/* Google登录按钮 - 宽20rem，高3rem */}
          <button
            onClick={handleGoogleLogin}
            className="w-[20rem] h-[3rem] flex items-center justify-center gap-[0.625rem] px-[0.875rem] py-[0.875rem] rounded-[0.625rem] border border-[#E5E7EB] hover:bg-gray-50 transition-colors"
          >
            {/* 按钮内部容器 - 宽18.125rem，高1.125rem，gap 0.625rem */}
            <div className="w-[18.125rem] h-[1.125rem] flex items-center gap-[0.625rem]">
              {/* Google图标 - 1rem*1rem */}
              <img src={GoogleIcon} alt="Google" className="w-4 h-4 flex-shrink-0" />
              {/* 文本 */}
              <span className="font-lexend font-normal text-[0.875rem] leading-none text-[#4B5563] capitalize">
                {t('modal.continueWithGoogle')}
              </span>
            </div>
          </button>
          {/* 提示文本 */}
          <div className="text-center">
            <span className="font-lexend font-normal text-[0.875rem] leading-none text-[#9CA3AF] capitalize">
              {t('auth.loginToReceiveFreeCredits')}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginModal