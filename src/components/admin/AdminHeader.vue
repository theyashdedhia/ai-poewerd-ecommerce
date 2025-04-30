<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();
const showUserMenu = ref(false);

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
};

const handleLogout = async () => {
  await authStore.logout();
  router.push('/');
};
</script>

<template>
  <header class="bg-white shadow-sm border-b">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center py-4">
        <div class="flex items-center space-x-2">
          <span class="text-xl font-bold text-primary-500">Shopify</span>
          <span class="text-sm bg-gray-200 rounded-md px-2 py-0.5">Seller Dashboard</span>
        </div>
        
        <div class="flex items-center space-x-6">
          <!-- Return to Store -->
          <router-link to="/" class="text-gray-600 hover:text-primary-500 text-sm">
            <span class="flex items-center space-x-1">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Return to Store</span>
            </span>
          </router-link>
          
          <!-- User menu -->
          <div class="relative">
            <button 
              @click="toggleUserMenu" 
              class="flex items-center space-x-1 focus:outline-none"
            >
              <span>{{ authStore.user?.first_name || 'Account' }}</span>
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            
            <div 
              v-show="showUserMenu" 
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 animate-slideDown"
            >
              <router-link 
                to="/profile" 
                @click="showUserMenu = false"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </router-link>
              <button 
                @click="handleLogout" 
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>