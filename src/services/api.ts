import axios from 'axios'
import {getCurrentLocale} from '../utils/i18n.js'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json'
    }
})

// Request interceptor to add language header
api.interceptors.request.use(
    (config) => {
        // Get current locale from i18n utils
        const locale = getCurrentLocale()

        // Add language header
        if (locale) {
            config.headers['x-language'] = locale
        }

        // Add auth token if available
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 errors (unauthorized)
        if (error.response?.status === 401) {
            // Clear token and redirect to login
            localStorage.removeItem('token')
            delete api.defaults.headers.common['Authorization']

            // Only redirect if not already on login page
            if (window.location.pathname !== '/login') {
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

// Export specific API methods for different modules
export const authAPI = {
    login: (credentials: { email: string; password: string }) =>
        api.post('/auth/login', credentials),

    register: (credentials: { username: string; email: string; password: string }) =>
        api.post('/auth/register', credentials),

    getMe: () => api.get('/auth/me'),

    updateProfile: (data: any) => api.put('/auth/profile', data),

    updatePreferences: (preferences: any) => api.put('/auth/preferences', preferences),

    updateFontSettings: (fontSettings: any) => api.put('/auth/font-settings', fontSettings)
}

export const wordsAPI = {
    getWords: (params?: any) => api.get('/words', {params}),

    addWord: (word: any) => api.post('/words', word),

    updateWord: (id: string, word: any) => api.put(`/words/${id}`, word),

    deleteWord: (id: string) => api.delete(`/words/${id}`),

    getStats: () => api.get('/words/stats'),

    getPartsOfSpeech: () => api.get('/words/parts-of-speech'),

    getRandomWords: (params?: any) => api.get('/words/random', {params})
}

export const generationsAPI = {
    generate: (data: {
        words: string[];
        isPublic?: boolean;
        maxRetries?: number;
        grammarLanguage?: string;
        signal?: AbortSignal
    }) => {
        const {signal, ...requestData} = data
        return api.post('/generate', requestData, {signal})
    },

    getUserGenerations: (params?: any) => api.get('/generations', {params}),

    getPublicGenerations: (params?: any) => api.get('/generations/public', {params}),

    getGeneration: (id: string) => api.get(`/generations/${id}`),

    toggleLike: (id: string) => api.post(`/generations/${id}/like`),

    updatePrivacy: (id: string, isPublic: boolean) =>
        api.put(`/generations/${id}/privacy`, {isPublic}),

    deleteGeneration: (id: string) => api.delete(`/generations/${id}`),

    deleteAllGenerations: () => api.delete('/generations/all')
}

export const aiConfigAPI = {
    getApiKeyStatus: () => api.get('/auth/api-key-status'),

    updateApiKey: (data: { apiKey: string; useCustomApiKey: boolean }) => api.put('/auth/api-key', data),

    testApiKey: (apiKey: string) => api.post('/auth/test-api-key', {apiKey}),

    getPublicKey: () => api.get('/auth/public-key')
}

export const statisticsAPI = {
    getPublicStats: () => api.get('/generations/public/stats'),
    getGlobalStats: () => api.get('/statistics')
}

export const sentenceCheckAPI = {
    checkSentence: (data: {
        sentence: string;
        isPublic?: boolean;
        maxRetries?: number;
        grammarLanguage?: string;
        signal?: AbortSignal
    }) => {
        const {signal, ...requestData} = data
        return api.post('/check', requestData, {signal})
    },

    getUserSentenceChecks: (params?: any) => api.get('/checks', {params}),

    getPublicSentenceChecks: (params?: any) => api.get('/checks/public', {params}),

    getSentenceCheck: (id: string) => api.get(`/checks/${id}`),

    toggleLike: (id: string) => api.post(`/checks/${id}/like`),

    updatePrivacy: (id: string, isPublic: boolean) =>
        api.put(`/checks/${id}/privacy`, {isPublic}),

    deleteSentenceCheck: (id: string) => api.delete(`/checks/${id}`),

    deleteAllSentenceChecks: () => api.delete('/checks/all'),

    getStatistics: () => api.get('/checks/public/stats')
}