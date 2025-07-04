import { atom } from 'jotai'

export type Language = 'en' | 'zh' | 'ja' | 'ko'

export interface I18nMessages {
  [key: string]: string | I18nMessages
}

export const languageAtom = atom<Language>('en')

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
    const browserLang = navigator.language.split('-')[0] as Language
    const supportedLangs: Language[] = ['en', 'zh', 'ja', 'ko']
    const lang = savedLang || (supportedLangs.includes(browserLang) ? browserLang : 'en')
    set(languageAtom, lang)
  }
)