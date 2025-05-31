import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const API_BASE_URL = 'http://localhost:5000/api'

interface Generation {
  _id: string
  userId: {
    _id: string
    username: string
  }
  words: string[]
  sentence: string
  explanation: string
  isPublic: boolean
  likes: Array<{
    userId: string
    createdAt: string
  }>
  likeCount: number
  aiModel: string
  promptVersion: string
  createdAt: string
  updatedAt: string
}

interface GenerateRequest {
  words: string[]
  isPublic?: boolean
}

interface PaginationInfo {
  current: number
  total: number
  hasNext: boolean
}

export const useGenerationsStore = defineStore('generations', () => {
  const generations = ref<Generation[]>([])
  const publicGenerations = ref<Generation[]>([])
  const currentGeneration = ref<Generation | null>(null)
  const loading = ref(false)
  const generating = ref(false)
  const publicPagination = ref<PaginationInfo>({
    current: 1,
    total: 1,
    hasNext: false
  })
  const toast = useToast()

  const sortedGenerations = computed(() => {
    return [...generations.value].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  })

  const generateSentence = async (request: GenerateRequest) => {
    generating.value = true
    try {
      const response = await axios.post(`${API_BASE_URL}/generate`, request)
      currentGeneration.value = response.data.generation
      
      // Add to user's generations if authenticated
      if (response.data.generation.userId) {
        generations.value.unshift(response.data.generation)
      }
      
      toast.success('Sentence generated successfully!')
      return { success: true, generation: response.data.generation }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to generate sentence'
      toast.error(message)
      return { success: false, message }
    } finally {
      generating.value = false
    }
  }

  const fetchUserGenerations = async () => {
    loading.value = true
    try {
      const response = await axios.get(`${API_BASE_URL}/generations`)
      generations.value = response.data.generations
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch generations'
      toast.error(message)
    } finally {
      loading.value = false
    }
  }

  const fetchPublicGenerations = async (page = 1, sortBy = 'recent') => {
    loading.value = true
    try {
      const response = await axios.get(`${API_BASE_URL}/generations/public`, {
        params: { page, sortBy, limit: 10 }
      })
      
      if (page === 1) {
        publicGenerations.value = response.data.generations
      } else {
        publicGenerations.value.push(...response.data.generations)
      }
      
      publicPagination.value = response.data.pagination
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch public generations'
      toast.error(message)
    } finally {
      loading.value = false
    }
  }

  const toggleLike = async (generationId: string) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/generations/${generationId}/like`)
      const { liked, likeCount } = response.data
      
      // Update the generation in both arrays
      const updateGeneration = (gen: Generation) => {
        if (gen._id === generationId) {
          gen.likeCount = likeCount
          // Update likes array (simplified - you might want to track full like data)
          return { ...gen, likeCount }
        }
        return gen
      }
      
      generations.value = generations.value.map(updateGeneration)
      publicGenerations.value = publicGenerations.value.map(updateGeneration)
      
      if (currentGeneration.value?._id === generationId) {
        currentGeneration.value.likeCount = likeCount
      }
      
      toast.success(liked ? 'Generation liked!' : 'Like removed')
      return { success: true, liked, likeCount }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to toggle like'
      toast.error(message)
      return { success: false, message }
    }
  }

  const updateGenerationPrivacy = async (generationId: string, isPublic: boolean) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/generations/${generationId}/privacy`, {
        isPublic
      })
      
      // Update the generation in the array
      const index = generations.value.findIndex(g => g._id === generationId)
      if (index !== -1) {
        generations.value[index].isPublic = isPublic
      }
      
      if (currentGeneration.value?._id === generationId) {
        currentGeneration.value.isPublic = isPublic
      }
      
      toast.success(`Generation is now ${isPublic ? 'public' : 'private'}`)
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to update privacy'
      toast.error(message)
      return { success: false, message }
    }
  }

  const deleteGeneration = async (generationId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/generations/${generationId}`)
      
      generations.value = generations.value.filter(g => g._id !== generationId)
      publicGenerations.value = publicGenerations.value.filter(g => g._id !== generationId)
      
      if (currentGeneration.value?._id === generationId) {
        currentGeneration.value = null
      }
      
      toast.success('Generation deleted successfully')
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to delete generation'
      toast.error(message)
      return { success: false, message }
    }
  }

  const getGeneration = async (generationId: string) => {
    loading.value = true
    try {
      const response = await axios.get(`${API_BASE_URL}/generations/${generationId}`)
      return { success: true, generation: response.data.generation }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch generation'
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const clearCurrentGeneration = () => {
    currentGeneration.value = null
  }

  const loadMorePublicGenerations = async (sortBy = 'recent') => {
    if (publicPagination.value.hasNext) {
      await fetchPublicGenerations(publicPagination.value.current + 1, sortBy)
    }
  }

  const refreshPublicGenerations = async (sortBy = 'recent') => {
    publicGenerations.value = []
    publicPagination.value = { current: 1, total: 1, hasNext: false }
    await fetchPublicGenerations(1, sortBy)
  }

  return {
    generations: computed(() => generations.value),
    sortedGenerations,
    publicGenerations: computed(() => publicGenerations.value),
    currentGeneration: computed(() => currentGeneration.value),
    loading: computed(() => loading.value),
    generating: computed(() => generating.value),
    publicPagination: computed(() => publicPagination.value),
    generateSentence,
    fetchUserGenerations,
    fetchPublicGenerations,
    toggleLike,
    updateGenerationPrivacy,
    deleteGeneration,
    getGeneration,
    clearCurrentGeneration,
    loadMorePublicGenerations,
    refreshPublicGenerations
  }
}) 