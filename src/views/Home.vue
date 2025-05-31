<template>
  <div class="space-y-12">
    <!-- Hero Section -->
    <section class="text-center space-y-6">
      <div class="space-y-4">
        <h1 class="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
          Learn English with AI
        </h1>
        <p class="text-xl text-secondary max-w-3xl mx-auto leading-relaxed">
          Build your vocabulary, generate sentences with AI assistance, and learn from a vibrant community of English learners worldwide.
        </p>
      </div>
      
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <router-link 
          v-if="!authStore.isAuthenticated" 
          to="/register" 
          class="btn btn-primary btn-lg"
        >
          {{ $t('nav.register') }}
        </router-link>
        <router-link 
          v-if="authStore.isAuthenticated" 
          to="/words" 
          class="btn btn-primary btn-lg"
        >
          {{ $t('nav.words') }}
        </router-link>
        <router-link to="/community" class="btn btn-secondary btn-lg">
          {{ $t('nav.community') }}
        </router-link>
      </div>
    </section>

    <!-- Features Section -->
    <section class="grid md:grid-cols-3 gap-8">
      <div class="card text-center">
        <div class="card-body space-y-4">
          <div class="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
            <BookOpenIcon class="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 class="text-xl font-semibold">Build Your Vocabulary</h3>
          <p class="text-secondary">
            Add words to your personal collection and track your learning progress with detailed usage statistics.
          </p>
        </div>
      </div>

      <div class="card text-center">
        <div class="card-body space-y-4">
          <div class="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
            <SparklesIcon class="w-8 h-8 text-purple-600 dark:text-purple-400" />
          </div>
          <h3 class="text-xl font-semibold">AI-Powered Generation</h3>
          <p class="text-secondary">
            Generate natural sentences using your words with advanced AI and get detailed grammar explanations.
          </p>
        </div>
      </div>

      <div class="card text-center">
        <div class="card-body space-y-4">
          <div class="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
            <UsersIcon class="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
          <h3 class="text-xl font-semibold">Community Learning</h3>
          <p class="text-secondary">
            Share your generations with others, explore community content, and learn from fellow learners.
          </p>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="space-y-8">
      <h2 class="text-3xl font-bold text-center">How It Works</h2>
      
      <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="text-center space-y-3">
          <div class="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">
            1
          </div>
          <h4 class="font-semibold">Add Words</h4>
          <p class="text-sm text-secondary">Build your personal vocabulary collection</p>
        </div>

        <div class="text-center space-y-3">
          <div class="w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">
            2
          </div>
          <h4 class="font-semibold">Select & Generate</h4>
          <p class="text-sm text-secondary">Choose words and let AI create sentences</p>
        </div>

        <div class="text-center space-y-3">
          <div class="w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">
            3
          </div>
          <h4 class="font-semibold">Learn Grammar</h4>
          <p class="text-sm text-secondary">Get detailed explanations and syntax analysis</p>
        </div>

        <div class="text-center space-y-3">
          <div class="w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center mx-auto font-bold text-lg">
            4
          </div>
          <h4 class="font-semibold">Share & Explore</h4>
          <p class="text-sm text-secondary">Connect with the learning community</p>
        </div>
      </div>
    </section>

    <!-- Recent Community Activity -->
    <section v-if="recentGenerations.length > 0" class="space-y-6">
      <div class="flex justify-between items-center">
        <h2 class="text-2xl font-bold">Recent Community Activity</h2>
        <router-link to="/community" class="text-accent-color hover:underline">
          View All →
        </router-link>
      </div>
      
      <div class="grid md:grid-cols-2 gap-6">
        <GenerationCard
          v-for="generation in recentGenerations.slice(0, 4)"
          :key="generation._id"
          :generation="generation"
          :show-actions="false"
        />
      </div>
    </section>

    <!-- Call to Action -->
    <section v-if="!authStore.isAuthenticated" class="text-center py-12 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl">
      <div class="space-y-4">
        <h2 class="text-3xl font-bold">Ready to Start Learning?</h2>
        <p class="text-lg text-secondary max-w-2xl mx-auto">
          Join thousands of learners who are improving their English with AI-powered sentence generation.
        </p>
        <router-link to="/register" class="btn btn-primary btn-lg">
          Get Started Free
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { BookOpenIcon, SparklesIcon, UsersIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'
import { useGenerationsStore } from '../stores/generations'
import GenerationCard from '../components/GenerationCard.vue'

const authStore = useAuthStore()
const generationsStore = useGenerationsStore()

const recentGenerations = ref([])

onMounted(async () => {
  // Fetch some recent public generations for the home page
  try {
    await generationsStore.fetchPublicGenerations(1, 'recent')
    recentGenerations.value = generationsStore.publicGenerations
  } catch (error) {
    console.error('Failed to fetch recent generations:', error)
  }
})
</script>

<style scoped>
.btn-lg {
  @apply px-8 py-4 text-lg;
}
</style> 