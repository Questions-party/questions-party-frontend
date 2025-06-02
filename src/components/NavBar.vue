<template>
  <nav class="bg-primary border-b border-color shadow-custom">
    <div class="container mx-auto px-4 max-w-7xl">
      <div class="flex justify-between items-center h-16">
        <!-- Logo and Brand -->
        <div class="flex items-center space-x-4">
          <router-link to="/" class="flex items-center space-x-2">
            <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">EL</span>
            </div>
            <span class="font-bold text-xl text-primary">English Learning</span>
          </router-link>
          <!-- AI Provider Badge -->
          <div class="hidden sm:block">
            <span class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
              <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              SiliconFlow
            </span>
          </div>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex items-center space-x-1">
          <router-link
            to="/"
            class="nav-link"
            :class="{ active: $route.name === 'Home' }"
          >
            {{ $t('nav.home') }}
          </router-link>
          
          <router-link
            to="/community"
            class="nav-link"
            :class="{ active: $route.name === 'Community' }"
          >
            {{ $t('nav.community') }}
          </router-link>
          
          <router-link
            to="/check"
            class="nav-link"
            :class="{ active: $route.name === 'Check' }"
          >
            {{ $t('nav.check') }}
          </router-link>
          
          <router-link
            to="/generate"
            class="nav-link"
            :class="{ active: $route.name === 'Generate' }"
          >
            {{ $t('nav.generate') }}
          </router-link>
          
          <router-link
            v-if="authStore.isAuthenticated"
            to="/words"
            class="nav-link"
            :class="{ active: $route.name === 'Words' }"
          >
            {{ $t('nav.words') }}
          </router-link>
        </div>

        <!-- Right side controls -->
        <div class="flex items-center space-x-4">
          <!-- Theme Toggle -->
          <button
            @click="themeStore.toggleTheme()"
            class="p-2 rounded-md hover:bg-tertiary transition-colors"
            :title="themeStore.isDark ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <SunIcon v-if="themeStore.isDark" class="w-5 h-5" />
            <MoonIcon v-else class="w-5 h-5" />
          </button>

          <!-- Language Toggle -->
          <button
            @click="toggleLanguage"
            class="p-2 rounded-md hover:bg-tertiary transition-colors text-sm font-medium"
            :title="$t('profile.language')"
          >
            {{ themeStore.language.toUpperCase() }}
          </button>

          <!-- User Menu -->
          <div v-if="authStore.isAuthenticated" class="relative">
            <Menu as="div" class="relative">
              <MenuButton class="flex items-center space-x-2 p-2 rounded-md hover:bg-tertiary transition-colors">
                <UserIcon class="w-5 h-5" />
                <span class="hidden sm:block text-sm font-medium">{{ authStore.user?.username }}</span>
                <ChevronDownIcon class="w-4 h-4" />
              </MenuButton>

              <transition
                enter-active-class="transition duration-100 ease-out"
                enter-from-class="transform scale-95 opacity-0"
                enter-to-class="transform scale-100 opacity-1"
                leave-active-class="transition duration-75 ease-in"
                leave-from-class="transform scale-100 opacity-1"
                leave-to-class="transform scale-95 opacity-0"
              >
                <MenuItems class="absolute right-0 mt-2 w-48 bg-primary border border-color rounded-md shadow-lg z-50">
                  <div class="py-1">
                    <MenuItem>
                      <router-link
                        to="/profile"
                        class="flex items-center px-4 py-2 text-sm hover:bg-secondary transition-colors"
                      >
                        <UserIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.profile') }}
                      </router-link>
                    </MenuItem>
                    <MenuItem>
                      <router-link
                        to="/ai-config"
                        class="flex items-center px-4 py-2 text-sm hover:bg-secondary transition-colors"
                      >
                        <Cog6ToothIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.aiConfiguration') }}
                      </router-link>
                    </MenuItem>
                    <MenuItem>
                      <button
                        @click="logout"
                        class="flex items-center w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                      >
                        <ArrowRightOnRectangleIcon class="w-4 h-4 mr-2" />
                        {{ $t('nav.logout') }}
                      </button>
                    </MenuItem>
                  </div>
                </MenuItems>
              </transition>
            </Menu>
          </div>

          <!-- Login/Register buttons -->
          <div v-else class="flex items-center space-x-2">
            <router-link to="/login" class="btn btn-ghost">
              {{ $t('nav.login') }}
            </router-link>
            <router-link to="/register" class="btn btn-primary">
              {{ $t('nav.register') }}
            </router-link>
          </div>

          <!-- Mobile menu button -->
          <button
            @click="mobileMenuOpen = !mobileMenuOpen"
            class="md:hidden p-2 rounded-md hover:bg-tertiary transition-colors"
          >
            <Bars3Icon v-if="!mobileMenuOpen" class="w-6 h-6" />
            <XMarkIcon v-else class="w-6 h-6" />
          </button>
        </div>
      </div>

      <!-- Mobile Navigation -->
      <transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="transform -translate-y-2 opacity-0"
        enter-to-class="transform translate-y-0 opacity-1"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="transform translate-y-0 opacity-1"
        leave-to-class="transform -translate-y-2 opacity-0"
      >
        <div v-if="mobileMenuOpen" class="md:hidden border-t border-color bg-primary">
          <div class="px-2 pt-2 pb-3 space-y-1">
            <router-link
              to="/"
              class="block nav-link"
              :class="{ active: $route.name === 'Home' }"
              @click="mobileMenuOpen = false"
            >
              {{ $t('nav.home') }}
            </router-link>
            
            <router-link
              to="/community"
              class="block nav-link"
              :class="{ active: $route.name === 'Community' }"
              @click="mobileMenuOpen = false"
            >
              {{ $t('nav.community') }}
            </router-link>
            
            <router-link
              to="/check"
              class="block nav-link"
              :class="{ active: $route.name === 'Check' }"
              @click="mobileMenuOpen = false"
            >
              {{ $t('nav.check') }}
            </router-link>
            
            <router-link
              to="/generate"
              class="block nav-link"
              :class="{ active: $route.name === 'Generate' }"
              @click="mobileMenuOpen = false"
            >
              {{ $t('nav.generate') }}
            </router-link>
            
            <router-link
              v-if="authStore.isAuthenticated"
              to="/words"
              class="block nav-link"
              :class="{ active: $route.name === 'Words' }"
              @click="mobileMenuOpen = false"
            >
              {{ $t('nav.words') }}
            </router-link>

            <div v-if="authStore.isAuthenticated" class="border-t border-color pt-2 mt-2">
              <router-link
                to="/profile"
                class="block nav-link"
                @click="mobileMenuOpen = false"
              >
                {{ $t('nav.profile') }}
              </router-link>
              <router-link
                to="/ai-config"
                class="block nav-link"
                @click="mobileMenuOpen = false"
              >
                {{ $t('nav.aiConfiguration') }}
              </router-link>
              <button
                @click="logout"
                class="block w-full text-left nav-link"
              >
                {{ $t('nav.logout') }}
              </button>
            </div>

            <div v-else class="border-t border-color pt-2 mt-2 space-y-2">
              <router-link
                to="/login"
                class="block nav-link"
                @click="mobileMenuOpen = false"
              >
                {{ $t('nav.login') }}
              </router-link>
              <router-link
                to="/register"
                class="block nav-link"
                @click="mobileMenuOpen = false"
              >
                {{ $t('nav.register') }}
              </router-link>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import {
  UserIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  XMarkIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth.ts'
import { useThemeStore } from '../stores/theme.ts'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const themeStore = useThemeStore()
const { locale } = useI18n()

const mobileMenuOpen = ref(false)

const logout = () => {
  authStore.logout()
  mobileMenuOpen.value = false
}

const toggleLanguage = () => {
  const newLang = themeStore.language === 'en' ? 'zh' : 'en'
  themeStore.setLanguage(newLang)
  locale.value = newLang
}
</script> 