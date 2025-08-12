// Centralized i18n configuration
export type Language = 'en' | 'zh-CN' | 'zh-HK'

export interface LanguageOption {
  code: Language
  name: string
  shortName: string
  hreflang: string
  ogLocale: string
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', shortName: 'EN', hreflang: 'en', ogLocale: 'en_US' },
  { code: 'zh-CN', name: '简体中文', shortName: '简体', hreflang: 'zh-CN', ogLocale: 'zh_CN' },
  { code: 'zh-HK', name: '繁體中文（香港）', shortName: '繁中', hreflang: 'zh-HK', ogLocale: 'zh_HK' }
]

export const DEFAULT_LANGUAGE: Language = 'en'

