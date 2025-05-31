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
                      Delete
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </transition>
          </Menu>
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

      <!-- Grammar Explanation -->
      <div v-if="showExplanation" class="generation-explanation">
        <h4 class="font-medium text-sm mb-2 text-primary">{{ $t('generation.explanation') }}</h4>
        <p class="text-sm leading-relaxed">{{ generation.explanation }}</p>
      </div>
      
      <!-- Toggle explanation button -->
      <button
        v-if="!showExplanation"
        @click="showExplanation = true"
        class="text-sm text-accent-color hover:underline"
      >
        Show explanation →
      </button>
    </div>

    <div v-if="showActions && authStore.isAuthenticated" class="card-footer">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4 text-sm text-muted">
          <span>{{ $t('generation.wordsUsed') }}: {{ generation.words.length }}</span>
          <span>{{ $t('generation.aiModel') }}: {{ generation.aiModel }}</span>
        </div>
        
        <div class="flex items-center space-x-2">
          <button
            @click="shareGeneration"
            class="btn btn-ghost btn-sm"
          >
            <ShareIcon class="w-4 h-4 mr-1" />
            Share
          </button>
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
import { useAuthStore } from '../stores/auth'
import { useGenerationsStore } from '../stores/generations'
import { useToast } from 'vue-toastification'

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

const showExplanation = ref(false)
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
    return 'Just now'
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60)
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600)
    return `${hours} hour${hours > 1 ? 's' : ''} ago`
  } else {
    const days = Math.floor(diffInSeconds / 86400)
    return `${days} day${days > 1 ? 's' : ''} ago`
  }
}

const toggleLike = async () => {
  if (likingInProgress.value) return
  
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
    console.error('Failed to update privacy:', error)
  }
}

const deleteGeneration = async () => {
  if (confirm('Are you sure you want to delete this generation?')) {
    try {
      await generationsStore.deleteGeneration(props.generation._id)
    } catch (error) {
      console.error('Failed to delete generation:', error)
    }
  }
}

const shareGeneration = async () => {
  if (navigator.share) {
    try {
      await navigator.share({
        title: 'English Learning - Generated Sentence',
        text: `"${props.generation.sentence}" - Generated using words: ${props.generation.words.join(', ')}`,
        url: window.location.href
      })
    } catch (error) {
      // User cancelled or error occurred
      copyToClipboard()
    }
  } else {
    copyToClipboard()
  }
}

const copyToClipboard = async () => {
  const text = `"${props.generation.sentence}" - Generated using words: ${props.generation.words.join(', ')}`
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Generation copied to clipboard!')
  } catch (error) {
    toast.error('Failed to copy to clipboard')
  }
}
</script>

<style scoped>
.btn-sm {
  @apply px-2 py-1 text-xs;
}
</style> 