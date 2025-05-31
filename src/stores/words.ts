import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const API_BASE_URL = 'http://localhost:5000/api'

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
  const words = ref<Word[]>([])
  const selectedWords = ref<Set<string>>(new Set())
  const loading = ref(false)
  const stats = ref<WordStats | null>(null)
  const toast = useToast()

  const sortedWords = computed(() => {
    return [...words.value].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  const selectedWordsList = computed(() => {
    return Array.from(selectedWords.value)
  })

  const canGenerate = computed(() => {
    return selectedWords.value.size >= 1 && selectedWords.value.size <= 20
  })

  const fetchWords = async () => {
    loading.value = true
    try {
      const response = await axios.get(`${API_BASE_URL}/words`)
      words.value = response.data.words
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch words'
      toast.error(message)
    } finally {
      loading.value = false
    }
  }

  const addWord = async (newWord: NewWord) => {
    loading.value = true
    try {
      const response = await axios.post(`${API_BASE_URL}/words`, newWord)
      words.value.unshift(response.data.word)
      toast.success('Word added successfully!')
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to add word'
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const updateWord = async (id: string, updatedWord: Partial<NewWord>) => {
    loading.value = true
    try {
      const response = await axios.put(`${API_BASE_URL}/words/${id}`, updatedWord)
      const index = words.value.findIndex(w => w._id === id)
      if (index !== -1) {
        words.value[index] = response.data.word
      }
      toast.success('Word updated successfully!')
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update word'
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const deleteWord = async (id: string) => {
    loading.value = true
    try {
      await axios.delete(`${API_BASE_URL}/words/${id}`)
      words.value = words.value.filter(w => w._id !== id)
      selectedWords.value.delete(id)
      toast.success('Word deleted successfully!')
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete word'
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const getRandomWords = async (count: number = 5, includeAll: boolean = false) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/words/random`, {
        params: { count, includeAll }
      })
      return response.data.words
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to get random words'
      toast.error(message)
      return []
    }
  }

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/words/stats`)
      stats.value = response.data.stats
    } catch (error: any) {
      console.error('Failed to fetch word stats:', error)
    }
  }

  const toggleWordSelection = (wordId: string) => {
    if (selectedWords.value.has(wordId)) {
      selectedWords.value.delete(wordId)
    } else {
      if (selectedWords.value.size < 20) {
        selectedWords.value.add(wordId)
      } else {
        toast.warning('You can select maximum 20 words at a time')
      }
    }
  }

  const selectAllWords = () => {
    const wordsToSelect = words.value.slice(0, 20) // Limit to first 20 words
    selectedWords.value = new Set(wordsToSelect.map(w => w._id))
    if (words.value.length > 20) {
      toast.info('Only first 20 words were selected (maximum limit)')
    }
  }

  const deselectAllWords = () => {
    selectedWords.value.clear()
  }

  const getSelectedWordsText = () => {
    const selectedWordObjects = words.value.filter(w => selectedWords.value.has(w._id))
    return selectedWordObjects.map(w => w.word)
  }

  const isWordSelected = (wordId: string) => {
    return selectedWords.value.has(wordId)
  }

  return {
    words: computed(() => words.value),
    sortedWords,
    selectedWords: selectedWordsList,
    selectedWordsCount: computed(() => selectedWords.value.size),
    canGenerate,
    loading: computed(() => loading.value),
    stats: computed(() => stats.value),
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