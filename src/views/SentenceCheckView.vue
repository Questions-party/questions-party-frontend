<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <div class="spinner-lg mx-auto mb-4"></div>
      <p class="text-secondary">{{ $t('common.loading') }}...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-center py-12">
      <ExclamationTriangleIcon class="w-16 h-16 text-red-400 mx-auto mb-4" />
      <h3 class="text-lg font-medium text-primary mb-2">{{ $t('sentenceCheck.notFound') }}</h3>
      <p class="text-secondary mb-4">{{ error }}</p>
      <router-link to="/check" class="btn btn-primary">
        {{ $t('sentenceCheck.checkNewSentence') }}
      </router-link>
    </div>

    <!-- Sentence Check Display -->
    <div v-else-if="sentenceCheck">
      <!-- Back Button -->
      <div class="mb-6">
        <button 
          @click="$router.go(-1)"
          class="btn btn-ghost btn-sm"
        >
          <ArrowLeftIcon class="w-4 h-4 mr-2" />
          {{ $t('common.back') }}
        </button>
      </div>

      <!-- Header -->
<!--      <div class="text-center space-y-4 mb-8">-->
<!--        <h1 class="text-3xl font-bold text-primary">{{ $t('sentenceCheck.title') }}</h1>-->
<!--        <div class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 dark:from-green-900/20 dark:to-emerald-900/20 dark:text-green-300">-->
<!--          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">-->
<!--            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>-->
<!--          </svg>-->
<!--          {{ $t('sentenceCheck.poweredBy') }}-->
<!--        </div>-->
<!--      </div>-->

      <!-- Main Sentence Check Display -->
      <GenerationSentenceCard
        :sentence-check="sentenceCheck"
        :show-actions="true"
      />

      <!-- Actions -->
      <div class="flex flex-col sm:flex-row gap-3 mt-8">
        <router-link 
          to="/check" 
          class="btn btn-primary flex-1"
        >
          <CheckCircleIcon class="w-4 h-4 mr-2" />
          {{ $t('sentenceCheck.checkNewSentence') }}
        </router-link>
        
        <router-link 
          v-if="sentenceCheck.isPublic"
          to="/community" 
          class="btn btn-secondary flex-1"
        >
          <UsersIcon class="w-4 h-4 mr-2" />
          {{ $t('sentenceCheck.browseCommunityChecks') }}
        </router-link>
        
        <router-link 
          v-if="authStore.isAuthenticated && isOwnSentenceCheck"
          to="/profile" 
          class="btn btn-ghost flex-1"
        >
          <UserIcon class="w-4 h-4 mr-2" />
          {{ $t('sentenceCheck.viewAllChecks') }}
        </router-link>
      </div>

      <!-- Related Actions for Authenticated Users -->
      <div v-if="authStore.isAuthenticated" class="text-center mt-8">
        <p class="text-secondary mb-4">{{ $t('sentenceCheck.likeWhat') }}</p>
        <div class="flex flex-col sm:flex-row gap-3 justify-center max-w-md mx-auto">
          <router-link to="/check" class="btn btn-ghost btn-sm">
            {{ $t('sentenceCheck.checkSimilar') }}
          </router-link>
          <router-link to="/community" class="btn btn-ghost btn-sm">
            {{ $t('sentenceCheck.exploreMore') }}
          </router-link>
        </div>
      </div>

      <!-- Call to Action for Guests -->
      <div v-else class="text-center py-8 mt-8 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-2xl border border-green-200 dark:border-green-800">
        <div class="space-y-6">
          <div>
            <h3 class="text-2xl font-bold mb-3">{{ $t('sentenceCheck.joinCommunity') }}</h3>
            <p class="text-secondary max-w-2xl mx-auto mb-4">
              {{ $t('sentenceCheck.joinDesc') }}
            </p>
          </div>

          <!-- Feature highlights -->
          <div class="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-sm">
            <div class="flex items-center space-x-2">
              <CheckCircleIcon class="w-5 h-5 text-green-600" />
              <span>{{ $t('sentenceCheck.aiAnalysis') }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <AcademicCapIcon class="w-5 h-5 text-blue-600" />
              <span>{{ $t('sentenceCheck.grammarCorrections') }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <UsersIcon class="w-5 h-5 text-purple-600" />
              <span>{{ $t('sentenceCheck.communityLearning') }}</span>
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            <router-link class="btn btn-primary" to="/register">
              <UserPlusIcon class="w-4 h-4 mr-2" />
              {{ $t('sentenceCheck.getStartedFree') }}
            </router-link>
            <router-link class="btn btn-secondary" to="/login">
              {{ $t('sentenceCheck.signIn') }}
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { 
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  UsersIcon,
  UserIcon,
  UserPlusIcon,
  AcademicCapIcon
} from '@heroicons/vue/24/outline'
import { useSentenceCheckStore } from '../stores/sentenceCheck.ts'
import { useAuthStore } from '../stores/auth.ts'
import GenerationSentenceCard from '../components/GenerationSentenceCard.vue'
import { useI18n } from 'vue-i18n'

const route = useRoute()
const sentenceCheckStore = useSentenceCheckStore()
const authStore = useAuthStore()
const { t } = useI18n()

const sentenceCheck = ref(null)
const loading = ref(true)
const error = ref('')

const isOwnSentenceCheck = computed(() => {
  return authStore.user?.id === sentenceCheck.value?.userId._id
})

onMounted(async () => {
  const id = route.params.id as string
  if (id) {
    try {
      const result = await sentenceCheckStore.getSentenceCheck(id)
      if (result) {
        sentenceCheck.value = result
      } else {
        error.value = t('sentenceCheck.notFound')
      }
    } catch (err) {
      console.error('Failed to fetch sentence check:', err)
      error.value = t('sentenceCheck.fetchFailed')
    } finally {
      loading.value = false
    }
  } else {
    error.value = t('common.badRequest')
    loading.value = false
  }
})
</script> 