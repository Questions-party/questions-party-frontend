import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.ts'

// Lazy load components for better performance
const Home = () => import('../views/Home.vue')
const Login = () => import('../views/Login.vue')
const Register = () => import('../views/Register.vue')
const Words = () => import('../views/Words.vue')
const Generate = () => import('../views/Generate.vue')
const Check = () => import('../views/Check.vue')
const Community = () => import('../views/Community.vue')
const Profile = () => import('../views/Profile.vue')
const AIConfig = () => import('../views/AIConfig.vue')
const GenerationView = () => import('../views/GenerationView.vue')

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresGuest: true }
  },
  {
    path: '/words',
    name: 'Words',
    component: Words,
    meta: { requiresAuth: true }
  },
  {
    path: '/generate',
    name: 'Generate',
    component: Generate
  },
  {
    path: '/check',
    name: 'Check',
    component: Check
  },
  {
    path: '/community',
    name: 'Community',
    component: Community
  },
  {
    path: '/generation/:id',
    name: 'GenerationView',
    component: GenerationView
  },
  {
    path: '/check/:id',
    name: 'SentenceCheckView',
    component: () => import('../views/SentenceCheckView.vue')
  },
  {
    path: '/ai-config',
    name: 'AIConfig',
    component: AIConfig,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

export default router 