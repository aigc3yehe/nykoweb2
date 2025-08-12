import { useEffect } from 'react'
import { useLocation, useParams } from 'react-router-dom'
import { SUPPORTED_LANGUAGES } from '../i18n/config'
import { useI18n } from '../hooks/useI18n'

const BASE_URL = 'https://mavae.ai'

function setTag(name: string, content: string) {
  let el = document.head.querySelector(`meta[name="${name}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('name', name)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setProperty(property: string, content: string) {
  let el = document.head.querySelector(`meta[property="${property}"]`) as HTMLMetaElement | null
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute('property', property)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setLink(rel: string, href: string, hrefLang?: string) {
  const selector = hrefLang ? `link[rel="${rel}"][hreflang="${hrefLang}"]` : `link[rel="${rel}"]`
  let el = document.head.querySelector(selector) as HTMLLinkElement | null
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', rel)
    if (hrefLang) el.setAttribute('hreflang', hrefLang)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function Seo({ title, description, image }: { title: string; description: string; image?: string }) {
  const { pathname } = useLocation()
  const { lang } = useParams()
  const { language } = useI18n()

  useEffect(() => {
    const pathWithoutLang = pathname.replace(/^\/(en|zh-CN|zh-HK)(\/|$)/, '/')
    const currentLang = (lang as any) || language || 'en'
    const canonical = `${BASE_URL}/${currentLang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`

    document.documentElement.lang = currentLang
    document.title = title

    setTag('description', description)
    setLink('canonical', canonical)

    SUPPORTED_LANGUAGES.forEach(l => {
      setLink('alternate', `${BASE_URL}/${l.code}${pathWithoutLang}`, l.hreflang)
    })
    setLink('alternate', `${BASE_URL}/en${pathWithoutLang}`, 'x-default')

    const ogLocale = SUPPORTED_LANGUAGES.find(l => l.code === currentLang)?.ogLocale || 'en_US'
    setProperty('og:locale', ogLocale)
    setProperty('og:title', title)
    setProperty('og:description', description)
    setProperty('og:url', canonical)
    setProperty('og:type', 'website')
    if (image) setProperty('og:image', image)

    setTag('twitter:card', 'summary_large_image')
    setTag('twitter:title', title)
    setTag('twitter:description', description)
    if (image) setTag('twitter:image', image)
  }, [pathname, lang, language, title, description, image])

  return null
}
