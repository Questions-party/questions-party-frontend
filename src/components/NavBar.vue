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
            v-if="authStore.isAuthenticated"
            to="/words"
            class="nav-link"
            :class="{ active: $route.name === 'Words' }"
          >
            {{ $t('nav.words') }}
          </router-link>
          
          <router-link
            v-if="authStore.isAuthenticated"
            to="/generate"
            class="nav-link"
            :class="{ active: $route.name === 'Generate' }"
          >
            {{ $t('nav.generate') }}
          </router-link>
          
          <router-link
            to="/community"
            class="nav-link"
            :class="{ active: $route.name === 'Community' }"
          >
            {{ $t('nav.community') }}
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
                        class="block px-4 py-2 text-sm hover:bg-secondary transition-colors"
                      >
                        {{ $t('nav.profile') }}
                      </router-link>
                    </MenuItem>
                    <MenuItem>
                      <button
                        @click="logout"
                        class="block w-full text-left px-4 py-2 text-sm hover:bg-secondary transition-colors"
                      >
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
              v-if="authStore.isAuthenticated"
              to="/words"
              class="block nav-link"
              :class="{ active: $route.name === 'Words' }"
              @click="mobileMenuOpen = false"
            >
              {{ $t('nav.words') }}
            </router-link>
            
            <router-link
              v-if="authStore.isAuthenticated"
              to="/generate"
              class="block nav-link"
              :class="{ active: $route.name === 'Generate' }"
              @click="mobileMenuOpen = false"
            >
              {{ $t('nav.generate') }}
            </router-link>
            
            <router-link
              to="/community"
              class="block nav-link"
              :class="{ active: $route.name === 'Community' }"
              @click="mobileMenuOpen = false"
            >
              {{ $t('nav.community') }}
            </router-link>

            <div v-if="authStore.isAuthenticated" class="border-t border-color pt-2 mt-2">
              <router-link
                to="/profile"
                class="block nav-link"
                @click="mobileMenuOpen = false"
              >
                {{ $t('nav.profile') }}
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
                class="block w-full btn btn-ghost"
                @click="mobileMenuOpen = false"
              >
                {{ $t('nav.login') }}
              </router-link>
              <router-link
                to="/register"
                class="block w-full btn btn-primary"
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
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'
import {
  SunIcon,
  MoonIcon,
  UserIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'
import { useThemeStore } from '../stores/theme'

const router = useRouter()
const { locale } = useI18n()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const mobileMenuOpen = ref(false)

const toggleLanguage = () => {
  const newLanguage = themeStore.language === 'en' ? 'zh' : 'en'
  themeStore.setLanguage(newLanguage)
}

const logout = async () => {
  authStore.logout()
  mobileMenuOpen.value = false
  router.push('/')
}
</script> 