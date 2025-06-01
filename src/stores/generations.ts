import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
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
}

interface PublicPagination {
  page: number
  limit: number
  hasNext: boolean
  total: number
}

export const useGenerationsStore = defineStore('generations', () => {
  const toast = useToast()
  const { t } = useI18n()
  
  const generations = ref<Generation[]>([])
  const publicGenerations = ref<Generation[]>([])
  const currentGeneration = ref<Generation | null>(null)
  const generating = ref(false)
  const loading = ref(false)
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
    try {
      const response = await axios.post(`${API_BASE_URL}/generations/generate`, input)
      
      if (response.data.success) {
        currentGeneration.value = response.data.generation
        generations.value.unshift(response.data.generation)
        toast.success(t('generation.generationSuccess'))
        return { success: true, generation: response.data.generation }
      } else {
        const message = response.data.message || t('generation.generationError')
        toast.error(message)
        return { success: false, message }
      }
    } catch (error: any) {
      const message = error.response?.data?.message || t('generation.generationError')
      toast.error(message)
      return { success: false, message }
    } finally {
      generating.value = false
    }
  }

  const fetchUserGenerations = async () => {
    loading.value = true
    try {
      const response = await axios.get(`${API_BASE_URL}/generations/user`)
      
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
      const response = await axios.get(`${API_BASE_URL}/generations/public`, {
        params: { page, sortBy, limit: publicPagination.value.limit }
      })
      
      if (response.data.success) {
        if (page === 1) {
          publicGenerations.value = response.data.generations
        } else {
          publicGenerations.value.push(...response.data.generations)
        }
        
        publicPagination.value = {
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          hasNext: response.data.pagination.hasNext,
          total: response.data.pagination.total
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
      const response = await axios.post(`${API_BASE_URL}/generations/${generationId}/like`)
      
      if (response.data.success) {
        const liked = response.data.liked
        
        // Update in both user and public generations
        const updateGeneration = (gen: Generation) => {
          if (gen._id === generationId) {
            gen.likeCount = response.data.likeCount
            gen.likes = response.data.likes
          }
        }
        
        generations.value.forEach(updateGeneration)
        publicGenerations.value.forEach(updateGeneration)
        
        if (currentGeneration.value?._id === generationId) {
          currentGeneration.value.likeCount = response.data.likeCount
          currentGeneration.value.likes = response.data.likes
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
      const response = await axios.put(`${API_BASE_URL}/generations/${generationId}`, { isPublic })
      
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
        
        const status = isPublic ? t('generation.public') : t('generation.private')
        toast.success(t('generation.privacyUpdated', { status }))
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
      const response = await axios.delete(`${API_BASE_URL}/generations/${generationId}`)
      
      if (response.data.success) {
        generations.value = generations.value.filter(g => g._id !== generationId)
        publicGenerations.value = publicGenerations.value.filter(g => g._id !== generationId)
        
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

  const clearCurrentGeneration = () => {
    currentGeneration.value = null
  }

  return {
    generations,
    publicGenerations,
    currentGeneration,
    generating,
    loading,
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
    clearCurrentGeneration
  }
}) 