import { atom } from 'jotai'
import { DEFAULT_LANGUAGE, Language } from '../i18n/config'

export interface I18nMessages {
  [key: string]: string | I18nMessages
}

export const languageAtom = atom<Language>(DEFAULT_LANGUAGE)

export const setLanguageAtom = atom(
  null,
  (_, set, language: Language) => {
    set(languageAtom, language)
    localStorage.setItem('language', language)
  }
)

// 初始化语言
export const initLanguageAtom = atom(
  null,
  (_, set) => {
    const savedLang = localStorage.getItem('language') as Language
    const browserLang = ((): Language => {
      const nav = navigator.language
      if (nav.startsWith('zh-CN') || nav === 'zh') return 'zh-CN'
      if (nav.startsWith('zh-TW') || nav.startsWith('zh-HK')) return 'zh-HK'
      return 'en'
    })()
    const supportedLangs: Language[] = ['en', 'zh-CN', 'zh-HK']
    const lang = savedLang || (supportedLangs.includes(browserLang) ? browserLang : DEFAULT_LANGUAGE)
    set(languageAtom, lang)
  }
)