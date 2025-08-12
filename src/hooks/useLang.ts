import { useParams } from 'react-router-dom'
import { useAtom } from 'jotai'
import { languageAtom } from '../store/i18nStore'
import type { Language } from '../i18n/config'

export function useLang(): Language {
  const { lang } = useParams()
  const [stateLang] = useAtom(languageAtom)
  return (lang as Language) || stateLang
}

export function withLangPrefix(lang: string, path: string): string {
  if (!path || path === '/') return `/${lang}`
  const clean = path.startsWith('/') ? path : `/${path}`
  return `/${lang}${clean}`
}
