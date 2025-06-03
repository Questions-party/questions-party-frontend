<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center space-y-4">
      <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
        <span class="text-white font-bold text-2xl">
          {{ authStore.user?.username.charAt(0).toUpperCase() }}
        </span>
      </div>
      <div>
        <h1 class="text-3xl font-bold text-primary">{{ authStore.user?.username }}</h1>
        <p class="text-secondary">{{ authStore.user?.email }}</p>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-6">
      <div class="card text-center">
        <div class="card-body">
          <div class="text-3xl font-bold text-blue-600 mb-2">{{ wordsStore.stats?.totalWords || wordsStore.words.length }}</div>
          <p class="text-sm text-secondary">{{ $t('profile.totalWords') }}</p>
        </div>
      </div>
      <div class="card text-center">
        <div class="card-body">
          <div class="text-3xl font-bold text-green-600 mb-2">{{ generationsStore.generations.length }}</div>
          <p class="text-sm text-secondary">{{ $t('profile.totalGenerations') }}</p>
        </div>
      </div>
      <div class="card text-center">
        <div class="card-body">
          <div class="text-3xl font-bold text-emerald-600 mb-2">{{ sentenceCheckStore.userSentenceChecks.length }}</div>
          <p class="text-sm text-secondary">{{ $t('profile.totalSentenceChecks') }}</p>
        </div>
      </div>
      <div class="card text-center">
        <div class="card-body">
          <div class="text-3xl font-bold text-purple-600 mb-2">{{ totalLikes }}</div>
          <p class="text-sm text-secondary">{{ $t('profile.totalLikes') }}</p>
        </div>
      </div>
    </div>

    <!-- Preferences Settings -->
    <div class="card">
      <div class="card-header">
        <h3 class="text-lg font-semibold">{{ $t('profile.preferences') }}</h3>
      </div>
      <div class="card-body space-y-6">
        <!-- Theme Setting -->
        <div class="flex justify-between items-center">
          <div>
            <label class="text-sm font-medium text-primary">{{ $t('profile.theme') }}</label>
            <p class="text-xs text-secondary">{{ $t('profile.themeDescription') }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="themeStore.setTheme('light')"
              class="btn btn-sm"
              :class="themeStore.theme === 'light' ? 'btn-primary' : 'btn-ghost'"
            >
              {{ $t('profile.light') }}
            </button>
            <button
              @click="themeStore.setTheme('dark')"
              class="btn btn-sm"
              :class="themeStore.theme === 'dark' ? 'btn-primary' : 'btn-ghost'"
            >
              {{ $t('profile.dark') }}
            </button>
          </div>
        </div>

        <!-- Language Setting -->
        <div class="flex justify-between items-center">
          <div>
            <label class="text-sm font-medium text-primary">{{ $t('profile.language') }}</label>
            <p class="text-xs text-secondary">{{ $t('profile.languageDescription') }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="themeStore.setLanguage('en')"
              class="btn btn-sm"
              :class="themeStore.language === 'en' ? 'btn-primary' : 'btn-ghost'"
            >
              {{ $t('profile.english') }}
            </button>
            <button
              @click="themeStore.setLanguage('zh')"
              class="btn btn-sm"
              :class="themeStore.language === 'zh' ? 'btn-primary' : 'btn-ghost'"
            >
              {{ $t('profile.chinese') }}
            </button>
          </div>
        </div>

        <!-- Grammar Explanation Language Setting -->
        <div class="flex justify-between items-center">
          <div>
            <label class="text-sm font-medium text-primary">{{ $t('generation.grammarExplanationLanguage') }}</label>
            <p class="text-xs text-secondary">{{ $t('profile.grammarLanguageDescription') }}</p>
          </div>
          <div class="flex items-center space-x-2">
            <button
              @click="updateGrammarLanguage('combined')"
              class="btn btn-sm"
              :class="preferences.grammarExplanationLanguage === 'combined' ? 'btn-primary' : 'btn-ghost'"
            >
              {{ $t('generation.combiningChineseEnglish') }}
            </button>
            <button
              @click="updateGrammarLanguage('pure')"
              class="btn btn-sm"
              :class="preferences.grammarExplanationLanguage === 'pure' ? 'btn-primary' : 'btn-ghost'"
            >
              {{ $t('generation.pureEnglish') }}
            </button>
          </div>
        </div>

        <!-- Public Generations Setting -->
        <div class="flex justify-between items-center">
          <div>
            <label for="showPublic" class="text-sm font-medium text-primary">{{ $t('profile.showPublicGenerations') }}</label>
            <p class="text-xs text-secondary">{{ $t('profile.showPublicGenerationsDescription') }}</p>
          </div>
          <input
            id="showPublic"
            v-model="preferences.showPublicGenerations"
            @change="updatePreferences"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        </div>
      </div>
    </div>

    <!-- Recent Generations -->
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <h3 class="text-xl font-semibold">{{ $t('profile.yourContent') }}</h3>
          
          <!-- Content Type Toggle -->
          <div class="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              @click="activeContentType = 'generations'"
              :class="[
                'px-3 py-1 text-sm font-medium rounded-md transition-all',
                activeContentType === 'generations'
                  ? 'bg-white dark:bg-gray-700 text-primary shadow'
                  : 'text-secondary hover:text-primary'
              ]"
            >
              <SparklesIcon class="w-4 h-4 mr-1 inline" />
              {{ $t('profile.generations') }}
            </button>
            <button
              @click="activeContentType = 'sentenceChecks'"
              :class="[
                'px-3 py-1 text-sm font-medium rounded-md transition-all',
                activeContentType === 'sentenceChecks'
                  ? 'bg-white dark:bg-gray-700 text-primary shadow'
                  : 'text-secondary hover:text-primary'
              ]"
            >
              <CheckCircleIcon class="w-4 h-4 mr-1 inline" />
              {{ $t('profile.sentenceChecks') }}
            </button>
          </div>
        </div>
        <router-link to="/generate" class="btn btn-primary btn-sm">
          <SparklesIcon class="w-4 h-4 mr-1" />
          {{ $t('profile.createNew') }}
        </router-link>
      </div>

      <div v-if="isLoading" class="text-center py-8">
        <div class="spinner-lg mx-auto mb-4"></div>
        <p class="text-secondary">{{ $t('common.loading') }}...</p>
      </div>

      <div v-else-if="getCurrentContent().length === 0" class="text-center py-12">
        <SparklesIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-primary mb-2">{{ $t('profile.noGenerationsYet') }}</h3>
        <p class="text-secondary mb-4">{{ $t('profile.startCreating') }}</p>
        <router-link to="/generate" class="btn btn-primary">
          {{ $t('profile.createFirstGeneration') }}
        </router-link>
      </div>

      <div v-else class="grid grid-cols-1 gap-6">
        <GenerationWordsCard
          v-for="generation in getCurrentContent().slice(0, 6)"
          :key="generation._id"
          :generation="generation"
          :show-actions="true"
        />
      </div>

      <div v-if="getCurrentContent().length > 6" class="text-center">
        <button
          @click="showAllGenerations = !showAllGenerations"
          class="btn btn-ghost"
        >
          {{ showAllGenerations ? $t('profile.showLess') : $t('profile.viewAll', { count: getCurrentContent().length, type: getContentTypeName() }) }}
        </button>
      </div>

      <!-- All Generations (when expanded) -->
      <div v-if="showAllGenerations && getCurrentContent().length > 6" class="grid grid-cols-1 gap-6">
        <GenerationWordsCard
          v-for="generation in getCurrentContent().slice(6)"
          :key="generation._id"
          :generation="generation"
          :show-actions="true"
        />
      </div>
    </div>

    <!-- Account Actions -->
    <div class="card">
      <div class="card-header">
        <h3 class="text-lg font-semibold">{{ $t('profile.accountActions') }}</h3>
      </div>
      <div class="card-body space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-primary">{{ $t('profile.exportData') }}</p>
            <p class="text-xs text-secondary">{{ $t('profile.downloadAll') }}</p>
          </div>
          <button
            @click="exportData"
            class="btn btn-secondary btn-sm"
          >
            <ArrowDownTrayIcon class="w-4 h-4 mr-1" />
            {{ $t('profile.exportButton') }}
          </button>
        </div>

        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-primary">{{ $t('profile.deleteAllGenerations') }}</p>
            <p class="text-xs text-secondary">{{ $t('profile.deleteAllGenerationsDesc') }}</p>
          </div>
          <button
            @click="showDeleteAllDialog = true"
            class="btn btn-sm"
            :class="getCurrentContent().length > 0 ? 'btn-ghost text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' : 'btn-ghost opacity-50 cursor-not-allowed'"
            :disabled="getCurrentContent().length === 0"
          >
            <TrashIcon class="w-4 h-4 mr-1" />
            {{ $t('common.delete') }}
          </button>
        </div>

        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm font-medium text-primary">{{ $t('profile.signOut') }}</p>
            <p class="text-xs text-secondary">{{ $t('profile.signOutDesc') }}</p>
          </div>
          <button
            @click="logout"
            class="btn btn-ghost btn-sm"
          >
            <ArrowRightOnRectangleIcon class="w-4 h-4 mr-1" />
            {{ $t('profile.signOut') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Delete All Generations Confirmation Dialog -->
    <ConfirmDialog
      :show="showDeleteAllDialog"
      :title="$t('profile.deleteAllGenerationsConfirm')"
      :message="$t('profile.deleteAllGenerationsMessage')"
      :warning-message="$t('profile.deleteAllGenerationsWarning')"
      :confirm-text="$t('common.delete')"
      :cancel-text="$t('common.cancel')"
      :loading="deleteAllLoading"
      type="danger"
      @confirm="confirmDeleteAllGenerations"
      @cancel="showDeleteAllDialog = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  SparklesIcon,
  ArrowDownTrayIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth.ts'
import { useWordsStore } from '../stores/words.ts'
import { useGenerationsStore } from '../stores/generations.ts'
import { useThemeStore } from '../stores/theme.ts'
import { useToast } from 'vue-toastification'
import GenerationWordsCard from '../components/GenerationWordsCard.vue'
import GenerationSentenceCard from '../components/GenerationSentenceCard.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { useI18n } from 'vue-i18n'
import { generationsAPI } from '../services/api.ts'
import { useSentenceCheckStore } from '../stores/sentenceCheck.ts'

const router = useRouter()
const authStore = useAuthStore()
const wordsStore = useWordsStore()
const generationsStore = useGenerationsStore()
const themeStore = useThemeStore()
const toast = useToast()
const { t } = useI18n()
const sentenceCheckStore = useSentenceCheckStore()

const showAllGenerations = ref(false)
const showDeleteAllDialog = ref(false)
const deleteAllLoading = ref(false)
const activeContentType = ref('generations')

const preferences = reactive({
  showPublicGenerations: authStore.user?.preferences?.showPublicGenerations ?? true,
  grammarExplanationLanguage: authStore.user?.preferences?.grammarExplanationLanguage ?? 'combined'
})

const totalLikes = computed(() => {
  return generationsStore.generations.reduce((total, gen) => total + gen.likeCount, 0) +
         sentenceCheckStore.userSentenceChecks.reduce((total, check) => total + check.likeCount, 0)
})

const isLoading = computed(() => {
  if (activeContentType.value === 'generations') {
    return generationsStore.loading
  } else {
    return sentenceCheckStore.loading
  }
})

const getCurrentContent = () => {
  if (activeContentType.value === 'generations') {
    return generationsStore.sortedGenerations
  } else {
    return sentenceCheckStore.sortedSentenceChecks
  }
}

const getContentTypeName = () => {
  return activeContentType.value === 'generations' ? t('community.wordGenerations') : t('community.sentenceChecks')
}

onMounted(async () => {
  // Fetch user data
  Promise.all([
    wordsStore.fetchWords(),
    wordsStore.fetchStats(),
    generationsStore.fetchUserGenerations(),
    sentenceCheckStore.fetchUserSentenceChecks()
  ]).catch(error => {
    console.error('Failed to fetch user data:', error)
  })

  // Initialize preferences from user data
  if (authStore.user?.preferences) {
    preferences.showPublicGenerations = authStore.user.preferences.showPublicGenerations ?? true
    preferences.grammarExplanationLanguage = authStore.user.preferences.grammarExplanationLanguage ?? 'combined'
  }
})

const updatePreferences = async () => {
  try {
    await authStore.updatePreferences({
      showPublicGenerations: preferences.showPublicGenerations,
      theme: themeStore.theme,
      language: themeStore.language,
      grammarExplanationLanguage: preferences.grammarExplanationLanguage
    })
  } catch (error) {
    console.error('Failed to update preferences:', error)
    toast.error('Failed to update preferences')
  }
}

const updateGrammarLanguage = (language: string) => {
  preferences.grammarExplanationLanguage = language
  updatePreferences()
}

const exportData = () => {
  // Mock data export
  const data = {
    words: wordsStore.words,
    generations: generationsStore.generations,
    profile: authStore.user
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'questions-party-data.json'
  a.click()
  URL.revokeObjectURL(url)
  
  toast.success(t('profile.exportDataSuccess'))
}

const confirmDeleteAllGenerations = async () => {
  deleteAllLoading.value = true
  try {
    await generationsAPI.deleteAllGenerations()
    
    // Clear the generations from the store
    generationsStore.generations = []
    
    showDeleteAllDialog.value = false
    toast.success(t('profile.deleteAllGenerationsSuccess'))
  } catch (error) {
    console.error('Failed to delete all generations:', error)
    toast.error(t('profile.deleteAllGenerationsError'))
  } finally {
    deleteAllLoading.value = false
  }
}

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script> 