import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generationsAPI, statisticsAPI } from '../services/api.ts'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'

interface Generation {
  _id: string
  sentence: string
  explanation: string
  thinkingText?: string
  rawResponseContent?: string
  words: string[]
  isPublic: boolean
  likeCount: number
  likes?: Array<{ userId: string }>
  userId: {
    _id: string
    username: string
  }
  aiModel?: string
  createdAt: string
  updatedAt: string
}

interface GenerationInput {
  words: string[]
  isPublic?: boolean
  maxRetries?: number
  grammarLanguage?: string
  enableThinking?: boolean
  signal?: AbortSignal
}

interface RetryInfo {
  attempt: number
  maxRetries: number
  success: boolean
}

interface GenerationProgress {
  isRetrying: boolean
  currentAttempt: number
  maxRetries: number
  errorMessage?: string
  startTime?: number
  elapsedTime: number
  isGenerating: boolean
  isCancelled: boolean
  canCancel: boolean
}

interface PublicPagination {
  page: number
  limit: number
  hasNext: boolean
  total: number
}

interface CommunityStatistics {
  totalGenerations: number
  totalWords: number
  totalLikes: number
}

export const useGenerationsStore = defineStore('generations', () => {
  const toast = useToast()
  const { t } = useI18n()
  
  const generations = ref<Generation[]>([])
  const publicGenerations = ref<Generation[]>([])
  const currentGeneration = ref<Generation | null>(null)
  const statistics = ref<CommunityStatistics>({
    totalGenerations: 0,
    totalWords: 0,
    totalLikes: 0
  })
  const generating = ref(false)
  const loading = ref(false)
  const statisticsLoading = ref(false)
  const generationProgress = ref<GenerationProgress>({
    isRetrying: false,
    currentAttempt: 0,
    maxRetries: 3,
    startTime: undefined,
    elapsedTime: 0,
    isGenerating: false,
    isCancelled: false,
    canCancel: false
  })
  const publicPagination = ref<PublicPagination>({
    page: 1,
    limit: 10,
    hasNext: false,
    total: 0
  })
  
  // Timer for elapsed time tracking
  let elapsedTimer: number | null = null
  // Abort controller for cancelling requests
  let abortController: AbortController | null = null

  const sortedGenerations = computed(() => {
    return [...generations.value].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  // Helper function to start elapsed time tracking
  const startElapsedTimer = () => {
    generationProgress.value.startTime = Date.now()
    generationProgress.value.elapsedTime = 0
    
    elapsedTimer = setInterval(() => {
      if (generationProgress.value.startTime && !generationProgress.value.isCancelled) {
        generationProgress.value.elapsedTime = Math.floor((Date.now() - generationProgress.value.startTime) / 1000)
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

  // Cancel generation
  const cancelGeneration = () => {
    if (abortController && !abortController.signal.aborted) {
      abortController.abort()
    }
    generationProgress.value.isCancelled = true
    generationProgress.value.canCancel = false
    generating.value = false
    stopElapsedTimer()
    
    toast.info(t('generation.cancelled'))
    
    // Reset progress after a short delay
    setTimeout(() => {
      generationProgress.value = {
        isRetrying: false,
        currentAttempt: 0,
        maxRetries: 3,
        startTime: undefined,
        elapsedTime: 0,
        isGenerating: false,
        isCancelled: false,
        canCancel: false
      }
    }, 1000)
  }

  const generateSentence = async (input: GenerationInput) => {
    generating.value = true
    generationProgress.value = {
      isRetrying: false,
      currentAttempt: 1,
      maxRetries: input.maxRetries || 3,
      startTime: Date.now(),
      elapsedTime: 0,
      isGenerating: true,
      isCancelled: false,
      canCancel: true
    }
    
    // Start elapsed time tracking
    startElapsedTimer()
    
    const maxRetries = input.maxRetries || 3
    let lastError = null
    
    try {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        // Check if cancelled
        if (generationProgress.value.isCancelled) {
          return { success: false, message: t('generation.cancelled'), cancelled: true }
        }
        
        generationProgress.value.currentAttempt = attempt
        generationProgress.value.isRetrying = attempt > 1
        
        // Create new abort controller for each attempt
        abortController = new AbortController()
        
        try {
          const response = await generationsAPI.generate({
            ...input,
            signal: abortController.signal
          })
          
          // Check if cancelled after request
          if (generationProgress.value.isCancelled) {
            return { success: false, message: t('generation.cancelled'), cancelled: true }
          }
          
          if (response.data.success) {
            currentGeneration.value = response.data.generation
            generations.value.unshift(response.data.generation)
            
            // Show success message
            if (attempt > 1) {
              toast.success(t('generation.retrySuccess', { attempt }))
            } else {
              toast.success(t('generation.generationSuccess'))
            }
            
            return { 
              success: true, 
              generation: response.data.generation,
              attempt
            }
          } else {
            // Check if the error is retryable
            const isRetryable = response.data.retryable !== false
            lastError = response.data.message || t('generation.generationError')
            
            if (!isRetryable) {
              // Non-retryable error, break the loop
              toast.error(lastError)
              return { success: false, message: lastError, retryable: false }
            }
            
            // If this is the last attempt, show error
            if (attempt === maxRetries) {
              const retryMessage = t('generation.retryFailed', { attempts: maxRetries })
              toast.error(`${lastError} ${retryMessage}`)
              return { success: false, message: lastError, attempts: maxRetries }
            }
            
            // Show retry message and continue
            toast.warning(t('generation.retryAttempt', { attempt: attempt + 1, max: maxRetries }))
            
            // Wait a bit before retrying
            await new Promise(resolve => setTimeout(resolve, 1000))
          }
        } catch (error: any) {
          // Check if cancelled
          if (generationProgress.value.isCancelled || error.name === 'AbortError') {
            return { success: false, message: t('generation.cancelled'), cancelled: true }
          }
          
          const message = error.response?.data?.message || t('generation.generationError')
          const isRetryable = error.response?.data?.retryable !== false
          lastError = message
          
          if (!isRetryable) {
            // Non-retryable error, break the loop
            toast.error(message)
            return { success: false, message, retryable: false }
          }
          
          // If this is the last attempt, show error
          if (attempt === maxRetries) {
            const retryMessage = t('generation.retryFailed', { attempts: maxRetries })
            toast.error(`${message} ${retryMessage}`)
            return { success: false, message, attempts: maxRetries }
          }
          
          // Show retry message and continue
          toast.warning(t('generation.retryAttempt', { attempt: attempt + 1, max: maxRetries }))
          
          // Wait a bit before retrying
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
      
      // If we get here, all retries failed
      return { success: false, message: lastError || t('generation.generationError'), attempts: maxRetries }
      
    } finally {
      generating.value = false
      stopElapsedTimer()
      generationProgress.value.canCancel = false
      
      // Reset progress after a short delay to allow UI to show final state
      setTimeout(() => {
        if (!generationProgress.value.isCancelled) {
          generationProgress.value = {
            isRetrying: false,
            currentAttempt: 0,
            maxRetries: 3,
            startTime: undefined,
            elapsedTime: 0,
            isGenerating: false,
            isCancelled: false,
            canCancel: false
          }
        }
      }, 2000)
    }
  }

  const fetchUserGenerations = async () => {
    loading.value = true
    try {
      const response = await generationsAPI.getUserGenerations()
      
      if (response.data.success) {
        generations.value = response.data.generations
        return { success: true, generations: response.data.generations }
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

  const fetchPublicGenerations = async (page: number = 1, sortBy: string = 'recent') => {
    loading.value = true
    try {
      const response = await generationsAPI.getPublicGenerations({
        page, sortBy, limit: publicPagination.value.limit
      })
      
      if (response.data.success) {
        if (page === 1) {
          publicGenerations.value = response.data.generations
        } else {
          publicGenerations.value.push(...response.data.generations)
        }
        
        publicPagination.value = {
          page: response.data.pagination.current,
          limit: response.data.pagination.limit || 10,
          hasNext: response.data.pagination.hasNext,
          total: response.data.pagination.totalGenerations
        }
        
        return { success: true, generations: response.data.generations }
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

  const toggleLike = async (generationId: string) => {
    try {
      const response = await generationsAPI.toggleLike(generationId)
      
      if (response.data.success) {
        const liked = response.data.liked
        
        // Update in both user and public generations
        const updateGeneration = (gen: Generation) => {
          if (gen._id === generationId) {
            gen.likeCount = response.data.likeCount
          }
        }
        
        generations.value.forEach(updateGeneration)
        publicGenerations.value.forEach(updateGeneration)
        
        if (currentGeneration.value?._id === generationId) {
          currentGeneration.value.likeCount = response.data.likeCount
        }
        
        toast.success(liked ? t('generation.likeSuccess') : t('generation.unlikeSuccess'))
        return { success: true, liked }
      } else {
        const message = response.data.message || t('common.error')
        toast.error(message)
        return { success: false, message }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('common.error')
      toast.error(message)
      return { success: false, message }
    }
  }

  const updateGenerationPrivacy = async (generationId: string, isPublic: boolean) => {
    try {
      const response = await generationsAPI.updatePrivacy(generationId, isPublic)
      
      if (response.data.success) {
        const updateGeneration = (gen: Generation) => {
          if (gen._id === generationId) {
            gen.isPublic = isPublic
          }
        }
        
        generations.value.forEach(updateGeneration)
        
        if (currentGeneration.value?._id === generationId) {
          currentGeneration.value.isPublic = isPublic
        }
        
        toast.success(t('generation.privacyUpdateSuccess'))
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
    }
  }

  const deleteGeneration = async (generationId: string) => {
    try {
      const response = await generationsAPI.deleteGeneration(generationId)
      
      if (response.data.success) {
        generations.value = generations.value.filter(gen => gen._id !== generationId)
        publicGenerations.value = publicGenerations.value.filter(gen => gen._id !== generationId)
        
        if (currentGeneration.value?._id === generationId) {
          currentGeneration.value = null
        }
        
        toast.success(t('generation.deleteSuccess'))
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
    }
  }

  const refreshPublicGenerations = async (sortBy: string = 'recent') => {
    publicPagination.value.page = 1
    await fetchPublicGenerations(1, sortBy)
  }

  const loadMorePublicGenerations = async (sortBy: string = 'recent') => {
    if (publicPagination.value.hasNext) {
      const nextPage = publicPagination.value.page + 1
      await fetchPublicGenerations(nextPage, sortBy)
    }
  }

  const fetchStatistics = async () => {
    statisticsLoading.value = true
    try {
      const response = await statisticsAPI.getPublicStats()
      
      if (response.data.success) {
        statistics.value = response.data.statistics
        return { success: true, statistics: response.data.statistics }
      } else {
        console.error('Failed to fetch statistics:', response.data.message)
        return { success: false, message: response.data.message }
      }
    } catch (error: any) {
      console.error('Error fetching statistics:', error)
      return { success: false, message: error.response?.data?.message || t('common.error') }
    } finally {
      statisticsLoading.value = false
    }
  }

  const clearCurrentGeneration = () => {
    currentGeneration.value = null
  }

  return {
    // State
    generations,
    publicGenerations,
    currentGeneration,
    statistics,
    generating,
    loading,
    statisticsLoading,
    generationProgress,
    publicPagination,
    
    // Computed
    sortedGenerations,
    
    // Actions
    generateSentence,
    cancelGeneration,
    fetchUserGenerations,
    fetchPublicGenerations,
    toggleLike,
    updateGenerationPrivacy,
    deleteGeneration,
    refreshPublicGenerations,
    loadMorePublicGenerations,
    fetchStatistics,
    clearCurrentGeneration
  }
}) 