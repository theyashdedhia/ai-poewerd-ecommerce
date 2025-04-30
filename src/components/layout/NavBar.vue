<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useCartStore } from '@/stores/cart';

const props = defineProps<{
  isScrolled: boolean;
}>();

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

const showMobileMenu = ref(false);
const showUserMenu = ref(false);

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value;
  if (showMobileMenu.value) {
    showUserMenu.value = false;
  }
};

const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value;
  if (showUserMenu.value) {
    showMobileMenu.value = false;
  }
};

const closeMobileMenu = () => {
  showMobileMenu.value = false;
};

const closeUserMenu = () => {
  showUserMenu.value = false;
};

const handleLogout = async () => {
  await authStore.logout();
  closeUserMenu();
  router.push('/');
};

const navbarClass = computed(() => {
  return props.isScrolled
    ? 'bg-white shadow'
    : 'bg-transparent';
});

const textColorClass = computed(() => {
  return props.isScrolled
    ? 'text-gray-800'
    : 'text-gray-800';
});
</script>

<template>
  <header 
    :class="[
      'fixed w-full top-0 z-50 transition-all duration-300',
      navbarClass
    ]"
  >
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center py-4">
        <!-- Logo -->
        <router-link to="/" class="flex items-center space-x-2">
          <span class="text-2xl font-bold text-primary-500">Shopify</span>
        </router-link>
        
        <!-- Desktop Navigation -->
        <nav class="hidden md:flex items-center space-x-8">
          <router-link 
            to="/" 
            :class="['font-medium hover:text-primary-500 transition-colors', textColorClass]"
          >
            Home
          </router-link>
          <router-link 
            to="/products" 
            :class="['font-medium hover:text-primary-500 transition-colors', textColorClass]"
          >
            Products
          </router-link>
          <router-link
            v-if="authStore.isSeller"
            to="/admin"
            :class="['font-medium hover:text-primary-500 transition-colors', textColorClass]"
          >
            Seller Dashboard
          </router-link>
        </nav>
        
        <!-- Desktop User Actions -->
        <div class="hidden md:flex items-center space-x-6">
          <!-- Cart -->
          <router-link 
            to="/cart" 
            class="relative p-2 rounded-full hover:bg-gray-100"
            :class="textColorClass"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span 
              v-if="cartStore.totalItems > 0" 
              class="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ cartStore.totalItems }}
            </span>
          </router-link>
          
          <!-- User Account dropdown -->
          <div class="relative" v-if="authStore.isAuthenticated">
            <button 
              @click="toggleUserMenu" 
              class="flex items-center space-x-1 focus:outline-none"
              :class="textColorClass"
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
                @click="closeUserMenu"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Profile
              </router-link>
              <router-link 
                to="/orders" 
                @click="closeUserMenu"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Orders
              </router-link>
              <router-link 
                to="/wishlist" 
                @click="closeUserMenu"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Wishlist
              </router-link>
              <button 
                @click="handleLogout" 
                class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Logout
              </button>
            </div>
          </div>
          
          <template v-else>
            <router-link 
              to="/login" 
              class="btn btn-outline"
            >
              Login
            </router-link>
            <router-link 
              to="/register" 
              class="btn btn-primary"
            >
              Sign Up
            </router-link>
          </template>
        </div>
        
        <!-- Mobile Menu Button -->
        <div class="flex items-center space-x-4 md:hidden">
          <router-link 
            to="/cart" 
            class="relative p-2"
            :class="textColorClass"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span 
              v-if="cartStore.totalItems > 0" 
              class="absolute -top-1 -right-1 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            >
              {{ cartStore.totalItems }}
            </span>
          </router-link>
          
          <button 
            @click="toggleMobileMenu" 
            class="p-2 focus:outline-none"
            :class="textColorClass"
          >
            <svg 
              v-if="!showMobileMenu" 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
            <svg 
              v-else 
              xmlns="http://www.w3.org/2000/svg" 
              class="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Mobile Menu -->
      <div 
        v-show="showMobileMenu" 
        class="md:hidden bg-white border-t mt-2 -mx-4 animate-slideDown"
      >
        <div class="py-3">
          <router-link 
            to="/" 
            @click="closeMobileMenu"
            class="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
          >
            Home
          </router-link>
          <router-link 
            to="/products" 
            @click="closeMobileMenu"
            class="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
          >
            Products
          </router-link>
          <router-link
            v-if="authStore.isSeller"
            to="/admin"
            @click="closeMobileMenu"
            class="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
          >
            Seller Dashboard
          </router-link>
          
          <div v-if="authStore.isAuthenticated" class="border-t border-gray-200 mt-2 pt-2">
            <router-link 
              to="/profile" 
              @click="closeMobileMenu"
              class="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
            >
              Profile
            </router-link>
            <router-link 
              to="/orders" 
              @click="closeMobileMenu"
              class="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
            >
              Orders
            </router-link>
            <router-link 
              to="/wishlist" 
              @click="closeMobileMenu"
              class="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
            >
              Wishlist
            </router-link>
            <button 
              @click="handleLogout" 
              class="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
          
          <div v-else class="border-t border-gray-200 mt-2 pt-2 flex flex-col px-4 gap-2">
            <router-link 
              to="/login" 
              @click="closeMobileMenu"
              class="btn btn-outline w-full text-center"
            >
              Login
            </router-link>
            <router-link 
              to="/register" 
              @click="closeMobileMenu"
              class="btn btn-primary w-full text-center"
            >
              Sign Up
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </header>
  
  <!-- Spacer to account for fixed navbar -->
  <div class="h-20"></div>
</template>