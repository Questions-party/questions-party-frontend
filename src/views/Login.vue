<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
          <span class="text-white font-bold text-xl">EL</span>
        </div>
        <h2 class="mt-6 text-3xl font-bold text-primary">
          {{ $t('auth.loginTitle') }}
        </h2>
        <p class="mt-2 text-sm text-secondary">
          {{ $t('auth.noAccount') }}
          <router-link to="/register" class="font-medium text-accent-color hover:underline">
            {{ $t('auth.switchToRegister') }}
          </router-link>
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-primary">
              {{ $t('auth.email') }}
            </label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              required
              autocomplete="email"
              class="input mt-1"
              :class="{ 'border-red-500': errors.email }"
              :placeholder="$t('auth.email')"
            />
            <p v-if="errors.email" class="mt-1 text-sm text-red-600">
              {{ errors.email }}
            </p>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-primary">
              {{ $t('auth.password') }}
            </label>
            <div class="relative mt-1">
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                class="input pr-10"
                :class="{ 'border-red-500': errors.password }"
                :placeholder="$t('auth.password')"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p v-if="errors.password" class="mt-1 text-sm text-red-600">
              {{ errors.password }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              v-model="form.rememberMe"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-secondary">
              {{ $t('auth.rememberMe') }}
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-accent-color hover:underline">
              {{ $t('auth.forgotPassword') }}
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full btn btn-primary flex justify-center items-center"
          >
            <div v-if="authStore.loading" class="spinner mr-2"></div>
            {{ authStore.loading ? $t('common.loading') : $t('auth.loginButton') }}
          </button>
        </div>

        <div v-if="loginError" class="text-center">
          <p class="text-sm text-red-600">{{ loginError }}</p>
        </div>
      </form>

      <!-- Demo credentials info -->
      <div class="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <h3 class="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
          {{ $t('auth.demoCredentials') }}
        </h3>
        <p class="text-xs text-blue-600 dark:text-blue-300">
          {{ $t('auth.demoEmail') }}<br>
          {{ $t('auth.demoPassword') }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth.ts'
import { useI18n } from 'vue-i18n'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()

const showPassword = ref(false)
const loginError = ref('')

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
})

const errors = reactive({
  email: '',
  password: ''
})

const validateForm = () => {
  errors.email = ''
  errors.password = ''
  
  if (!form.email) {
    errors.email = t('validation.emailRequired')
    return false
  }
  
  if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = t('validation.invalidEmail')
    return false
  }
  
  if (!form.password) {
    errors.password = t('validation.passwordRequired')
    return false
  }
  
  if (form.password.length < 6) {
    errors.password = t('validation.passwordMinLength')
    return false
  }
  
  return true
}

const handleLogin = async () => {
  loginError.value = ''
  
  if (!validateForm()) {
    return
  }
  
  try {
    const result = await authStore.login({
      email: form.email,
      password: form.password
    })
    
    if (result.success) {
      const redirect = router.currentRoute.value.query.redirect as string
      router.push(redirect || '/words')
    } else {
      loginError.value = result.message || t('auth.loginFailed')
    }
  } catch (error) {
    loginError.value = t('auth.unexpectedError')
    console.error('Login error:', error)
  }
}

// Fill demo credentials
const fillDemoCredentials = () => {
  form.email = 'demo@example.com'
  form.password = 'demo123'
}
</script> 