import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

interface AIConfig {
  _id: string
  name: string
  apiUrl: string
  apiKey: string
  model: string
  isAvailable: boolean
  lastUsedTime: string
  headers?: Record<string, string>
  requestTemplate?: Record<string, any>
  responseTextPath?: string
  responseThinkingTextPath?: string
  apiKeyPlacement?: string
  apiKeyHeader?: string
  apiKeyBodyPath?: string
  requestMessageGroupPath?: string
  requestRolePathFromGroup?: string
  requestTextPathFromGroup?: string
  requestUserRoleField?: string
  requestAssistantField?: string
  requestSystemField?: string
  createdAt: string
  updatedAt: string
}

interface AIConfigInput {
  name: string
  apiUrl: string
  apiKey: string
  model: string
  headers?: Record<string, string>
  requestTemplate?: Record<string, any>
  responseTextPath?: string
  responseThinkingTextPath?: string
  apiKeyPlacement?: string
  apiKeyHeader?: string
  apiKeyBodyPath?: string
  requestMessageGroupPath?: string
  requestRolePathFromGroup?: string
  requestTextPathFromGroup?: string
  requestUserRoleField?: string
  requestAssistantField?: string
  requestSystemField?: string
}

export const useAIConfigStore = defineStore('aiConfig', () => {
  const toast = useToast()
  const { t } = useI18n()
  
  const configs = ref<AIConfig[]>([])
  const currentConfig = ref<AIConfig | null>(null)
  const loading = ref(false)
  const testing = ref(false)

  const availableConfigs = computed(() => {
    return configs.value.filter(config => config.isAvailable)
  })

  const sortedConfigs = computed(() => {
    return [...configs.value].sort((a, b) => {
      // Available configs first, then by last used time
      if (a.isAvailable !== b.isAvailable) {
        return a.isAvailable ? -1 : 1
      }
      return new Date(b.lastUsedTime).getTime() - new Date(a.lastUsedTime).getTime()
    })
  })

  const fetchConfigs = async () => {
    loading.value = true
    try {
      const response = await axios.get(`${API_BASE_URL}/ai-config`)
      
      if (response.data.success) {
        configs.value = response.data.configs
        return { success: true, configs: response.data.configs }
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

  const getConfig = async (configId: string) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/ai-config/${configId}`)
      
      if (response.data.success) {
        return { success: true, config: response.data.config }
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

  const createConfig = async (configData: AIConfigInput) => {
    loading.value = true
    try {
      const response = await axios.post(`${API_BASE_URL}/ai-config`, configData)
      
      if (response.data.success) {
        configs.value.unshift(response.data.config)
        toast.success(t('aiConfig.createSuccess'))
        return { success: true, config: response.data.config }
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

  const updateConfig = async (configId: string, configData: Partial<AIConfigInput>) => {
    loading.value = true
    try {
      const response = await axios.put(`${API_BASE_URL}/ai-config/${configId}`, configData)
      
      if (response.data.success) {
        const index = configs.value.findIndex(c => c._id === configId)
        if (index !== -1) {
          configs.value[index] = { ...configs.value[index], ...response.data.config }
        }
        toast.success(t('aiConfig.updateSuccess'))
        return { success: true, config: response.data.config }
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

  const deleteConfig = async (configId: string) => {
    loading.value = true
    try {
      const response = await axios.delete(`${API_BASE_URL}/ai-config/${configId}`)
      
      if (response.data.success) {
        configs.value = configs.value.filter(c => c._id !== configId)
        toast.success(t('aiConfig.deleteSuccess'))
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

  const testConfig = async (configId: string) => {
    testing.value = true
    try {
      const response = await axios.post(`${API_BASE_URL}/ai-config/${configId}/test`)
      
      if (response.data.success) {
        // Update the config's isAvailable status
        const config = configs.value.find(c => c._id === configId)
        if (config) {
          config.isAvailable = response.data.isAvailable
          config.lastUsedTime = new Date().toISOString()
        }
        
        const testResult = response.data.testResult
        if (testResult.success) {
          toast.success(t('aiConfig.testSuccess'))
        } else {
          toast.error(t('aiConfig.testFailed', { message: testResult.message }))
        }
        
        return { success: true, testResult }
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
      testing.value = false
    }
  }

  const createDefaultConfig = async () => {
    loading.value = true
    try {
      const response = await axios.post(`${API_BASE_URL}/ai-config/default`)
      
      if (response.data.success) {
        configs.value.unshift(response.data.config)
        toast.success(response.data.message || t('aiConfig.defaultConfigSuccess'))
        return { success: true, config: response.data.config }
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

  const getTemplateConfigs = () => {
    return {
      siliconflow: {
        name: 'SiliconFlow (Qwen/QwQ-32B)',
        apiUrl: 'https://api.siliconflow.cn/v1/chat/completions',
        model: 'Qwen/QwQ-32B-Preview',
        apiKeyPlacement: 'header',
        headers: { 'Content-Type': 'application/json' },
        requestTemplate: {
          model: 'Qwen/QwQ-32B-Preview',
          messages: [],
          stream: false
        },
        responseTextPath: 'choices[0].message.content',
        responseThinkingTextPath: 'choices[0].message.reasoning_content',
        requestMessageGroupPath: 'messages',
        requestRolePathFromGroup: 'role',
        requestTextPathFromGroup: 'content',
        requestUserRoleField: 'user',
        requestAssistantField: 'assistant',
        requestSystemField: 'system'
      },
      openai: {
        name: 'OpenAI (GPT-4)',
        apiUrl: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4',
        apiKeyPlacement: 'header',
        headers: { 'Content-Type': 'application/json' },
        requestTemplate: {
          model: 'gpt-4',
          messages: [],
          stream: false
        },
        responseTextPath: 'choices[0].message.content',
        requestMessageGroupPath: 'messages',
        requestRolePathFromGroup: 'role',
        requestTextPathFromGroup: 'content',
        requestUserRoleField: 'user',
        requestAssistantField: 'assistant',
        requestSystemField: 'system'
      },
      anthropic: {
        name: 'Anthropic (Claude)',
        apiUrl: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-sonnet-20240229',
        apiKeyPlacement: 'custom_header',
        apiKeyHeader: 'x-api-key',
        headers: { 
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        },
        requestTemplate: {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: []
        },
        responseTextPath: 'content[0].text',
        requestMessageGroupPath: 'messages',
        requestRolePathFromGroup: 'role',
        requestTextPathFromGroup: 'content',
        requestUserRoleField: 'user',
        requestAssistantField: 'assistant',
        requestSystemField: 'system'
      }
    }
  }

  return {
    // State
    configs: computed(() => configs.value),
    currentConfig: computed(() => currentConfig.value),
    loading: computed(() => loading.value),
    testing: computed(() => testing.value),
    availableConfigs,
    sortedConfigs,
    
    // Actions
    fetchConfigs,
    getConfig,
    createConfig,
    updateConfig,
    deleteConfig,
    testConfig,
    createDefaultConfig,
    getTemplateConfigs
  }
}) 