import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'

const API_BASE_URL = 'http://localhost:5000/api'

interface User {
  id: string
  username: string
  email: string
  preferences?: {
    theme: 'light' | 'dark'
    language: 'en' | 'zh'
    showPublicGenerations: boolean
  }
}

interface LoginCredentials {
  email: string
  password: string
}

interface RegisterCredentials {
  username: string
  email: string
  password: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('token'))
  const loading = ref(false)
  const toast = useToast()

  // Set up axios interceptor for authentication
  if (token.value) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
  }

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  const setAuth = (userData: User, authToken: string) => {
    user.value = userData
    token.value = authToken
    localStorage.setItem('token', authToken)
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
  }

  const clearAuth = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
  }

  const login = async (credentials: LoginCredentials) => {
    loading.value = true
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials)
      const { user: userData, token: authToken } = response.data
      
      setAuth(userData, authToken)
      toast.success('Login successful!')
      
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const register = async (credentials: RegisterCredentials) => {
    loading.value = true
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, credentials)
      const { user: userData, token: authToken } = response.data
      
      setAuth(userData, authToken)
      toast.success('Registration successful!')
      
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const logout = () => {
    clearAuth()
    toast.info('Logged out successfully')
  }

  const fetchUser = async () => {
    if (!token.value) return

    try {
      const response = await axios.get(`${API_BASE_URL}/auth/me`)
      user.value = response.data.user
    } catch (error) {
      // Token is invalid, clear auth
      clearAuth()
    }
  }

  const updateProfile = async (profileData: Partial<User>) => {
    loading.value = true
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/profile`, profileData)
      user.value = { ...user.value!, ...response.data.user }
      toast.success('Profile updated successfully!')
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  const updatePreferences = async (preferences: User['preferences']) => {
    loading.value = true
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/preferences`, preferences)
      if (user.value) {
        user.value.preferences = { ...user.value.preferences, ...response.data.preferences }
      }
      toast.success('Preferences updated successfully!')
      return { success: true }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Preferences update failed'
      toast.error(message)
      return { success: false, message }
    } finally {
      loading.value = false
    }
  }

  // Initialize user if token exists
  if (token.value) {
    fetchUser()
  }

  return {
    user: computed(() => user.value),
    loading: computed(() => loading.value),
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    updateProfile,
    updatePreferences
  }
}) 