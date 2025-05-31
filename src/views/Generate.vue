<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold text-primary">{{ $t('generation.title') }}</h1>
      <p class="text-secondary max-w-2xl mx-auto">
        {{ $t('generation.selectWords') }}
      </p>
    </div>

    <!-- Selected Words Display -->
    <div v-if="wordsStore.selectedWordsCount > 0" class="card">
      <div class="card-header">
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-semibold">
            Selected Words ({{ wordsStore.selectedWordsCount }}/20)
          </h3>
          <button
            @click="wordsStore.deselectAllWords()"
            class="btn btn-ghost btn-sm"
          >
            Clear All
          </button>
        </div>
      </div>
      <div class="card-body">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="wordId in wordsStore.selectedWords"
            :key="wordId"
            class="word-tag selected cursor-pointer"
            @click="wordsStore.toggleWordSelection(wordId)"
          >
            {{ getWordById(wordId)?.word }}
            <XMarkIcon class="w-3 h-3 ml-1" />
          </span>
        </div>
      </div>
    </div>

    <!-- Word Selection Grid -->
    <div class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-lg font-semibold">Choose Words</h3>
        <div class="flex items-center space-x-2">
          <button
            @click="refreshWords"
            :disabled="wordsStore.loading"
            class="btn btn-ghost btn-sm"
          >
            <ArrowPathIcon class="w-4 h-4 mr-1" :class="{ 'animate-spin': wordsStore.loading }" />
            Refresh
          </button>
          <router-link to="/words" class="btn btn-ghost btn-sm">
            Manage Words
          </router-link>
        </div>
      </div>

      <div v-if="wordsStore.words.length === 0" class="text-center py-12">
        <BookOpenIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 class="text-lg font-medium text-primary mb-2">No words available</h3>
        <p class="text-secondary mb-4">Add some words to your collection first!</p>
        <router-link to="/words" class="btn btn-primary">
          <PlusIcon class="w-4 h-4 mr-2" />
          Add Words
        </router-link>
      </div>

      <div v-else class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        <button
          v-for="word in wordsStore.words"
          :key="word._id"
          @click="wordsStore.toggleWordSelection(word._id)"
          class="word-tag transition-all duration-200"
          :class="{
            'selected': wordsStore.isWordSelected(word._id),
            'opacity-50 cursor-not-allowed': !wordsStore.isWordSelected(word._id) && wordsStore.selectedWordsCount >= 20
          }"
          :disabled="!wordsStore.isWordSelected(word._id) && wordsStore.selectedWordsCount >= 20"
        >
          {{ word.word }}
        </button>
      </div>
    </div>

    <!-- Generation Controls -->
    <div v-if="wordsStore.canGenerate" class="space-y-4">
      <div class="card">
        <div class="card-body">
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <input
                id="isPublic"
                v-model="isPublic"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label for="isPublic" class="text-sm font-medium text-primary">
                {{ $t('generation.makePublic') }}
              </label>
            </div>

            <button
              @click="generateSentence"
              :disabled="generationsStore.generating || !wordsStore.canGenerate"
              class="w-full btn btn-primary btn-lg"
            >
              <div v-if="generationsStore.generating" class="spinner mr-2"></div>
              <SparklesIcon v-else class="w-5 h-5 mr-2" />
              {{ generationsStore.generating ? $t('generation.generating') : $t('generation.generate') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Generated Result -->
    <transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-1"
    >
      <div v-if="generationsStore.currentGeneration" class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-semibold">Generated Result</h3>
          <div class="flex items-center space-x-2">
            <button
              @click="regenerateWithSameWords"
              :disabled="generationsStore.generating"
              class="btn btn-secondary btn-sm"
            >
              <ArrowPathIcon class="w-4 h-4 mr-1" />
              {{ $t('generation.regenerate') }}
            </button>
            <button
              @click="shareGeneration"
              class="btn btn-ghost btn-sm"
            >
              <ShareIcon class="w-4 h-4 mr-1" />
              Share
            </button>
          </div>
        </div>

        <GenerationCard
          :generation="generationsStore.currentGeneration"
          :show-actions="true"
        />

        <!-- Quick Actions -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            @click="generateWithNewWords"
            class="btn btn-primary flex-1"
          >
            Generate with Different Words
          </button>
          <button
            @click="saveAndContinue"
            class="btn btn-secondary flex-1"
          >
            Save & Generate Another
          </button>
        </div>
      </div>
    </transition>

    <!-- Recent Generations -->
    <div v-if="generationsStore.generations.length > 0" class="space-y-4">
      <div class="flex justify-between items-center">
        <h3 class="text-xl font-semibold">Your Recent Generations</h3>
        <span class="text-sm text-secondary">
          {{ generationsStore.generations.length }} total
        </span>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <GenerationCard
          v-for="generation in generationsStore.sortedGenerations.slice(0, 4)"
          :key="generation._id"
          :generation="generation"
          :show-actions="true"
        />
      </div>

      <div class="text-center">
        <router-link to="/profile" class="btn btn-ghost">
          View All Generations →
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { 
  SparklesIcon, 
  BookOpenIcon, 
  PlusIcon, 
  XMarkIcon, 
  ArrowPathIcon,
  ShareIcon
} from '@heroicons/vue/24/outline'
import { useWordsStore } from '../stores/words'
import { useGenerationsStore } from '../stores/generations'
import { useToast } from 'vue-toastification'
import GenerationCard from '../components/GenerationCard.vue'

const wordsStore = useWordsStore()
const generationsStore = useGenerationsStore()
const toast = useToast()

const isPublic = ref(true)

onMounted(async () => {
  if (wordsStore.words.length === 0) {
    await wordsStore.fetchWords()
  }
  
  if (generationsStore.generations.length === 0) {
    await generationsStore.fetchUserGenerations()
  }
})

const getWordById = (wordId: string) => {
  return wordsStore.words.find(w => w._id === wordId)
}

const refreshWords = async () => {
  await wordsStore.fetchWords()
}

const generateSentence = async () => {
  const selectedWords = wordsStore.getSelectedWordsText()
  
  if (selectedWords.length === 0) {
    toast.warning('Please select at least one word')
    return
  }

  const result = await generationsStore.generateSentence({
    words: selectedWords,
    isPublic: isPublic.value
  })

  if (result.success) {
    // Keep words selected for potential regeneration
  }
}

const regenerateWithSameWords = async () => {
  await generateSentence()
}

const generateWithNewWords = () => {
  wordsStore.deselectAllWords()
  generationsStore.clearCurrentGeneration()
}

const saveAndContinue = () => {
  generationsStore.clearCurrentGeneration()
  // Keep current word selection for convenience
}

const shareGeneration = async () => {
  const generation = generationsStore.currentGeneration
  if (!generation) return

  if (navigator.share) {
    try {
      await navigator.share({
        title: 'English Learning - Generated Sentence',
        text: `"${generation.sentence}" - Generated using words: ${generation.words.join(', ')}`,
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
  const generation = generationsStore.currentGeneration
  if (!generation) return

  const text = `"${generation.sentence}" - Generated using words: ${generation.words.join(', ')}`
  try {
    await navigator.clipboard.writeText(text)
    toast.success('Generation copied to clipboard!')
  } catch (error) {
    toast.error('Failed to copy to clipboard')
  }
}
</script>

<style scoped>
.btn-lg {
  @apply px-8 py-4 text-lg;
}
</style> 