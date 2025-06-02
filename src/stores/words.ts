import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
import { wordsAPI } from '../services/api.ts'

interface WordDefinition {
  text: string
  partOfSpeech: string
}

interface Word {
  _id: string
  word: string
  userIds: string[]
  definitions: WordDefinition[]
  primaryDefinition?: string
  primaryPartOfSpeech?: string
  usageCount: number
  wordNetProcessed: boolean
  createdAt: string
  updatedAt: string
}

interface NewWord {
  word: string
}

interface WordStats {
  totalWords: number
  totalUsage: number
  mostUsedWords: Word[]
  partOfSpeechStats: { _id: string, count: number }[]
}

export const useWordsStore = defineStore('words', () => {
  const maxWordLength = ref<number>(50)
  const words = ref<Word[]>([])
  const selectedWords = ref<Set<string>>(new Set())
  const loading = ref(false)
  const stats = ref<WordStats | null>(null)
  const partsOfSpeech = ref<string[]>([])
  const currentFilter = ref<string>('all')
  const searchQuery = ref<string>('')
  const toast = useToast()
  const { t } = useI18n()

  const filteredWords = computed(() => {
    let filtered = words.value

    // Apply part of speech filter
    if (currentFilter.value && currentFilter.value !== 'all') {
      filtered = filtered.filter(word => word.primaryPartOfSpeech === currentFilter.value)
    }

    // Apply search filter
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.toLowerCase().trim()
      filtered = filtered.filter(word => 
        word.word.toLowerCase().includes(query) ||
        word.primaryDefinition?.toLowerCase().includes(query)
      )
    }

    return filtered
  })

  const sortedWords = computed(() => {
    return [...filteredWords.value].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  const selectedWordsList = computed(() => {
    return Array.from(selectedWords.value)
  })

  const selectedWordsCount = computed(() => selectedWords.value.size)
  const canGenerate = computed(() => selectedWordsCount.value >= 1 && selectedWordsCount.value <= maxWordLength.value)

  // Total count of unfiltered words for UI display logic
  const totalWordsCount = computed(() => words.value.length)

  const fetchWords = async () => {
    loading.value = true
    try {
      const params: any = {}
      if (currentFilter.value && currentFilter.value !== 'all') {
        params.partOfSpeech = currentFilter.value
      }
      if (searchQuery.value.trim()) {
        params.search = searchQuery.value.trim()
      }

      const response = await wordsAPI.getWords(params)
      
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

  const fetchPartsOfSpeech = async () => {
    try {
      const response = await wordsAPI.getPartsOfSpeech()
      if (response.data.success) {
        partsOfSpeech.value = response.data.partsOfSpeech
      }
    } catch (error) {
      console.error('Failed to fetch parts of speech:', error)
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
        // Refresh parts of speech if a new one was added
        if (response.data.word.primaryPartOfSpeech && !partsOfSpeech.value.includes(response.data.word.primaryPartOfSpeech)) {
          await fetchPartsOfSpeech()
        }
        return { success: true, word: response.data.word }
      } else {
        const message = response.data.message || t('common.error')
        // Check if it's a spelling error
        if (response.data.error === 'SPELLING_ERROR') {
          const suggestions = response.data.suggestions || []
          const suggestionText = suggestions.length > 0 
            ? t('words.spellingErrorWithSuggestions', { suggestions: suggestions.join(', ') })
            : t('words.spellingError')
          toast.error(suggestionText)
          return { success: false, message: suggestionText, suggestions }
        }
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

  const updateWord = async (id: string, updatedWord: { usageCount?: number }) => {
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

  const getRandomWords = async (count: number = 10, excludeUserWords: boolean = false, partOfSpeech?: string) => {
    try {
      const params: any = { count, excludeUserWords }
      if (partOfSpeech) {
        params.partOfSpeech = partOfSpeech
      }
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

  const setFilter = (filter: string) => {
    currentFilter.value = filter
    fetchWords()
  }

  const setSearchQuery = (query: string) => {
    searchQuery.value = query
    fetchWords()
  }

  const clearFilters = () => {
    currentFilter.value = 'all'
    searchQuery.value = ''
    fetchWords()
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
    const wordsToSelect = filteredWords.value.slice(0, maxWordLength.value)
    selectedWords.value = new Set(wordsToSelect.map(w => w._id))
    
    if (filteredWords.value.length > maxWordLength.value) {
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
    words: sortedWords,
    selectedWords: selectedWordsList,
    selectedWordsCount,
    canGenerate,
    loading,
    stats,
    partsOfSpeech,
    currentFilter,
    searchQuery,
    totalWordsCount,
    fetchWords,
    fetchPartsOfSpeech,
    addWord,
    updateWord,
    deleteWord,
    getRandomWords,
    fetchStats,
    setFilter,
    setSearchQuery,
    clearFilters,
    toggleWordSelection,
    selectAllWords,
    deselectAllWords,
    getSelectedWordsText,
    isWordSelected
  }
}) 