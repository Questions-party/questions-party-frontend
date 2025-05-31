import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'

type Theme = 'light' | 'dark'
type Language = 'en' | 'zh'

export const useThemeStore = defineStore('theme', () => {
  const { locale } = useI18n()
  
  const theme = ref<Theme>((localStorage.getItem('theme') as Theme) || 'light')
  const language = ref<Language>((localStorage.getItem('language') as Language) || 'en')

  const isDark = computed(() => theme.value === 'dark')

  const setTheme = (newTheme: Theme) => {
    theme.value = newTheme
    localStorage.setItem('theme', newTheme)
    updateDocumentTheme()
  }

  const toggleTheme = () => {
    setTheme(theme.value === 'light' ? 'dark' : 'light')
  }

  const setLanguage = (newLanguage: Language) => {
    language.value = newLanguage
    locale.value = newLanguage
    localStorage.setItem('language', newLanguage)
  }

  const updateDocumentTheme = () => {
    if (theme.value === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark')
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.setAttribute('data-theme', 'light')
      document.documentElement.classList.remove('dark')
    }
  }

  const initializeTheme = () => {
    updateDocumentTheme()
    
    // Set initial language
    locale.value = language.value
    
    // Watch for changes and persist them
    watch(theme, (newTheme) => {
      localStorage.setItem('theme', newTheme)
      updateDocumentTheme()
    })
    
    watch(language, (newLanguage) => {
      localStorage.setItem('language', newLanguage)
      locale.value = newLanguage
    })
  }

  // Auto-detect system theme preference if no theme is set
  const detectSystemTheme = () => {
    if (!localStorage.getItem('theme')) {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      setTheme(systemPrefersDark ? 'dark' : 'light')
    }
  }

  return {
    theme: computed(() => theme.value),
    language: computed(() => language.value),
    isDark,
    setTheme,
    toggleTheme,
    setLanguage,
    initializeTheme,
    detectSystemTheme
  }
}) 