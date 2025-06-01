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
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
            <p class="text-xs text-secondary">Choose your preferred theme</p>
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
            <p class="text-xs text-secondary">Choose your interface language</p>
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

        <!-- Public Generations Setting -->
        <div class="flex justify-between items-center">
          <div>
            <label for="showPublic" class="text-sm font-medium text-primary">{{ $t('profile.showPublicGenerations') }}</label>
            <p class="text-xs text-secondary">Allow your generations to appear in the community feed</p>
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
        <h3 class="text-xl font-semibold">{{ $t('generation.yourRecentGenerations') }}</h3>
        <router-link to="/generate" class="btn btn-primary btn-sm">
          <SparklesIcon class="w-4 h-4 mr-1" />
          {{ $t('profile.createNew') }}
        </router-link>
      </div>

      <div v-if="generationsStore.loading" class="text-center py-8">
        <div class="spinner-lg mx-auto mb-4"></div>
        <p class="text-secondary">{{ $t('common.loading') }}...</p>
      </div>

      <div v-else-if="generationsStore.generations.length === 0" class="text-center py-12">
        <SparklesIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-primary mb-2">{{ $t('profile.noGenerationsYet') }}</h3>
        <p class="text-secondary mb-4">{{ $t('profile.startCreating') }}</p>
        <router-link to="/generate" class="btn btn-primary">
          {{ $t('profile.createFirstGeneration') }}
        </router-link>
      </div>

      <div v-else class="grid md:grid-cols-2 gap-6">
        <GenerationCard
          v-for="generation in generationsStore.sortedGenerations.slice(0, 6)"
          :key="generation._id"
          :generation="generation"
          :show-actions="true"
        />
      </div>

      <div v-if="generationsStore.generations.length > 6" class="text-center">
        <button
          @click="showAllGenerations = !showAllGenerations"
          class="btn btn-ghost"
        >
          {{ showAllGenerations ? 'Show Less' : `View All ${generationsStore.generations.length} Generations` }}
        </button>
      </div>

      <!-- All Generations (when expanded) -->
      <div v-if="showAllGenerations && generationsStore.generations.length > 6" class="grid md:grid-cols-2 gap-6">
        <GenerationCard
          v-for="generation in generationsStore.sortedGenerations.slice(6)"
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
            Export
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  SparklesIcon,
  ArrowDownTrayIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth.ts'
import { useWordsStore } from '../stores/words.ts'
import { useGenerationsStore } from '../stores/generations.ts'
import { useThemeStore } from '../stores/theme.ts'
import { useToast } from 'vue-toastification'
import GenerationCard from '../components/GenerationCard.vue'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const wordsStore = useWordsStore()
const generationsStore = useGenerationsStore()
const themeStore = useThemeStore()
const toast = useToast()
const { t } = useI18n()

const showAllGenerations = ref(false)

const preferences = reactive({
  showPublicGenerations: authStore.user?.preferences?.showPublicGenerations ?? true
})

const totalLikes = computed(() => {
  return generationsStore.generations.reduce((total, gen) => total + gen.likeCount, 0)
})

onMounted(async () => {
  // Fetch user data
  Promise.all([
    wordsStore.fetchWords(),
    wordsStore.fetchStats(),
    generationsStore.fetchUserGenerations()
  ]).catch(error => {
    console.error('Failed to fetch user data:', error)
  })

  // Initialize preferences from user data
  if (authStore.user?.preferences) {
    preferences.showPublicGenerations = authStore.user.preferences.showPublicGenerations ?? true
  }
})

const updatePreferences = async () => {
  try {
    await authStore.updatePreferences({
      showPublicGenerations: preferences.showPublicGenerations,
      theme: themeStore.theme,
      language: themeStore.language
    })
  } catch (error) {
    console.error('Failed to update preferences:', error)
    toast.error('Failed to update preferences')
  }
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
  
  toast.success(t('profile.exportSuccess'))
}

const deleteAllGenerations = async () => {
  if (confirm(t('profile.deleteAllGenerationsConfirm'))) {
    // Implementation would go here
    toast.success(t('profile.deleteAllGenerationsSuccess'))
  }
}

const regenerateQuestions = () => {
  toast.success(t('profile.regenerateSuccess'))
}

const logout = () => {
  authStore.logout()
  router.push('/')
}
</script> 