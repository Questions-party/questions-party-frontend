<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold text-primary">{{ $t('generation.title') }}</h1>
      <p class="text-secondary max-w-2xl mx-auto">
        {{ $t('generation.selectWords') }}
      </p>
      <div class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 dark:from-purple-900/20 dark:to-blue-900/20 dark:text-purple-300">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
        {{ $t('generation.poweredBy') }}
      </div>
    </div>

    <!-- Authentication Required Notice -->
    <div v-if="!authStore.isAuthenticated" class="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
      <div class="flex items-start space-x-3">
        <ExclamationTriangleIcon class="w-6 h-6 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div class="flex-1">
          <h3 class="text-lg font-medium text-amber-800 dark:text-amber-200 mb-2">{{ $t('generation.authRequired') }}</h3>
          <p class="text-amber-700 dark:text-amber-300 mb-4">
            {{ $t('generation.authRequiredDesc') }}
          </p>
          <div class="flex flex-col sm:flex-row gap-3">
            <router-link to="/login" class="btn btn-primary">
              <UserIcon class="w-4 h-4 mr-2" />
              {{ $t('generation.signIn') }}
            </router-link>
            <router-link to="/register" class="btn btn-secondary">
              <UserPlusIcon class="w-4 h-4 mr-2" />
              {{ $t('generation.createAccount') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- Generation Interface (only for authenticated users) -->
    <div v-else>
      <!-- Selected Words Display -->
      <div v-if="wordsStore.selectedWordsCount > 0" class="card">
        <div class="card-header">
          <div class="flex justify-between items-center">
            <h3 class="text-lg font-semibold">
              {{ $t('generation.selectedWords') }} ({{ wordsStore.selectedWordsCount }}/20)
            </h3>
            <button
              @click="wordsStore.deselectAllWords()"
              class="btn btn-ghost btn-sm"
            >
              {{ $t('generation.clearAll') }}
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
          <h3 class="text-lg font-semibold">{{ $t('generation.chooseWords') }}</h3>
          <div class="flex items-center space-x-2">
            <button
              @click="refreshWords"
              :disabled="wordsStore.loading"
              class="btn btn-ghost btn-sm"
            >
              <ArrowPathIcon class="w-4 h-4 mr-1" :class="{ 'animate-spin': wordsStore.loading }" />
              {{ $t('generation.refresh') }}
            </button>
            <router-link to="/words" class="btn btn-ghost btn-sm">
              {{ $t('generation.manageWords') }}
            </router-link>
          </div>
        </div>

        <div v-if="wordsStore.words.length === 0" class="text-center py-12">
          <BookOpenIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 class="text-lg font-medium text-primary mb-2">{{ $t('generation.noWordsAvailable') }}</h3>
          <p class="text-secondary mb-4">{{ $t('generation.addWordsFirst') }}</p>
          <router-link to="/words" class="btn btn-primary">
            <PlusIcon class="w-4 h-4 mr-2" />
            {{ $t('generation.addWords') }}
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
              <!-- AI Features Info -->
              <div class="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/10 dark:to-blue-900/10 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                <h4 class="font-medium text-sm mb-2 text-primary">{{ $t('generation.aiFeatures') }}</h4>
                <div class="grid sm:grid-cols-2 gap-3 text-sm">
                  <div class="flex items-center space-x-2">
                    <CheckCircleIcon class="w-4 h-4 text-green-600" />
                    <span>{{ $t('generation.grammarExplanation') }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <CheckCircleIcon class="w-4 h-4 text-green-600" />
                    <span>{{ $t('generation.aiReasoning') }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <CheckCircleIcon class="w-4 h-4 text-green-600" />
                    <span>{{ $t('generation.naturalStructure') }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <CheckCircleIcon class="w-4 h-4 text-green-600" />
                    <span>{{ $t('generation.educationalInsights') }}</span>
                  </div>
                </div>
              </div>

              <div class="flex items-center space-x-3">
                <input
                  id="isPublic"
                  v-model="isPublic"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label for="isPublic" class="text-sm font-medium text-primary">
                  {{ $t('generation.makePublic') }} - {{ $t('generation.shareWithCommunity') }}
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
            <h3 class="text-xl font-semibold">{{ $t('generation.generatedResult') }}</h3>
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
                {{ $t('generation.share') }}
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
              {{ $t('generation.generateDifferentWords') }}
            </button>
            <button
              @click="saveAndContinue"
              class="btn btn-secondary flex-1"
            >
              {{ $t('generation.saveAndGenerateAnother') }}
            </button>
          </div>
        </div>
      </transition>

      <!-- Recent Generations -->
      <div v-if="generationsStore.generations.length > 0" class="space-y-4">
        <div class="flex justify-between items-center">
          <h3 class="text-xl font-semibold">{{ $t('generation.yourRecentGenerations') }}</h3>
          <span class="text-sm text-secondary">
            {{ generationsStore.generations.length }} {{ $t('generation.total') }}
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
            {{ $t('generation.viewAllGenerations') }} →
          </router-link>
        </div>
      </div>
    </div>

    <!-- Browse Public Content Suggestion -->
    <div v-if="!authStore.isAuthenticated" class="text-center py-8">
      <p class="text-secondary mb-4">{{ $t('generation.communityPrompt') }}</p>
      <router-link to="/community" class="btn btn-ghost">
        <UsersIcon class="w-4 h-4 mr-2" />
        {{ $t('generation.browsePublicGenerations') }}
      </router-link>
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
  ShareIcon,
  ExclamationTriangleIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'
import { useGenerationsStore } from '../stores/generations'
import { useWordsStore } from '../stores/words'
import { useAuthStore } from '../stores/auth'
import GenerationCard from '../components/GenerationCard.vue'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'

const wordsStore = useWordsStore()
const generationsStore = useGenerationsStore()
const authStore = useAuthStore()
const toast = useToast()
const { t } = useI18n()

const isPublic = ref(true)

onMounted(async () => {
  if (authStore.isAuthenticated) {
    await wordsStore.fetchWords()
    await generationsStore.fetchUserGenerations()
  }
})

const getWordById = (id: string) => {
  return wordsStore.words.find(word => word._id === id)
}

const refreshWords = async () => {
  await wordsStore.fetchWords()
}

const generateSentence = async () => {
  if (!wordsStore.canGenerate) return

  const selectedWordTexts = wordsStore.selectedWords.map(id => {
    const word = getWordById(id)
    return word?.word || ''
  }).filter(Boolean)

  const result = await generationsStore.generateSentence({
    words: selectedWordTexts,
    isPublic: isPublic.value
  })

  if (result.success) {
    // Clear selections after successful generation
    wordsStore.deselectAllWords()
  }
}

const regenerateWithSameWords = async () => {
  if (!generationsStore.currentGeneration) return

  const result = await generationsStore.generateSentence({
    words: generationsStore.currentGeneration.words,
    isPublic: isPublic.value
  })
}

const generateWithNewWords = () => {
  generationsStore.clearCurrentGeneration()
  wordsStore.deselectAllWords()
}

const saveAndContinue = () => {
  generationsStore.clearCurrentGeneration()
  wordsStore.deselectAllWords()
  toast.success('Ready to generate another sentence!')
}

const shareGeneration = () => {
  if (generationsStore.currentGeneration) {
    const url = `${window.location.origin}/generation/${generationsStore.currentGeneration._id}`
    navigator.clipboard.writeText(url).then(() => {
      toast.success(t('generation.linkCopied'))
    }).catch(() => {
      toast.error(t('generation.linkCopyFailed'))
    })
  }
}
</script>

<style scoped>
.btn-lg {
  @apply px-8 py-4 text-lg;
}
</style> 