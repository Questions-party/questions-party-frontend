<template>
  <div class="min-h-screen">
    <!-- Hero Section with Dynamic Background -->
    <section class="relative overflow-hidden bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <!-- Animated Background Elements -->
      <div class="absolute inset-0">
        <div
            class="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div
            class="absolute top-40 right-10 w-72 h-72 bg-yellow-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div
            class="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <!-- Floating Particles -->
      <div class="absolute inset-0 overflow-hidden">
        <div v-for="i in 20" :key="i"
             :style="getFloatingParticleStyle(i)"
             class="absolute animate-float">
          <div class="w-2 h-2 bg-white rounded-full opacity-20"></div>
        </div>
      </div>

      <div class="relative container mx-auto px-6 py-20 text-center">
        <!-- Main Hero Content -->
        <div class="max-w-5xl mx-auto space-y-8">
          <!-- Badge -->
          <div
              class="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 animate-fade-in">
            <SparklesIcon class="w-5 h-5 mr-2 text-yellow-300"/>
            <span class="text-sm font-medium">{{ $t('home.poweredBy') }}</span>
          </div>

          <!-- Main Headline -->
          <div class="space-y-6 animate-slide-up">
            <h1 class="text-5xl sm:text-6xl sm:leading-normal lg:text-7xl lg:leading-normal font-bold bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent leading-tight">
              {{ $t('home.title') }}
            </h1>
            <p class="text-xl sm:text-2xl text-blue-100 max-w-4xl mx-auto leading-relaxed">
              {{ $t('home.subtitle') }}
            </p>
          </div>

          <!-- Interactive Feature Pills -->
          <div class="flex flex-wrap justify-center gap-4 mt-12 opacity-0 animate-slide-up animation-delay-300">
            <div class="group cursor-pointer">
              <div class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 
                         hover:bg-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                <div class="flex items-center space-x-2">
                  <SparklesIcon class="w-5 h-5 text-yellow-300"/>
                  <span class="text-sm font-medium">{{ $t('home.featurePills.aiSentenceGeneration') }}</span>
                </div>
              </div>
            </div>
            <div class="group cursor-pointer">
              <div class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 
                         hover:bg-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                <div class="flex items-center space-x-2">
                  <AcademicCapIcon class="w-5 h-5 text-green-300"/>
                  <span class="text-sm font-medium">{{ $t('home.featurePills.grammarChecking') }}</span>
                </div>
              </div>
            </div>
            <div class="group cursor-pointer">
              <div class="px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 
                         hover:bg-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
                <div class="flex items-center space-x-2">
                  <UsersIcon class="w-5 h-5 text-purple-300"/>
                  <span class="text-sm font-medium">{{ $t('home.featurePills.communityLearning') }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- CTA Buttons with Enhanced Design -->
          <div
              class="flex flex-col sm:flex-row gap-6 justify-center mt-12 opacity-0 animate-slide-up animation-delay-600">
            <router-link
                v-if="!authStore.isAuthenticated"
                class="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl font-semibold text-lg
                     hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-300
                     shadow-xl hover:shadow-2xl"
                to="/register"
            >
              <div
                  class="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div class="relative flex items-center justify-center">
                <UserPlusIcon class="w-6 h-6 mr-3"/>
                {{ $t('home.getStartedFree') }}
              </div>
            </router-link>

            <router-link
                v-else
                class="group relative px-8 py-4 bg-gradient-to-r from-emerald-500 to-blue-500 rounded-2xl font-semibold text-lg
                     hover:from-emerald-600 hover:to-blue-600 transform hover:scale-105 transition-all duration-300
                     shadow-xl hover:shadow-2xl"
                to="/generate"
            >
              <div
                  class="absolute inset-0 bg-gradient-to-r from-emerald-400 to-blue-400 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div class="relative flex items-center justify-center">
                <SparklesIcon class="w-6 h-6 mr-3"/>
                {{ $t('home.generateSentences') }}
              </div>
            </router-link>

            <router-link
                class="group px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-2xl font-semibold text-lg
                     hover:bg-white/20 hover:border-white/50 transform hover:scale-105 transition-all duration-300"
                to="/community"
            >
              <div class="flex items-center justify-center">
                <UsersIcon class="w-6 h-6 mr-3"/>
                {{ $t('home.browseCommunity') }}
              </div>
            </router-link>
          </div>
        </div>

        <!-- Scroll Indicator -->
        <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDownIcon class="w-6 h-6 text-white/60"/>
        </div>
      </div>
    </section>

    <!-- Dynamic Statistics Section -->
    <section class="py-20 bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ $t('home.statistics.title') }}
          </h2>
          <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
        </div>

        <div v-if="statisticsLoading" class="flex justify-center py-12">
          <div class="relative">
            <div class="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
            <div
                class="absolute top-0 left-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>

        <div v-else class="grid md:grid-cols-3 gap-8">
          <!-- Animated Stat Cards -->
          <div v-for="(stat, index) in statisticsData" :key="stat.key"
               :class="getStatCardAnimation(index)"
               class="group relative p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-lg hover:shadow-2xl
                      transform hover:-translate-y-2 transition-all duration-500">
            <!-- Gradient Border -->
            <div
                :class="stat.gradient"
                class="absolute inset-0 bg-gradient-to-r rounded-3xl p-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div class="bg-white dark:bg-slate-800 rounded-3xl w-full h-full"></div>
            </div>

            <div class="relative z-10 text-center space-y-4">
              <!-- Icon -->
              <div :class="stat.iconBg"
                   class="w-16 h-16 mx-auto rounded-full flex items-center justify-center">
                <component :is="stat.icon" :class="stat.iconColor" class="w-8 h-8"/>
              </div>

              <!-- Animated Number -->
              <div class="space-y-2">
                <div :class="stat.textColor" class="text-4xl font-bold">
                  <AnimatedCounter :duration="2000" :target="stat.value"/>
                </div>
                <p class="text-gray-600 dark:text-gray-300 font-medium">
                  {{ stat.label }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Interactive Features Showcase -->
    <section class="py-20 bg-white dark:bg-slate-900">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ $t('home.features.title') }}
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {{ $t('home.features.subtitle') }}
          </p>
        </div>

        <div class="grid lg:grid-cols-2 gap-16 items-center">
          <!-- Feature 1: Sentence Generation -->
          <div class="space-y-8 order-2 lg:order-1">
            <div class="space-y-6">
              <div class="inline-flex items-center px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <SparklesIcon class="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400"/>
                <span class="text-sm font-semibold text-blue-600 dark:text-blue-400">{{
                    $t('home.features.aiEnhancedBadge')
                  }}</span>
              </div>
              <h3 class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ $t('home.features.aiEnhanced') }}
              </h3>
              <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {{ $t('home.features.aiEnhancedDesc') }}
              </p>
            </div>

            <!-- Interactive Demo -->
            <div
                class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
              <!-- Demo Card Header -->
              <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                <div class="flex items-center space-x-3">
                  <div
                      class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span class="text-white font-bold text-xs">D</span>
                  </div>
                  <div>
                    <p class="font-medium text-sm text-gray-900 dark:text-white">Demo User</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('date.justNow') }}</p>
                  </div>
                </div>
              </div>

              <!-- Demo Card Body -->
              <div class="p-4 space-y-4">
                <!-- Words Used -->
                <div class="flex flex-wrap gap-2">
                  <span
                      class="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium border border-blue-200 dark:border-blue-800">
                    learn
                  </span>
                  <span
                      class="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium border border-green-200 dark:border-green-800">
                    explore
                  </span>
                  <span
                      class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium border border-purple-200 dark:border-purple-800">
                    enhance
                  </span>
                </div>

                <!-- Generated Sentence -->
                <blockquote
                    class="text-lg font-medium text-gray-900 dark:text-white leading-relaxed bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-blue-900/20 dark:via-indigo-900/20 dark:to-purple-900/20 p-4 rounded-lg border-l-4 border-blue-400 italic">
                  "Students should <span
                    class="font-semibold text-blue-600 dark:text-blue-400 not-italic">explore</span> various methods to
                  <span class="font-semibold text-green-600 dark:text-green-400 not-italic">enhance</span> their ability
                  to <span class="font-semibold text-purple-600 dark:text-purple-400 not-italic">learn</span>
                  effectively."
                </blockquote>

                <!-- AI Model Badge -->
                <div class="flex items-center space-x-2">
                  <span
                      class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                    <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Qwen/QwQ-32B
                  </span>
                  <span class="text-xs text-purple-600 dark:text-purple-400">
                    ✨ {{ $t('home.features.demoElements.generatedWithAI') }}
                  </span>
                </div>

                <!-- Demo Toggle Buttons -->
                <div class="flex flex-wrap gap-3">
                  <button class="text-sm text-green-600 dark:text-green-400 hover:underline flex items-center">
                    <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path clip-rule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            fill-rule="evenodd"/>
                    </svg>
                    Show explanation →
                  </button>
                  <button class="text-sm text-orange-600 dark:text-orange-400 hover:underline">
                    Show Chinese translation →
                  </button>
                  <button class="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                    Show AI reasoning →
                  </button>
                </div>
              </div>

              <!-- Demo Card Footer -->
              <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/50">
                <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                  <div class="flex items-center space-x-4">
                    <span>{{ $t('generation.wordsUsed') }}: 3</span>
                    <span>{{ $t('generation.aiModel') }}: {{ $t('generation.poweredBy') }}</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <button class="flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm">
                      <ShareIcon class="w-4 h-4 mr-1"/>
                      Share
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Visual Element -->
          <div class="order-1 lg:order-2">
            <div class="relative">
              <!-- Floating Cards Animation -->
              <div class="relative w-full h-96">
                <div v-for="(card, index) in floatingCards" :key="index"
                     :class="[card.gradient, getFloatingCardStyle(index)]"
                     :style="getFloatingCardPosition(index)"
                     class="absolute w-64 h-32 bg-gradient-to-br rounded-2xl shadow-lg transform transition-all duration-1000">
                  <div class="p-4 text-white">
                    <component :is="card.icon" class="w-8 h-8 mb-2"/>
                    <h4 class="font-semibold">{{ card.title }}</h4>
                    <p class="text-sm opacity-90">{{ card.description }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Feature 2: Grammar Checking -->
        <div class="grid lg:grid-cols-2 gap-16 items-center mt-24">
          <!-- Visual Element -->
          <div>
            <div class="relative">
              <!-- Grammar Check Demo -->
              <div
                  class="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
                <!-- Demo Card Header -->
                <div class="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div class="flex items-center space-x-3">
                    <div
                        class="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center">
                      <span class="text-white font-bold text-xs">D</span>
                    </div>
                    <div>
                      <p class="font-medium text-sm text-gray-900 dark:text-white">Demo User</p>
                      <p class="text-xs text-gray-500 dark:text-gray-400">{{ $t('date.justNow') }}</p>
                    </div>
                  </div>
                </div>

                <!-- Demo Card Body -->
                <div class="p-4 space-y-4">
                  <!-- Original Sentence -->
                  <div class="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border-l-4 border-blue-400">
                    <h4 class="font-medium text-sm mb-2 text-gray-900 dark:text-white flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Original Sentence
                    </h4>
                    <blockquote class="text-lg font-medium text-gray-900 dark:text-white leading-relaxed">
                      "I am <span
                        class="bg-red-100 dark:bg-red-900/30 text-red-600 px-1 rounded font-semibold">go</span> to the
                      store yesterday."
                    </blockquote>
                  </div>

                  <!-- AI Model Badge -->
                  <div class="flex items-center space-x-2">
                    <span
                        class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300">
                      <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                      Qwen/QwQ-32B
                    </span>
                    <span class="text-xs text-green-600 dark:text-green-400">
                      ✨ {{ $t('home.features.demoElements.grammarAnalysisComplete') }}
                    </span>
                  </div>

                  <!-- Grammar Correction Preview -->
                  <div
                      class="bg-gradient-to-r from-emerald-50 via-green-50 to-teal-50 dark:from-emerald-900/10 dark:via-green-900/10 dark:to-teal-900/10 p-4 rounded-lg border-l-4 border-emerald-400 shadow-sm">
                    <h4 class="font-medium text-sm mb-2 text-gray-900 dark:text-white flex items-center">
                      <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
                      </svg>
                      Grammar Correction
                    </h4>
                    <div class="text-gray-800 dark:text-gray-200">
                      "I <span
                        class="bg-green-100 dark:bg-green-900/30 text-green-600 px-1 rounded font-semibold">went</span>
                      to the store yesterday."
                      <div class="mt-2 text-sm text-green-600 dark:text-green-400">
                        ✓ {{ $t('home.features.demoElements.correctedPastTense') }}
                      </div>
                    </div>
                  </div>

                  <!-- Demo Toggle Buttons -->
                  <div class="flex flex-wrap gap-3">
                    <button class="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center">
                      <svg class="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path clip-rule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              fill-rule="evenodd"/>
                      </svg>
                      Show grammar analysis →
                    </button>
                    <button class="text-sm text-violet-600 dark:text-violet-400 hover:underline">
                      Show keyword analysis →
                    </button>
                    <button class="text-sm text-orange-600 dark:text-orange-400 hover:underline">
                      Show Chinese definition →
                    </button>
                    <button class="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                      Show AI reasoning →
                    </button>
                  </div>
                </div>

                <!-- Demo Card Footer -->
                <div class="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-800/50">
                  <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                    <div class="flex items-center space-x-4">
                      <span>AI Model: {{ $t('generation.poweredBy') }}</span>
                      <span>Length: 35 chars</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <button class="flex items-center text-blue-600 dark:text-blue-400 hover:underline text-sm">
                        <ShareIcon class="w-4 h-4 mr-1"/>
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Feature Description -->
          <div class="space-y-8">
            <div class="space-y-6">
              <div class="inline-flex items-center px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <AcademicCapIcon class="w-5 h-5 mr-2 text-green-600 dark:text-green-400"/>
                <span class="text-sm font-semibold text-green-600 dark:text-green-400">{{
                    $t('home.features.grammarInsightsBadge')
                  }}</span>
              </div>
              <h3 class="text-3xl font-bold text-gray-900 dark:text-white">
                {{ $t('home.features.grammarInsights') }}
              </h3>
              <p class="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                {{ $t('home.features.grammarInsightsDesc') }}
              </p>
            </div>

            <!-- Quick Actions -->
            <div class="flex space-x-4">
              <router-link class="flex items-center px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl
                                 transform hover:scale-105 transition-all duration-200"
                           to="/check">
                <AcademicCapIcon class="w-5 h-5 mr-2"/>
                {{ $t('home.features.demoElements.tryGrammarCheck') }}
              </router-link>
<!--              <button class="flex items-center px-6 py-3 border-2 border-green-500 text-green-500 hover:bg-green-50 -->
<!--                            dark:hover:bg-green-900/20 rounded-xl transition-all duration-200">-->
<!--                <PlayIcon class="w-5 h-5 mr-2"/>-->
<!--                {{ $t('home.features.demoElements.watchDemo') }}-->
<!--              </button>-->
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section
        class="py-20 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-indigo-900/20 dark:via-purple-900/20 dark:to-pink-900/20">
      <div class="container mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {{ $t('home.howItWorks.title') }}
          </h2>
          <p class="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {{ $t('home.howItWorks.subtitle') }}
          </p>
        </div>

        <!-- Interactive Steps -->
        <div class="relative">
          <!-- Connection Line -->
          <div class="hidden lg:block absolute top-24 left-1/2 transform -translate-x-1/2 w-full max-w-5xl">
            <svg class="w-full h-2" preserveAspectRatio="none" viewBox="0 0 100 2">
              <path d="M0,1 Q25,0 50,1 T100,1" fill="none" stroke="url(#gradient)" stroke-width="2"/>
              <defs>
                <linearGradient id="gradient" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" style="stop-color:#3B82F6;stop-opacity:1"/>
                  <stop offset="33%" style="stop-color:#10B981;stop-opacity:1"/>
                  <stop offset="66%" style="stop-color:#8B5CF6;stop-opacity:1"/>
                  <stop offset="100%" style="stop-color:#F59E0B;stop-opacity:1"/>
                </linearGradient>
              </defs>
            </svg>
          </div>

          <div class="grid lg:grid-cols-4 gap-8">
            <div v-for="(step, index) in howItWorksSteps" :key="index"
                 class="relative group text-center">
              <!-- Step Circle -->
              <div :class="step.bgClass"
                   class="relative z-10 w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center text-white font-bold text-xl
                          transform group-hover:scale-110 transition-all duration-300 shadow-lg">
                <span>{{ index + 1 }}</span>
                <!-- Pulse Effect -->
                <div :class="step.bgClass" class="absolute inset-0 rounded-full animate-ping opacity-25"></div>
              </div>

              <!-- Content -->
              <div class="space-y-4">
                <h4 class="text-xl font-bold text-gray-900 dark:text-white">
                  {{ step.title }}
                </h4>
                <p class="text-gray-600 dark:text-gray-300">
                  {{ step.description }}
                </p>

                <!-- Interactive Element -->
                <div class="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 
                           transition-all duration-300">
                  <button :class="step.borderClass"
                          class="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg border-2
                                hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                    <component :is="step.icon" class="w-4 h-4 mr-2"/>
                    {{ $t('home.howItWorks.tryNow') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Enhanced CTA Section -->
    <section class="relative py-20 overflow-hidden">
      <!-- Dynamic Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
        <div class="absolute inset-0 bg-black/20"></div>
        <!-- Animated Shapes -->
        <div class="absolute top-0 left-0 w-full h-full">
          <div class="absolute top-20 left-20 w-40 h-40 bg-white/10 rounded-full animate-pulse"></div>
          <div
              class="absolute bottom-20 right-20 w-60 h-60 bg-white/5 rounded-full animate-pulse animation-delay-1000"></div>
          <div
              class="absolute top-1/2 left-1/3 w-32 h-32 bg-white/10 rounded-full animate-pulse animation-delay-2000"></div>
        </div>
      </div>

      <div class="relative container mx-auto px-6 text-center text-white">
        <div class="max-w-4xl mx-auto space-y-8">
          <!-- Badge -->
          <div
              class="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
            <RocketLaunchIcon class="w-5 h-5 mr-2"/>
            <span class="font-semibold">{{ $t('home.cta.transformJourney') }}</span>
          </div>

          <!-- Headline -->
          <h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
            {{ $t('home.cta.title') }}
          </h2>

          <p class="text-xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
            {{ $t('home.cta.subtitle') }}
          </p>

          <!-- Feature Benefits -->
          <div class="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto my-12">
            <div v-for="(benefit, index) in ctaBenefits" :key="index"
                 class="flex items-center justify-center space-x-3 p-4 bg-white/10 backdrop-blur-sm rounded-xl">
              <CheckCircleIcon class="w-6 h-6 text-green-300 flex-shrink-0"/>
              <span class="font-medium">{{ benefit }}</span>
            </div>
          </div>

          <!-- CTA Buttons -->
          <div class="flex flex-col sm:flex-row gap-6 justify-center mt-12">
            <router-link
                v-if="!authStore.isAuthenticated"
                class="group relative px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-lg
                     hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-2xl"
                to="/register"
            >
              <div
                  class="absolute inset-0 bg-gradient-to-r from-white to-blue-50 rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div class="relative flex items-center justify-center">
                <UserPlusIcon class="w-6 h-6 mr-3"/>
                {{ $t('home.cta.startLearningNow') }}
              </div>
            </router-link>

            <router-link
                v-else
                class="group relative px-10 py-5 bg-white text-blue-600 rounded-2xl font-bold text-lg
                     hover:bg-blue-50 transform hover:scale-105 transition-all duration-300 shadow-2xl"
                to="/generate"
            >
              <div class="relative flex items-center justify-center">
                <SparklesIcon class="w-6 h-6 mr-3"/>
                {{ $t('home.cta.createFirstSentence') }}
              </div>
            </router-link>

            <router-link
                class="group px-10 py-5 border-3 border-white text-white hover:bg-white hover:text-blue-600
                     rounded-2xl font-bold text-lg transform hover:scale-105 transition-all duration-300"
                to="/community"
            >
              <div class="flex items-center justify-center">
                <UsersIcon class="w-6 h-6 mr-3"/>
                {{ $t('home.cta.exploreCommunity') }}
              </div>
            </router-link>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref} from 'vue'
import {
  AcademicCapIcon,
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  EyeIcon,
  PlayIcon,
  RocketLaunchIcon,
  ShareIcon,
  SparklesIcon,
  UserPlusIcon,
  UsersIcon
} from '@heroicons/vue/24/outline'
import {useAuthStore} from '../stores/auth.ts'
import {statistics} from '../stores/statistics.ts'
import {useI18n} from 'vue-i18n'

const {t} = useI18n()

// Components
const AnimatedCounter = {
  props: ['target', 'duration'],
  setup(props: { target: number; duration: number }) {
    const displayValue = ref(0)

    onMounted(() => {
      const start = 0
      const end = props.target
      const duration = props.duration
      const startTime = Date.now()

      const updateValue = () => {
        const now = Date.now()
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)

        displayValue.value = Math.floor(start + (end - start) * progress)

        if (progress < 1) {
          requestAnimationFrame(updateValue)
        }
      }

      updateValue()
    })

    return {displayValue}
  },
  template: '<span>{{ displayValue.toLocaleString() }}</span>'
}

const authStore = useAuthStore()
const {formattedStats, loading: statisticsLoading, fetchStatistics} = statistics()

// Computed data for dynamic content
const statisticsData = computed(() => [
  {
    key: 'sentences',
    value: parseInt(formattedStats.value?.aiGeneratedSentences?.replace(/,/g, '') || '0'),
    label: t('home.statistics.aiGeneratedSentences'),
    icon: SparklesIcon,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
    textColor: 'text-blue-600 dark:text-blue-400',
    gradient: 'from-blue-500 to-purple-500'
  },
  {
    key: 'words',
    value: parseInt(formattedStats.value?.wordsPracticed?.replace(/,/g, '') || '0'),
    label: t('home.statistics.wordsPracticed'),
    icon: BookOpenIcon,
    iconBg: 'bg-green-100 dark:bg-green-900/30',
    iconColor: 'text-green-600 dark:text-green-400',
    textColor: 'text-green-600 dark:text-green-400',
    gradient: 'from-green-500 to-emerald-500'
  },
  {
    key: 'users',
    value: parseInt(formattedStats.value?.activeLearners?.replace(/,/g, '') || '0'),
    label: t('home.statistics.activeLearners'),
    icon: UsersIcon,
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
    textColor: 'text-purple-600 dark:text-purple-400',
    gradient: 'from-purple-500 to-pink-500'
  }
])

const floatingCards = computed(() => [
  {
    title: t('home.floatingCards.sentenceGeneration.title'),
    description: t('home.floatingCards.sentenceGeneration.description'),
    icon: SparklesIcon,
    gradient: 'from-blue-500 to-purple-600'
  },
  {
    title: t('home.floatingCards.grammarAnalysis.title'),
    description: t('home.floatingCards.grammarAnalysis.description'),
    icon: AcademicCapIcon,
    gradient: 'from-green-500 to-emerald-600'
  },
  {
    title: t('home.floatingCards.communityLearning.title'),
    description: t('home.floatingCards.communityLearning.description'),
    icon: UsersIcon,
    gradient: 'from-purple-500 to-pink-600'
  }
])

const howItWorksSteps = computed(() => [
  {
    title: t('home.howItWorks.step1'),
    description: t('home.howItWorks.step1Desc'),
    icon: EyeIcon,
    bgClass: 'bg-blue-500',
    borderClass: 'border-blue-500 text-blue-500'
  },
  {
    title: t('home.howItWorks.step2'),
    description: t('home.howItWorks.step2Desc'),
    icon: BookOpenIcon,
    bgClass: 'bg-green-500',
    borderClass: 'border-green-500 text-green-500'
  },
  {
    title: t('home.howItWorks.step3'),
    description: t('home.howItWorks.step3Desc'),
    icon: SparklesIcon,
    bgClass: 'bg-purple-500',
    borderClass: 'border-purple-500 text-purple-500'
  },
  {
    title: t('home.howItWorks.step4'),
    description: t('home.howItWorks.step4Desc'),
    icon: ChatBubbleLeftRightIcon,
    bgClass: 'bg-orange-500',
    borderClass: 'border-orange-500 text-orange-500'
  }
])

const ctaBenefits = computed(() => [
  t('home.cta.freeToStart'),
  t('home.cta.learningTogether'),
  t('home.cta.instantAccess')
])

// Animation functions
const getFloatingParticleStyle = (index: number) => {
  const delay = index * 200
  const duration = 3000 + (index % 3) * 1000
  return {
    left: `${(index * 73) % 100}%`,
    top: `${(index * 47) % 100}%`,
    animationDelay: `${delay}ms`,
    animationDuration: `${duration}ms`
  }
}

const getStatCardAnimation = (index: number) => {
  const delays = ['animate-fade-in', 'animate-fade-in animation-delay-300', 'animate-fade-in animation-delay-600']
  return delays[index] || ''
}

const getFloatingCardStyle = (index: number) => {
  return `animate-float animation-delay-${index * 1000}`
}

const getFloatingCardPosition = (index: number) => {
  const positions = [
    {top: '10%', left: '10%', transform: 'rotate(-5deg)'},
    {top: '40%', right: '10%', transform: 'rotate(8deg)'},
    {bottom: '10%', left: '20%', transform: 'rotate(-3deg)'}
  ]
  return positions[index] || {}
}

// Lifecycle
onMounted(() => {
  fetchStatistics()
})
</script>

<style scoped>
/* Custom Animations */
@keyframes blob {
  0%, 100% {
    transform: translate(0px, 0px) scale(1);
  }
  33% {
    transform: translate(30px, -50px) scale(1.1);
  }
  66% {
    transform: translate(-20px, 20px) scale(0.9);
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-blob {
  animation: blob 7s infinite;
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-fade-in {
  animation: fade-in 0.8s ease-out forwards;
}

.animate-slide-up {
  animation: slide-up 0.8s ease-out forwards;
}

.animation-delay-300 {
  animation-delay: 300ms;
}

.animation-delay-600 {
  animation-delay: 600ms;
}

.animation-delay-1000 {
  animation-delay: 1000ms;
}

.animation-delay-2000 {
  animation-delay: 2000ms;
}

.animation-delay-4000 {
  animation-delay: 4000ms;
}

/* Enhanced transitions and effects */
.group:hover .animate-pulse {
  animation-duration: 1s;
}

/* Custom gradient border effect */
.border-3 {
  border-width: 3px;
}

/* Backdrop blur support */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Custom hover effects */
.hover\:shadow-2xl:hover {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

/* Text gradient effects */
.bg-clip-text {
  -webkit-background-clip: text;
  background-clip: text;
}

/* Smooth scrolling for the entire page */
html {
  scroll-behavior: smooth;
}
</style> 