import React from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { themeAtom, toggleThemeAtom } from '../../store/themeStore'
import { languageAtom, setLanguageAtom, Language } from '../../store/i18nStore'
import { useI18n } from '../../hooks/useI18n'
import ThemeToggle from '../ui/ThemeToggle'
import LanguageSelector from '../ui/LanguageSelector'

const Header: React.FC = React.memo(() => {
  const { t } = useI18n()
  
  return (
    <header className="h-14 border-b border-border bg-background dark:bg-background">
      <div className="flex h-full items-center justify-between px-6 md:px-6">
        {/* Logo */}
        <div className="flex items-center">
          <img 
            src="/src/assets/web2/Logo.png" 
            alt="Logo" 
            className="w-[4.4375rem] h-8"
          />
        </div>
        
        {/* 右侧按钮组 */}
        <div className="flex items-center gap-2.5">
          {/* 主题切换按钮 */}
          <ThemeToggle />
          
          {/* 语言选择器 */}
          <LanguageSelector />
          
          {/* Upgrade 按钮 */}
          <button className="flex items-center justify-center gap-1.5 w-[7.125rem] h-8 px-4 py-2 bg-[#00FF48] hover:bg-[#00E041] dark:bg-[#00CC39] dark:hover:bg-[#00B833] rounded-md transition-colors">
            <img 
              src="/src/assets/web2/upgrade.svg" 
              alt="Upgrade" 
              className="w-4 h-4"
            />
            <span className="text-black dark:text-black font-normal text-sm leading-none font-lexend">
              {t('header.upgrade')} {/* en: Upgrade / zh: 升级 */}
            </span>
          </button>
          
          {/* Log in 按钮 */}
          <button className="flex items-center justify-center w-[5.75rem] h-8 px-4 py-2 bg-[#0900FF] hover:bg-[#0800E6] dark:bg-[#0A00FF] dark:hover:bg-[#0900E6] rounded-md transition-colors">
            <span className="text-white dark:text-white font-normal text-sm leading-none font-lexend">
              {t('header.login')} {/* en: Log in / zh: 登录 */}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
})

Header.displayName = 'Header'

export default Header