<template>
  <div class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto">
          <span class="text-white font-bold text-xl">EL</span>
        </div>
        <h2 class="mt-6 text-3xl font-bold text-primary">
          {{ $t('auth.registerTitle') }}
        </h2>
        <p class="mt-2 text-sm text-secondary">
          {{ $t('auth.hasAccount') }}
          <router-link to="/login" class="font-medium text-accent-color hover:underline">
            {{ $t('auth.switchToLogin') }}
          </router-link>
        </p>
      </div>

      <form @submit.prevent="handleRegister" class="mt-8 space-y-6">
        <div class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-primary">
              {{ $t('auth.username') }}
            </label>
            <input
              id="username"
              v-model="form.username"
              type="text"
              required
              autocomplete="username"
              class="input mt-1"
              :class="{ 'border-red-500': errors.username }"
              :placeholder="$t('auth.username')"
            />
            <p v-if="errors.username" class="mt-1 text-sm text-red-600">
              {{ errors.username }}
            </p>
          </div>

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
                autocomplete="new-password"
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

          <div>
            <label for="confirmPassword" class="block text-sm font-medium text-primary">
              {{ $t('auth.confirmPassword') }}
            </label>
            <div class="relative mt-1">
              <input
                id="confirmPassword"
                v-model="form.confirmPassword"
                :type="showConfirmPassword ? 'text' : 'password'"
                required
                autocomplete="new-password"
                class="input pr-10"
                :class="{ 'border-red-500': errors.confirmPassword }"
                :placeholder="$t('auth.confirmPassword')"
              />
              <button
                type="button"
                @click="showConfirmPassword = !showConfirmPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5 text-gray-400" />
                <EyeSlashIcon v-else class="h-5 w-5 text-gray-400" />
              </button>
            </div>
            <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">
              {{ errors.confirmPassword }}
            </p>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="authStore.loading"
            class="w-full btn btn-primary flex justify-center items-center"
          >
            {{ authStore.loading ? $t('common.loading') : $t('auth.registerButton') }}
          </button>
        </div>

        <div v-if="registerError" class="text-center">
          <p class="text-sm text-red-600">{{ registerError }}</p>
        </div>
      </form>
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
const showConfirmPassword = ref(false)
const registerError = ref('')

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateForm = () => {
  errors.username = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  
  let isValid = true
  
  if (!form.username) {
    errors.username = t('validation.usernameRequired')
    isValid = false
  } else if (form.username.length < 3) {
    errors.username = t('validation.usernameMinLength')
    isValid = false
  } else if (form.username.length > 30) {
    errors.username = t('validation.usernameMaxLength')
    isValid = false
  } else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) {
    errors.username = t('validation.usernamePattern')
    isValid = false
  }
  
  if (!form.email) {
    errors.email = t('validation.emailRequired')
    isValid = false
  } else if (!/\S+@\S+\.\S+/.test(form.email)) {
    errors.email = t('validation.invalidEmail')
    isValid = false
  }
  
  if (!form.password) {
    errors.password = t('validation.passwordRequired')
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = t('validation.passwordMinLength')
    isValid = false
  }
  
  if (!form.confirmPassword) {
    errors.confirmPassword = t('validation.confirmPasswordRequired')
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = t('validation.passwordMatch')
    isValid = false
  }
  
  return isValid
}

const handleRegister = async () => {
  registerError.value = ''
  
  if (!validateForm()) {
    return
  }
  
  try {
    const result = await authStore.register({
      username: form.username,
      email: form.email,
      password: form.password
    })

    if (result.success) {
      router.push('/words')
    } else {
      registerError.value = result.message || t('auth.registerFailed')
    }
  } catch (error) {
    registerError.value = t('auth.unexpectedError')
    console.error('Register error:', error)
  }
}
</script> 