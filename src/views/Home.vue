<template>
  <div class="space-y-12">
    <!-- Hero Section -->
    <section class="text-center space-y-6">
      <div class="space-y-4">
        <h1 class="text-4xl sm:text-5xl font-bold text-primary mb-4">
          {{ $t('home.title') }}
        </h1>
        <p class="text-xl text-secondary max-w-3xl mx-auto">
          {{ $t('home.subtitle') }}
        </p>
      </div>
      
      <!-- AI Provider Badge -->
      <div class="flex justify-center">
        <div class="inline-flex items-center px-4 py-2 rounded-full text-sm bg-gradient-to-r from-purple-100 to-blue-100 text-purple-800 dark:from-purple-900/20 dark:to-blue-900/20 dark:text-purple-300">
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          {{ $t('home.poweredBy') }}
        </div>
      </div>

      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <router-link
          v-if="!authStore.isAuthenticated"
          to="/register"
          class="btn btn-primary btn-lg"
        >
          <UserPlusIcon class="w-5 h-5 mr-2" />
          {{ $t('home.getStartedFree') }}
        </router-link>
        <router-link
          v-else
          to="/generate"
          class="btn btn-primary btn-lg"
        >
          <SparklesIcon class="w-5 h-5 mr-2" />
          {{ $t('home.generateSentences') }}
        </router-link>
        
        <router-link
          to="/community"
          class="btn btn-secondary btn-lg"
        >
          <UsersIcon class="w-5 h-5 mr-2" />
          {{ $t('home.browseCommunity') }}
        </router-link>
      </div>
    </section>

    <!-- Features Grid -->
    <section class="grid md:grid-cols-3 gap-8">
      <div class="text-center space-y-4">
        <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center mx-auto">
          <SparklesIcon class="w-6 h-6 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 class="text-xl font-semibold">{{ $t('home.features.aiEnhanced') }}</h3>
        <p class="text-secondary">
          {{ $t('home.features.aiEnhancedDesc') }}
        </p>
      </div>

      <div class="text-center space-y-4">
        <div class="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center mx-auto">
          <EyeIcon class="w-6 h-6 text-green-600 dark:text-green-400" />
        </div>
        <h3 class="text-xl font-semibold">{{ $t('home.features.publicAccess') }}</h3>
        <p class="text-secondary">
          {{ $t('home.features.publicAccessDesc') }}
        </p>
      </div>

      <div class="text-center space-y-4">
        <div class="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center mx-auto">
          <AcademicCapIcon class="w-6 h-6 text-purple-600 dark:text-purple-400" />
        </div>
        <h3 class="text-xl font-semibold">{{ $t('home.features.grammarInsights') }}</h3>
        <p class="text-secondary">
          {{ $t('home.features.grammarInsightsDesc') }}
        </p>
      </div>
    </section>

    <!-- How It Works -->
    <section class="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-8">
      <div class="text-center mb-8">
        <h2 class="text-3xl font-bold mb-4">{{ $t('home.howItWorks.title') }}</h2>
        <p class="text-secondary max-w-2xl mx-auto">
          {{ $t('home.howItWorks.subtitle') }}
        </p>
      </div>

      <div class="grid md:grid-cols-4 gap-6">
        <div class="text-center space-y-3">
          <div class="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">
            1
          </div>
          <h4 class="font-semibold">{{ $t('home.howItWorks.step1') }}</h4>
          <p class="text-sm text-secondary">{{ $t('home.howItWorks.step1Desc') }}</p>
        </div>

        <div class="text-center space-y-3">
          <div class="w-10 h-10 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">
            2
          </div>
          <h4 class="font-semibold">{{ $t('home.howItWorks.step2') }}</h4>
          <p class="text-sm text-secondary">{{ $t('home.howItWorks.step2Desc') }}</p>
        </div>

        <div class="text-center space-y-3">
          <div class="w-10 h-10 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">
            3
          </div>
          <h4 class="font-semibold">{{ $t('home.howItWorks.step3') }}</h4>
          <p class="text-sm text-secondary">{{ $t('home.howItWorks.step3Desc') }}</p>
        </div>

        <div class="text-center space-y-3">
          <div class="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto font-bold">
            4
          </div>
          <h4 class="font-semibold">{{ $t('home.howItWorks.step4') }}</h4>
          <p class="text-sm text-secondary">{{ $t('home.howItWorks.step4Desc') }}</p>
        </div>
      </div>
    </section>

    <!-- Statistics -->
    <section class="text-center space-y-8">
      <h2 class="text-3xl font-bold">{{ $t('home.statistics.title') }}</h2>
      
      <div v-if="statisticsLoading" class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
      
      <div v-else class="grid sm:grid-cols-3 gap-8">
        <div class="space-y-2">
          <div class="text-4xl font-bold text-blue-600">
            {{ formattedStats?.aiGeneratedSentences || '0' }}
          </div>
          <p class="text-secondary">{{ $t('home.statistics.aiGeneratedSentences') }}</p>
        </div>
        
        <div class="space-y-2">
          <div class="text-4xl font-bold text-green-600">
            {{ formattedStats?.wordsPracticed || '0' }}
          </div>
          <p class="text-secondary">{{ $t('home.statistics.wordsPracticed') }}</p>
        </div>
        
        <div class="space-y-2">
          <div class="text-4xl font-bold text-purple-600">
            {{ formattedStats?.activeLearners || '0' }}
          </div>
          <p class="text-secondary">{{ $t('home.statistics.activeLearners') }}</p>
        </div>
      </div>
    </section>

    <!-- Enhanced CTA Section -->
    <section class="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white text-center">
      <div class="space-y-6">
        <h2 class="text-3xl font-bold">{{ $t('home.cta.title') }}</h2>
        <p class="text-blue-100 max-w-2xl mx-auto">
          {{ $t('home.cta.subtitle') }}
        </p>
        
        <!-- Feature highlights for CTA -->
        <div class="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-sm">
          <div class="flex items-center justify-center space-x-2">
            <CheckCircleIcon class="w-5 h-5 text-green-300" />
            <span>{{ $t('home.cta.freeToStart') }}</span>
          </div>
          <div class="flex items-center justify-center space-x-2">
            <CheckCircleIcon class="w-5 h-5 text-green-300" />
            <span>{{ $t('home.cta.noCreditCard') }}</span>
          </div>
          <div class="flex items-center justify-center space-x-2">
            <CheckCircleIcon class="w-5 h-5 text-green-300" />
            <span>{{ $t('home.cta.instantAccess') }}</span>
          </div>
        </div>
        
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            v-if="!authStore.isAuthenticated"
            to="/register"
            class="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            {{ $t('home.cta.startLearningNow') }}
          </router-link>
          <router-link
            v-else
            to="/generate"
            class="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            {{ $t('home.cta.createFirstSentence') }}
          </router-link>
          
          <router-link
            to="/community"
            class="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            {{ $t('home.cta.exploreCommunity') }}
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import {
  SparklesIcon,
  UsersIcon,
  UserPlusIcon,
  EyeIcon,
  AcademicCapIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth.ts'
import { statistics } from '../stores/statistics.ts'

const authStore = useAuthStore()

// Statistics composable
const { formattedStats, loading: statisticsLoading, fetchStatistics } = statistics()

// Fetch statistics when component mounts
onMounted(() => {
  fetchStatistics()
})
</script>

<style scoped>
.btn-lg {
  @apply px-8 py-4 text-lg;
}
</style> 