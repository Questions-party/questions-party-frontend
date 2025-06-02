<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div
        v-if="show"
        class="fixed inset-0 z-50 overflow-y-auto"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        
        <!-- Modal container -->
        <div class="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
          <Transition
            name="modal-inner"
            appear
            @after-leave="$emit('closed')"
          >
            <div
              v-if="show"
              class="relative transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 px-6 pb-6 pt-8 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:px-8 sm:pb-8"
            >
              <!-- Close button -->
              <button
                @click="$emit('cancel')"
                class="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>

              <!-- Icon -->
              <div class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 mb-6">
                <component :is="iconComponent" class="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>

              <!-- Content -->
              <div class="text-center">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-3" id="modal-title">
                  {{ title }}
                </h3>
                <p class="text-gray-600 dark:text-gray-300 mb-2 leading-relaxed">
                  {{ message }}
                </p>
                <p v-if="warningMessage" class="text-sm text-red-600 dark:text-red-400 font-medium">
                  {{ warningMessage }}
                </p>
              </div>

              <!-- Action buttons -->
              <div class="mt-8 flex flex-col-reverse sm:flex-row sm:gap-3">
                <button
                  @click="$emit('cancel')"
                  type="button"
                  class="mt-3 sm:mt-0 w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-6 py-3 text-base font-medium text-gray-700 dark:text-gray-300 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors sm:w-auto"
                >
                  {{ cancelText }}
                </button>
                <button
                  @click="$emit('confirm')"
                  type="button"
                  class="w-full inline-flex justify-center rounded-xl border border-transparent bg-red-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors sm:w-auto"
                  :class="{ 'opacity-50 cursor-not-allowed': loading }"
                  :disabled="loading"
                >
                  <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ confirmText }}
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  XMarkIcon, 
  ExclamationTriangleIcon,
  TrashIcon,
  InformationCircleIcon 
} from '@heroicons/vue/24/outline'

interface Props {
  show: boolean
  title: string
  message: string
  warningMessage?: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  type: 'danger',
  loading: false
})

const emit = defineEmits<{
  confirm: []
  cancel: []
  closed: []
}>()

const iconComponent = computed(() => {
  switch (props.type) {
    case 'danger':
      return TrashIcon
    case 'warning':
      return ExclamationTriangleIcon
    case 'info':
      return InformationCircleIcon
    default:
      return ExclamationTriangleIcon
  }
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-inner-enter-active {
  transition: all 0.3s ease;
}

.modal-inner-leave-active {
  transition: all 0.2s ease;
}

.modal-inner-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-20px);
}

.modal-inner-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style> 