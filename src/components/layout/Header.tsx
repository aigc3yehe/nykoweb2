import React, { useState, useEffect, useRef } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useNavigate, useLocation } from 'react-router-dom'
import { toggleSidebarAtom } from '../../store/sidebarStore'
import { showLoginModalAtom, userStateAtom, fetchUserDataAtom } from '../../store/loginStore'
import { useI18n } from '../../hooks/useI18n'
import { useLang, withLangPrefix } from '../../hooks/useLang'
import { getCurrentTheme, toggleTheme } from '../../utils/theme'
import ThemeAdaptiveIcon from '../ui/ThemeAdaptiveIcon'
import LanguageSelector from '../ui/LanguageSelector'
import LeftIcon from '../../assets/mavae/left.svg'
import LeftIconDark from '../../assets/mavae/dark/left.svg'
import CreditIcon from '../../assets/mavae/credit_btn.svg'
import RadixIcon from '../../assets/mavae/Radix.svg'
import RadixIconDark from '../../assets/mavae/dark/Radix.svg'
import LogoMobileIcon from '../../assets/mavae/logo_mobile.svg'
import LogoMobileIconDark from '../../assets/mavae/dark/logo_mobile.svg'
import SunIcon from '../../assets/mavae/sun.svg'
import SunIconDark from '../../assets/mavae/dark/sun.svg'
import MoonIcon from '../../assets/mavae/moom.svg'
import MoonIconDark from '../../assets/mavae/dark/moom.svg'
import FreeIcon from '../../assets/mavae/vip/free.svg'
import FreeIconDark from '../../assets/mavae/dark/vip/free.svg'
import ProIcon from '../../assets/mavae/vip/pro.svg'
import ProIconDark from '../../assets/mavae/dark/vip/pro.svg'
import PlusIcon from '../../assets/mavae/vip/plus.svg'
import PlusIconDark from '../../assets/mavae/dark/vip/plus.svg'

const Header: React.FC = React.memo(() => {
  const { t } = useI18n()
  const lang = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const toggleSidebar = useSetAtom(toggleSidebarAtom)
  const showLoginModal = useSetAtom(showLoginModalAtom)
  const [userState] = useAtom(userStateAtom)
  const fetchUserData = useSetAtom(fetchUserDataAtom)
  const [theme, setTheme] = useState<'light' | 'dark'>(getCurrentTheme())
  const userMenuRef = useRef<HTMLDivElement>(null)

  // 监听主题变化
  useEffect(() => {
    const handleThemeChange = () => {
      setTheme(getCurrentTheme())
    }

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleThemeChange)

    // 监听DOM变化
    const observer = new MutationObserver(handleThemeChange)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange)
      observer.disconnect()
    }
  }, [])

  // 当用户登录后，获取用户数据
  useEffect(() => {
    if (userState.isAuthenticated && userState.user && !userState.isUserDataLoaded) {
      fetchUserData()
    }
  }, [userState.isAuthenticated, userState.user, userState.isUserDataLoaded, fetchUserData])


  const handleToggleTheme = () => {
    const newTheme = toggleTheme()
    setTheme(newTheme)
  }

  const handleUserClick = () => {
    navigate(withLangPrefix(lang, '/account'))
  }

  // 获取当前页面标题
  const getPageTitle = () => {
    const path = location.pathname
    if (path.includes('/workflow/builder')) return 'Builder'
    if (path.includes('/style/trainer')) return 'Style Trainer'
    if (path.includes('/cases')) return t('nav.recipes')
    if (path.includes('/creations')) return t('profile.myCreations')
    if (path.includes('/account')) return 'Account'
    return t('pages.home') // Home页面
  }

  // 判断是否显示返回组件
  const shouldShowReturnComponent = () => {
    const path = location.pathname
    // 移除语言前缀后再判断
    const pathWithoutLang = path.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '')
    if (pathWithoutLang.includes('/workflow/builder')) return false
    if (pathWithoutLang.includes('/style/trainer')) return false
    if (pathWithoutLang.includes('/edit')) return false
    return (pathWithoutLang.includes('/workflow/') && pathWithoutLang.split('/').length > 2) || // 工作流详情页面
      (pathWithoutLang.includes('/model/') && pathWithoutLang.split('/').length > 2) // model详情页面
  }

  // 获取会员等级图标
  const getMembershipIcon = () => {
    if (!userState.userPlan) {
      return { light: FreeIcon, dark: FreeIconDark } // 默认使用Free图标
    }

    switch (userState.userPlan.plan_type) {
      case 'premium_plus':
        return { light: ProIcon, dark: ProIconDark }
      case 'premium':
        return { light: PlusIcon, dark: PlusIconDark }
      case 'free':
      default:
        return { light: FreeIcon, dark: FreeIconDark }
    }
  }

  return (
    <header className="h-14 md:h-24 bg-secondary dark:bg-secondary-dark md:bg-primary md:dark:bg-primary-dark">
      <div className="flex h-full items-center justify-between px-2.5 pr-4 md:px-8 md:py-6">
        {/* 左侧：移动端菜单+Logo / PC端页面标题 */}
        <div className="flex items-center">
          {(() => {
            // 移除语言前缀后再判断
            location.pathname.replace(/^\/[a-z]{2}(-[A-Z]{2})?/, '');
            if (shouldShowReturnComponent()) {
              return (
                <>
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 h-8"
                    aria-label={t('pages.return')}
                  >
                    <ThemeAdaptiveIcon
                      lightIcon={LeftIcon}
                      darkIcon={LeftIconDark}
                      alt={t('pages.return')}
                      size="lg"
                    />
                    <span className="font-switzer font-bold text-2xl leading-8 text-text-main dark:text-text-main-dark select-none">
                      {t('pages.return')}
                    </span>
                  </button>
                </>
              )
            } else {
              return (
                <>
                  {/* 移动端：菜单按钮 + Logo */}
                  <div className="flex md:hidden items-center w-29 h-9 gap-1">
                    <button
                      onClick={() => toggleSidebar()}
                      className="w-12 h-12 flex items-center justify-center hover:bg-tertiary dark:hover:bg-tertiary-dark transition-colors rounded-lg"
                      aria-label="Toggle menu"
                    >
                      <ThemeAdaptiveIcon
                        lightIcon={RadixIcon}
                        darkIcon={RadixIconDark}
                        alt="Menu"
                        size="lg"
                      />
                    </button>
                    <ThemeAdaptiveIcon
                      lightIcon={LogoMobileIcon}
                      darkIcon={LogoMobileIconDark}
                      alt="Logo"
                      className="w-19 h-8.5"
                    />
                  </div>
                  {/* PC端页面标题 */}
                  <span className="hidden md:block font-lexend font-normal text-xl leading-[100%] text-text-main dark:text-text-main-dark select-none">
                    {getPageTitle()}
                  </span>
                </>
              )
            }
          })()}
        </div>

        {/* 右侧按钮组 */}
        <div className="flex items-center gap-2 h-9 md:h-12">
          {/* 分数显示和Upgrade按钮 - 登录后且数据加载完成才显示 */}
          {userState.isAuthenticated && userState.user && userState.isUserDataLoaded && (() => {
            // 判断是否显示Upgrade按钮
            const shouldShowUpgrade = !userState.userPlan || userState.userPlan.plan_type !== 'premium_plus'

            return (
              <div className="h-9 md:h-12 pl-4 gap-2 rounded-full bg-[#84CC161A] flex items-center">
                {/* 左侧分数显示 - 根据是否显示Upgrade按钮调整右侧padding和点击功能 */}
                {shouldShowUpgrade ? (
                  // 显示Upgrade按钮时，分数显示不可点击
                  <div className="h-4 md:h-6 gap-1 flex items-center">
                    <img src={CreditIcon} alt="Credit" className="w-4 h-4 md:w-6 md:h-6" />
                    <span className="font-switzer font-medium text-sm md:text-base leading-5 md:leading-6 text-[#65A30D]">
                      {userState.userDetails?.credit || 0}
                    </span>
                  </div>
                ) : (
                  // 隐藏Upgrade按钮时，分数显示可点击跳转到pricing页面
                  <button
                    onClick={() => navigate(withLangPrefix(lang, '/pricing'))}
                    className="h-4 md:h-6 gap-1 flex items-center pr-4 hover:opacity-80 transition-opacity cursor-pointer"
                  >
                    <img src={CreditIcon} alt="Credit" className="w-4 h-4 md:w-6 md:h-6" />
                    <span className="font-switzer font-medium text-sm md:text-base leading-5 md:leading-6 text-[#65A30D]">
                      {userState.userDetails?.credit || 0}
                    </span>
                  </button>
                )}

                {/* 右侧Upgrade按钮 - 非premium会员才显示 */}
                {shouldShowUpgrade && (
                  <button
                    onClick={() => navigate(withLangPrefix(lang, '/pricing'))}
                    className="w-22 h-9 md:w-28 md:h-12 px-4 md:px-6 gap-2 rounded-full bg-[#84CC16] hover:bg-[#65A30D] transition-colors flex items-center justify-center"
                  >
                    <span className="font-switzer font-medium text-sm md:text-base leading-5 md:leading-6 text-white text-center">
                      Upgrade
                    </span>
                  </button>
                )}
              </div>
            )
          })()}

          {/* Daily free credits按钮 - 仅在未登录状态下显示 */}
          {!userState.isAuthenticated && (
            <button
              onClick={() => showLoginModal()}
              className="h-9 md:h-12 px-4 md:px-6 gap-2 rounded-full bg-[#84CC16] hover:bg-[#65A30D] transition-colors flex items-center justify-center"
            >
              <span className="font-switzer font-medium text-sm md:text-base leading-5 md:leading-6 text-white text-center whitespace-nowrap">
                {t('auth.dailyFreeCredits')}
              </span>
            </button>
          )}

          {/* 登录按钮或用户头像 */}
          {userState.isAuthenticated && userState.user ? (
            /* 用户头像 - 移动端36*36px / PC端48*48px 圆形 + 会员等级标识 */
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={handleUserClick}
                className="w-9 h-9 md:w-12 md:h-12 rounded-full bg-[#E5E7EB] hover:bg-[#D1D5DB] transition-colors overflow-hidden flex items-center justify-center"
                aria-label="User account"
              >
                {userState.user.picture ? (
                  <img
                    src={userState.user.picture}
                    alt={userState.user.name || 'User'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 text-sm md:text-base font-medium">
                    {userState.user.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </button>

              {/* 会员等级标识 - 下边居中 */}
              <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-7 h-3 md:w-9 md:h-4">
                <ThemeAdaptiveIcon
                  lightIcon={getMembershipIcon().light}
                  darkIcon={getMembershipIcon().dark}
                  alt="Membership"
                  className='w-7 h-3 md:w-9 md:h-4'
                />
              </div>

            </div>
          ) : (
            /* 登录按钮 */
            <button
              onClick={() => showLoginModal()}
              className="flex items-center justify-center w-17.5 h-9 md:w-27 md:h-12 px-4 md:px-8 gap-2.5 rounded-full bg-link-default dark:bg-link-default-dark hover:bg-link-pressed dark:hover:bg-link-pressed-dark transition-colors"
            >
              <span className="font-switzer font-medium text-sm md:text-base leading-5 md:leading-6 text-white text-center">
                {t('header.login')}
              </span>
            </button>
          )}

          {/* 语言切换按钮 - 仅PC端显示 */}
          <div className="hidden md:flex">
            <LanguageSelector />
          </div>

          {/* 主题切换按钮 - 仅PC端显示 */}
          <button
            onClick={handleToggleTheme}
            className="hidden md:flex w-12 h-12 rounded-full items-center justify-center hover:bg-secondary dark:hover:bg-secondary-dark transition-colors"
            aria-label={`切换到${theme === 'light' ? '暗色' : '亮色'}主题`}
          >
            {theme === 'light' ? (
              // 月亮图标 - 切换到暗色主题
              <ThemeAdaptiveIcon
                lightIcon={MoonIcon}
                darkIcon={MoonIconDark}
                alt="Dark Theme"
                size="lg"
              />
            ) : (
              // 太阳图标 - 切换到亮色主题
              <ThemeAdaptiveIcon
                lightIcon={SunIcon}
                darkIcon={SunIconDark}
                alt="Light Theme"
                size="lg"
              />
            )}
          </button>
        </div>
      </div>
    </header>
  )
})

Header.displayName = 'Header'

export default Header