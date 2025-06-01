import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
import { wordsAPI } from '../services/api.ts'

interface Word {
  _id: string
  word: string
  userId: string
  definition?: string
  partOfSpeech?: string
  usageCount: number
  createdAt: string
  updatedAt: string
}

interface NewWord {
  word: string
  definition?: string
  partOfSpeech?: string
}

interface WordStats {
  totalWords: number
  totalUsage: number
  mostUsedWord?: Word
}

export const useWordsStore = defineStore('words', () => {
  const maxWordLength = ref<number>(50)
  const words = ref<Word[]>([])
  const selectedWords = ref<Set<string>>(new Set())
  const loading = ref(false)
  const stats = ref<WordStats | null>(null)
  const toast = useToast()
  const { t } = useI18n()

  const sortedWords = computed(() => {
    return [...words.value].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  const selectedWordsList = computed(() => {
    return Array.from(selectedWords.value)
  })

  const selectedWordsCount = computed(() => selectedWords.value.size)
  const canGenerate = computed(() => selectedWordsCount.value >= 1 && selectedWordsCount.value <= maxWordLength.value)

  const fetchWords = async () => {
    loading.value = true
    try {
      const response = await wordsAPI.getWords()
      
      if (response.data.success) {
        words.value = response.data.words
        return { success: true, words: response.data.words }
      } else {
        const message = response.data.message || t('common.error')
        toast.error(message)
        return { success: false, message }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('common.error')
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const addWord = async (newWord: NewWord) => {
    // Check if word already exists
    const existingWord = words.value.find(w => w.word.toLowerCase() === newWord.word.toLowerCase())
    if (existingWord) {
      toast.error(t('words.wordExists'))
      return { success: false, message: t('words.wordExists') }
    }

    loading.value = true
    try {
      const response = await wordsAPI.addWord(newWord)
      
      if (response.data.success) {
        words.value.unshift(response.data.word)
        toast.success(t('words.wordAdded'))
        return { success: true, word: response.data.word }
      } else {
        const message = response.data.message || t('common.error')
        toast.error(message)
        return { success: false, message }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('common.error')
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const updateWord = async (id: string, updatedWord: Partial<NewWord>) => {
    loading.value = true
    try {
      const response = await wordsAPI.updateWord(id, updatedWord)
      
      if (response.data.success) {
        const index = words.value.findIndex(w => w._id === id)
        if (index !== -1) {
          words.value[index] = { ...words.value[index], ...response.data.word }
        }
        toast.success(t('words.wordUpdated'))
        return { success: true, word: response.data.word }
      } else {
        const message = response.data.message || t('common.error')
        toast.error(message)
        return { success: false, message }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('common.error')
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const deleteWord = async (id: string) => {
    loading.value = true
    try {
      const response = await wordsAPI.deleteWord(id)
      
      if (response.data.success) {
        words.value = words.value.filter(w => w._id !== id)
        selectedWords.value.delete(id)
        toast.success(t('words.wordDeleted'))
        return { success: true }
      } else {
        const message = response.data.message || t('common.error')
        toast.error(message)
        return { success: false, message }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('common.error')
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const getRandomWords = async (count: number = 10, excludeUserWords: boolean = false) => {
    try {
      const params = { count, excludeUserWords }
      const response = await wordsAPI.getRandomWords(params)
      
      if (response.data.success) {
        return response.data.words
      } else {
        return []
      }
    } catch (error) {
      console.error('Failed to fetch random words:', error)
      return []
    }
  }

  const fetchStats = async () => {
    try {
      const response = await wordsAPI.getStats()
      if (response.data.success) {
        stats.value = response.data.stats
      }
    } catch (error) {
      console.error('Failed to fetch word stats:', error)
    }
  }

  const toggleWordSelection = (wordId: string) => {
    if (selectedWords.value.has(wordId)) {
      selectedWords.value.delete(wordId)
    } else {
      if (selectedWords.value.size >= maxWordLength.value) {
        toast.warning(t('words.maxSelectionWarning'))
        return
      }
      selectedWords.value.add(wordId)
    }
  }

  const selectAllWords = () => {
    const wordsToSelect = words.value.slice(0, maxWordLength.value)
    selectedWords.value = new Set(wordsToSelect.map(w => w._id))
    
    if (words.value.length > maxWordLength.value) {
      toast.info(t('words.maxSelectionInfo'))
    }
  }

  const deselectAllWords = () => {
    selectedWords.value.clear()
  }

  const getSelectedWordsText = () => {
    return selectedWordsList.value.map(id => words.value.find(w => w._id === id)?.word).filter(Boolean)
  }

  const isWordSelected = (wordId: string) => {
    return selectedWords.value.has(wordId)
  }

  return {
    maxWordLength,
    words,
    sortedWords,
    selectedWords: selectedWordsList,
    selectedWordsCount,
    canGenerate,
    loading,
    stats,
    fetchWords,
    addWord,
    updateWord,
    deleteWord,
    getRandomWords,
    fetchStats,
    toggleWordSelection,
    selectAllWords,
    deselectAllWords,
    getSelectedWordsText,
    isWordSelected
  }
}) 