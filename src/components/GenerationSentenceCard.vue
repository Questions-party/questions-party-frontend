<script lang="ts" setup>
import {computed, onMounted, reactive, ref, watch} from 'vue'
import {Menu, MenuButton, MenuItem, MenuItems} from '@headlessui/vue'
import {EllipsisVerticalIcon, HeartIcon, ShareIcon} from '@heroicons/vue/24/outline'
import {useAuthStore} from '../stores/auth.ts'
import {useSentenceCheckStore} from '../stores/sentenceCheck.ts'
import {useToast} from 'vue-toastification'
import {useI18n} from 'vue-i18n'
import {marked} from 'marked'
import ConfirmDialog from './ConfirmDialog.vue'

interface Props {
  sentenceCheck: any
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true
})

const authStore = useAuthStore()
const sentenceCheckStore = useSentenceCheckStore()
const toast = useToast()
const {t} = useI18n()

const showGrammarAnalysis = ref(false)
const showGrammarCorrection = ref(false)
const showKeywordAnalysis = ref(false)
const showChineseDefinition = ref(false)
const showThinking = ref(false)
const showRawResponse = ref(false)
const likingInProgress = ref(false)
const showFontConfig = ref(false)
const showDeleteDialog = ref(false)
const deleteLoading = ref(false)

// Font settings configuration
const fontSettings = reactive({
  size: 'text-base',
  weight: 'font-normal',
  lineHeight: 'leading-relaxed',
  family: 'font-sans',
  color: 'text-gray-700 dark:text-gray-300'
})

// Computed property for font classes
const fontClasses = computed(() => {
  return `${fontSettings.size} ${fontSettings.weight} ${fontSettings.lineHeight} ${fontSettings.family} ${fontSettings.color}`
})

// Debounced save function for font settings
let saveTimeout: number | null = null
const saveFontSettings = () => {
  if (saveTimeout) clearTimeout(saveTimeout)
  saveTimeout = setTimeout(async () => {
    if (authStore.isAuthenticated) {
      // Save to backend for authenticated users
      try {
        await authStore.updateFontSettings(fontSettings)
      } catch (error) {
        console.error('Failed to save font settings:', error)
      }
    }
    // Always save to localStorage as backup
    localStorage.setItem('sentenceCheckCard-fontSettings', JSON.stringify(fontSettings))
  }, 500) // 500ms debounce
}

// Load font settings from user preferences or localStorage on mount
onMounted(() => {
  if (authStore.isAuthenticated && authStore.user?.preferences?.fontSettings) {
    // Load from user preferences
    Object.assign(fontSettings, authStore.user.preferences.fontSettings)
  } else {
    // Fallback to localStorage for non-authenticated users
    const savedSettings = localStorage.getItem('sentenceCheckCard-fontSettings')
    if (savedSettings) {
      Object.assign(fontSettings, JSON.parse(savedSettings))
    }
  }
})

// Watch for changes and save to localStorage
watch(fontSettings, (newSettings) => {
  saveFontSettings()
}, {deep: true})

// Reset font settings to default
const resetFontSettings = () => {
  fontSettings.size = 'text-base'
  fontSettings.weight = 'font-normal'
  fontSettings.lineHeight = 'leading-relaxed'
  fontSettings.family = 'font-sans'
  fontSettings.color = 'text-gray-700 dark:text-gray-300'
}

const isOwnSentenceCheck = computed(() => {
  return authStore.user?.id === props.sentenceCheck.userId._id
})

// Card styling based on public/private status
const cardClasses = computed(() => {
  if (!isOwnSentenceCheck.value) return ''

  return props.sentenceCheck.isPublic
      ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-900/10'
      : 'border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-900/10'
})

const visibilityBadgeClasses = computed(() => {
  return props.sentenceCheck.isPublic
      ? 'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
      : 'inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300'
})

const isLiked = computed(() => {
  if (!authStore.user) return false
  return props.sentenceCheck.likes?.some((like: any) => like.userId === authStore.user?.id)
})

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) {
    return t('date.justNow')
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return minutes === 1 ?
        t('date.minuteAgo', {count: minutes}) :
        t('date.minutesAgo', {count: minutes})
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return hours === 1 ?
        t('date.hourAgo', {count: hours}) :
        t('date.hoursAgo', {count: hours})
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return days === 1 ?
        t('date.dayAgo', {count: days}) :
        t('date.daysAgo', {count: days})
  }
}

const parseMarkdown = (text: string) => {
  return marked(text || '')
}

const toggleLike = async () => {
  if (likingInProgress.value || !authStore.isAuthenticated) return

  likingInProgress.value = true
  try {
    await sentenceCheckStore.toggleLike(props.sentenceCheck._id)
  } catch (error) {
    console.error('Failed to toggle like:', error)
  } finally {
    likingInProgress.value = false
  }
}

const togglePrivacy = async () => {
  try {
    await sentenceCheckStore.updateSentenceCheckPrivacy(
        props.sentenceCheck._id,
        !props.sentenceCheck.isPublic
    )
  } catch (error) {
    console.error('Failed to toggle privacy:', error)
  }
}

const confirmDelete = async () => {
  deleteLoading.value = true
  try {
    const result = await sentenceCheckStore.deleteSentenceCheck(props.sentenceCheck._id)
    if (result.success) {
      showDeleteDialog.value = false
    }
  } catch (error) {
    console.error('Failed to delete sentence check:', error)
  } finally {
    deleteLoading.value = false
  }
}

const shareSentenceCheck = () => {
  const url = `${window.location.origin}/check/${props.sentenceCheck._id}`
  navigator.clipboard.writeText(url).then(() => {
    toast.success(t('sentenceCheck.linkCopied'))
  }).catch(() => {
    toast.error(t('sentenceCheck.linkCopyFailed'))
  })
}
</script>

<template>
  <div :class="cardClasses" class="card generation-card fade-in">
    <div class="card-header">
      <div class="flex justify-between items-start">
        <div class="flex items-center space-x-3">
          <div
              class="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
            <span class="text-white font-bold text-xs">
              {{ sentenceCheck.userId.username.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div>
            <p class="font-medium text-sm">{{ sentenceCheck.userId.username }}</p>
            <div class="flex items-center space-x-2">
              <p class="text-xs text-muted">{{ formatDate(sentenceCheck.createdAt) }}</p>
              <span v-if="isOwnSentenceCheck" :class="visibilityBadgeClasses">
                {{ sentenceCheck.isPublic ? $t('cards.public') : $t('cards.private') }}
              </span>
            </div>
          </div>
        </div>

        <div v-if="showActions && authStore.isAuthenticated" class="flex items-center space-x-2">
          <!-- Font Configuration Toggle -->
          <button
              :class="{ 'bg-tertiary': showFontConfig }"
              :title="$t('fontSettings.title')"
              class="p-1 rounded-md hover:bg-tertiary transition-colors"
              @click="showFontConfig = !showFontConfig"
          >
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                  d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM2 15a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z"/>
            </svg>
          </button>

          <button
              :class="{ 'text-red-500': isLiked }"
              :disabled="likingInProgress || !sentenceCheck.isPublic"
              class="flex items-center space-x-1 text-sm hover:bg-tertiary rounded-md px-2 py-1 transition-colors"
              @click="toggleLike"
          >
            <HeartIcon
                :class="{ 'fill-current': isLiked }"
                class="w-4 h-4"
            />
            <span>{{ sentenceCheck.likeCount }}</span>
          </button>

          <!-- More options for own sentence checks -->
          <Menu v-if="isOwnSentenceCheck" as="div" class="relative">
            <MenuButton class="p-1 rounded-md hover:bg-tertiary transition-colors">
              <EllipsisVerticalIcon class="w-4 h-4"/>
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
                        class="block w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                        @click="togglePrivacy"
                    >
                      {{ sentenceCheck.isPublic ? $t('cards.makePrivate') : $t('cards.makePublic') }}
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                        class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-secondary transition-colors"
                        @click="showDeleteDialog = true"
                    >
                      {{ $t('common.delete') }}
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </transition>
          </Menu>
        </div>

        <!-- Show like button for anonymous users (but disabled) -->
        <div v-else-if="showActions" class="flex items-center space-x-2">
          <div class="flex items-center space-x-1 text-sm text-muted px-2 py-1">
            <HeartIcon class="w-4 h-4"/>
            <span>{{ sentenceCheck.likeCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Font Configuration Panel -->
    <div v-if="showFontConfig" class="border-b border-color bg-secondary/50 p-4">
      <div class="flex flex-wrap gap-4 items-center text-sm">
        <div class="flex items-center space-x-2">
          <label class="font-medium">{{ $t('fontSettings.fontSize') }}:</label>
          <select
              v-model="fontSettings.size"
              class="px-2 py-1 rounded border border-color bg-primary text-sm"
          >
            <option value="text-xs">{{ $t('fontSettings.sizes.extraSmall') }}</option>
            <option value="text-sm">{{ $t('fontSettings.sizes.small') }}</option>
            <option value="text-base">{{ $t('fontSettings.sizes.normal') }}</option>
            <option value="text-lg">{{ $t('fontSettings.sizes.large') }}</option>
            <option value="text-xl">{{ $t('fontSettings.sizes.extraLarge') }}</option>
            <option value="text-2xl">{{ $t('fontSettings.sizes.xxLarge') }}</option>
          </select>
        </div>

        <div class="flex items-center space-x-2">
          <label class="font-medium">{{ $t('fontSettings.fontWeight') }}:</label>
          <select
              v-model="fontSettings.weight"
              class="px-2 py-1 rounded border border-color bg-primary text-sm"
          >
            <option value="font-light">{{ $t('fontSettings.weights.light') }}</option>
            <option value="font-normal">{{ $t('fontSettings.weights.normal') }}</option>
            <option value="font-medium">{{ $t('fontSettings.weights.medium') }}</option>
            <option value="font-semibold">{{ $t('fontSettings.weights.semibold') }}</option>
            <option value="font-bold">{{ $t('fontSettings.weights.bold') }}</option>
          </select>
        </div>

        <div class="flex items-center space-x-2">
          <label class="font-medium">{{ $t('fontSettings.lineHeight') }}:</label>
          <select
              v-model="fontSettings.lineHeight"
              class="px-2 py-1 rounded border border-color bg-primary text-sm"
          >
            <option value="leading-tight">{{ $t('fontSettings.lineHeights.tight') }}</option>
            <option value="leading-normal">{{ $t('fontSettings.lineHeights.normal') }}</option>
            <option value="leading-relaxed">{{ $t('fontSettings.lineHeights.relaxed') }}</option>
            <option value="leading-loose">{{ $t('fontSettings.lineHeights.loose') }}</option>
          </select>
        </div>

        <div class="flex items-center space-x-2">
          <label class="font-medium">{{ $t('fontSettings.fontFamily') }}:</label>
          <select
              v-model="fontSettings.family"
              class="px-2 py-1 rounded border border-color bg-primary text-sm"
          >
            <option value="font-sans">{{ $t('fontSettings.families.sansSerif') }}</option>
            <option value="font-serif">{{ $t('fontSettings.families.serif') }}</option>
            <option value="font-mono">{{ $t('fontSettings.families.monospace') }}</option>
          </select>
        </div>

        <div class="flex items-center space-x-2">
          <label class="font-medium">{{ $t('fontSettings.textColor') }}:</label>
          <select
              v-model="fontSettings.color"
              class="px-2 py-1 rounded border border-color bg-primary text-sm"
          >
            <option value="text-gray-700 dark:text-gray-300">{{ $t('fontSettings.colors.default') }}</option>
            <option value="text-gray-900 dark:text-gray-100">{{ $t('fontSettings.colors.highContrast') }}</option>
            <option value="text-blue-700 dark:text-blue-300">{{ $t('fontSettings.colors.blue') }}</option>
            <option value="text-green-700 dark:text-green-300">{{ $t('fontSettings.colors.green') }}</option>
            <option value="text-purple-700 dark:text-purple-300">{{ $t('fontSettings.colors.purple') }}</option>
            <option value="text-red-700 dark:text-red-300">{{ $t('fontSettings.colors.red') }}</option>
          </select>
        </div>

        <button
            class="px-3 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            @click="resetFontSettings"
        >
          {{ $t('common.reset') }}
        </button>
      </div>
    </div>

    <div class="card-body space-y-4">
      <!-- Original Sentence -->
      <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-l-4 border-blue-400">
        <h4 class="font-medium text-sm mb-2 text-primary flex items-center">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ $t('cards.originalSentence') }}
        </h4>
        <blockquote :class="fontClasses" class="text-lg">
          <span v-html="parseMarkdown(sentenceCheck.originalSentence)"></span>
        </blockquote>
      </div>

      <!-- AI Model Badge -->
      <div class="flex items-center space-x-2">
        <span
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ sentenceCheck.aiModel || '' }}
        </span>
        <span v-if="sentenceCheck.thinkingText" class="text-xs text-accent-color">
          ✨ With AI Reasoning
        </span>
        <span v-if="sentenceCheck.modelSelection" class="text-xs text-blue-600 dark:text-blue-400">
          🎯 Dynamic Selection
        </span>
      </div>

      <!-- Model Selection Information -->
      <div v-if="sentenceCheck.modelSelection"
           class="bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg border-l-4 border-blue-400">
        <h5 class="font-medium text-sm mb-2 text-blue-800 dark:text-blue-300 flex items-center">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ $t('cards.dynamicModelSelection') }}
        </h5>
        <div class="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <p><strong>{{ $t('cards.selectedModel') }}:</strong> {{ sentenceCheck.modelSelection.selectedModel }}</p>
          <p><strong>{{ $t('cards.inputSize') }}:</strong> {{ sentenceCheck.modelSelection.inputSize }} characters</p>
          <p><strong>{{ $t('cards.selectionLogic') }}:</strong> {{ sentenceCheck.modelSelection.selectionReason }}</p>
        </div>
      </div>

      <!-- Grammar Analysis -->
      <div v-if="showGrammarAnalysis" class="generation-explanation">
        <h4 class="font-medium text-sm mb-3 text-primary flex items-center">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path clip-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  fill-rule="evenodd"/>
          </svg>
          {{ $t('cards.grammarAnalysis') }}
        </h4>
        <div
            class="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/10 dark:via-indigo-900/10 dark:to-purple-900/10 p-4 rounded-lg border-l-4 border-blue-400 shadow-sm">
          <div :class="fontClasses" class="prose prose-sm dark:prose-invert max-w-none"
               v-html="parseMarkdown(sentenceCheck.grammarAnalysis)"></div>
        </div>
      </div>

      <!-- Grammar Correction -->
      <div v-if="showGrammarCorrection" class="generation-correction">
        <h4 class="font-medium text-sm mb-3 text-primary flex items-center">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
          </svg>
          {{ $t('cards.grammarCorrection') }}
        </h4>
        <div
            class="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/10 dark:via-green-900/10 dark:to-teal-900/10 p-4 rounded-lg border-l-4 border-emerald-400 shadow-sm">
          <div :class="fontClasses" class="prose prose-sm dark:prose-invert max-w-none"
               v-html="parseMarkdown(sentenceCheck.grammarCorrection)"></div>
        </div>
      </div>

      <!-- Keyword Analysis -->
      <div v-if="showKeywordAnalysis" class="generation-keywords">
        <h4 class="font-medium text-sm mb-3 text-primary flex items-center">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
                d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1zM2 15a1 1 0 011-1h14a1 1 0 110 2H3a1 1 0 01-1-1z"/>
          </svg>
          {{ $t('cards.keywordAnalysis') }}
        </h4>
        <div
            class="bg-gradient-to-r from-violet-50 via-purple-50 to-fuchsia-50 dark:from-violet-900/10 dark:via-purple-900/10 dark:to-fuchsia-900/10 p-4 rounded-lg border-l-4 border-violet-400 shadow-sm">
          <div :class="fontClasses" class="prose prose-sm dark:prose-invert max-w-none"
               v-html="parseMarkdown(sentenceCheck.keywordAnalysis)"></div>
        </div>
      </div>

      <!-- Chinese Definition -->
      <div v-if="showChineseDefinition && sentenceCheck.chineseDefinition" class="generation-chinese">
        <h4 class="font-medium text-sm mb-3 text-primary flex items-center">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
          </svg>
          {{ $t('cards.chineseDefinitionFull') }}
        </h4>
        <div
            class="bg-gradient-to-r from-orange-50 via-yellow-50 to-amber-50 dark:from-orange-900/10 dark:via-yellow-900/10 dark:to-amber-900/10 p-4 rounded-lg border-l-4 border-orange-400 shadow-sm">
          <div :class="fontClasses" class="prose prose-sm dark:prose-invert max-w-none"
               v-html="parseMarkdown(sentenceCheck.chineseDefinition)"></div>
        </div>
      </div>

      <!-- AI Thinking/Reasoning Text (if available) -->
      <div v-if="showThinking && sentenceCheck.thinkingText" class="generation-thinking">
        <h4 class="font-medium text-sm mb-2 text-primary flex items-center">
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
                d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          {{ $t('cards.aiReasoningProcess') }}
        </h4>
        <div
            class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 p-3 rounded-lg border-l-4 border-purple-400">
          <p :class="fontClasses" class="whitespace-pre-wrap">{{ sentenceCheck.thinkingText }}</p>
        </div>
      </div>

      <!-- Raw AI Response (if available and parsing failed/partial) -->
      <div v-if="showRawResponse && sentenceCheck.rawResponseContent" class="generation-raw-response">
        <h4 class="font-medium text-sm mb-2 text-primary flex items-center">
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path
                d="M4 5a1 1 0 011-1h10a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1v-2zM16 13a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z"/>
          </svg>
          {{ $t('cards.rawAiResponse') }}
        </h4>
        <div
            class="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-900/50 dark:to-slate-900/50 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
          <pre :class="fontClasses"
               class="whitespace-pre-wrap text-xs overflow-auto max-h-60">{{ sentenceCheck.rawResponseContent }}</pre>
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
          {{ $t('cards.rawResponseNote') }}
        </p>
      </div>

      <!-- Toggle buttons -->
      <div class="flex flex-wrap gap-3">
        <button
            v-if="!showGrammarAnalysis"
            class="text-sm text-blue-600 hover:underline"
            @click="showGrammarAnalysis = true"
        >
          {{ $t('cards.showGrammarAnalysis') }} →
        </button>
        <button
            v-if="!showGrammarCorrection"
            class="text-sm text-emerald-600 hover:underline"
            @click="showGrammarCorrection = true"
        >
          {{ $t('cards.showGrammarCorrection') }} →
        </button>
        <button
            v-if="!showKeywordAnalysis"
            class="text-sm text-violet-600 hover:underline"
            @click="showKeywordAnalysis = true"
        >
          {{ $t('cards.showKeywordAnalysis') }} →
        </button>
        <button
            v-if="sentenceCheck.chineseDefinition && !showChineseDefinition"
            class="text-sm text-orange-600 hover:underline"
            @click="showChineseDefinition = true"
        >
          {{ $t('cards.showChineseDefinition') }} →
        </button>
        <button
            v-if="sentenceCheck.thinkingText && !showThinking"
            class="text-sm text-purple-600 hover:underline"
            @click="showThinking = true"
        >
          {{ $t('cards.showAiReasoning') }} →
        </button>
        <button
            v-if="sentenceCheck.rawResponseContent && !showRawResponse"
            class="text-sm text-gray-600 hover:underline"
            @click="showRawResponse = true"
        >
          {{ $t('cards.showRawResponse') }} →
        </button>
      </div>
    </div>

    <div v-if="showActions" class="card-footer">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4 text-sm text-muted">
          <span>AI Model: {{ sentenceCheck.aiModel || '' }}</span>
          <span>Length: {{ sentenceCheck.originalSentence.length }} chars</span>
        </div>

        <div class="flex items-center space-x-2">
          <button
              v-if="authStore.isAuthenticated"
              class="btn btn-ghost btn-sm"
              @click="shareSentenceCheck"
          >
            <ShareIcon class="w-4 h-4 mr-1"/>
            Share
          </button>
          <span v-else class="text-xs text-muted">
            {{ $t('common.signInToInteract') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
        :cancel-text="$t('common.cancel')"
        :confirm-text="$t('common.delete')"
        :loading="deleteLoading"
        :message="$t('cards.deleteSentenceCheckMessage')"
        :show="showDeleteDialog"
        :title="$t('cards.deleteSentenceCheckTitle')"
        :warning-message="$t('cards.deleteSentenceCheckWarning')"
        type="danger"
        @cancel="showDeleteDialog = false"
        @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.btn-sm {
  @apply px-2 py-1 text-xs;
}
</style>