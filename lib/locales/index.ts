import zh_cn from './zh_cn'
import en from './en'
import type { Locale } from '../types'

let currentLocale = zh_cn

export function t(key: string) {
  return currentLocale[key as keyof Locale] || key
}

export function setLocale(locale: Locale) {
  currentLocale = locale
}

export { zh_cn, en }
