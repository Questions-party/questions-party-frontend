import { ref, computed } from 'vue'
import { statisticsAPI } from '../services/api.ts'

export interface GlobalStatistics {
  totalUsers: number
  totalGenerations: number
  totalWords: number
  totalUniqueWords: number
}

const statisticalData = ref<GlobalStatistics | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

export function statistics() {
  const fetchStatistics = async () => {
    if (loading.value) return
    
    loading.value = true
    error.value = null
    
    try {
      const response = await statisticsAPI.getGlobalStats()
      
      if (response.data.success) {
        statisticalData.value = response.data.statistics
      } else {
        throw new Error('Failed to fetch statisticalData')
      }
    } catch (err) {
      console.error('Error fetching statisticalData:', err)
      error.value = 'Failed to load statisticalData'
      
      // Provide fallback data
      statisticalData.value = {
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
    if (!statisticalData.value) return null
    
    return {
      activeLearners: formatNumber(statisticalData.value.totalUsers),
      aiGeneratedSentences: formatNumber(statisticalData.value.totalGenerations),
      wordsPracticed: formatNumber(statisticalData.value.totalWords)
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
    statistics: computed(() => statisticalData.value),
    formattedStats,
    loading: computed(() => loading.value),
    error: computed(() => error.value),
    fetchStatistics
  }
} 