import { ref, computed } from 'vue'
import { statisticsAPI } from '../services/api.ts'

export interface GlobalStatistics {
  totalUsers: number
  totalGenerations: number
  totalWords: number
  totalUniqueWords: number
}

const statistics = ref<GlobalStatistics | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function useStatistics() {
  const fetchStatistics = async () => {
    if (loading.value) return
    
    loading.value = true
    error.value = null
    
    try {
      const response = await statisticsAPI.getGlobalStats()
      
      if (response.data.success) {
        statistics.value = response.data.statistics
      } else {
        throw new Error('Failed to fetch statistics')
      }
    } catch (err) {
      console.error('Error fetching statistics:', err)
      error.value = 'Failed to load statistics'
      
      // Provide fallback data
      statistics.value = {
        totalUsers: 0,
        totalGenerations: 0,
        totalWords: 0,
        totalUniqueWords: 0
      }
    } finally {
      loading.value = false
    }
  }

  // Computed properties for formatted display
  const formattedStats = computed(() => {
    if (!statistics.value) return null
    
    return {
      activeLearners: formatNumber(statistics.value.totalUsers),
      aiGeneratedSentences: formatNumber(statistics.value.totalGenerations),
      wordsPracticed: formatNumber(statistics.value.totalWords)
    }
  })

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M+'
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K+'
    }
    return num.toString()
  }

  return {
    statistics: computed(() => statistics.value),
    formattedStats,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchStatistics
  }
} 