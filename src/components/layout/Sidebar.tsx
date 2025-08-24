import React, { useEffect, useState } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { useLang, withLangPrefix } from '../../hooks/useLang'
import { useAtom, useSetAtom } from 'jotai'
import { sidebarOpenAtom, closeSidebarAtom } from '../../store/sidebarStore'
import { getCurrentTheme, toggleTheme } from '../../utils/theme'

import { cn } from '../../utils/cn'

// 导入新的MAVAE图标
import LogoIcon from '../../assets/mavae/logo.svg'
import LogoIconDark from '../../assets/mavae/dark/logo.svg'
import SparksIcon from '../../assets/mavae/Sparks.svg'
import RecipesIcon from '../../assets/mavae/Recipes.svg'
import MyAssetsIcon from '../../assets/mavae/MyAssets.svg'
import WorkflowBuilderIcon from '../../assets/mavae/WorkflowBuilder.svg'
import StyleTrainerIcon from '../../assets/mavae/StyleTrainer.svg'
import XIcon from '../../assets/mavae/X.svg'
import DiscordIcon from '../../assets/mavae/discord.svg'
import WeixinIcon from '../../assets/mavae/weixin.svg'
import CloseIcon from '../../assets/mavae/close.svg'
import GlobeIcon from '../../assets/mavae/globe.svg'
import ThemeIcon from '../../assets/mavae/them.svg'

interface NavItem {
  key: string
  label: string
  icon: string
  path: string
  matchPaths: string[] // 匹配路径列表
}

const IconComponent: React.FC<{
  src: string
  alt: string
  className?: string
  isSelected?: boolean
}> = ({ src, alt, className, isSelected }) => {
  return (
    <div className={cn("flex-shrink-0", className)}>
      <svg 
        className={cn(
          "w-5 h-5",
          // 图标颜色跟随文字颜色
          isSelected 
            ? "text-link-default dark:text-link-default-dark" 
            : "text-text-secondary dark:text-text-secondary-dark"
        )}
        style={{
          filter: isSelected 
            ? "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(230deg) brightness(104%) contrast(97%)" // #4458FF
            : "brightness(0) saturate(100%) invert(44%) sepia(8%) saturate(1018%) hue-rotate(201deg) brightness(94%) contrast(87%)" // #686E7D
        }}
      >
        <image href={src} width="1.25rem" height="1.25rem" />
      </svg>
    </div>
  )
}

// 底部社交图标组件
const SocialIconComponent: React.FC<{
  src: string
  alt: string
  href?: string
}> = ({ src, alt, href }) => {
  const IconElement = (
    <div className="w-9 h-9 flex items-center justify-center hover:bg-tertiary dark:hover:bg-tertiary-dark transition-colors rounded-lg">
      {/* Light theme icon */}
      <svg 
        className="w-5 h-5 block dark:hidden"
        style={{
          filter: "brightness(0) saturate(100%) invert(7%) sepia(5%) saturate(1038%) hue-rotate(202deg) brightness(94%) contrast(95%)" // #121314
        }}
      >
        <image href={src} width="1.25rem" height="1.25rem" />
      </svg>
      {/* Dark theme icon */}
      <svg 
        className="w-5 h-5 hidden dark:block"
        style={{
          filter: "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%)" // #FFFFFF
        }}
      >
        <image href={src} width="1.25rem" height="1.25rem" />
      </svg>
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
      {/* Light theme icon */}
      <svg 
        className="w-6 h-6 block dark:hidden"
        style={{
          filter: "brightness(0) saturate(100%) invert(7%) sepia(5%) saturate(1038%) hue-rotate(202deg) brightness(94%) contrast(95%)" // #121314
        }}
      >
        <image href={CloseIcon} width="1.5rem" height="1.5rem" />
      </svg>
      {/* Dark theme icon */}
      <svg 
        className="w-6 h-6 hidden dark:block"
        style={{
          filter: "brightness(0) saturate(100%) invert(100%) sepia(0%) saturate(0%) hue-rotate(93deg) brightness(103%) contrast(103%)" // #FFFFFF
        }}
      >
        <image href={CloseIcon} width="1.5rem" height="1.5rem" />
      </svg>
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
        <IconComponent 
          src={ThemeIcon} 
          alt="Theme" 
          isSelected={false}
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
      label: 'Home',
      icon: SparksIcon,
      path: withLangPrefix(lang, '/'),
      matchPaths: [`/${lang}`, `/${lang}/`]
    },
    {
      key: 'recipes',
      label: 'Agent Cases',
      icon: RecipesIcon,
      path: withLangPrefix(lang, '/recipes'),
      matchPaths: [`/${lang}/recipes`, `/${lang}/recipes/workflows`, `/${lang}/recipes/styles`]
    },
    {
      key: 'assets',
      label: 'My creations',
      icon: MyAssetsIcon,
      path: withLangPrefix(lang, '/profile'),
      matchPaths: [`/${lang}/profile`]
    }
  ]

  const bottomNavItems: NavItem[] = [
    {
      key: 'workflow-builder',
      label: 'Builder',
      icon: WorkflowBuilderIcon,
      path: withLangPrefix(lang, '/workflow/builder'),
      matchPaths: [`/${lang}/workflow/builder`]
    },
    {
      key: 'style-trainer',
      label: 'Style Trainer',
      icon: StyleTrainerIcon,
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
                      src={item.icon} 
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
                      src={item.icon} 
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
               <IconComponent 
                 src={GlobeIcon} 
                 alt="Language" 
                 isSelected={false}
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
              src={XIcon} 
              alt="X (Twitter)" 
              href="https://x.com/mavae"
            />
            <SocialIconComponent 
              src={DiscordIcon} 
              alt="Discord" 
              href="https://discord.gg/mavae"
            />
            <SocialIconComponent 
              src={WeixinIcon} 
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