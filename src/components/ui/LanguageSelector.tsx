import React, { useState, useCallback } from 'react'
import { useAtom, useSetAtom } from 'jotai'
import { languageAtom, setLanguageAtom, Language } from '../../store/i18nStore'

const languages = [
  { code: 'en' as Language, name: 'English', flag: '🇺🇸' },
  { code: 'zh' as Language, name: '中文', flag: '🇨🇳' },
  { code: 'ja' as Language, name: '日本語', flag: '🇯🇵' },
  { code: 'ko' as Language, name: '한국어', flag: '🇰🇷' }
]

const LanguageSelector: React.FC = React.memo(() => {
  const [language] = useAtom(languageAtom)
  const setLanguage = useSetAtom(setLanguageAtom)
  const [isOpen, setIsOpen] = useState(false)

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  const handleToggle = useCallback(() => {
    setIsOpen(!isOpen)
  }, [isOpen])

  const handleLanguageSelect = useCallback((langCode: Language) => {
    setLanguage(langCode)
    setIsOpen(false)
  }, [setLanguage])

  return (
    <div className="relative">
      <button
        onClick={handleToggle}
        className="flex items-center justify-center h-8 px-2 rounded-md border border-border bg-background hover:bg-accent dark:bg-background dark:hover:bg-accent transition-colors gap-1"
      >
        <span className="text-sm">{currentLanguage.flag}</span>
        <svg className="h-3 w-3 text-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-background dark:bg-background border border-border rounded-lg shadow-lg z-50">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className="w-full px-4 py-2 text-left hover:bg-accent dark:hover:bg-accent transition-colors flex items-center space-x-3 first:rounded-t-lg last:rounded-b-lg text-foreground"
            >
              <span>{lang.flag}</span>
              <span className="text-sm">{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
})

LanguageSelector.displayName = 'LanguageSelector'

export default LanguageSelector