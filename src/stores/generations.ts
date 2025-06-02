import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { generationsAPI, statisticsAPI } from '../services/api.ts'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface Generation {
  _id: string
  sentence: string
  explanation: string
  thinkingText?: string
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
    maxRetries: 3
  })
  const publicPagination = ref<PublicPagination>({
    page: 1,
    limit: 10,
    hasNext: false,
    total: 0
  })

  const sortedGenerations = computed(() => {
    return [...generations.value].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  const generateSentence = async (input: GenerationInput) => {
    generating.value = true
    generationProgress.value = {
      isRetrying: false,
      currentAttempt: 0,
      maxRetries: input.maxRetries || 3
    }
    
    try {
      const response = await generationsAPI.generate(input)
      
      if (response.data.success) {
        currentGeneration.value = response.data.generation
        generations.value.unshift(response.data.generation)
        
        // Handle retry info in success message
        if (response.data.retryInfo && response.data.retryInfo.attempt > 1) {
          toast.success(t('generation.retrySuccess', { attempt: response.data.retryInfo.attempt }))
        } else {
          toast.success(t('generation.generationSuccess'))
        }
        
        return { 
          success: true, 
          generation: response.data.generation,
          retryInfo: response.data.retryInfo
        }
      } else {
        const message = response.data.message || t('generation.generationError')
        
        // Handle retry info in error case
        if (response.data.retryInfo) {
          const retryMessage = t('generation.retryFailed', { attempts: response.data.retryInfo.maxRetries })
          toast.error(`${message} ${retryMessage}`)
        } else {
          toast.error(message)
        }
        
        return { 
          success: false, 
          message,
          retryInfo: response.data.retryInfo
        }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('generation.generationError')
      const retryInfo = error.response?.data?.retryInfo
      
      if (retryInfo) {
        const retryMessage = t('generation.retryFailed', { attempts: retryInfo.maxRetries })
        toast.error(`${message} ${retryMessage}`)
      } else {
        toast.error(message)
      }
      
      return { 
        success: false, 
        message,
        retryInfo
      }
    } finally {
      generating.value = false
      generationProgress.value = {
        isRetrying: false,
        currentAttempt: 0,
        maxRetries: 3
      }
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
    generations,
    publicGenerations,
    currentGeneration,
    statistics,
    generating,
    loading,
    statisticsLoading,
    generationProgress,
    publicPagination,
    sortedGenerations,
    generateSentence,
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