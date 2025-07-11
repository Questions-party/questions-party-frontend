import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig((mode) => {
    const env = loadEnv(mode, process.cwd())
    return {
        plugins: [vue()],
        server: {
            port: 5173,
            proxy: env.VITE_ENV === 'development' ? {
                '/api': {
                    target: env.VITE_API_BASE_URL,
                    changeOrigin: true,
                }
            } : undefined
        }
    }
})