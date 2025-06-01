<template>
  <div class="card generation-card fade-in">
    <div class="card-header">
      <div class="flex justify-between items-start">
        <div class="flex items-center space-x-3">
          <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span class="text-white font-bold text-xs">
              {{ generation.userId.username.charAt(0).toUpperCase() }}
            </span>
          </div>
          <div>
            <p class="font-medium text-sm">{{ generation.userId.username }}</p>
            <p class="text-xs text-muted">{{ formatDate(generation.createdAt) }}</p>
          </div>
        </div>
        
        <div v-if="showActions && authStore.isAuthenticated" class="flex items-center space-x-2">
          <button
            @click="toggleLike"
            :disabled="likingInProgress"
            class="flex items-center space-x-1 text-sm hover:bg-tertiary rounded-md px-2 py-1 transition-colors"
            :class="{ 'text-red-500': isLiked }"
          >
            <HeartIcon 
              class="w-4 h-4" 
              :class="{ 'fill-current': isLiked }"
            />
            <span>{{ generation.likeCount }}</span>
          </button>
          
          <!-- More options for own generations -->
          <Menu v-if="isOwnGeneration" as="div" class="relative">
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
                      @click="togglePrivacy"
                      class="block w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                    >
                      {{ generation.isPublic ? 'Make Private' : 'Make Public' }}
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      @click="deleteGeneration"
                      class="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-secondary transition-colors"
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
            <HeartIcon class="w-4 h-4" />
            <span>{{ generation.likeCount }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="card-body space-y-4">
      <!-- Words Used -->
      <div class="flex flex-wrap gap-2">
        <span
          v-for="word in generation.words"
          :key="word"
          class="word-tag"
        >
          {{ word }}
        </span>
      </div>

      <!-- Generated Sentence -->
      <blockquote class="generation-sentence">
        "{{ generation.sentence }}"
      </blockquote>

      <!-- AI Model Badge -->
      <div class="flex items-center space-x-2">
        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          {{ generation.aiModel || 'Qwen/QwQ-32B' }}
        </span>
        <span v-if="generation.thinkingText" class="text-xs text-accent-color">
          ✨ With AI Reasoning
        </span>
      </div>

      <!-- Grammar Explanation -->
      <div v-if="showExplanation" class="generation-explanation">
        <h4 class="font-medium text-sm mb-2 text-primary">{{ $t('generation.explanation') }}</h4>
        <p class="text-sm leading-relaxed">{{ generation.explanation }}</p>
      </div>

      <!-- AI Thinking/Reasoning Text (if available) -->
      <div v-if="showThinking && generation.thinkingText" class="generation-thinking">
        <h4 class="font-medium text-sm mb-2 text-primary flex items-center">
          <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          AI Reasoning Process
        </h4>
        <div class="text-sm leading-relaxed bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/10 dark:to-purple-900/10 p-3 rounded-lg border-l-4 border-purple-400">
          <p class="whitespace-pre-wrap">{{ generation.thinkingText }}</p>
        </div>
      </div>
      
      <!-- Toggle buttons -->
      <div class="flex space-x-3">
        <button
          v-if="!showExplanation"
          @click="showExplanation = true"
          class="text-sm text-accent-color hover:underline"
        >
          Show explanation →
        </button>
        <button
          v-if="generation.thinkingText && !showThinking"
          @click="showThinking = true"
          class="text-sm text-purple-600 hover:underline"
        >
          Show AI reasoning →
        </button>
      </div>
    </div>

    <div v-if="showActions" class="card-footer">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4 text-sm text-muted">
          <span>{{ $t('generation.wordsUsed') }}: {{ generation.words.length }}</span>
          <span>{{ $t('generation.aiModel') }}: {{ generation.aiModel || 'Qwen/QwQ-32B' }}</span>
        </div>
        
        <div class="flex items-center space-x-2">
          <button
            v-if="authStore.isAuthenticated"
            @click="shareGeneration"
            class="btn btn-ghost btn-sm"
          >
            <ShareIcon class="w-4 h-4 mr-1" />
            Share
          </button>
          <span v-else class="text-xs text-muted">
            {{ $t('common.signInToInteract') }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { 
  HeartIcon, 
  EllipsisVerticalIcon, 
  ShareIcon 
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth.ts'
import { useGenerationsStore } from '../stores/generations.ts'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'

interface Props {
  generation: any
  showActions?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showActions: true
})

const authStore = useAuthStore()
const generationsStore = useGenerationsStore()
const toast = useToast()
const { t } = useI18n()

const showExplanation = ref(false)
const showThinking = ref(false)
const likingInProgress = ref(false)

const isOwnGeneration = computed(() => {
  return authStore.user?.id === props.generation.userId._id
})

const isLiked = computed(() => {
  if (!authStore.user) return false
  return props.generation.likes?.some((like: any) => like.userId === authStore.user?.id)
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
      t('date.minuteAgo', { count: minutes }) : 
      t('date.minutesAgo', { count: minutes })
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return hours === 1 ? 
      t('date.hourAgo', { count: hours }) : 
      t('date.hoursAgo', { count: hours })
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return days === 1 ? 
      t('date.dayAgo', { count: days }) : 
      t('date.daysAgo', { count: days })
  }
}

const toggleLike = async () => {
  if (likingInProgress.value || !authStore.isAuthenticated) return
  
  likingInProgress.value = true
  try {
    await generationsStore.toggleLike(props.generation._id)
  } catch (error) {
    console.error('Failed to toggle like:', error)
  } finally {
    likingInProgress.value = false
  }
}

const togglePrivacy = async () => {
  try {
    await generationsStore.updateGenerationPrivacy(
      props.generation._id, 
      !props.generation.isPublic
    )
  } catch (error) {
    console.error('Failed to toggle privacy:', error)
  }
}

const deleteGeneration = async () => {
  if (confirm(t('generation.deleteConfirm'))) {
    try {
      await generationsStore.deleteGeneration(props.generation._id)
    } catch (error) {
      console.error('Failed to delete generation:', error)
    }
  }
}

const shareGeneration = () => {
  const url = `${window.location.origin}/generation/${props.generation._id}`
  navigator.clipboard.writeText(url).then(() => {
    toast.success(t('generation.linkCopied'))
  }).catch(() => {
    toast.error(t('generation.linkCopyFailed'))
  })
}
</script>

<style scoped>
.btn-sm {
  @apply px-2 py-1 text-xs;
}
</style> 