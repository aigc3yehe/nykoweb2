import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useLang, withLangPrefix } from '../../hooks/useLang'
import { useI18n } from '../../hooks/useI18n'
import { useAtom, useSetAtom } from 'jotai'
import { sidebarOpenAtom, closeSidebarAtom } from '../../store/sidebarStore'
import { getCurrentTheme, toggleTheme } from '../../utils/theme'
import ThemeAdaptiveIcon from '../ui/ThemeAdaptiveIcon'

import { cn } from '../../utils/cn'

// 导入新的MAVAE图标
import LogoIcon from '../../assets/mavae/logo.svg'
import LogoIconDark from '../../assets/mavae/dark/logo.svg'

// 导航图标 - 正常状态
import SparksIcon from '../../assets/mavae/Sparks.svg'
import RecipesIcon from '../../assets/mavae/Recipes.svg'
import MyAssetsIcon from '../../assets/mavae/MyAssets.svg'
import WorkflowBuilderIcon from '../../assets/mavae/WorkflowBuilder.svg'
import StyleTrainerIcon from '../../assets/mavae/StyleTrainer.svg'

// 导航图标 - 暗色主题
import SparksIconDark from '../../assets/mavae/dark/Sparks.svg'
import RecipesIconDark from '../../assets/mavae/dark/Recipes.svg'
import MyAssetsIconDark from '../../assets/mavae/dark/MyAssets.svg'
import WorkflowBuilderIconDark from '../../assets/mavae/dark/WorkflowBuilder.svg'
import StyleTrainerIconDark from '../../assets/mavae/dark/StyleTrainer.svg'

// 导航图标 - 选中状态
import SparksIconSelected from '../../assets/mavae/selected/Sparks.svg'
import RecipesIconSelected from '../../assets/mavae/selected/Recipes.svg'
import MyAssetsIconSelected from '../../assets/mavae/selected/MyAssets.svg'
import WorkflowBuilderIconSelected from '../../assets/mavae/selected/WorkflowBuilder.svg'
import StyleTrainerIconSelected from '../../assets/mavae/selected/StyleTrainer.svg'

// 导航图标 - 暗色选中状态
import SparksIconDarkSelected from '../../assets/mavae/dark/selected/Sparks.svg'
import RecipesIconDarkSelected from '../../assets/mavae/dark/selected/Recipes.svg'
import MyAssetsIconDarkSelected from '../../assets/mavae/dark/selected/MyAssets.svg'
import WorkflowBuilderIconDarkSelected from '../../assets/mavae/dark/selected/WorkflowBuilder.svg'
import StyleTrainerIconDarkSelected from '../../assets/mavae/dark/selected/StyleTrainer.svg'

// 其他图标
import XIcon from '../../assets/mavae/X.svg'
import XIconDark from '../../assets/mavae/dark/X.svg'
import DiscordIcon from '../../assets/mavae/discord.svg'
import DiscordIconDark from '../../assets/mavae/dark/discord.svg'
import WeixinIcon from '../../assets/mavae/weixin.svg'
import WeixinIconDark from '../../assets/mavae/dark/weixin.svg'
import CloseIcon from '../../assets/mavae/close.svg'
import CloseIconDark from '../../assets/mavae/dark/close.svg'
import GlobeIcon from '../../assets/mavae/globe.svg'
import GlobeIconDark from '../../assets/mavae/dark/globe.svg'
import ThemeIcon from '../../assets/mavae/them.svg'
import ThemeIconDark from '../../assets/mavae/dark/them.svg'

interface NavItem {
  key: string
  label: string
  lightIcon: string
  darkIcon: string
  lightSelectedIcon: string
  darkSelectedIcon: string
  path: string
  matchPaths: string[] // 匹配路径列表
}

const IconComponent: React.FC<{
  lightIcon: string
  darkIcon: string
  lightSelectedIcon: string
  darkSelectedIcon: string
  alt: string
  className?: string
  isSelected?: boolean
}> = ({ lightIcon, darkIcon, lightSelectedIcon, darkSelectedIcon, alt, className, isSelected }) => {
  return (
    <ThemeAdaptiveIcon
      lightIcon={lightIcon}
      darkIcon={darkIcon}
      lightSelectedIcon={lightSelectedIcon}
      darkSelectedIcon={darkSelectedIcon}
      alt={alt}
      size="md"
      className={className}
      isSelected={isSelected}
    />
  )
}

// 底部社交图标组件
const SocialIconComponent: React.FC<{
  lightIcon: string
  darkIcon: string
  alt: string
  href?: string
}> = ({ lightIcon, darkIcon, alt, href }) => {
  const IconElement = (
    <div className="w-9 h-9 flex items-center justify-center hover:bg-tertiary dark:hover:bg-tertiary-dark transition-colors rounded-lg">
      <ThemeAdaptiveIcon
        lightIcon={lightIcon}
        darkIcon={darkIcon}
        alt={alt}
        size="md"
      />
    </div>
  )

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className="block">
        {IconElement}
      </a>
    )
  }

  return IconElement
}

// 移动端关闭按钮组件
const MobileCloseButton: React.FC<{
  onClose: () => void
}> = ({ onClose }) => {
  return (
    <button
      onClick={onClose}
      className="w-9 h-9 flex items-center justify-center hover:bg-tertiary dark:hover:bg-tertiary-dark transition-colors rounded-lg"
      aria-label="Close menu"
    >
      <ThemeAdaptiveIcon
        lightIcon={CloseIcon}
        darkIcon={CloseIconDark}
        alt="Close"
        size="lg"
      />
    </button>
  )
}

// 移动端主题切换组件
const MobileThemeToggle: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(getCurrentTheme())

  const handleToggle = () => {
    const newTheme = toggleTheme()
    setTheme(newTheme)
  }

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

  const isDark = theme === 'dark'

  return (
    <div className="w-full h-12 flex items-center justify-between px-4">
      <div className="flex items-center gap-2">
        <ThemeAdaptiveIcon
          lightIcon={ThemeIcon}
          darkIcon={ThemeIconDark}
          alt="Theme"
          size="md"
        />
        <span className="font-switzer font-medium text-base leading-6 text-text-main dark:text-text-main-dark">
          Theme
        </span>
      </div>

      {/* 主题切换按钮 */}
      <div className="w-37 h-9 rounded-full border border-line-subtle dark:border-line-subtle-dark bg-quaternary dark:bg-quaternary-dark  relative">
        <button
          onClick={handleToggle}
          className={cn(
            "absolute left-0.5 top-px w-18 h-8 rounded-full transition-all duration-300 ease-in-out",
            "font-switzer font-medium text-sm leading-5 text-center",
            isDark
              ? "translate-x-0 text-text-secondary dark:text-text-secondary-dark"
              : "translate-x-0 bg-btn-selected dark:bg-btn-selected-dark text-text-main dark:text-text-main-dark"
          )}
        >
          Light
        </button>
        <button
          onClick={handleToggle}
          className={cn(
            "absolute top-px right-0.5 w-18 h-8 rounded-full transition-all duration-300 ease-in-out",
            "font-switzer font-medium text-sm leading-5 text-center",
            isDark
              ? "translate-x-18 bg-btn-selected dark:bg-btn-selected-dark text-text-main dark:text-text-main-dark"
              : "translate-x-18 text-text-secondary dark:text-text-secondary-dark"
          )}
        >
          Dark
        </button>
      </div>
    </div>
  )
}

const Sidebar: React.FC = () => {
  const { t } = useI18n()
  const lang = useLang()
  const location = useLocation()
  const [isOpen] = useAtom(sidebarOpenAtom)
  const closeSidebar = useSetAtom(closeSidebarAtom)

  // 路由变化时关闭移动端侧边栏
  useEffect(() => {
    closeSidebar()
  }, [location.pathname, closeSidebar])

  // 定义导航项
  const topNavItems: NavItem[] = [
    {
      key: 'home',
      label: t('nav.home'),
      lightIcon: SparksIcon,
      darkIcon: SparksIconDark,
      lightSelectedIcon: SparksIconSelected,
      darkSelectedIcon: SparksIconDarkSelected,
      path: withLangPrefix(lang, '/'),
      matchPaths: [`/${lang}`, `/${lang}/`]
    },
    {
      key: 'recipes',
      label: t('nav.recipes'),
      lightIcon: RecipesIcon,
      darkIcon: RecipesIconDark,
      lightSelectedIcon: RecipesIconSelected,
      darkSelectedIcon: RecipesIconDarkSelected,
      path: withLangPrefix(lang, '/cases'),
      matchPaths: [`/${lang}/cases`, `/${lang}/cases/workflows`, `/${lang}/cases/styles`]
    },
    {
      key: 'assets',
      label: t('profile.myCreations'),
      lightIcon: MyAssetsIcon,
      darkIcon: MyAssetsIconDark,
      lightSelectedIcon: MyAssetsIconSelected,
      darkSelectedIcon: MyAssetsIconDarkSelected,
      path: withLangPrefix(lang, '/profile'),
      matchPaths: [`/${lang}/profile`]
    }
  ]

  const bottomNavItems: NavItem[] = [
    {
      key: 'workflow-builder',
      label: 'Builder',
      lightIcon: WorkflowBuilderIcon,
      darkIcon: WorkflowBuilderIconDark,
      lightSelectedIcon: WorkflowBuilderIconSelected,
      darkSelectedIcon: WorkflowBuilderIconDarkSelected,
      path: withLangPrefix(lang, '/workflow/builder'),
      matchPaths: [`/${lang}/workflow/builder`]
    },
    {
      key: 'style-trainer',
      label: 'Style Trainer',
      lightIcon: StyleTrainerIcon,
      darkIcon: StyleTrainerIconDark,
      lightSelectedIcon: StyleTrainerIconSelected,
      darkSelectedIcon: StyleTrainerIconDarkSelected,
      path: withLangPrefix(lang, '/style/trainer'),
      matchPaths: [`/${lang}/style/trainer`]
    }
  ]

  const isLocation = (pathname: string, matchPaths: string[]) => {
    return matchPaths.includes(pathname)
  }

  return (
    <>
      {/* 遮罩层 - 移动端显示 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-20 z-40 md:hidden"
          onClick={() => closeSidebar()}
        />
      )}

      {/* 侧边栏 */}
      <aside className={cn(
        "fixed md:relative inset-y-0 left-0 z-50 md:z-auto",
        "w-full md:w-40 border-r border-line-subtle dark:border-line-subtle-dark bg-secondary dark:bg-secondary-dark",
        "flex flex-col justify-between",
        "pt-0 md:pt-8 pb-5",
        "transform transition-transform duration-300 ease-in-out md:transform-none",
        "h-full",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* 上半部分：移动端顶部栏 + PC端Logo + 导航 */}
        <div className="flex flex-col">
          {/* 移动端H5顶部栏 */}
          <div className="md:hidden w-full h-14 flex items-center justify-between px-2.5 pr-4 border-b border-line-subtle dark:border-line-subtle-dark bg-secondary dark:bg-secondary-dark">
            <MobileCloseButton onClose={closeSidebar} />
            <div className="flex-1" /> {/* 占位，保持关闭按钮在左侧 */}
          </div>

          {/* PC端Logo区域 */}
          <div className="hidden md:block px-3.3 py-4">
            <Link to={withLangPrefix(lang, '/')} className="block">
              <img
                src={LogoIcon}
                alt="Logo"
                className="w-33 h-12.36 block dark:hidden"
              />
              <img
                src={LogoIconDark}
                alt="Logo"
                className="w-33 h-12.36 hidden dark:block"
              />
            </Link>
          </div>

          {/* 导航区域 */}
          <nav className="pt-0 md:pt-10 px-0 flex flex-col gap-2">
            {/* 上方三个导航项 */}
            <div className="flex flex-col gap-2">
              {topNavItems.map((item) => {
                const isSelected = isLocation(location.pathname, item.matchPaths)
                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    className={cn(
                      "relative flex items-center gap-2 w-full md:w-40 h-12 px-4 py-3",
                      "font-switzer text-base leading-6 font-medium transition-all duration-200",
                      // 选中状态
                      isSelected
                        ? "font-bold text-link-default dark:text-link-default-dark"
                        : "text-text-secondary dark:text-text-secondary-dark",
                      // Hover状态 - 所有状态都有hover效果
                      "hover:bg-tertiary dark:hover:bg-tertiary-dark"
                    )}
                  >
                    <IconComponent
                      lightIcon={item.lightIcon}
                      darkIcon={item.darkIcon}
                      lightSelectedIcon={item.lightSelectedIcon}
                      darkSelectedIcon={item.darkSelectedIcon}
                      alt={item.label}
                      isSelected={isSelected}
                    />
                    <span className="flex-1">{item.label}</span>
                    {/* 选中状态的右侧线条 */}
                    {isSelected && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-link-default dark:bg-link-default-dark rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>

            {/* 分割线 */}
            <div className="w-full md:w-40 h-6 px-4 py-3 flex items-center">
              <div className="w-full md:w-32 h-0 border-t border-line-subtle dark:border-line-subtle-dark" />
            </div>

            {/* 下方两个导航项 */}
            <div className="flex flex-col gap-2">
              {bottomNavItems.map((item) => {
                const isSelected = isLocation(location.pathname, item.matchPaths)
                return (
                  <Link
                    key={item.key}
                    to={item.path}
                    className={cn(
                      "relative flex items-center gap-2 w-full md:w-40 h-12 px-4 py-3",
                      "font-switzer text-base leading-6 font-medium transition-all duration-200",
                      // 选中状态
                      isSelected
                        ? "font-bold text-link-default dark:text-link-default-dark"
                        : "text-text-secondary dark:text-text-secondary-dark",
                      // Hover状态 - 所有状态都有hover效果
                      "hover:bg-tertiary dark:hover:bg-tertiary-dark"
                    )}
                  >
                    <IconComponent
                      lightIcon={item.lightIcon}
                      darkIcon={item.darkIcon}
                      lightSelectedIcon={item.lightSelectedIcon}
                      darkSelectedIcon={item.darkSelectedIcon}
                      alt={item.label}
                      isSelected={isSelected}
                    />
                    <span className="flex-1">{item.label}</span>
                    {/* 选中状态的右侧线条 */}
                    {isSelected && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-link-default dark:bg-link-default-dark rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* 移动端分割线和额外按钮 */}
          <div className="md:hidden">
            {/* 分割线 */}
            <div className="w-full h-6 px-4 py-3 flex items-center">
              <div className="w-full h-0 border-t border-line-subtle dark:border-line-subtle-dark" />
            </div>

            {/* 语言按钮 */}
            <div className="w-full h-12 flex items-center gap-2 px-4">
              <ThemeAdaptiveIcon
                lightIcon={GlobeIcon}
                darkIcon={GlobeIconDark}
                alt="Language"
                size="md"
              />
              <span className="font-switzer font-medium text-base leading-6 text-text-main dark:text-text-main-dark">
                English
              </span>
            </div>

            {/* 主题切换按钮 */}
            <MobileThemeToggle />
          </div>
        </div>

        {/* 下半部分：底部官方链接 */}
        <div className="w-full md:w-40 h-19 pt-3 gap-3 border-t border-line-subtle dark:border-line-subtle-dark flex flex-col">
          {/* 社交图标行 */}
          <div className="w-full md:w-40 h-9 gap-2 flex items-center justify-center">
            <SocialIconComponent
              lightIcon={XIcon}
              darkIcon={XIconDark}
              alt="X (Twitter)"
              href="https://x.com/MavaeAI"
            />
            <SocialIconComponent
              lightIcon={DiscordIcon}
              darkIcon={DiscordIconDark}
              alt="Discord"
              href="https://discord.gg/mavae"
            />
            <SocialIconComponent
              lightIcon={WeixinIcon}
              darkIcon={WeixinIconDark}
              alt="WeChat"
            />
          </div>

          {/* 版权文本行 */}
          <div className="w-full md:w-40 h-9 flex items-center justify-center">
            <span className="font-switzer font-medium text-xs leading-4 text-text-main dark:text-text-main-dark text-center">
              MAVAE © 2025
            </span>
          </div>
        </div>
      </aside>
    </>
  )
}

export default React.memo(Sidebar)