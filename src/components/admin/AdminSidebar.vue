<script setup lang="ts">
// No special logic needed for the sidebar
</script>

<template>
  <aside class="w-64 bg-white shadow-sm h-screen border-r">
    <div class="p-6">
      <h2 class="text-xl font-bold text-gray-800">Dashboard</h2>
    </div>
    
    <nav class="mt-2">
      <router-link 
        to="/admin" 
        exact
        class="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors"
        active-class="bg-gray-100 text-primary-500 border-l-4 border-primary-500"
      >
        <div class="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span>Overview</span>
        </div>
      </router-link>
      
      <router-link 
        to="/admin/products" 
        class="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors"
        active-class="bg-gray-100 text-primary-500 border-l-4 border-primary-500"
      >
        <div class="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <span>Products</span>
        </div>
      </router-link>
      
      <router-link 
        to="/admin/orders" 
        class="block px-6 py-3 text-gray-700 hover:bg-gray-100 hover:text-primary-500 transition-colors"
        active-class="bg-gray-100 text-primary-500 border-l-4 border-primary-500"
      >
        <div class="flex items-center space-x-3">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>Orders</span>
        </div>
      </router-link>
    </nav>
  </aside>
</template>