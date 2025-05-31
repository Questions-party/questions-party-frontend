<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-primary">{{ $t('words.myWords') }}</h1>
        <p class="text-secondary mt-1">
          Manage your vocabulary collection and track your learning progress
        </p>
      </div>
      
      <div class="flex items-center space-x-3">
        <button
          @click="showAddForm = !showAddForm"
          class="btn btn-primary"
        >
          <PlusIcon class="w-4 h-4 mr-2" />
          {{ $t('words.add') }}
        </button>
        
        <button
          @click="fetchRandomWords"
          :disabled="wordsStore.loading"
          class="btn btn-secondary"
        >
          <ArrowPathIcon class="w-4 h-4 mr-2" :class="{ 'animate-spin': loadingRandom }" />
          {{ $t('words.randomWords') }}
        </button>
      </div>
    </div>

    <!-- Add Word Form -->
    <transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-1"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="transform scale-100 opacity-1"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div v-if="showAddForm" class="card">
        <div class="card-header">
          <h3 class="text-lg font-semibold">{{ $t('words.add') }}</h3>
        </div>
        <div class="card-body">
          <form @submit.prevent="addWord" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="word" class="block text-sm font-medium text-primary">
                  Word *
                </label>
                <input
                  id="word"
                  v-model="newWord.word"
                  type="text"
                  required
                  class="input mt-1"
                  :placeholder="$t('words.enterWord')"
                />
              </div>
              
              <div>
                <label for="partOfSpeech" class="block text-sm font-medium text-primary">
                  {{ $t('words.partOfSpeech') }}
                </label>
                <select
                  id="partOfSpeech"
                  v-model="newWord.partOfSpeech"
                  class="input mt-1"
                >
                  <option value="">Select...</option>
                  <option value="noun">Noun</option>
                  <option value="verb">Verb</option>
                  <option value="adjective">Adjective</option>
                  <option value="adverb">Adverb</option>
                  <option value="preposition">Preposition</option>
                  <option value="conjunction">Conjunction</option>
                  <option value="interjection">Interjection</option>
                  <option value="pronoun">Pronoun</option>
                  <option value="determiner">Determiner</option>
                </select>
              </div>
              
              <div class="flex items-end">
                <button
                  type="submit"
                  :disabled="wordsStore.loading || !newWord.word.trim()"
                  class="btn btn-primary w-full"
                >
                  <div v-if="wordsStore.loading" class="spinner mr-2"></div>
                  {{ $t('words.add') }}
                </button>
              </div>
            </div>
            
            <div>
              <label for="definition" class="block text-sm font-medium text-primary">
                {{ $t('words.definition') }}
              </label>
              <textarea
                id="definition"
                v-model="newWord.definition"
                rows="2"
                class="input mt-1"
                placeholder="Optional definition or notes..."
              ></textarea>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Words Selection Controls -->
    <div v-if="wordsStore.words.length > 0" class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="flex items-center space-x-4">
        <span class="text-sm text-secondary">
          {{ wordsStore.selectedWordsCount }} of {{ wordsStore.words.length }} selected
        </span>
        
        <div class="flex items-center space-x-2">
          <button
            @click="wordsStore.selectAllWords()"
            class="btn btn-ghost btn-sm"
            :disabled="wordsStore.selectedWordsCount === Math.min(wordsStore.words.length, 20)"
          >
            {{ $t('words.selectAll') }}
          </button>
          
          <button
            @click="wordsStore.deselectAllWords()"
            class="btn btn-ghost btn-sm"
            :disabled="wordsStore.selectedWordsCount === 0"
          >
            {{ $t('words.deselectAll') }}
          </button>
        </div>
      </div>
      
      <router-link
        v-if="wordsStore.canGenerate"
        to="/generate"
        class="btn btn-primary"
      >
        <SparklesIcon class="w-4 h-4 mr-2" />
        {{ $t('words.generate') }} ({{ wordsStore.selectedWordsCount }})
      </router-link>
    </div>

    <!-- Words Grid -->
    <div v-if="wordsStore.loading && wordsStore.words.length === 0" class="text-center py-12">
      <div class="spinner-lg mx-auto mb-4"></div>
      <p class="text-secondary">{{ $t('common.loading') }}...</p>
    </div>
    
    <div v-else-if="wordsStore.words.length === 0" class="text-center py-12">
      <BookOpenIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-primary mb-2">{{ $t('words.noWords') }}</h3>
      <p class="text-secondary mb-4">Start building your vocabulary by adding your first word!</p>
      <button
        @click="showAddForm = true"
        class="btn btn-primary"
      >
        <PlusIcon class="w-4 h-4 mr-2" />
        {{ $t('words.add') }}
      </button>
    </div>
    
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <WordCard
        v-for="word in wordsStore.sortedWords"
        :key="word._id"
        :word="word"
        :selected="wordsStore.isWordSelected(word._id)"
        @toggle-select="wordsStore.toggleWordSelection(word._id)"
        @edit="editWord"
        @delete="deleteWord"
      />
    </div>

    <!-- Random Words Section -->
    <div v-if="randomWords.length > 0" class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">{{ $t('words.randomWords') }}</h2>
        <button
          @click="clearRandomWords"
          class="text-sm text-accent-color hover:underline"
        >
          Clear
        </button>
      </div>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="word in randomWords"
          :key="word._id"
          class="card cursor-pointer hover:shadow-lg transition-shadow"
          @click="addRandomWordToCollection(word)"
        >
          <div class="card-body">
            <div class="flex justify-between items-start">
              <div>
                <h4 class="font-medium">{{ word.word }}</h4>
                <p v-if="word.definition" class="text-sm text-secondary mt-1">
                  {{ word.definition }}
                </p>
                <span v-if="word.partOfSpeech" class="inline-block mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded">
                  {{ word.partOfSpeech }}
                </span>
              </div>
              <PlusIcon class="w-5 h-5 text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { 
  PlusIcon, 
  BookOpenIcon, 
  SparklesIcon, 
  ArrowPathIcon 
} from '@heroicons/vue/24/outline'
import { useWordsStore } from '../stores/words'
import { useToast } from 'vue-toastification'
import WordCard from '../components/WordCard.vue'

const wordsStore = useWordsStore()
const toast = useToast()

const showAddForm = ref(false)
const loadingRandom = ref(false)
const randomWords = ref([])

const newWord = reactive({
  word: '',
  definition: '',
  partOfSpeech: ''
})

onMounted(() => {
  wordsStore.fetchWords()
})

const addWord = async () => {
  if (!newWord.word.trim()) return
  
  const result = await wordsStore.addWord({
    word: newWord.word.trim(),
    definition: newWord.definition.trim() || undefined,
    partOfSpeech: newWord.partOfSpeech || undefined
  })
  
  if (result.success) {
    newWord.word = ''
    newWord.definition = ''
    newWord.partOfSpeech = ''
    showAddForm.value = false
  }
}

const editWord = (word: any) => {
  // Implement edit functionality
  console.log('Edit word:', word)
}

const deleteWord = async (word: any) => {
  if (confirm(`Are you sure you want to delete "${word.word}"?`)) {
    await wordsStore.deleteWord(word._id)
  }
}

const fetchRandomWords = async () => {
  loadingRandom.value = true
  try {
    const words = await wordsStore.getRandomWords(12, true)
    randomWords.value = words.filter((rw: any) => 
      !wordsStore.words.some((uw: any) => uw.word === rw.word)
    )
  } catch (error) {
    console.error('Failed to fetch random words:', error)
  } finally {
    loadingRandom.value = false
  }
}

const clearRandomWords = () => {
  randomWords.value = []
}

const addRandomWordToCollection = async (word: any) => {
  const result = await wordsStore.addWord({
    word: word.word,
    definition: word.definition,
    partOfSpeech: word.partOfSpeech
  })
  
  if (result.success) {
    randomWords.value = randomWords.value.filter((w: any) => w._id !== word._id)
  }
}
</script> 