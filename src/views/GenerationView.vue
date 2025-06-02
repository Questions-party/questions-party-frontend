<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center min-h-64">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-color"></div>
    </div>
    
    <div v-else-if="error" class="text-center py-12">
      <div class="text-red-500 mb-4">
        <svg class="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/>
        </svg>
      </div>
      <h2 class="text-2xl font-bold text-primary mb-2">{{ $t('common.error') }}</h2>
      <p class="text-muted mb-4">{{ error }}</p>
      <button 
        @click="$router.push('/community')"
        class="btn btn-primary"
      >
        {{ $t('community.title') }}
      </button>
    </div>
    
    <div v-else-if="generation" class="max-w-4xl mx-auto">
      <!-- Back button -->
      <div class="mb-6">
        <button 
          @click="$router.back()"
          class="flex items-center text-accent-color hover:underline"
        >
          <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clip-rule="evenodd"/>
          </svg>
          {{ $t('common.back') }}
        </button>
      </div>
      
      <!-- Generation Card -->
      <GenerationCard 
        :generation="generation" 
        :show-actions="true"
        class="mb-8"
      />
      
      <!-- Share Section -->
      <div class="bg-secondary rounded-lg p-6 border border-color">
        <h3 class="text-lg font-semibold mb-4">{{ $t('generation.share') }}</h3>
        <div class="flex items-center space-x-4">
          <div class="flex-1">
            <input 
              :value="shareUrl"
              readonly
              class="w-full px-3 py-2 border border-color rounded-md bg-primary text-sm"
            />
          </div>
          <button
            @click="copyToClipboard"
            class="btn btn-primary"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
              <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
            </svg>
            {{ $t('generation.linkCopied') }}
          </button>
        </div>
        
        <!-- Social sharing buttons -->
        <div class="mt-4 flex space-x-3">
          <button
            @click="shareToTwitter"
            class="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
            </svg>
            Twitter
          </button>
          
          <button
            @click="shareToFacebook"
            class="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Facebook
          </button>
          
          <button
            @click="shareToLinkedIn"
            class="flex items-center px-4 py-2 bg-blue-700 text-white rounded-md hover:bg-blue-800 transition-colors"
          >
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
            LinkedIn
          </button>
        </div>
      </div>
      
      <!-- Related generations -->
      <div v-if="relatedGenerations.length > 0" class="mt-8">
        <h3 class="text-lg font-semibold mb-4">{{ $t('generation.relatedGenerations') }}</h3>
        <div class="grid gap-4">
          <GenerationCard 
            v-for="relatedGen in relatedGenerations"
            :key="relatedGen._id"
            :generation="relatedGen"
            :show-actions="false"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useI18n } from 'vue-i18n'
import { generationsAPI } from '../services/api.ts'
import GenerationCard from '../components/GenerationCard.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const { t } = useI18n()

const generation = ref(null)
const relatedGenerations = ref([])
const loading = ref(true)
const error = ref('')

const shareUrl = computed(() => {
  return `${window.location.origin}/generation/${route.params.id}`
})

const fetchGeneration = async () => {
  try {
    loading.value = true
    const response = await generationsAPI.getGeneration(route.params.id as string)
    
    if (response.data.success) {
      generation.value = response.data.generation
      
      // Fetch related generations (same user or similar words)
      if (generation.value) {
        await fetchRelatedGenerations()
      }
    } else {
      error.value = response.data.message || t('common.error')
    }
  } catch (err: any) {
    error.value = err.response?.data?.message || t('common.error')
  } finally {
    loading.value = false
  }
}

const fetchRelatedGenerations = async () => {
  try {
    const response = await generationsAPI.getPublicGenerations({
      limit: 3,
      exclude: generation.value._id
    })
    
    if (response.data.success) {
      relatedGenerations.value = response.data.generations.slice(0, 3)
    }
  } catch (err) {
    console.error('Failed to fetch related generations:', err)
  }
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(shareUrl.value)
    toast.success(t('generation.linkCopied'))
  } catch (err) {
    toast.error(t('generation.linkCopyFailed'))
  }
}

const shareToTwitter = () => {
  const text = `Check out this AI-generated sentence: "${generation.value.sentence}"`
  const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl.value)}`
  window.open(url, '_blank')
}

const shareToFacebook = () => {
  const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl.value)}`
  window.open(url, '_blank')
}

const shareToLinkedIn = () => {
  const title = 'AI-Generated English Sentence'
  const summary = `Check out this AI-generated sentence: "${generation.value.sentence}"`
  const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl.value)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(summary)}`
  window.open(url, '_blank')
}

onMounted(() => {
  fetchGeneration()
})
</script> 