<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold text-primary">{{ $t('community.title') }}</h1>
      <p class="text-secondary max-w-2xl mx-auto">
        {{ $t('home.subtitle') }}
      </p>
    </div>

    <!-- Filters and Controls -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
            {{ $t('community.wordGenerations') }}
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
            {{ $t('community.sentenceChecks') }}
          </button>
        </div>

        <!-- Sort Controls -->
        <div class="flex items-center space-x-2">
          <label class="text-sm font-medium text-primary whitespace-nowrap" for="sortBy">
            {{ $t('community.sortBy') }}:
          </label>
          <select
              id="sortBy"
              v-model="currentSortBy"
              class="input py-1 px-2 text-sm"
              @change="handleSortChange"
          >
            <option value="recent">{{ $t('community.recent') }}</option>
            <option value="liked">{{ $t('community.liked') }}</option>
            <option value="trending">{{ $t('community.trending') }}</option>
          </select>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <button
            :disabled="generationsStore.loading"
            class="btn btn-ghost btn-sm"
            @click="refreshGenerations"
        >
          <ArrowPathIcon :class="{ 'animate-spin': generationsStore.loading }" class="w-4 h-4 mr-1"/>
          {{ $t('common.refresh') }}
        </button>

        <router-link
            v-if="authStore.isAuthenticated"
            class="btn btn-primary btn-sm"
            to="/generate"
        >
          <SparklesIcon class="w-4 h-4 mr-1"/>
          {{ $t('community.createYourOwn') }}
        </router-link>

        <!-- Encourage sign up for anonymous users -->
        <router-link
            v-else
            class="btn btn-primary btn-sm"
            to="/register"
        >
          <UserPlusIcon class="w-4 h-4 mr-1"/>
          {{ $t('community.joinToCreate') }}
        </router-link>
      </div>
    </div>

    <!-- Public Access Notice for Anonymous Users -->
    <div v-if="!authStore.isAuthenticated"
         class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
      <div class="flex items-start space-x-3">
        <EyeIcon class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5"/>
        <div>
          <h3 class="text-sm font-medium text-green-800 dark:text-green-200">{{ $t('community.browsingAsGuest') }}</h3>
          <p class="text-sm text-green-700 dark:text-green-300 mt-1">
            {{ $t('community.guestDescription') }}
            <router-link class="underline font-medium" to="/register">{{
                $t('community.createFreeAccount')
              }}
            </router-link>
            .
          </p>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="card text-center">
        <div class="card-body">
          <div v-if="activeContentType === 'generations' ? generationsStore.statisticsLoading : sentenceCheckStore.statisticsLoading" class="text-3xl font-bold text-blue-600 mb-2">
            <div class="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-20 mx-auto rounded"></div>
          </div>
          <div v-else class="text-3xl font-bold text-blue-600 mb-2">
            {{ activeContentType === 'generations' 
              ? generationsStore.statistics.totalGenerations.toLocaleString() 
              : sentenceCheckStore.statistics.totalChecks.toLocaleString() }}
          </div>
          <p class="text-sm text-secondary">
            {{ activeContentType === 'generations' ? $t('community.totalGenerations') : $t('community.totalSentenceChecks') }}
          </p>
        </div>
      </div>
      <div class="card text-center">
        <div class="card-body">
          <div v-if="activeContentType === 'generations' ? generationsStore.statisticsLoading : sentenceCheckStore.statisticsLoading" class="text-3xl font-bold text-green-600 mb-2">
            <div class="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-20 mx-auto rounded"></div>
          </div>
          <div v-else class="text-3xl font-bold text-green-600 mb-2">
            {{ activeContentType === 'generations' 
              ? generationsStore.statistics.totalWords.toLocaleString() 
              : Math.round(sentenceCheckStore.statistics.avgSentenceLength) }}
          </div>
          <p class="text-sm text-secondary">
            {{ activeContentType === 'generations' ? $t('community.totalWords') : $t('community.avgSentenceLength') }}
          </p>
        </div>
      </div>
      <div class="card text-center">
        <div class="card-body">
          <div v-if="activeContentType === 'generations' ? generationsStore.statisticsLoading : sentenceCheckStore.statisticsLoading" class="text-3xl font-bold text-purple-600 mb-2">
            <div class="animate-pulse bg-gray-300 dark:bg-gray-600 h-8 w-20 mx-auto rounded"></div>
          </div>
          <div v-else class="text-3xl font-bold text-purple-600 mb-2">
            {{ activeContentType === 'generations' 
              ? generationsStore.statistics.totalLikes.toLocaleString() 
              : sentenceCheckStore.statistics.totalLikes.toLocaleString() }}
          </div>
          <p class="text-sm text-secondary">{{ $t('community.totalLikes') }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading && getCurrentContent().length === 0" class="text-center py-12">
      <div class="spinner-lg mx-auto mb-4"></div>
      <p class="text-secondary">{{ $t('common.loading') }}...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="getCurrentContent().length === 0" class="text-center py-12">
      <UsersIcon class="w-16 h-16 text-gray-400 mx-auto mb-4"/>
      <h3 class="text-lg font-medium text-primary mb-2">
        {{ activeContentType === 'generations' ? $t('community.noGenerations') : $t('community.noSentenceChecks') }}
      </h3>
      <p class="text-secondary mb-4">
        {{ activeContentType === 'generations' ? $t('community.beFirstToShare') : $t('community.beFirstToCheck') }}
      </p>
      <router-link
          v-if="authStore.isAuthenticated"
          class="btn btn-primary"
          :to="activeContentType === 'generations' ? '/generate' : '/check'"
      >
        <SparklesIcon v-if="activeContentType === 'generations'" class="w-4 h-4 mr-2"/>
        <CheckCircleIcon v-else class="w-4 h-4 mr-2"/>
        {{ activeContentType === 'generations' ? $t('generation.createNew') : $t('sentenceCheck.checkNewSentence') }}
      </router-link>
      <router-link
          v-else
          class="btn btn-primary"
          to="/register"
      >
        {{ $t('community.joinCommunity') }}
      </router-link>
    </div>

    <!-- Content Feed -->
    <div v-else class="space-y-6">
      <!-- Word Generations -->
      <template v-if="activeContentType === 'generations'">
        <GenerationWordsCard
            v-for="generation in generationsStore.publicGenerations"
            :key="generation._id"
            :generation="generation"
            :show-actions="true"
        />
        
        <!-- Load More Button for Generations -->
        <div v-if="generationsStore.publicPagination.hasNext" class="text-center">
          <button
              :disabled="generationsStore.loading"
              class="btn btn-secondary"
              @click="loadMoreGenerations"
          >
            <div v-if="generationsStore.loading" class="spinner mr-2"></div>
            {{ $t('community.loadMore') }}
          </button>
        </div>

        <!-- End of Feed for Generations -->
        <div v-else-if="generationsStore.publicGenerations.length > 0" class="text-center py-8">
          <p class="text-secondary">{{ $t('community.endOfFeed') }}</p>
          <button
              class="btn btn-ghost mt-2"
              @click="refreshContent"
          >
            {{ $t('common.refresh') }}
          </button>
        </div>
      </template>

      <!-- Sentence Checks -->
      <template v-else>
        <GenerationSentenceCard
            v-for="sentenceCheck in sentenceCheckStore.publicSentenceChecks"
            :key="sentenceCheck._id"
            :sentence-check="sentenceCheck"
            :show-actions="true"
        />
        
        <!-- Load More Button for Sentence Checks -->
        <div v-if="sentenceCheckStore.publicPagination.hasNext" class="text-center">
          <button
              :disabled="sentenceCheckStore.loading"
              class="btn btn-secondary"
              @click="loadMoreSentenceChecks"
          >
            <div v-if="sentenceCheckStore.loading" class="spinner mr-2"></div>
            {{ $t('community.loadMore') }}
          </button>
        </div>

        <!-- End of Feed for Sentence Checks -->
        <div v-else-if="sentenceCheckStore.publicSentenceChecks.length > 0" class="text-center py-8">
          <p class="text-secondary">{{ $t('community.endOfFeed') }}</p>
          <button
              class="btn btn-ghost mt-2"
              @click="refreshContent"
          >
            {{ $t('common.refresh') }}
          </button>
        </div>
      </template>
    </div>

    <!-- Enhanced Call to Action for Guest Users -->
    <div v-if="!authStore.isAuthenticated"
         class="text-center py-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
      <div class="space-y-6">
        <div>
          <h3 class="text-2xl font-bold mb-3">{{ $t('community.joinAIPowered') }}</h3>
          <p class="text-secondary max-w-2xl mx-auto mb-4">
            {{ $t('community.createWordCollections') }}
          </p>
        </div>

        <!-- Feature highlights -->
        <div class="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-sm">
          <div class="flex items-center space-x-2">
            <SparklesIcon class="w-5 h-5 text-purple-600"/>
            <span>{{ $t('community.aiSentenceGeneration') }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <AcademicCapIcon class="w-5 h-5 text-blue-600"/>
            <span>{{ $t('community.grammarExplanations') }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <UsersIcon class="w-5 h-5 text-green-600"/>
            <span>{{ $t('community.communityLearning') }}</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <router-link class="btn btn-primary" to="/register">
            <UserPlusIcon class="w-4 h-4 mr-2"/>
            {{ $t('community.getStartedFree') }}
          </router-link>
          <router-link class="btn btn-secondary" to="/login">
            {{ $t('community.signIn') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {onMounted, ref, computed, watch} from 'vue'
import {AcademicCapIcon, ArrowPathIcon, EyeIcon, SparklesIcon, UserPlusIcon, UsersIcon, CheckCircleIcon} from '@heroicons/vue/24/outline'
import {useGenerationsStore} from '../stores/generations.ts'
import {useSentenceCheckStore} from '../stores/sentenceCheck.ts'
import {useAuthStore} from '../stores/auth.ts'
import GenerationWordsCard from '../components/GenerationWordsCard.vue'
import GenerationSentenceCard from '../components/GenerationSentenceCard.vue'

const generationsStore = useGenerationsStore()
const sentenceCheckStore = useSentenceCheckStore()
const authStore = useAuthStore()

const currentSortBy = ref('recent')
const activeContentType = ref('generations')

const isLoading = computed(() => {
  if (activeContentType.value === 'generations') {
    return generationsStore.loading
  } else {
    return sentenceCheckStore.loading
  }
})

const getCurrentContent = () => {
  if (activeContentType.value === 'generations') {
    return generationsStore.publicGenerations
  } else {
    return sentenceCheckStore.publicSentenceChecks
  }
}

// Watch for content type changes and load appropriate data
watch(activeContentType, async (newType) => {
  if (newType === 'generations') {
    await Promise.all([
      loadGenerations(),
      generationsStore.fetchStatistics()
    ])
  } else {
    await Promise.all([
      loadSentenceChecks(),
      sentenceCheckStore.fetchStatistics()
    ])
  }
}, { immediate: false })

onMounted(async () => {
  await Promise.all([
    loadGenerations(),
    generationsStore.fetchStatistics()
  ])
})

const loadGenerations = async () => {
  await generationsStore.fetchPublicGenerations(1, currentSortBy.value)
}

const loadSentenceChecks = async () => {
  await sentenceCheckStore.fetchPublicSentenceChecks(1, currentSortBy.value)
}

const handleSortChange = async () => {
  if (activeContentType.value === 'generations') {
    await generationsStore.refreshPublicGenerations(currentSortBy.value)
  } else {
    await sentenceCheckStore.refreshPublicSentenceChecks(currentSortBy.value)
  }
}

const refreshGenerations = async () => {
  if (activeContentType.value === 'generations') {
    await Promise.all([
      generationsStore.refreshPublicGenerations(currentSortBy.value),
      generationsStore.fetchStatistics()
    ])
  } else {
    await Promise.all([
      sentenceCheckStore.refreshPublicSentenceChecks(currentSortBy.value),
      sentenceCheckStore.fetchStatistics()
    ])
  }
}

const loadMoreGenerations = async () => {
  await generationsStore.loadMorePublicGenerations(currentSortBy.value)
}

const loadMoreSentenceChecks = async () => {
  await sentenceCheckStore.loadMorePublicSentenceChecks(currentSortBy.value)
}

const refreshContent = async () => {
  if (activeContentType.value === 'generations') {
    await Promise.all([
      generationsStore.refreshPublicGenerations(currentSortBy.value),
      generationsStore.fetchStatistics()
    ])
  } else {
    await Promise.all([
      sentenceCheckStore.refreshPublicSentenceChecks(currentSortBy.value),
      sentenceCheckStore.fetchStatistics()
    ])
  }
}
</script> 