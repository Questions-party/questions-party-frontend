import {defineStore} from 'pinia'
import {ref} from 'vue'
import {useToast} from 'vue-toastification'
import {useI18n} from 'vue-i18n'
import {aiConfigAPI} from '../services/api.ts' // Import the API module
import {rsaCrypto} from '../utils/rsaCrypto.ts'

interface PlatformInfo {
    provider: string
    model: string
    apiUrl: string
    features: string[]
}

interface ApiKeyStatus {
    useCustomApiKey: boolean
    hasCustomApiKey: boolean
    customApiKey: string
    platformInfo: PlatformInfo
}

interface TestResult {
    success: boolean
    message: string
    response?: {
        content: string
        thinking: string
    }
}

export const useApiKeyStore = defineStore('apiKey', () => {
    const toast = useToast()
    const {t} = useI18n()

    const loading = ref(false)
    const testing = ref(false)
    const useCustomApiKey = ref(false)
    const hasCustomApiKey = ref(false)
    const customApiKey = ref('')
    const platformInfo = ref<PlatformInfo | null>(null)
    const testResult = ref<TestResult | null>(null)
    const publicKey = ref<string | null>(null)

    const fetchApiKeyStatus = async () => {
        loading.value = true
        try {
            const response = await aiConfigAPI.getApiKeyStatus()

            if (response.data.success) {
                const data: ApiKeyStatus = response.data
                useCustomApiKey.value = data.useCustomApiKey
                hasCustomApiKey.value = data.hasCustomApiKey
                platformInfo.value = data.platformInfo

                // Also fetch public key if we don't have it
                if (!publicKey.value) {
                    await fetchPublicKey()
                }

                return {success: true, data}
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

    const fetchPublicKey = async () => {
        try {
            const response = await aiConfigAPI.getPublicKey()

            if (response.data.success) {
                publicKey.value = response.data.publicKey
                rsaCrypto.setPublicKey(response.data.publicKey)
                return {success: true, publicKey: response.data.publicKey}
            } else {
                const message = response.data.message || t('common.error')
                return {success: false, message}
            }
        } catch (error: any) {
            const message = error.response?.data?.message || t('common.error')
            return {success: false, message}
        }
    }

    const updateApiKey = async (apiKey: string, shouldUseCustomKey: boolean) => {
        loading.value = true
        try {
            // fetch the latest public key before encryption
            if (shouldUseCustomKey && apiKey) {
                const keyResult = await fetchPublicKey()
                if (!keyResult.success) {
                    toast.error(t('apiKey.publicKeyFetchFailed'))
                    return {success: false, message: t('apiKey.publicKeyFetchError')}
                }
            }

            // Encrypt API key if provided and using custom key
            let encryptedApiKey = ''
            if (shouldUseCustomKey && apiKey && publicKey.value) {
                try {
                    const encrypted = await rsaCrypto.encrypt(apiKey)
                    encryptedApiKey = 'rsa:' + encrypted
                } catch (encryptError) {
                    toast.error(t('apiKey.encryptionFailed'))
                    return {success: false, message: t('apiKey.encryptionError')}
                }
            }

            const response = await aiConfigAPI.updateApiKey({
                apiKey: shouldUseCustomKey ? encryptedApiKey : '',
                useCustomApiKey: shouldUseCustomKey
            })

            if (response.data.success) {
                useCustomApiKey.value = response.data.useCustomApiKey
                hasCustomApiKey.value = shouldUseCustomKey && !!apiKey
                customApiKey.value = apiKey
                toast.success(t('apiKey.updateSuccess'))
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

    const testApiKey = async (apiKey: string) => {
        testing.value = true
        testResult.value = null // Clear previous result
        try {
            const response = await aiConfigAPI.testApiKey(apiKey)

            if (response.data.success) {
                testResult.value = response.data.testResult
                toast.success(t('apiKey.testSuccess'))
                return {success: true, testResult: response.data.testResult}
            } else {
                const message = response.data.message || t('common.error')
                testResult.value = {
                    success: false,
                    message: message
                }
                toast.error(message)
                return {success: false, message}
            }
        } catch (error: any) {
            const message = error.response?.data?.message || t('common.error')
            testResult.value = {
                success: false,
                message: message
            }
            toast.error(message)
            return {success: false, message}
        } finally {
            testing.value = false
        }
    }

    const clearTestResult = () => {
        testResult.value = null
    }

    const usePlatformApiKey = async () => {
        return await updateApiKey('', false)
    }

    return {
        // State
        customApiKey,
        loading,
        testing,
        useCustomApiKey,
        hasCustomApiKey,
        platformInfo,
        testResult,
        publicKey,

        // Actions
        fetchApiKeyStatus,
        fetchPublicKey,
        updateApiKey,
        testApiKey,
        usePlatformApiKey,
        clearTestResult
    }
}, {
    persist: true
})