<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold text-primary">{{ $t('sentenceCheck.title') }}</h1>
      <p class="text-secondary max-w-2xl mx-auto">
        {{ $t('sentenceCheck.subtitle') }}
      </p>
      <div class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-300">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
        {{ $t('sentenceCheck.poweredBy') }}
      </div>
    </div>

    <!-- Authentication Required Notice -->
    <div v-if="!authStore.isAuthenticated" class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
      <div class="flex items-start space-x-3">
        <ExclamationTriangleIcon class="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div class="flex-1">
          <h3 class="text-lg font-medium text-amber-800 dark:text-amber-200 mb-2">{{ $t('sentenceCheck.authRequired') }}</h3>
          <p class="text-amber-700 dark:text-amber-300 mb-4">
            {{ $t('sentenceCheck.authRequiredDesc') }}
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <router-link to="/login" class="btn btn-primary">
              <UserIcon class="w-4 h-4 mr-2" />
              {{ $t('sentenceCheck.signIn') }}
            </router-link>
            <router-link to="/register" class="btn btn-secondary">
              <UserPlusIcon class="w-4 h-4 mr-2" />
              {{ $t('sentenceCheck.createAccount') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Sentence Check Interface (only for authenticated users) -->
    <div v-else>
      <!-- Sentence Input Form -->
      <div class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold">{{ $t('sentenceCheck.enterSentence') }}</h3>
        </div>
        <div class="card-body space-y-4">
          <!-- Textarea for sentence input -->
          <div class="space-y-2">
            <textarea
              v-model="inputSentence"
              :placeholder="$t('sentenceCheck.sentencePlaceholder')"
              class="w-full h-32 px-4 py-3 border border-color rounded-lg resize-none outline-none bg-gray-50 dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              :class="{ 'border-red-500': inputSentence.length > 800 }"
              maxlength="800"
            ></textarea>
            
            <!-- Character counter -->
            <div class="flex justify-between items-center text-sm">
              <span 
                :class="{ 'text-red-500': inputSentence.length > 800, 'text-gray-500': inputSentence.length <= 800 }"
              >
                {{ $t('sentenceCheck.characterCount', { count: inputSentence.length }) }}
              </span>
              <span class="text-gray-400">{{ $t('sentenceCheck.maxCharacters') }}</span>
            </div>
            
            <!-- Error message for long sentence -->
            <div v-if="inputSentence.length > 800" class="text-red-500 text-sm">
              {{ $t('sentenceCheck.sentenceTooLong') }}
            </div>
          </div>

          <!-- Advanced Settings -->
          <div class="border-t pt-4">
            <button
              @click="showAdvancedSettings = !showAdvancedSettings"
              class="flex items-center text-sm text-secondary hover:text-primary transition-colors"
            >
              <ChevronDownIcon 
                :class="{ 'rotate-180': showAdvancedSettings }" 
                class="w-4 h-4 mr-2 transition-transform" 
              />
              {{ showAdvancedSettings ? $t('sentenceCheck.hideAdvanced') : $t('sentenceCheck.showAdvanced') }}
            </button>

            <transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="transform scale-95 opacity-0"
              enter-to-class="transform scale-100 opacity-1"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="transform scale-100 opacity-1"
              leave-to-class="transform scale-95 opacity-0"
            >
              <div v-show="showAdvancedSettings" class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                <!-- Grammar Language Option -->
                <div>
                  <label class="block text-sm font-medium text-primary mb-2">
                    {{ $t('sentenceCheck.grammarExplanationLanguage') }}
                  </label>
                  <div class="space-y-2">
                    <label class="flex items-center space-x-3 cursor-pointer">
                      <input
                        v-model="grammarLanguageOption"
                        type="radio"
                        value="combined"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div class="flex flex-col">
                        <span class="text-sm font-medium text-primary">
                          {{ $t('sentenceCheck.combiningChineseEnglish') }}
                        </span>
                        <span class="text-xs text-secondary">
                          {{ $t('sentenceCheck.combiningChineseEnglishDesc') }}
                        </span>
                      </div>
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
                        {{ $t('sentenceCheck.recommended') }}
                      </span>
                    </label>
                    <label class="flex items-center space-x-3 cursor-pointer">
                      <input
                        v-model="grammarLanguageOption"
                        type="radio"
                        value="pure"
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div class="flex flex-col">
                        <span class="text-sm font-medium text-primary">
                          {{ $t('sentenceCheck.pureEnglish') }}
                        </span>
                        <span class="text-xs text-secondary">
                          {{ $t('sentenceCheck.pureEnglishDesc') }}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
                
                <!-- Max Retries -->
                <div>
                  <label class="block text-sm font-medium text-primary mb-2">
                    {{ $t('sentenceCheck.maxRetries') }}
                  </label>
                  <div class="flex items-center space-x-3">
                    <input
                      v-model="maxRetries"
                      type="range"
                      min="1"
                      max="10"
                      class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                    />
                    <span class="w-8 text-center text-sm font-medium">{{ maxRetries }}</span>
                  </div>
                  <p class="text-xs text-secondary mt-1">
                    {{ $t('sentenceCheck.maxRetriesDesc') }}
                  </p>
                </div>
              </div>
            </transition>
          </div>

          <!-- Public Setting -->
          <div class="flex items-center space-x-3">
            <input
              id="isPublic"
              v-model="isPublic"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="isPublic" class="text-sm font-medium text-primary">
              {{ $t('sentenceCheck.makePublic') }} - {{ $t('sentenceCheck.makePublicDesc') }}
            </label>
          </div>

          <!-- Check Progress -->
          <div v-if="sentenceCheckStore.checking || sentenceCheckStore.checkProgress.isChecking" class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div class="flex items-center space-x-3">
              <div class="spinner"></div>
              <div class="flex-1">
                <div class="flex items-center justify-between mb-2">
                  <p class="font-medium text-green-800 dark:text-green-200">
                    <span v-if="sentenceCheckStore.checkProgress.isRetrying">
                      {{ $t('sentenceCheck.retrying', { 
                        current: sentenceCheckStore.checkProgress.currentAttempt, 
                        max: sentenceCheckStore.checkProgress.maxRetries 
                      }) }}
                    </span>
                    <span v-else>
                      {{ $t('sentenceCheck.checking') }}
                    </span>
                  </p>
                  <span class="text-sm text-green-600 dark:text-green-300 font-mono">
                    {{ formatElapsedTime(sentenceCheckStore.checkProgress.elapsedTime) }}
                  </span>
                </div>
                
                <!-- Progress Bar -->
                <div class="w-full bg-green-200 dark:bg-green-800 rounded-full h-2 mb-2">
                  <div 
                    class="bg-green-600 dark:bg-green-400 h-2 rounded-full transition-all duration-300"
                    :style="{ width: `${Math.min((sentenceCheckStore.checkProgress.currentAttempt / sentenceCheckStore.checkProgress.maxRetries) * 100, 100)}%` }"
                  ></div>
                </div>
                
                <div class="flex items-center justify-between text-sm">
                  <span class="text-green-600 dark:text-green-300">
                    <span v-if="sentenceCheckStore.checkProgress.isRetrying">
                      {{ $t('sentenceCheck.formatError') }}
                    </span>
                    <span v-else>
                      {{ $t('sentenceCheck.currentAttempt', { 
                        current: sentenceCheckStore.checkProgress.currentAttempt, 
                        max: sentenceCheckStore.checkProgress.maxRetries 
                      }) }}
                    </span>
                  </span>
                  <span class="text-green-500 dark:text-green-400 text-xs">
                    {{ $t('sentenceCheck.aiModel') }}: Qwen/QwQ-32B
                  </span>
                </div>
              </div>
              
              <!-- Cancel Button -->
              <button
                v-if="sentenceCheckStore.checkProgress.canCancel"
                @click="sentenceCheckStore.cancelCheck()"
                class="btn btn-ghost btn-sm text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <XMarkIcon class="w-4 h-4 mr-1" />
                {{ $t('sentenceCheck.cancel') }}
              </button>
            </div>
          </div>

          <!-- Check Button -->
          <button
            @click="checkSentence"
            :disabled="sentenceCheckStore.checking || !canCheck"
            class="w-full btn btn-primary btn-lg"
          >
            <div v-if="sentenceCheckStore.checking" class="spinner mr-2"></div>
            <CheckCircleIcon v-else class="w-5 h-5 mr-2" />
            {{ sentenceCheckStore.checking ? $t('sentenceCheck.checking') : $t('sentenceCheck.checkSentence') }}
          </button>
        </div>
      </div>

      <!-- Current Check Result -->
      <transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="transform scale-95 opacity-0"
        enter-to-class="transform scale-100 opacity-1"
      >
        <div v-if="sentenceCheckStore.currentSentenceCheck" class="space-y-6">
          <div class="flex justify-between items-center">
            <h3 class="text-xl font-semibold">{{ $t('sentenceCheck.checkResult') }}</h3>
            <div class="flex items-center space-x-2">
              <button
                @click="recheckSameSentence"
                :disabled="sentenceCheckStore.checking"
                class="btn btn-secondary btn-sm"
              >
                <ArrowPathIcon class="w-4 h-4 mr-1" />
                {{ $t('common.refresh') }}
              </button>
              <button
                @click="shareSentenceCheck"
                class="btn btn-ghost btn-sm"
              >
                <ShareIcon class="w-4 h-4 mr-1" />
                {{ $t('sentenceCheck.share') }}
              </button>
            </div>
          </div>

          <!-- Display current sentence check using GenerationSentenceCard -->
          <GenerationSentenceCard
            :sentence-check="sentenceCheckStore.currentSentenceCheck"
            :show-actions="true"
          />

          <!-- Quick Actions -->
          <div class="flex flex-col sm:flex-row gap-3">
            <button
              @click="checkNewSentence"
              class="btn btn-primary flex-1"
            >
              {{ $t('sentenceCheck.checkNewSentence') }}
            </button>
            <button
              @click="saveAndContinue"
              class="btn btn-secondary flex-1"
            >
              {{ $t('sentenceCheck.saveAndContinue') }}
            </button>
          </div>
        </div>
      </transition>

      <!-- Recent Checks -->
      <div v-if="sentenceCheckStore.userSentenceChecks.length > 0" class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-semibold">{{ $t('sentenceCheck.yourChecks') }}</h3>
          <span class="text-sm text-secondary">
            {{ sentenceCheckStore.userSentenceChecks.length }} {{ $t('sentenceCheck.totalChecks') }}
          </span>
        </div>

        <div class="grid grid-cols-1 gap-6">
          <GenerationSentenceCard
            v-for="sentenceCheck in sentenceCheckStore.sortedSentenceChecks.slice(0, 4)"
            :key="sentenceCheck._id"
            :sentence-check="sentenceCheck"
            :show-actions="true"
          />
        </div>

        <div class="text-center">
          <router-link to="/profile" class="btn btn-ghost">
            {{ $t('sentenceCheck.viewAllChecks') }} →
          </router-link>
        </div>
      </div>
    </div>

    <!-- Browse Public Content Suggestion -->
    <div v-if="!authStore.isAuthenticated" class="text-center py-8">
      <p class="text-secondary mb-4">{{ $t('sentenceCheck.browsePublic') }}</p>
      <router-link to="/community" class="btn btn-ghost">
        <UsersIcon class="w-4 h-4 mr-2" />
        {{ $t('sentenceCheck.browseCommunityChecks') }}
      </router-link>
    </div>

    <!-- Community Statistics for guests -->
    <div v-if="!authStore.isAuthenticated" class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="card text-center">
        <div class="card-body">
          <div v-if="sentenceCheckStore.statisticsLoading" class="text-3xl font-bold text-green-600 mb-2">
            <div class="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-20 mx-auto rounded"></div>
          </div>
          <div v-else class="text-3xl font-bold text-green-600 mb-2">{{ sentenceCheckStore.statistics.totalChecks.toLocaleString() }}</div>
          <p class="text-sm text-secondary">{{ $t('sentenceCheck.totalChecks') }}</p>
        </div>
      </div>
      <div class="card text-center">
        <div class="card-body">
          <div v-if="sentenceCheckStore.statisticsLoading" class="text-3xl font-bold text-blue-600 mb-2">
            <div class="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-20 mx-auto rounded"></div>
          </div>
          <div v-else class="text-3xl font-bold text-blue-600 mb-2">{{ sentenceCheckStore.statistics.totalLikes.toLocaleString() }}</div>
          <p class="text-sm text-secondary">{{ $t('sentenceCheck.totalLikes') }}</p>
        </div>
      </div>
      <div class="card text-center">
        <div class="card-body">
          <div v-if="sentenceCheckStore.statisticsLoading" class="text-3xl font-bold text-purple-600 mb-2">
            <div class="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-20 mx-auto rounded"></div>
          </div>
          <div v-else class="text-3xl font-bold text-purple-600 mb-2">{{ Math.round(sentenceCheckStore.statistics.avgSentenceLength) }}</div>
          <p class="text-sm text-secondary">{{ $t('sentenceCheck.avgSentenceLength') }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  ArrowPathIcon,
  ShareIcon,
  ChevronDownIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { useSentenceCheckStore } from '../stores/sentenceCheck.ts'
import { useAuthStore } from '../stores/auth.ts'
import GenerationSentenceCard from '../components/GenerationSentenceCard.vue'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'

const sentenceCheckStore = useSentenceCheckStore()
const authStore = useAuthStore()
const toast = useToast()
const { t } = useI18n()

const inputSentence = ref('')
const isPublic = ref(true)
const maxRetries = ref(3)
const showAdvancedSettings = ref(false)
const grammarLanguageOption = ref('combined')

// Watch for changes in grammar language option and save to user preferences
watch(grammarLanguageOption, async (newValue) => {
  if (authStore.isAuthenticated) {
    try {
      await authStore.updatePreferences({
        grammarExplanationLanguage: newValue
      })
    } catch (error) {
      console.error('Failed to save grammar language preference:', error)
    }
  }
}, { immediate: false })

const canCheck = computed(() => {
  return inputSentence.value.trim().length > 0 && 
         inputSentence.value.length <= 800 && 
         !sentenceCheckStore.checking
})

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await sentenceCheckStore.fetchUserSentenceChecks()
    
    // Load user's grammar language preference
    if (authStore.user?.preferences?.grammarExplanationLanguage) {
      grammarLanguageOption.value = authStore.user.preferences.grammarExplanationLanguage
    }
  } else {
    // Load statistics for guests
    await sentenceCheckStore.fetchStatistics()
  }
})

const checkSentence = async () => {
  if (!canCheck.value) return

  const result = await sentenceCheckStore.checkSentence({
    sentence: inputSentence.value.trim(),
    isPublic: isPublic.value,
    maxRetries: maxRetries.value,
    grammarLanguage: grammarLanguageOption.value
  })

  if (result.success) {
    // Clear input after successful check
    inputSentence.value = ''
  }
}

const recheckSameSentence = async () => {
  if (!sentenceCheckStore.currentSentenceCheck) return

  const result = await sentenceCheckStore.checkSentence({
    sentence: sentenceCheckStore.currentSentenceCheck.originalSentence,
    isPublic: isPublic.value,
    maxRetries: maxRetries.value,
    grammarLanguage: grammarLanguageOption.value
  })
}

const checkNewSentence = () => {
  sentenceCheckStore.clearCurrentSentenceCheck()
  inputSentence.value = ''
}

const saveAndContinue = () => {
  sentenceCheckStore.clearCurrentSentenceCheck()
  inputSentence.value = ''
  toast.success(t('sentenceCheck.readyForAnother'))
}

const shareSentenceCheck = () => {
  if (sentenceCheckStore.currentSentenceCheck) {
    const url = `${window.location.origin}/check/${sentenceCheckStore.currentSentenceCheck._id}`
    navigator.clipboard.writeText(url).then(() => {
      toast.success(t('sentenceCheck.linkCopied'))
    }).catch(() => {
      toast.error(t('sentenceCheck.linkCopyFailed'))
    })
  }
}

const formatElapsedTime = (elapsedTime: number) => {
  const hours = Math.floor(elapsedTime / 3600)
  const minutes = Math.floor((elapsedTime % 3600) / 60)
  const seconds = Math.floor(elapsedTime % 60)
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
.btn-lg {
  @apply px-8 py-4 text-lg;
}
</style> 