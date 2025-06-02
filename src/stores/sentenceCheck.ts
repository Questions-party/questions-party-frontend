import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
import { sentenceCheckAPI } from '../services/api.ts'

interface SentenceCheck {
  _id: string
  userId: {
    _id: string
    username: string
  }
  originalSentence: string
  grammarAnalysis: string
  grammarCorrection: string
  keywordAnalysis: string
  chineseDefinition: string
  thinkingText?: string
  isPublic: boolean
  likes: Array<{ userId: string; createdAt: string }>
  likeCount: number
  aiModel: string
  grammarLanguageOption: string
  createdAt: string
  updatedAt: string
}

interface CheckProgress {
  isRetrying: boolean
  currentAttempt: number
  maxRetries: number
}

interface Pagination {
  current: number
  total: number
  hasNext: boolean
  totalChecks: number
}

interface Statistics {
  totalChecks: number
  totalLikes: number
  avgSentenceLength: number
}

export const useSentenceCheckStore = defineStore('sentenceCheck', () => {
  const toast = useToast()
  const { t } = useI18n()

  // State
  const userSentenceChecks = ref<SentenceCheck[]>([])
  const publicSentenceChecks = ref<SentenceCheck[]>([])
  const currentSentenceCheck = ref<SentenceCheck | null>(null)
  const checking = ref(false)
  const loading = ref(false)
  const statisticsLoading = ref(false)
  
  // Pagination
  const userPagination = ref<Pagination>({
    current: 1,
    total: 1,
    hasNext: false,
    totalChecks: 0
  })
  
  const publicPagination = ref<Pagination>({
    current: 1,
    total: 1,
    hasNext: false,
    totalChecks: 0
  })

  // Statistics
  const statistics = ref<Statistics>({
    totalChecks: 0,
    totalLikes: 0,
    avgSentenceLength: 0
  })

  // Check progress
  const checkProgress = ref<CheckProgress>({
    isRetrying: false,
    currentAttempt: 0,
    maxRetries: 0
  })

  // Computed
  const sortedSentenceChecks = computed(() => {
    return [...userSentenceChecks.value].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  // Actions
  const checkSentence = async (params: {
    sentence: string
    isPublic?: boolean
    maxRetries?: number
    grammarLanguage?: string
  }) => {
    if (checking.value) return { success: false, message: 'Already checking' }
    
    checking.value = true
    checkProgress.value.isRetrying = false
    checkProgress.value.currentAttempt = 0
    checkProgress.value.maxRetries = params.maxRetries || 3

    try {
      const response = await sentenceCheckAPI.checkSentence({
        sentence: params.sentence,
        isPublic: params.isPublic ?? true,
        maxRetries: params.maxRetries || 3,
        grammarLanguage: params.grammarLanguage || 'combined'
      })

      if (response.data.success) {
        const newCheck = response.data.sentenceCheck
        
        // Add to user checks if it exists
        if (userSentenceChecks.value.length > 0) {
          userSentenceChecks.value.unshift(newCheck)
        }
        
        // Add to public checks if it's public
        if (newCheck.isPublic && publicSentenceChecks.value.length > 0) {
          publicSentenceChecks.value.unshift(newCheck)
        }
        
        // Set as current check
        currentSentenceCheck.value = newCheck
        
        // Show success with retry info if available
        if (response.data.retryInfo?.attempt > 1) {
          toast.success(t('sentenceCheck.retrySuccess', { attempt: response.data.retryInfo.attempt }))
        } else {
          toast.success(t('sentenceCheck.checkSuccess'))
        }
        
        return { success: true, sentenceCheck: newCheck, retryInfo: response.data.retryInfo }
      } else {
        const message = response.data.message || t('sentenceCheck.checkFailed')
        toast.error(message)
        return { success: false, message }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('sentenceCheck.checkFailed')
      toast.error(message)
      return { success: false, message }
    } finally {
      checking.value = false
      checkProgress.value.isRetrying = false
    }
  }

  const fetchUserSentenceChecks = async (page = 1, sortBy = 'recent') => {
    if (page === 1) {
      userSentenceChecks.value = []
      userPagination.value = { current: 1, total: 1, hasNext: false, totalChecks: 0 }
    }

    loading.value = true
    try {
      const response = await sentenceCheckAPI.getUserSentenceChecks({
        page, limit: 10, sortBy
      })

      if (response.data.success) {
        if (page === 1) {
          userSentenceChecks.value = response.data.sentenceChecks
        } else {
          userSentenceChecks.value.push(...response.data.sentenceChecks)
        }
        
        userPagination.value = response.data.pagination
        return { success: true }
      } else {
        const message = response.data.message || t('sentenceCheck.fetchFailed')
        toast.error(message)
        return { success: false, message }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('sentenceCheck.fetchFailed')
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const fetchPublicSentenceChecks = async (page = 1, sortBy = 'recent') => {
    if (page === 1) {
      publicSentenceChecks.value = []
      publicPagination.value = { current: 1, total: 1, hasNext: false, totalChecks: 0 }
    }

    loading.value = true
    try {
      const response = await sentenceCheckAPI.getPublicSentenceChecks({
        page, limit: 10, sortBy
      })

      if (response.data.success) {
        if (page === 1) {
          publicSentenceChecks.value = response.data.sentenceChecks
        } else {
          publicSentenceChecks.value.push(...response.data.sentenceChecks)
        }
        
        publicPagination.value = response.data.pagination
        return { success: true }
      } else {
        const message = response.data.message || t('sentenceCheck.fetchFailed')
        toast.error(message)
        return { success: false, message }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('sentenceCheck.fetchFailed')
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const refreshPublicSentenceChecks = async (sortBy = 'recent') => {
    await fetchPublicSentenceChecks(1, sortBy)
  }

  const loadMorePublicSentenceChecks = async (sortBy = 'recent') => {
    if (publicPagination.value.hasNext) {
      await fetchPublicSentenceChecks(publicPagination.value.current + 1, sortBy)
    }
  }

  const getSentenceCheck = async (id: string) => {
    try {
      const response = await sentenceCheckAPI.getSentenceCheck(id)
      if (response.data.success) {
        return response.data.sentenceCheck
      } else {
        const message = response.data.message || t('sentenceCheck.notFound')
        toast.error(message)
        return null
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('sentenceCheck.notFound')
      toast.error(message)
      return null
    }
  }

  const toggleLike = async (id: string) => {
    try {
      const response = await sentenceCheckAPI.toggleLike(id)
      
      if (response.data.success) {
        const { liked, likeCount } = response.data
        
        // Update in all arrays
        const updateCheck = (check: SentenceCheck) => {
          if (check._id === id) {
            check.likeCount = likeCount
            if (liked) {
              // Add current user to likes if not already there
              const userId = check.userId._id // Assuming we have access to current user
              if (!check.likes.some(like => like.userId === userId)) {
                check.likes.push({ userId, createdAt: new Date().toISOString() })
              }
            } else {
              // Remove current user from likes
              const userId = check.userId._id
              check.likes = check.likes.filter(like => like.userId !== userId)
            }
          }
        }
        
        userSentenceChecks.value.forEach(updateCheck)
        publicSentenceChecks.value.forEach(updateCheck)
        if (currentSentenceCheck.value && currentSentenceCheck.value._id === id) {
          updateCheck(currentSentenceCheck.value)
        }
        
        const message = liked ? t('sentenceCheck.likeSuccess') : t('sentenceCheck.unlikeSuccess')
        toast.success(message)
        
        return { success: true, liked, likeCount }
      } else {
        const message = response.data.message || t('sentenceCheck.likeFailed')
        toast.error(message)
        return { success: false, message }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('sentenceCheck.likeFailed')
      toast.error(message)
      return { success: false, message }
    }
  }

  const updateSentenceCheckPrivacy = async (id: string, isPublic: boolean) => {
    try {
      const response = await sentenceCheckAPI.updatePrivacy(id, isPublic)
      
      if (response.data.success) {
        const updatedCheck = response.data.sentenceCheck
        
        // Update in user checks
        const userIndex = userSentenceChecks.value.findIndex(check => check._id === id)
        if (userIndex !== -1) {
          userSentenceChecks.value[userIndex] = updatedCheck
        }
        
        // Add to or remove from public checks
        if (isPublic) {
          // Add to public checks if not already there
          const publicIndex = publicSentenceChecks.value.findIndex(check => check._id === id)
          if (publicIndex === -1) {
            publicSentenceChecks.value.unshift(updatedCheck)
          } else {
            publicSentenceChecks.value[publicIndex] = updatedCheck
          }
        } else {
          // Remove from public checks
          publicSentenceChecks.value = publicSentenceChecks.value.filter(check => check._id !== id)
        }
        
        // Update current check if it's the same one
        if (currentSentenceCheck.value && currentSentenceCheck.value._id === id) {
          currentSentenceCheck.value = updatedCheck
        }
        
        const status = isPublic ? t('sentenceCheck.public') : t('sentenceCheck.private')
        toast.success(t('sentenceCheck.privacyUpdated', { status }))
        
        return { success: true, sentenceCheck: updatedCheck }
      } else {
        const message = response.data.message || t('sentenceCheck.updateFailed')
        toast.error(message)
        return { success: false, message }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('sentenceCheck.updateFailed')
      toast.error(message)
      return { success: false, message }
    }
  }

  const deleteSentenceCheck = async (id: string) => {
    try {
      const response = await sentenceCheckAPI.deleteSentenceCheck(id)
      
      if (response.data.success) {
        // Remove from all arrays
        userSentenceChecks.value = userSentenceChecks.value.filter(check => check._id !== id)
        publicSentenceChecks.value = publicSentenceChecks.value.filter(check => check._id !== id)
        
        // Clear current check if it's the same one
        if (currentSentenceCheck.value && currentSentenceCheck.value._id === id) {
          currentSentenceCheck.value = null
        }
        
        toast.success(t('sentenceCheck.deleteSuccess'))
        return { success: true }
      } else {
        const message = response.data.message || t('sentenceCheck.deleteFailed')
        toast.error(message)
        return { success: false, message }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('sentenceCheck.deleteFailed')
      toast.error(message)
      return { success: false, message }
    }
  }

  const deleteAllSentenceChecks = async () => {
    try {
      const response = await sentenceCheckAPI.deleteAllSentenceChecks()
      
      if (response.data.success) {
        // Clear all user checks
        userSentenceChecks.value = []
        currentSentenceCheck.value = null
        userPagination.value = { current: 1, total: 1, hasNext: false, totalChecks: 0 }
        
        toast.success(t('sentenceCheck.deleteAllSuccess'))
        return { success: true }
      } else {
        const message = response.data.message || t('sentenceCheck.deleteAllFailed')
        toast.error(message)
        return { success: false, message }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('sentenceCheck.deleteAllFailed')
      toast.error(message)
      return { success: false, message }
    }
  }

  const fetchStatistics = async () => {
    statisticsLoading.value = true
    try {
      const response = await sentenceCheckAPI.getStatistics()
      if (response.data.success) {
        statistics.value = response.data.statistics
        return { success: true }
      } else {
        return { success: false }
      }
    } catch (error) {
      return { success: false }
    } finally {
      statisticsLoading.value = false
    }
  }

  const clearCurrentSentenceCheck = () => {
    currentSentenceCheck.value = null
  }

  const resetState = () => {
    userSentenceChecks.value = []
    publicSentenceChecks.value = []
    currentSentenceCheck.value = null
    userPagination.value = {
      current: 1,
      total: 1,
      hasNext: false,
      totalChecks: 0
    }
    publicPagination.value = {
      current: 1,
      total: 1,
      hasNext: false,
      totalChecks: 0
    }
    statistics.value = {
      totalChecks: 0,
      totalLikes: 0,
      avgSentenceLength: 0
    }
    checkProgress.value = {
      isRetrying: false,
      currentAttempt: 0,
      maxRetries: 0
    }
  }

  return {
    // State
    userSentenceChecks,
    publicSentenceChecks,
    currentSentenceCheck,
    checking,
    loading,
    statisticsLoading,
    userPagination,
    publicPagination,
    statistics,
    checkProgress,

    // Computed
    sortedSentenceChecks,

    // Actions
    checkSentence,
    fetchUserSentenceChecks,
    fetchPublicSentenceChecks,
    refreshPublicSentenceChecks,
    loadMorePublicSentenceChecks,
    getSentenceCheck,
    toggleLike,
    updateSentenceCheckPrivacy,
    deleteSentenceCheck,
    deleteAllSentenceChecks,
    fetchStatistics,
    clearCurrentSentenceCheck,
    resetState
  }
}) 