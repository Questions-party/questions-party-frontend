<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold text-primary">{{ $t('aiConfig.title') }}</h1>
      <p class="text-secondary max-w-2xl mx-auto">
        {{ $t('aiConfig.subtitle') }}
      </p>
    </div>

    <!-- Quick Setup Section -->
    <div class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
      <div class="flex items-start space-x-4">
        <div class="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <SparklesIcon class="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold mb-2">{{ $t('aiConfig.quickSetup') }}</h3>
          <p class="text-secondary mb-4">
            {{ $t('aiConfig.quickSetupDesc') }}
          </p>
          <div class="flex flex-wrap gap-3">
            <button
              @click="createDefault"
              :disabled="aiConfigStore.loading"
              class="btn btn-primary"
            >
              <PlusIcon class="w-4 h-4 mr-2" />
              {{ $t('aiConfig.createDefaultConfig') }}
            </button>
            <button
              @click="showCreateForm = true"
              class="btn btn-secondary"
            >
              <Cog6ToothIcon class="w-4 h-4 mr-2" />
              {{ $t('aiConfig.customConfiguration') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Configurations List -->
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">{{ $t('aiConfig.yourConfigurations') }}</h2>
        <div class="flex items-center space-x-2">
          <button
            @click="refreshConfigs"
            :disabled="aiConfigStore.loading"
            class="btn btn-ghost btn-sm"
          >
            <ArrowPathIcon class="w-4 h-4 mr-1" :class="{ 'animate-spin': aiConfigStore.loading }" />
            {{ $t('aiConfig.refresh') }}
          </button>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="aiConfigStore.loading && aiConfigStore.configs.length === 0" class="text-center py-12">
        <div class="spinner-lg mx-auto mb-4"></div>
        <p class="text-secondary">{{ $t('aiConfig.loadingConfigurations') }}</p>
      </div>

      <!-- Empty State -->
      <div v-else-if="aiConfigStore.configs.length === 0" class="text-center py-12">
        <Cog6ToothIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-primary mb-2">{{ $t('aiConfig.noConfigurations') }}</h3>
        <p class="text-secondary mb-4">{{ $t('aiConfig.noConfigurationsDesc') }}</p>
        <button
          @click="createDefault"
          class="btn btn-primary"
        >
          <PlusIcon class="w-4 h-4 mr-2" />
          {{ $t('aiConfig.createDefaultConfiguration') }}
        </button>
      </div>

      <!-- Configurations Grid -->
      <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="config in aiConfigStore.sortedConfigs"
          :key="config._id"
          class="card"
          :class="{ 'ring-2 ring-green-500': config.isAvailable }"
        >
          <div class="card-header">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold text-lg">{{ config.name }}</h3>
                <p class="text-sm text-secondary">{{ config.model }}</p>
              </div>
              <div class="flex items-center space-x-1">
                <!-- Status indicator -->
                <div
                  class="w-3 h-3 rounded-full"
                  :class="{
                    'bg-green-500': config.isAvailable,
                    'bg-red-500': !config.isAvailable
                  }"
                  :title="config.isAvailable ? $t('aiConfig.available') : $t('aiConfig.unavailable')"
                ></div>
                
                <!-- Menu -->
                <Menu as="div" class="relative">
                  <MenuButton class="p-1 rounded-md hover:bg-tertiary transition-colors">
                    <EllipsisVerticalIcon class="w-4 h-4" />
                  </MenuButton>
                  
                  <transition
                    enter-active-class="transition duration-100 ease-out"
                    enter-from-class="transform scale-95 opacity-0"
                    enter-to-class="transform scale-100 opacity-1"
                    leave-active-class="transition duration-75 ease-in"
                    leave-from-class="transform scale-100 opacity-1"
                    leave-to-class="transform scale-95 opacity-0"
                  >
                    <MenuItems class="absolute right-0 mt-2 w-48 bg-primary border border-color rounded-md shadow-lg z-10">
                      <div class="py-1">
                        <MenuItem>
                          <button
                            @click="testConfig(config._id)"
                            :disabled="aiConfigStore.testing"
                            class="block w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                          >
                            {{ $t('aiConfig.testConfiguration') }}
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            @click="editConfig(config)"
                            class="block w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                          >
                            {{ $t('aiConfig.edit') }}
                          </button>
                        </MenuItem>
                        <MenuItem>
                          <button
                            @click="deleteConfig(config._id, config.name)"
                            class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-secondary transition-colors"
                          >
                            {{ $t('aiConfig.delete') }}
                          </button>
                        </MenuItem>
                      </div>
                    </MenuItems>
                  </transition>
                </Menu>
              </div>
            </div>
          </div>

          <div class="card-body">
            <div class="space-y-3">
              <div class="text-sm">
                <span class="font-medium">{{ $t('aiConfig.provider') }}:</span>
                <span class="ml-2 text-secondary">{{ getProviderName(config.apiUrl) }}</span>
              </div>
              
              <div class="text-sm">
                <span class="font-medium">{{ $t('aiConfig.lastUsed') }}:</span>
                <span class="ml-2 text-secondary">{{ formatDate(config.lastUsedTime) }}</span>
              </div>

              <div class="flex items-center justify-between pt-2">
                <button
                  @click="testConfig(config._id)"
                  :disabled="aiConfigStore.testing"
                  class="btn btn-sm"
                  :class="{
                    'btn-success': config.isAvailable,
                    'btn-ghost': !config.isAvailable
                  }"
                >
                  <div v-if="aiConfigStore.testing" class="spinner-sm mr-1"></div>
                  <CheckCircleIcon v-else-if="config.isAvailable" class="w-4 h-4 mr-1" />
                  <XCircleIcon v-else class="w-4 h-4 mr-1" />
                  {{ config.isAvailable ? $t('aiConfig.working') : $t('aiConfig.test') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create/Edit Form Modal -->
    <div
      v-if="showCreateForm || editingConfig"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="closeForm"
    >
      <div class="bg-primary rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-semibold">
              {{ editingConfig ? $t('aiConfig.editConfiguration') : $t('aiConfig.createConfiguration') }}
            </h2>
            <button
              @click="closeForm"
              class="p-1 rounded-md hover:bg-secondary transition-colors"
            >
              <XMarkIcon class="w-5 h-5" />
            </button>
          </div>

          <form @submit.prevent="saveConfig" class="space-y-6">
            <!-- Provider Templates -->
            <div v-if="!editingConfig">
              <label class="block text-sm font-medium mb-2">{{ $t('aiConfig.providerTemplates') }}</label>
              <p class="text-sm text-secondary mb-3">{{ $t('aiConfig.selectTemplate') }}</p>
              <div class="grid sm:grid-cols-2 gap-3">
                <button
                  v-for="(template, key) in aiConfigStore.getTemplateConfigs()"
                  :key="key"
                  type="button"
                  @click="loadTemplate(template)"
                  class="text-left p-3 border border-color rounded-lg hover:bg-secondary transition-colors"
                >
                  <div class="font-medium">{{ template.name }}</div>
                  <div class="text-sm text-secondary">{{ template.model }}</div>
                  <div class="text-xs text-accent-color mt-1">{{ $t('aiConfig.useTemplate') }}</div>
                </button>
              </div>
            </div>

            <!-- Basic Configuration -->
            <div class="space-y-4">
              <div>
                <label for="name" class="block text-sm font-medium mb-1">{{ $t('aiConfig.configurationName') }}</label>
                <input
                  id="name"
                  v-model="configForm.name"
                  type="text"
                  required
                  class="input w-full"
                  :placeholder="$t('aiConfig.configurationNamePlaceholder')"
                />
              </div>

              <div>
                <label for="apiUrl" class="block text-sm font-medium mb-1">{{ $t('aiConfig.apiUrl') }}</label>
                <input
                  id="apiUrl"
                  v-model="configForm.apiUrl"
                  type="url"
                  required
                  class="input w-full"
                  :placeholder="$t('aiConfig.apiUrlPlaceholder')"
                />
              </div>

              <div>
                <label for="apiKey" class="block text-sm font-medium mb-1">{{ $t('aiConfig.apiKey') }}</label>
                <input
                  id="apiKey"
                  v-model="configForm.apiKey"
                  type="password"
                  required
                  class="input w-full"
                  :placeholder="$t('aiConfig.apiKeyPlaceholder')"
                />
              </div>

              <div>
                <label for="model" class="block text-sm font-medium mb-1">{{ $t('aiConfig.model') }}</label>
                <input
                  id="model"
                  v-model="configForm.model"
                  type="text"
                  required
                  class="input w-full"
                  :placeholder="$t('aiConfig.modelPlaceholder')"
                />
              </div>
            </div>

            <!-- Advanced Options -->
            <div>
              <button
                type="button"
                @click="showAdvanced = !showAdvanced"
                class="flex items-center text-sm font-medium text-accent-color hover:underline"
              >
                <ChevronRightIcon 
                  class="w-4 h-4 mr-1 transition-transform"
                  :class="{ 'rotate-90': showAdvanced }"
                />
                Advanced Options
              </button>

              <div v-if="showAdvanced" class="mt-4 space-y-4">
                <div>
                  <label for="apiKeyPlacement" class="block text-sm font-medium mb-1">API Key Placement</label>
                  <select
                    id="apiKeyPlacement"
                    v-model="configForm.apiKeyPlacement"
                    class="input w-full"
                  >
                    <option value="header">Authorization Header</option>
                    <option value="body">Request Body</option>
                    <option value="custom_header">Custom Header</option>
                  </select>
                </div>

                <div v-if="configForm.apiKeyPlacement === 'custom_header'">
                  <label for="apiKeyHeader" class="block text-sm font-medium mb-1">Custom Header Name</label>
                  <input
                    id="apiKeyHeader"
                    v-model="configForm.apiKeyHeader"
                    type="text"
                    class="input w-full"
                    placeholder="X-API-Key"
                  />
                </div>

                <div v-if="configForm.apiKeyPlacement === 'body'">
                  <label for="apiKeyBodyPath" class="block text-sm font-medium mb-1">API Key Body Path</label>
                  <input
                    id="apiKeyBodyPath"
                    v-model="configForm.apiKeyBodyPath"
                    type="text"
                    class="input w-full"
                    placeholder="api_key"
                  />
                </div>

                <!-- Response Paths -->
                <div class="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label for="responseTextPath" class="block text-sm font-medium mb-1">Response Text Path</label>
                    <input
                      id="responseTextPath"
                      v-model="configForm.responseTextPath"
                      type="text"
                      class="input w-full"
                      placeholder="choices[0].message.content"
                    />
                  </div>
                  <div>
                    <label for="responseThinkingTextPath" class="block text-sm font-medium mb-1">Thinking Text Path (Optional)</label>
                    <input
                      id="responseThinkingTextPath"
                      v-model="configForm.responseThinkingTextPath"
                      type="text"
                      class="input w-full"
                      placeholder="choices[0].message.reasoning_content"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Form Actions -->
            <div class="flex justify-end space-x-3 pt-4 border-t border-color">
              <button
                type="button"
                @click="closeForm"
                class="btn btn-ghost"
              >
                {{ $t('aiConfig.cancel') }}
              </button>
              <button
                type="submit"
                :disabled="aiConfigStore.loading"
                class="btn btn-primary"
              >
                <div v-if="aiConfigStore.loading" class="spinner-sm mr-2"></div>
                {{ editingConfig ? $t('aiConfig.updateSuccess') : $t('aiConfig.save') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import {
  SparklesIcon,
  PlusIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  EllipsisVerticalIcon,
  CheckCircleIcon,
  XCircleIcon,
  XMarkIcon,
  ChevronRightIcon
} from '@heroicons/vue/24/outline'
import { useAIConfigStore } from '../stores/aiConfig'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'

const aiConfigStore = useAIConfigStore()
const toast = useToast()
const { t } = useI18n()

const showCreateForm = ref(false)
const showAdvanced = ref(false)
const editingConfig = ref<any>(null)

const configForm = reactive({
  name: '',
  apiUrl: '',
  apiKey: '',
  model: 'Qwen/QwQ-32B',
  apiKeyPlacement: 'header',
  apiKeyHeader: '',
  apiKeyBodyPath: '',
  requestTemplate: {},
  responseTextPath: 'choices[0].message.content',
  responseThinkingTextPath: 'choices[0].message.reasoning_content',
  requestMessageGroupPath: 'messages',
  requestRolePathFromGroup: 'role',
  requestTextPathFromGroup: 'content',
  requestUserRoleField: 'user',
  requestAssistantField: 'assistant',
  requestSystemField: 'system',
  headers: { 'Content-Type': 'application/json' }
})

onMounted(async () => {
  await refreshConfigs()
})

const refreshConfigs = async () => {
  await aiConfigStore.fetchConfigs()
}

const createDefault = async () => {
  const result = await aiConfigStore.createDefaultConfig()
  if (result.success) {
    await refreshConfigs()
  }
}

const loadTemplate = (template: any) => {
  Object.assign(configForm, template)
  configForm.requestTemplate = template.requestTemplate
}

const editConfig = async (config: any) => {
  const result = await aiConfigStore.getConfig(config._id)
  if (result.success) {
    editingConfig.value = result.config
    Object.assign(configForm, result.config)
    showCreateForm.value = true
  }
}

const closeForm = () => {
  showCreateForm.value = false
  showAdvanced.value = false
  editingConfig.value = null
  
  // Reset form
  Object.assign(configForm, {
    name: '',
    apiUrl: '',
    apiKey: '',
    model: 'Qwen/QwQ-32B',
    apiKeyPlacement: 'header',
    apiKeyHeader: '',
    apiKeyBodyPath: '',
    requestTemplate: {},
    responseTextPath: 'choices[0].message.content',
    responseThinkingTextPath: 'choices[0].message.reasoning_content',
    requestMessageGroupPath: 'messages',
    requestRolePathFromGroup: 'role',
    requestTextPathFromGroup: 'content',
    requestUserRoleField: 'user',
    requestAssistantField: 'assistant',
    requestSystemField: 'system',
    headers: { 'Content-Type': 'application/json' }
  })
}

const saveConfig = async () => {
  const data = { ...configForm }
  
  let result
  if (editingConfig.value) {
    result = await aiConfigStore.updateConfig(editingConfig.value._id, data)
  } else {
    result = await aiConfigStore.createConfig(data)
  }
  
  if (result.success) {
    closeForm()
    await refreshConfigs()
  }
}

const testConfig = async (configId: string) => {
  await aiConfigStore.testConfig(configId)
}

const deleteConfig = async (configId: string, configName: string) => {
  if (confirm(t('aiConfig.deleteConfirmation', { name: configName }))) {
    const result = await aiConfigStore.deleteConfig(configId)
    if (result.success) {
      await refreshConfigs()
    }
  }
}

const getProviderName = (apiUrl: string): string => {
  if (apiUrl.includes('siliconflow')) return 'SiliconFlow'
  if (apiUrl.includes('openai')) return 'OpenAI'
  if (apiUrl.includes('anthropic')) return 'Anthropic'
  return 'Custom'
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return t('date.justNow')
  if (diffInSeconds < 3600) return t('date.minutesAgo', { count: Math.floor(diffInSeconds / 60) })
  if (diffInSeconds < 86400) return t('date.hoursAgo', { count: Math.floor(diffInSeconds / 3600) })
  return t('date.daysAgo', { count: Math.floor(diffInSeconds / 86400) })
}
</script> 