import { createApp } from 'vue'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import router from './router'
import App from './App.vue'
import i18n from './utils/i18n.js'
import './style.css'
import 'vue-toastification/dist/index.css'

// Create Pinia store
const pinia = createPinia()

// Create app
const app = createApp(App)

// Toast options
const toastOptions = {
  position: 'top-right',
  timeout: 5000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: 'button',
  icon: true,
  rtl: false
}

app.use(pinia)
app.use(router)
app.use(i18n)
app.use(Toast, toastOptions)

app.mount('#app') 