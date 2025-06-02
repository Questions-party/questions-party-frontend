import {defineStore} from 'pinia'
import {computed, ref} from 'vue'
import {useToast} from 'vue-toastification'
import {useI18n} from 'vue-i18n'
import {authAPI} from '../services/api.ts'

interface User {
    id: string
    username: string
    email: string
    preferences?: {
        theme?: string
        language?: string
        showPublicGenerations?: boolean
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
    const toast = useToast()
    const {t} = useI18n()

    const user = ref<User | null>(null)
    const token = ref<string | null>(localStorage.getItem('token'))
    const loading = ref(false)

    const isAuthenticated = computed(() => !!token.value && !!user.value)

    const setAuth = (userData: User, authToken: string) => {
        user.value = userData
        token.value = authToken
        localStorage.setItem('token', authToken)
    }

    const clearAuth = () => {
        user.value = null
        token.value = null
        localStorage.removeItem('token')
    }

    const login = async (credentials: LoginCredentials) => {
        loading.value = true
        try {
            const response = await authAPI.login(credentials)

            if (response.data.success) {
                setAuth(response.data.user, response.data.token)
                toast.success(t('auth.loginSuccess'))
                return {success: true}
            } else {
                const message = response.data.message || t('auth.loginFailed')
                toast.error(message)
                return {success: false, message}
            }
        } catch (error: any) {
            const message = error.response?.data?.message || t('auth.loginFailed')
            toast.error(message)
            return {success: false, message}
        } finally {
            loading.value = false
        }
    }

    const register = async (credentials: RegisterCredentials) => {
        loading.value = true
        try {
            const response = await authAPI.register(credentials)

            if (response.data.success) {
                setAuth(response.data.user, response.data.token)
                toast.success(t('auth.registerSuccess'))
                return {success: true}
            } else {
                const message = response.data.message || t('auth.registerFailed')
                toast.error(message)
                return {success: false, message}
            }
        } catch (error: any) {
            const message = error.response?.data?.message || t('auth.registerFailed')
            toast.error(message)
            return {success: false, message}
        } finally {
            loading.value = false
        }
    }

    const logout = () => {
        clearAuth()
        toast.info(t('auth.logoutSuccess'))
    }

    const fetchUser = async () => {
        if (!token.value) return

        try {
            const response = await authAPI.getMe()
            if (response.data.success) {
                user.value = response.data.user
            }
        } catch (error) {
            console.error('Failed to fetch user:', error)
            logout()
        }
    }

    const updateProfile = async (profileData: Partial<User>) => {
        loading.value = true
        try {
            const response = await authAPI.updateProfile(profileData)

            if (response.data.success) {
                user.value = {...user.value, ...response.data.user}
                toast.success(t('auth.profileUpdateSuccess'))
                return {success: true}
            } else {
                const message = response.data.message || t('common.error')
                toast.error(message)
                return {success: false, message}
            }
        } catch (error: any) {
            const message = error.response?.data?.message || t('common.error')
            toast.error(message)
            return {success: false, message}
        } finally {
            loading.value = false
        }
    }

    const updatePreferences = async (preferences: any) => {
        loading.value = true
        try {
            const response = await authAPI.updatePreferences(preferences)

            if (response.data.success) {
                if (user.value) {
                    user.value.preferences = {...user.value.preferences, ...preferences}
                }
                toast.success(t('auth.preferencesUpdateSuccess'))
                return {success: true}
            } else {
                const message = response.data.message || t('profile.preferencesError')
                toast.error(message)
                return {success: false, message}
            }
        } catch (error: any) {
            const message = error.response?.data?.message || t('profile.preferencesError')
            toast.error(message)
            return {success: false, message}
        } finally {
            loading.value = false
        }
    }

    // Initialize user if token exists
    if (token.value) {
        fetchUser()
    }

    return {
        user,
        token,
        loading,
        isAuthenticated,
        login,
        register,
        logout,
        fetchUser,
        updateProfile,
        updatePreferences
    }
}, {
    persist: true
})