<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';
import { useCartStore } from './stores/cart';

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

// Computed property to determine if we're on an auth page
const isAuthPage = computed(() => {
  return router.currentRoute.value.path === '/login' || 
         router.currentRoute.value.path === '/register';
});

onMounted(async () => {
  // Initialize auth state
  await authStore.initialize();
  
  // Load cart data
  await cartStore.loadCart();
  
  // If logged in, transfer any guest cart items to the database
  if (authStore.isAuthenticated) {
    await cartStore.transferCartToDatabase();
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Main content - router handles this -->
    <router-view />
  </div>
</template>