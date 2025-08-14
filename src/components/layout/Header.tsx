import React from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { useNavigate, useLocation } from 'react-router-dom'
import { toggleSidebarAtom } from '../../store/sidebarStore'
import { showLoginModalAtom, userStateAtom } from '../../store/loginStore'
import { useI18n } from '../../hooks/useI18n'
import { useLang, withLangPrefix } from '../../hooks/useLang'
import ThemeToggle from '../ui/ThemeToggle'
import LanguageSelector from '../ui/LanguageSelector'
import MenuIcon from '../../assets/web2/menu.svg'
import CuIcon from '../../assets/web2/cu.svg'
import BackIcon from '../../assets/web2/back.svg'
import LogoImage from '../../assets/web2/Logo.png'
import UpgradeIcon from '../../assets/web2/upgrade.svg'

const Header: React.FC = React.memo(() => {
  const { t } = useI18n()
  const lang = useLang()
  const navigate = useNavigate()
  const location = useLocation()
  const toggleSidebar = useSetAtom(toggleSidebarAtom)
  const showLoginModal = useSetAtom(showLoginModalAtom)
  const [userState] = useAtom(userStateAtom)

  return (
    <header className="h-14 border-b border-border bg-background dark:bg-background">
      <div className="flex h-full items-center justify-between px-4 md:px-6">
        {/* Logo和菜单按钮 */}
        <div className="flex items-center gap-3">
          {location.pathname === '/workflow/builder' || location.pathname === '/style/trainer' ? (
            <>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-6 h-6 md:w-6 md:h-6 mr-2"
                aria-label="Back"
              >
                <img src={BackIcon} alt="Back" className="w-6 h-6" />
              </button>
              <span className="font-lexend font-normal text-xl leading-[100%] text-[#1F2937] select-none">
                {location.pathname === '/workflow/builder' ? (
                  <>
                    <span className="hidden lg:inline">Workflow Builder</span>
                    <span className="lg:hidden">Builder</span>
                  </>
                ) : (
                  <>
                    <span className="hidden lg:inline">Style Trainer</span>
                    <span className="lg:hidden">Trainer</span>
                  </>
                )}
              </span>
            </>
          ) : (
            <>
              {/* 移动端菜单按钮 */}
              <button
                onClick={() => toggleSidebar()}
                className="flex md:hidden items-center justify-center w-8 h-8 rounded-md hover:bg-accent transition-colors"
                aria-label="Toggle menu"
              >
                <img
                  src={MenuIcon}
                  alt="Menu"
                  className="w-5 h-5 dark:invert"
                />
              </button>
              {/* Logo - 点击导航到首页 */}
              <button
        onClick={() => navigate(withLangPrefix(lang, '/'))}
                className="flex items-center"
                aria-label="Go to home"
              >
                <img
                  src={LogoImage}
                  alt="Logo"
                  className="w-[4.4375rem] h-8"
                />
              </button>
            </>
          )}
        </div>

        {/* 右侧按钮组 */}
        <div className="flex items-center gap-2.5">
          {/* 主题切换按钮 */}
          <ThemeToggle />

          {/* 语言选择器 - 移动端隐藏 */}
          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          {/* 分数显示 - 登录后显示 */}
          {userState.isAuthenticated && userState.user && (
            <div className="h-8 rounded-[6px] gap-1.5 px-3 border border-[#E5E7EB] flex items-center mr-1">
              <img src={CuIcon} alt="CU" className="w-[0.875rem] h-4" />
              <span className="font-lexend font-normal text-sm leading-[100%] text-[#1F2937] ml-1">
                {userState.userDetails?.credit || 0}
              </span>
            </div>
          )}

          {/* Upgrade 按钮 - 移动端只显示图标 */}
          <button 
            onClick={() => navigate(withLangPrefix(lang, '/pricing'))}
            className="flex items-center justify-center gap-1.5 h-8 px-3 sm:px-4 py-2 bg-[#00FF48] hover:bg-[#00E041] dark:bg-[#00CC39] dark:hover:bg-[#00B833] rounded-md transition-colors"
          >
            <img
              src={UpgradeIcon}
              alt="Upgrade"
              className="w-4 h-4"
            />
            <span className="hidden sm:inline text-black dark:text-black font-normal text-sm leading-none font-lexend">
              {t('header.upgrade')}
            </span>
          </button>

          {/* 登录按钮或用户头像 */}
          {userState.isAuthenticated && userState.user ? (
            /* 用户头像 - 32*32px (2rem*2rem) 圆形 */
            <button
            onClick={() => navigate(withLangPrefix(lang, '/profile'))}
              className="w-8 h-8 rounded-full bg-[#E5E7EB] hover:bg-[#D1D5DB] transition-colors overflow-hidden flex items-center justify-center"
              aria-label="User profile"
            >
              {userState.user.picture ? (
                <img
                  src={userState.user.picture}
                  alt={userState.user.name || 'User'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-600 text-sm font-medium">
                  {userState.user.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              )}
            </button>
          ) : (
            /* 登录按钮 */
            <button
              onClick={() => showLoginModal()}
              className="flex items-center justify-center h-8 px-3 sm:px-4 py-2 bg-[#0900FF] hover:bg-[#0800E6] dark:bg-[#0A00FF] dark:hover:bg-[#0900E6] rounded-md transition-colors"
            >
              <span className="text-white dark:text-white font-normal text-sm leading-none font-lexend">
                {t('header.login')}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
})

Header.displayName = 'Header'

export default Header