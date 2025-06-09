<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold text-primary">{{ $t('apiKey.title') }}</h1>
      <p class="text-secondary max-w-2xl mx-auto">
        {{ $t('apiKey.subtitle') }}
      </p>
    </div>

    <!-- Platform Configuration Info -->
    <div
        class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
      <div class="flex items-start space-x-4">
        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <SparklesIcon class="w-6 h-6 text-blue-600 dark:text-blue-400"/>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-semibold mb-2">{{ $t('apiKey.platformConfiguration') }}</h3>
          <p class="text-secondary mb-4">
            {{ $t('apiKey.platformDescription') }}
          </p>

          <div v-if="apiKeyStore.platformInfo" class="grid sm:grid-cols-2 gap-4 mb-4">
            <div class="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div class="text-sm font-medium text-primary">{{ $t('apiKey.provider') }}</div>
              <div class="text-lg font-semibold">{{ apiKeyStore.platformInfo.provider }}</div>
            </div>
            <div class="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
              <div class="text-sm font-medium text-primary">{{ $t('apiKey.model') }}</div>
              <div class="text-lg font-semibold">{{ apiKeyStore.platformInfo.model }}</div>
            </div>
          </div>

          <div v-if="apiKeyStore.platformInfo" class="mb-4">
            <h4 class="font-medium text-sm mb-2 text-primary">{{ $t('apiKey.features') }}</h4>
            <div class="grid sm:grid-cols-2 gap-2">
              <div
                  v-for="feature in apiKeyStore.platformInfo.features"
                  :key="feature"
                  class="flex items-center space-x-2 text-sm"
              >
                <CheckCircleIcon class="w-4 h-4 text-green-600"/>
                <span>{{ feature }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- API Key Configuration -->
    <div class="space-y-4">
      <h2 class="text-xl font-semibold">{{ $t('apiKey.configuration') }}</h2>

      <!-- Loading State -->
      <div v-if="apiKeyStore.loading && !apiKeyStore.platformInfo" class="text-center py-8">
        <div class="spinner-lg mx-auto mb-4"></div>
        <p class="text-secondary">{{ $t('apiKey.loadingConfiguration') }}</p>
      </div>

      <!-- Configuration Options -->
      <div v-else class="space-y-6">
        <!-- Platform API Key Option -->
        <div class="card">
          <div class="card-body">
            <div class="flex items-start space-x-4">
              <div class="w-6 h-6 mt-1">
                <input
                    id="platform-key"
                    :checked="!apiKeyStore.useCustomApiKey"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 outline-none"
                    type="radio"
                    @change="selectPlatformKey"
                />
              </div>
              <div class="flex-1">
                <label class="block text-lg font-medium text-primary cursor-pointer" for="platform-key">
                  {{ $t('apiKey.usePlatformKey') }}
                </label>
                <p class="text-secondary mt-1">
                  {{ $t('apiKey.platformKeyDescription') }}
                </p>
                <div class="mt-3">
                  <div
                      class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                    <CheckCircleIcon class="w-4 h-4 mr-1"/>
                    {{ $t('apiKey.recommended') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Custom API Key Option -->
        <div class="card">
          <div class="card-body">
            <div class="flex items-start space-x-4">
              <div class="w-6 h-6 mt-1">
                <input
                    id="custom-key"
                    :checked="apiKeyStore.useCustomApiKey"
                    class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 dark:bg-gray-700 dark:border-gray-600 outline-none"
                    type="radio"
                    @change="selectCustomKey"
                />
              </div>
              <div class="flex-1">
                <label class="block text-lg font-medium text-primary cursor-pointer" for="custom-key">
                  {{ $t('apiKey.useCustomKey') }}
                </label>
                <p class="text-secondary mt-1 mb-4">
                  {{ $t('apiKey.customKeyDescription') }}
                </p>

                <div v-if="showCustomKeyForm" class="space-y-4">
                  <div>
                    <label class="block text-sm font-medium mb-2" for="api-key-input">
                      {{ $t('apiKey.enterYourKey') }}
                    </label>
                    <div class="relative">
                      <input
                          id="api-key-input"
                          v-model="customApiKey"
                          :placeholder="$t('apiKey.keyPlaceholder')"
                          :type="showApiKey ? 'text' : 'password'"
                          class="input w-full pr-20"
                          @input="onApiKeyInput"
                      />
                      <button
                          class="absolute inset-y-0 right-10 flex items-center px-2 text-secondary hover:text-primary"
                          type="button"
                          @click="showApiKey = !showApiKey"
                      >
                        <EyeIcon v-if="!showApiKey" class="w-5 h-5"/>
                        <EyeSlashIcon v-else class="w-5 h-5"/>
                      </button>
                    </div>

                    <!-- Show current API key hint if one exists -->
                    <div v-if="apiKeyStore.hasCustomApiKey && !customApiKey" class="mt-2">
                      <p class="text-sm text-blue-600 dark:text-blue-400">
                        <InformationCircleIcon class="w-4 h-4 inline mr-1"/>
                        {{ $t('apiKey.existingKeyHint') }}
                      </p>
                    </div>
                  </div>

                  <div class="flex flex-col sm:flex-row gap-3">
                    <button
                        :disabled="!customApiKey.trim() || apiKeyStore.testing"
                        class="btn btn-secondary"
                        @click="testKey"
                    >
                      <div v-if="apiKeyStore.testing" class="spinner-sm mr-2"></div>
                      <CheckCircleIcon v-else class="w-4 h-4 mr-2"/>
                      {{ $t('apiKey.testKey') }}
                    </button>

                    <button
                        :disabled="apiKeyStore.loading"
                        class="btn btn-primary"
                        @click="saveCustomKey"
                    >
                      <div v-if="apiKeyStore.loading" class="spinner-sm mr-2"></div>
                      {{ $t('apiKey.saveKey') }}
                    </button>
                  </div>

                  <div class="text-sm text-secondary">
                    <ExclamationTriangleIcon class="w-4 h-4 inline mr-1"/>
                    {{ $t('apiKey.securityNote') }}
                  </div>
                  
                  <!-- Test Result Display -->
                  <div v-if="apiKeyStore.testResult" class="mt-4">
                    <div
                        :class="{
                          'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800': apiKeyStore.testResult.success,
                          'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800': !apiKeyStore.testResult.success
                        }"
                        class="border rounded-lg p-4"
                    >
                      <div class="flex items-start space-x-3">
                        <div class="flex-shrink-0">
                          <CheckCircleIcon
                              v-if="apiKeyStore.testResult.success"
                              class="w-5 h-5 text-green-600 dark:text-green-400"
                          />
                          <ExclamationTriangleIcon
                              v-else
                              class="w-5 h-5 text-red-600 dark:text-red-400"
                          />
                        </div>
                        <div class="flex-1 min-w-0">
                          <h4
                              :class="{
                                'text-green-800 dark:text-green-200': apiKeyStore.testResult.success,
                                'text-red-800 dark:text-red-200': !apiKeyStore.testResult.success
                              }"
                              class="text-sm font-medium"
                          >
                            {{ apiKeyStore.testResult.success ? $t('apiKey.testSuccess') : $t('apiKey.testFailed').replace('{message}', '') }}
                          </h4>
                          <p
                              :class="{
                                'text-green-700 dark:text-green-300': apiKeyStore.testResult.success,
                                'text-red-700 dark:text-red-300': !apiKeyStore.testResult.success
                              }"
                              class="text-sm mt-1"
                          >
                            {{ $t(apiKeyStore.testResult.message) }}
                          </p>
                          
                          <!-- API Response Content -->
                          <div v-if="apiKeyStore.testResult.success && apiKeyStore.testResult.response" class="mt-3">
                            <div class="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 p-3">
                              <h5 class="text-sm font-medium text-primary mb-2">{{ $t('apiKey.apiResponse') }}:</h5>
                              <div class="text-sm text-secondary whitespace-pre-wrap">{{ apiKeyStore.testResult.response.content.trim() }}</div>
                              
                              <!-- Show thinking process if available -->
                              <div v-if="apiKeyStore.testResult.response.thinking && apiKeyStore.testResult.response.thinking.trim()" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600">
                                <h6 class="text-xs font-medium text-primary mb-1">{{ $t('apiKey.aiThinkingProcess') }}:</h6>
                                <div class="text-xs text-secondary whitespace-pre-wrap">{{ apiKeyStore.testResult.response.thinking.trim() }}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                            class="flex-shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            @click="apiKeyStore.clearTestResult()"
                        >
                          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Current Status -->
        <div class="card bg-gray-50 dark:bg-gray-800/50">
          <div class="card-body">
            <h3 class="font-semibold mb-3">{{ $t('apiKey.currentStatus') }}</h3>
            <div class="flex items-center space-x-3">
              <div
                  :class="{
                  'bg-green-500': !apiKeyStore.useCustomApiKey || apiKeyStore.hasCustomApiKey,
                  'bg-yellow-500': apiKeyStore.useCustomApiKey && !apiKeyStore.hasCustomApiKey
                }"
                  class="w-3 h-3 rounded-full"
              ></div>
              <span class="text-sm">
                <template v-if="!apiKeyStore.useCustomApiKey">
                  {{ $t('apiKey.usingPlatformKey') }}
                </template>
                <template v-else-if="apiKeyStore.hasCustomApiKey">
                  {{ $t('apiKey.usingCustomKey') }}
                </template>
                <template v-else>
                  {{ $t('apiKey.customKeyNotSet') }}
                </template>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <ConfirmDialog
        :cancel-text="$t('common.cancel')"
        :confirm-text="$t('apiKey.switchToPlatform')"
        :loading="apiKeyStore.loading"
        :message="$t('apiKey.switchToPlatformMessage')"
        :show="showConfirmDialog"
        :title="$t('apiKey.switchToPlatformConfirm')"
        :warning-message="$t('apiKey.switchToPlatformWarning')"
        type="warning"
        @cancel="cancelSwitchToPlatform"
        @confirm="confirmSwitchToPlatform"
    />
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/vue/24/outline'
import {useApiKeyStore} from '../stores/aiConfig.ts'
import ConfirmDialog from '../components/ConfirmDialog.vue'

const apiKeyStore = useApiKeyStore()

const customApiKey = ref('')
const showApiKey = ref(false)
const showConfirmDialog = ref(false)

const showCustomKeyForm = computed(() => apiKeyStore.useCustomApiKey)

onMounted(async () => {
  await apiKeyStore.fetchApiKeyStatus()
  // customApiKey.value will be automatically populated from Pinia persist
  customApiKey.value = apiKeyStore.customApiKey || ''
  console.log(apiKeyStore.customApiKey)
  console.log(customApiKey.value)
})

const selectPlatformKey = async () => {
  if (!apiKeyStore.useCustomApiKey) return

  // Check if user has a custom API key that would be lost
  if (apiKeyStore.hasCustomApiKey || apiKeyStore.customApiKey || customApiKey.value) {
    showConfirmDialog.value = true
    return
  }

  await apiKeyStore.usePlatformApiKey()
}

const confirmSwitchToPlatform = async () => {
  showConfirmDialog.value = false
  await apiKeyStore.usePlatformApiKey()
}

const cancelSwitchToPlatform = () => {
  showConfirmDialog.value = false
  // Reset the radio button back to custom key
  // The radio button will automatically reflect the current state from the store
}

const selectCustomKey = async () => {
  await apiKeyStore.updateApiKey(apiKeyStore.customApiKey, true)
  await apiKeyStore.fetchApiKeyStatus()
  // customApiKey.value will use the persisted value from Pinia
  customApiKey.value = apiKeyStore.customApiKey || ''
}

const testKey = async () => {
  if (!customApiKey.value.trim()) return

  await apiKeyStore.testApiKey(customApiKey.value.trim())
}

const saveCustomKey = async () => {
  // Allow saving even if customApiKey is empty (to keep existing key)
  const keyToSave = customApiKey.value.trim() || ''

  await apiKeyStore.updateApiKey(keyToSave, true)
}

const onApiKeyInput = () => {
  apiKeyStore.clearTestResult()
}
</script> 