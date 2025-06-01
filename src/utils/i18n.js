import { createI18n } from 'vue-i18n'

// Import translations
import en from '../locales/en.json'
import zh from '../locales/zh.json'

// Create i18n instance
export const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('language') || 'en',
  fallbackLocale: 'en',
  messages: {
    en,
    zh
  }
})

// Function to get current locale that can be used outside Vue components
export const getCurrentLocale = () => {
  return i18n.global.locale.value
}

// Function to set locale
export const setLocale = (locale) => {
  i18n.global.locale.value = locale
  localStorage.setItem('language', locale)
}

export default i18n 