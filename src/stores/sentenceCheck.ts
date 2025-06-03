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
  startTime?: number
  elapsedTime: number
  isChecking: boolean
  isCancelled: boolean
  canCancel: boolean
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
    maxRetries: 0,
    startTime: undefined,
    elapsedTime: 0,
    isChecking: false,
    isCancelled: false,
    canCancel: false
  })

  // Timer for elapsed time tracking
  let elapsedTimer: number | null = null
  // Abort controller for cancelling requests
  let abortController: AbortController | null = null

  // Computed
  const sortedSentenceChecks = computed(() => {
    return [...userSentenceChecks.value].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  // Helper function to start elapsed time tracking
  const startElapsedTimer = () => {
    checkProgress.value.startTime = Date.now()
    checkProgress.value.elapsedTime = 0
    
    elapsedTimer = setInterval(() => {
      if (checkProgress.value.startTime && !checkProgress.value.isCancelled) {
        checkProgress.value.elapsedTime = Math.floor((Date.now() - checkProgress.value.startTime) / 1000)
      }
    }, 1000)
  }

  // Helper function to stop elapsed time tracking
  const stopElapsedTimer = () => {
    if (elapsedTimer) {
      clearInterval(elapsedTimer)
      elapsedTimer = null
    }
  }

  // Cancel check
  const cancelCheck = () => {
    if (abortController && !abortController.signal.aborted) {
      abortController.abort()
    }
    checkProgress.value.isCancelled = true
    checkProgress.value.canCancel = false
    checking.value = false
    stopElapsedTimer()
    
    toast.info(t('sentenceCheck.cancelled'))
    
    // Reset progress after a short delay
    setTimeout(() => {
      checkProgress.value = {
        isRetrying: false,
        currentAttempt: 0,
        maxRetries: 0,
        startTime: undefined,
        elapsedTime: 0,
        isChecking: false,
        isCancelled: false,
        canCancel: false
      }
    }, 1000)
  }

  // Actions
  const checkSentence = async (params: {
    sentence: string
    isPublic?: boolean
    maxRetries?: number
    grammarLanguage?: string
  }) => {
    if (checking.value) return { success: false, message: 'Already checking' }
    
    checking.value = true
    checkProgress.value = {
      isRetrying: false,
      currentAttempt: 1,
      maxRetries: params.maxRetries || 3,
      startTime: Date.now(),
      elapsedTime: 0,
      isChecking: true,
      isCancelled: false,
      canCancel: true
    }

    // Start elapsed time tracking
    startElapsedTimer()

    const maxRetries = params.maxRetries || 3
    let lastError = null

    try {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        // Check if cancelled
        if (checkProgress.value.isCancelled) {
          return { success: false, message: t('sentenceCheck.cancelled'), cancelled: true }
        }
        
        checkProgress.value.currentAttempt = attempt
        checkProgress.value.isRetrying = attempt > 1
        
        // Create new abort controller for each attempt
        abortController = new AbortController()

        try {
          const response = await sentenceCheckAPI.checkSentence({
            sentence: params.sentence,
            isPublic: params.isPublic ?? true,
            maxRetries: params.maxRetries || 3,
            grammarLanguage: params.grammarLanguage || 'combined',
            signal: abortController.signal
          })

          // Check if cancelled after request
          if (checkProgress.value.isCancelled) {
            return { success: false, message: t('sentenceCheck.cancelled'), cancelled: true }
          }

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
            if (attempt > 1) {
              toast.success(t('sentenceCheck.retrySuccess', { attempt }))
            } else {
              toast.success(t('sentenceCheck.checkSuccess'))
            }
            
            return { success: true, sentenceCheck: newCheck, attempt }
          } else {
            // Check if the error is retryable
            const isRetryable = response.data.retryable !== false
            lastError = response.data.message || t('sentenceCheck.checkFailed')
            
            if (!isRetryable) {
              // Non-retryable error, break the loop
              toast.error(lastError)
              return { success: false, message: lastError, retryable: false }
            }
            
            // If this is the last attempt, show error
            if (attempt === maxRetries) {
              const retryMessage = t('sentenceCheck.retryFailed', { attempts: maxRetries })
              toast.error(`${lastError} ${retryMessage}`)
              return { success: false, message: lastError, attempts: maxRetries }
            }
            
            // Show retry message and continue
            toast.warning(t('sentenceCheck.retryAttempt', { attempt: attempt + 1, max: maxRetries }))
            
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        } catch (error: any) {
          // Check if cancelled
          if (checkProgress.value.isCancelled || error.name === 'AbortError') {
            return { success: false, message: t('sentenceCheck.cancelled'), cancelled: true }
          }
          
          const message = error.response?.data?.message || t('sentenceCheck.checkFailed')
          const isRetryable = error.response?.data?.retryable !== false
          lastError = message
          
          if (!isRetryable) {
            // Non-retryable error, break the loop
            toast.error(message)
            return { success: false, message, retryable: false }
          }
          
          // If this is the last attempt, show error
          if (attempt === maxRetries) {
            const retryMessage = t('sentenceCheck.retryFailed', { attempts: maxRetries })
            toast.error(`${message} ${retryMessage}`)
            return { success: false, message, attempts: maxRetries }
          }
          
          // Show retry message and continue
          toast.warning(t('sentenceCheck.retryAttempt', { attempt: attempt + 1, max: maxRetries }))
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      // If we get here, all retries failed
      return { success: false, message: lastError || t('sentenceCheck.checkFailed'), attempts: maxRetries }
      
    } finally {
      checking.value = false
      stopElapsedTimer()
      checkProgress.value.canCancel = false
      
      // Reset progress after a short delay to allow UI to show final state
      setTimeout(() => {
        if (!checkProgress.value.isCancelled) {
          checkProgress.value = {
            isRetrying: false,
            currentAttempt: 0,
            maxRetries: 0,
            startTime: undefined,
            elapsedTime: 0,
            isChecking: false,
            isCancelled: false,
            canCancel: false
          }
        }
      }, 2000)
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
    userPagination.value = { current: 1, total: 1, hasNext: false, totalChecks: 0 }
    publicPagination.value = { current: 1, total: 1, hasNext: false, totalChecks: 0 }
    statistics.value = { totalChecks: 0, totalLikes: 0, avgSentenceLength: 0 }
    checkProgress.value = {
      isRetrying: false,
      currentAttempt: 0,
      maxRetries: 0,
      startTime: undefined,
      elapsedTime: 0,
      isChecking: false,
      isCancelled: false,
      canCancel: false
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
    cancelCheck,
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