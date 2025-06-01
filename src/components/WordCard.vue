<template>
  <div
    class="card cursor-pointer transition-all duration-200"
    :class="{
      'word-card-selected': selected,
      'hover:shadow-lg': !selected
    }"
    @click="$emit('toggle-select')"
  >
    <div class="card-body relative">
      <!-- Selection indicator -->
      <div
        v-if="selected"
        class="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm"
        style="background-color: var(--accent-color)"
      >
        <CheckIcon class="w-3 h-3 text-white" />
      </div>
      
      <!-- Word content -->
      <div class="space-y-3">
        <div class="flex justify-between items-start">
          <h3 class="text-lg font-semibold text-primary">{{ word.word }}</h3>
          
          <!-- Menu for actions -->
          <Menu as="div" class="relative" @click.stop>
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
              <MenuItems class="absolute right-0 mt-2 w-32 bg-primary border border-color rounded-md shadow-lg z-10">
                <div class="py-1">
                  <MenuItem>
                    <button
                      @click="$emit('edit', word)"
                      class="block w-full text-left px-3 py-2 text-sm hover:bg-secondary transition-colors"
                    >
                      {{ $t('words.edit') }}
                    </button>
                  </MenuItem>
                  <MenuItem>
                    <button
                      @click="$emit('delete', word)"
                      class="block w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-secondary transition-colors"
                    >
                      {{ $t('words.delete') }}
                    </button>
                  </MenuItem>
                </div>
              </MenuItems>
            </transition>
          </Menu>
        </div>
        
        <!-- Part of speech -->
        <div v-if="word.partOfSpeech" class="flex items-center">
          <span class="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded-md font-medium">
            {{ word.partOfSpeech }}
          </span>
        </div>
        
        <!-- Definition -->
        <div v-if="word.definition" class="text-sm text-secondary">
          <p class="line-clamp-3">{{ word.definition }}</p>
        </div>
        
        <!-- Usage statistics -->
        <div class="flex justify-between items-center text-xs text-muted pt-2 border-t border-color">
          <span>{{ $t('words.usageCount', { count: word.usageCount }) }}</span>
          <span>{{ formatDate(word.createdAt) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import { CheckIcon, EllipsisVerticalIcon } from '@heroicons/vue/24/outline'
import { useI18n } from 'vue-i18n'

interface Props {
  word: {
    _id: string
    word: string
    definition?: string
    partOfSpeech?: string
    usageCount: number
    createdAt: string
  }
  selected: boolean
}

defineProps<Props>()

defineEmits<{
  'toggle-select': []
  'edit': [word: Props['word']]
  'delete': [word: Props['word']]
}>()

const { t } = useI18n()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) {
    return t('date.today')
  } else if (diffInDays === 1) {
    return t('date.yesterday')
  } else if (diffInDays < 7) {
    return t('date.daysAgo', { count: diffInDays })
  } else {
    return date.toLocaleDateString()
  }
}
</script>

<style scoped>
/* Line clamp utility for text truncation */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style> 