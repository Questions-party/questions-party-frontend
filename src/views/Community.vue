<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="text-center space-y-4">
      <h1 class="text-3xl font-bold text-primary">{{ $t('community.title') }}</h1>
      <p class="text-secondary max-w-2xl mx-auto">
        {{ $t('home.subtitle') }}
      </p>
      <div class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 dark:from-purple-900/20 dark:to-blue-900/20 dark:text-purple-300">
        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
        </svg>
        {{ $t('home.poweredBy') }}
      </div>
    </div>

    <!-- Filters and Controls -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div class="flex items-center space-x-4">
        <label for="sortBy" class="text-sm font-medium text-primary">
          {{ $t('community.sortBy') }}:
        </label>
        <select
          id="sortBy"
          v-model="currentSortBy"
          @change="handleSortChange"
          class="input py-1 px-2 text-sm"
        >
          <option value="recent">{{ $t('community.recent') }}</option>
          <option value="liked">{{ $t('community.liked') }}</option>
          <option value="trending">{{ $t('community.trending') }}</option>
        </select>
      </div>

      <div class="flex items-center space-x-2">
        <button
          @click="refreshGenerations"
          :disabled="generationsStore.loading"
          class="btn btn-ghost btn-sm"
        >
          <ArrowPathIcon class="w-4 h-4 mr-1" :class="{ 'animate-spin': generationsStore.loading }" />
          {{ $t('common.refresh') }}
        </button>
        
        <router-link
          v-if="authStore.isAuthenticated"
          to="/generate"
          class="btn btn-primary btn-sm"
        >
          <SparklesIcon class="w-4 h-4 mr-1" />
          {{ $t('community.createYourOwn') }}
        </router-link>
        
        <!-- Encourage sign up for anonymous users -->
        <router-link
          v-else
          to="/register"
          class="btn btn-primary btn-sm"
        >
          <UserPlusIcon class="w-4 h-4 mr-1" />
          {{ $t('community.joinToCreate') }}
        </router-link>
      </div>
    </div>

    <!-- Public Access Notice for Anonymous Users -->
    <div v-if="!authStore.isAuthenticated" class="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
      <div class="flex items-start space-x-3">
        <EyeIcon class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
        <div>
          <h3 class="text-sm font-medium text-green-800 dark:text-green-200">{{ $t('community.browsingAsGuest') }}</h3>
          <p class="text-sm text-green-700 dark:text-green-300 mt-1">
            {{ $t('community.guestDescription') }}
            <router-link to="/register" class="underline font-medium">{{ $t('community.createFreeAccount') }}</router-link>.
          </p>
        </div>
      </div>
    </div>

    <!-- Statistics -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <div class="card text-center">
        <div class="card-body">
          <div class="text-3xl font-bold text-blue-600 mb-2">{{ stats.totalGenerations.toLocaleString() }}</div>
          <p class="text-sm text-secondary">{{ $t('community.totalGenerations') }}</p>
        </div>
      </div>
      <div class="card text-center">
        <div class="card-body">
          <div class="text-3xl font-bold text-green-600 mb-2">{{ stats.totalWords.toLocaleString() }}</div>
          <p class="text-sm text-secondary">{{ $t('community.totalWords') }}</p>
        </div>
      </div>
      <div class="card text-center">
        <div class="card-body">
          <div class="text-3xl font-bold text-purple-600 mb-2">{{ stats.totalLikes.toLocaleString() }}</div>
          <p class="text-sm text-secondary">{{ $t('community.totalLikes') }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="generationsStore.loading && generationsStore.publicGenerations.length === 0" class="text-center py-12">
      <div class="spinner-lg mx-auto mb-4"></div>
      <p class="text-secondary">{{ $t('common.loading') }}...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="generationsStore.publicGenerations.length === 0" class="text-center py-12">
      <UsersIcon class="w-16 h-16 text-gray-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-primary mb-2">{{ $t('community.noGenerations') }}</h3>
      <p class="text-secondary mb-4">{{ $t('community.beFirstToShare') }}</p>
      <router-link
        v-if="authStore.isAuthenticated"
        to="/generate"
        class="btn btn-primary"
      >
        <SparklesIcon class="w-4 h-4 mr-2" />
        {{ $t('generation.createNew') }}
      </router-link>
      <router-link
        v-else
        to="/register"
        class="btn btn-primary"
      >
        {{ $t('community.joinCommunity') }}
      </router-link>
    </div>

    <!-- Generations Feed -->
    <div v-else class="space-y-6">
      <GenerationCard
        v-for="generation in generationsStore.publicGenerations"
        :key="generation._id"
        :generation="generation"
        :show-actions="true"
      />

      <!-- Load More Button -->
      <div v-if="generationsStore.publicPagination.hasNext" class="text-center">
        <button
          @click="loadMore"
          :disabled="generationsStore.loading"
          class="btn btn-secondary"
        >
          <div v-if="generationsStore.loading" class="spinner mr-2"></div>
          {{ $t('community.loadMore') }}
        </button>
      </div>

      <!-- End of Feed -->
      <div v-else-if="generationsStore.publicGenerations.length > 0" class="text-center py-8">
        <p class="text-secondary">{{ $t('community.endOfFeed') }}</p>
        <button
          @click="refreshGenerations"
          class="btn btn-ghost mt-2"
        >
          {{ $t('common.refresh') }}
        </button>
      </div>
    </div>

    <!-- Enhanced Call to Action for Guest Users -->
    <div v-if="!authStore.isAuthenticated" class="text-center py-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border border-blue-200 dark:border-blue-800">
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
            <SparklesIcon class="w-5 h-5 text-purple-600" />
            <span>{{ $t('community.aiSentenceGeneration') }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <AcademicCapIcon class="w-5 h-5 text-blue-600" />
            <span>{{ $t('community.grammarExplanations') }}</span>
          </div>
          <div class="flex items-center space-x-2">
            <UsersIcon class="w-5 h-5 text-green-600" />
            <span>{{ $t('community.communityLearning') }}</span>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-3 justify-center">
          <router-link to="/register" class="btn btn-primary">
            <UserPlusIcon class="w-4 h-4 mr-2" />
            {{ $t('community.getStartedFree') }}
          </router-link>
          <router-link to="/login" class="btn btn-secondary">
            {{ $t('community.signIn') }}
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { 
  SparklesIcon, 
  UsersIcon, 
  ArrowPathIcon,
  UserPlusIcon,
  EyeIcon,
  AcademicCapIcon
} from '@heroicons/vue/24/outline'
import { useGenerationsStore } from '../stores/generations'
import { useAuthStore } from '../stores/auth'
import GenerationCard from '../components/GenerationCard.vue'
import { useI18n } from 'vue-i18n'

const generationsStore = useGenerationsStore()
const authStore = useAuthStore()
const { t } = useI18n()

const currentSortBy = ref('recent')

// Enhanced statistics with better formatting
const stats = ref({
  totalGenerations: 12470,
  totalWords: 89320,
  totalLikes: 34560
})

onMounted(async () => {
  await loadGenerations()
})

const loadGenerations = async () => {
  await generationsStore.fetchPublicGenerations(1, currentSortBy.value)
}

const handleSortChange = async () => {
  await generationsStore.refreshPublicGenerations(currentSortBy.value)
}

const refreshGenerations = async () => {
  await generationsStore.refreshPublicGenerations(currentSortBy.value)
}

const loadMore = async () => {
  await generationsStore.loadMorePublicGenerations(currentSortBy.value)
}
</script> 