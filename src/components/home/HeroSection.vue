<script setup lang="ts">
// No special logic needed for the hero section
</script>

<template>
  <section class="relative bg-gray-50 py-16 md:py-24">
    <div class="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
      <div class="text-center md:text-left animate-slideUp">
        <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Discover Amazing Products</h1>
        <p class="text-xl text-gray-600 mb-8">Shop the latest trends with fast delivery and exceptional customer service.</p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
          <router-link to="/products" class="btn btn-primary btn-lg">
            Shop Now
          </router-link>
          <router-link to="/products?featured=true" class="btn btn-outline btn-lg">
            Explore Featured
          </router-link>
        </div>
      </div>
      
      <div class="relative animate-fadeIn">
        <img 
          src="https://images.pexels.com/photos/5632402/pexels-photo-5632402.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2" 
          alt="Shopping" 
          class="rounded-lg shadow-xl w-full h-auto max-h-[500px] object-cover"
        />
        <div class="absolute -bottom-6 -left-6 bg-white p-4 rounded-lg shadow-lg hidden md:block">
          <div class="flex items-center gap-3">
            <div class="bg-accent-500 text-white p-2 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p class="font-medium text-gray-800">Special Offer</p>
              <p class="text-sm text-gray-500">Free shipping on orders over $50</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Decorative element -->
    <div class="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-white to-transparent"></div>
  </section>
</template>