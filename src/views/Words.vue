<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 class="text-3xl font-bold text-primary">{{ $t('words.myWords') }}</h1>
        <p class="text-secondary mt-1">
          {{ $t('words.manageProgress') }}
        </p>
      </div>

      <div class="flex items-center space-x-3">
        <button
            class="btn btn-primary"
            @click="showAddForm = !showAddForm"
        >
          <PlusIcon class="w-4 h-4 mr-2"/>
          {{ $t('words.add') }}
        </button>

        <div class="flex items-center space-x-2">
          <select
            v-model="randomWordCount"
            class="input py-2 px-3 text-sm"
          >
            <option value="5">5 {{ $t('words.words') }}</option>
            <option value="10">10 {{ $t('words.words') }}</option>
            <option value="15">15 {{ $t('words.words') }}</option>
            <option value="20">20 {{ $t('words.words') }}</option>
            <option value="30">30 {{ $t('words.words') }}</option>
          </select>

          <button
              :disabled="wordsStore.loading"
              class="btn btn-secondary whitespace-nowrap"
              @click="fetchRandomWords"
          >
            <ArrowPathIcon :class="{ 'animate-spin': loadingRandom }" class="w-4 h-4 mr-2"/>
            {{ $t('words.randomWords') }}
          </button>
        </div>
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
          <form class="space-y-4" @submit.prevent="addWord">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-primary" for="word">
                  {{ $t('words.word') }} *
                </label>
                <input
                    id="word"
                    v-model="newWord.word"
                    :placeholder="$t('words.enterWord')"
                    class="input mt-1"
                    required
                    type="text"
                />
                <p class="text-xs text-secondary mt-1">
                  {{ $t('words.spellingWillBeChecked') }}
                </p>
              </div>

              <div class="flex items-end md:items-center">
                <button
                    :disabled="wordsStore.loading || !newWord.word.trim()"
                    class="btn btn-primary w-full"
                    type="submit"
                >
                  <div v-if="wordsStore.loading" class="spinner mr-2"></div>
                  {{ $t('words.add') }}
                </button>
              </div>
            </div>

            <!-- Show spelling suggestions if available -->
            <div v-if="spellingError && spellingSuggestions.length > 0" class="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
              <p class="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                {{ $t('words.didYouMean') }}
              </p>
              <div class="flex flex-wrap gap-2">
                <button
                    v-for="suggestion in spellingSuggestions"
                    :key="suggestion"
                    @click="selectSuggestion(suggestion)"
                    class="text-xs bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors"
                >
                  {{ suggestion }}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </transition>

    <!-- Filters and Search -->
    <div v-if="wordsStore.words.length > 0" class="card">
      <div class="card-body">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Search -->
          <div>
            <label class="block text-sm font-medium text-primary mb-2">
              {{ $t('words.search') }}
            </label>
            <input
                v-model="searchQuery"
                :placeholder="$t('words.searchWords')"
                class="input"
                type="text"
                @input="debouncedSearch"
            />
          </div>

          <!-- Part of Speech Filter -->
          <div>
            <label class="block text-sm font-medium text-primary mb-2">
              {{ $t('words.filterByPartOfSpeech') }}
            </label>
            <select v-model="selectedFilter" class="input" @change="applyFilter">
              <option value="all">{{ $t('words.allPartsOfSpeech') }}</option>
              <option v-for="pos in wordsStore.partsOfSpeech" :key="pos" :value="pos">
                {{ $t(`words.${pos}`) }}
              </option>
            </select>
          </div>

          <!-- Clear Filters -->
          <div class="flex items-end">
            <button
                @click="clearFilters"
                :disabled="selectedFilter === 'all' && !searchQuery.trim()"
                class="btn btn-ghost w-full"
            >
              {{ $t('words.clearFilters') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Words Selection Controls -->
    <div v-if="wordsStore.words.length > 0"
         class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="flex items-center space-x-4">
        <span class="text-sm text-secondary">
          {{ $t('words.selectedCount', {count: wordsStore.selectedWordsCount, total: wordsStore.words.length}) }}
        </span>

        <div class="flex items-center space-x-2">
          <button
              :disabled="wordsStore.selectedWordsCount === Math.min(wordsStore.words.length, 20)"
              class="btn btn-ghost btn-sm"
              @click="wordsStore.selectAllWords()"
          >
            {{ $t('words.selectAll') }}
          </button>

          <button
              :disabled="wordsStore.selectedWordsCount === 0"
              class="btn btn-ghost btn-sm"
              @click="wordsStore.deselectAllWords()"
          >
            {{ $t('words.deselectAll') }}
          </button>
        </div>
      </div>

      <router-link
          v-if="wordsStore.canGenerate"
          class="btn btn-primary"
          to="/generate"
      >
        <SparklesIcon class="w-4 h-4 mr-2"/>
        {{ $t('words.generate') }} ({{ wordsStore.selectedWordsCount }})
      </router-link>
    </div>

    <!-- Words Grid -->
    <div v-if="wordsStore.loading && wordsStore.words.length === 0" class="text-center py-12">
      <div class="spinner-lg mx-auto mb-4"></div>
      <p class="text-secondary">{{ $t('common.loading') }}...</p>
    </div>

    <div v-else-if="wordsStore.words.length === 0" class="text-center py-12">
      <BookOpenIcon class="w-16 h-16 text-gray-400 mx-auto mb-4"/>
      <h3 class="text-lg font-medium text-primary mb-2">{{ $t('words.noWords') }}</h3>
      <p class="text-secondary mb-4">{{ $t('words.buildVocabulary') }}</p>
      <button
          class="btn btn-primary"
          @click="showAddForm = true"
      >
        <PlusIcon class="w-4 h-4 mr-2"/>
        {{ $t('words.add') }}
      </button>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <WordCard
          v-for="word in wordsStore.words"
          :key="word._id"
          :selected="wordsStore.isWordSelected(word._id)"
          :word="word"
          @delete="showDeleteConfirmation"
          @toggle-select="wordsStore.toggleWordSelection(word._id)"
      />
    </div>

    <!-- Random Words Section -->
    <div v-if="randomWords.length > 0" class="space-y-4">
      <div class="flex justify-between items-center">
        <h2 class="text-xl font-semibold">{{ $t('words.randomWords') }}</h2>
        <button
            class="text-sm text-accent-color hover:underline"
            @click="clearRandomWords"
        >
          {{ $t('words.clear') }}
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
                <span v-if="word.partOfSpeech"
                      class="inline-block mt-2 px-2 py-1 bg-gray-100 dark:bg-gray-800 text-xs rounded">
                  {{ $t(`words.${word.partOfSpeech}`) }}
                </span>
              </div>
              <PlusIcon class="w-5 h-5 text-gray-400"/>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <ConfirmDialog
      :show="showDeleteModal"
      :title="$t('words.delete') + ' ' + $t('words.word')"
      :message="$t('words.deleteConfirm', { word: wordToDelete?.word })"
      :confirm-text="$t('words.delete')"
      :cancel-text="$t('words.cancel')"
      :loading="deleteLoading"
      type="danger"
      @confirm="confirmDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script lang="ts" setup>
import {onMounted, reactive, ref, computed} from 'vue'
import {ArrowPathIcon, BookOpenIcon, PlusIcon, SparklesIcon} from '@heroicons/vue/24/outline'
import {useWordsStore} from '../stores/words.ts'
import WordCard from '../components/WordCard.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import { useI18n } from 'vue-i18n'

const wordsStore = useWordsStore()
const { t } = useI18n()

const showAddForm = ref(false)
const loadingRandom = ref(false)
const randomWords = ref<any[]>([])

// Spelling error handling
const spellingError = ref(false)
const spellingSuggestions = ref<string[]>([])

// Filtering and search
const searchQuery = ref('')
const selectedFilter = ref('all')
const searchTimeout = ref<NodeJS.Timeout | null>(null)

// Delete modal state
const showDeleteModal = ref(false)
const wordToDelete = ref<any>(null)
const deleteLoading = ref(false)

const newWord = reactive({
  word: ''
})

const randomWordCount = ref(5)

// Computed property for filter options
const filterOptions = computed(() => {
  return [
    { value: 'all', label: t('words.allPartsOfSpeech') },
    ...wordsStore.partsOfSpeech.map(pos => ({
      value: pos,
      label: t(`words.${pos}`)
    }))
  ]
})

onMounted(() => {
  wordsStore.fetchWords()
  wordsStore.fetchPartsOfSpeech()
})

// Debounced search function
const debouncedSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }
  
  searchTimeout.value = setTimeout(() => {
    wordsStore.setSearchQuery(searchQuery.value)
  }, 300)
}

const applyFilter = () => {
  wordsStore.setFilter(selectedFilter.value)
}

const clearFilters = () => {
  searchQuery.value = ''
  selectedFilter.value = 'all'
  wordsStore.clearFilters()
}

const addWord = async () => {
  if (!newWord.word.trim()) return

  spellingError.value = false
  spellingSuggestions.value = []

  const result = await wordsStore.addWord({
    word: newWord.word.trim()
  })

  if (result.success) {
    newWord.word = ''
    showAddForm.value = false
  } else if (result.suggestions) {
    spellingError.value = true
    spellingSuggestions.value = result.suggestions
  }
}

const selectSuggestion = (suggestion: string) => {
  newWord.word = suggestion
  spellingError.value = false
  spellingSuggestions.value = []
}

const showDeleteConfirmation = (word: any) => {
  wordToDelete.value = word
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  wordToDelete.value = null
}

const confirmDelete = async () => {
  if (!wordToDelete.value) return
  
  deleteLoading.value = true
  try {
    await wordsStore.deleteWord(wordToDelete.value._id)
    closeDeleteModal()
  } catch (error) {
    console.error('Failed to delete word:', error)
  } finally {
    deleteLoading.value = false
  }
}

const fetchRandomWords = async () => {
  loadingRandom.value = true
  try {
    const words = await wordsStore.getRandomWords(randomWordCount.value, true)
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
    word: word.word
  })

  if (result.success) {
    randomWords.value = randomWords.value.filter((w: any) => w._id !== word._id)
  }
}
</script> 