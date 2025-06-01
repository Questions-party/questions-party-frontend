<template>
  <footer class="bg-secondary border-t border-color mt-16">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <div class="text-center">
        <p class="text-muted text-sm">
          &copy; {{ currentYear }} {{ $t('footer.copyright') }}
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script> 