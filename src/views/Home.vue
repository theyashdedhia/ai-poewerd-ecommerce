<script setup lang="ts">
import { onMounted } from 'vue';
import { useProductStore } from '../stores/products';
import ProductCard from '../components/products/ProductCard.vue';
import HeroSection from '../components/home/HeroSection.vue';
import CategorySection from '../components/home/CategorySection.vue';
import FeatureSection from '../components/home/FeatureSection.vue';

const productStore = useProductStore();

onMounted(async () => {
  await Promise.all([
    productStore.loadFeaturedProducts(),
    productStore.loadCategories()
  ]);
});
</script>

<template>
  <div>
    <!-- Hero Section -->
    <HeroSection />
    
    <!-- Categories Section -->
    <CategorySection :categories="productStore.categories" />
    
    <!-- Featured Products Section -->
    <section class="py-16 bg-gray-50">
      <div class="container mx-auto px-4">
        <h2 class="text-3xl font-bold text-center mb-12">Featured Products</h2>
        
        <div v-if="productStore.isLoading" class="flex justify-center">
          <div class="spinner"></div>
        </div>
        
        <div v-else-if="productStore.featuredProducts.length === 0" class="text-center text-gray-500">
          No featured products available at the moment.
        </div>
        
        <div 
          v-else
          class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8"
        >
          <ProductCard 
            v-for="product in productStore.featuredProducts" 
            :key="product.id"
            :product="product"
          />
        </div>
        
        <div class="text-center mt-12">
          <router-link to="/products" class="btn btn-primary btn-lg">
            View All Products
          </router-link>
        </div>
      </div>
    </section>
    
    <!-- Features Section -->
    <FeatureSection />
    
    <!-- Newsletter Section -->
    <section class="bg-primary-500 py-16 text-white">
      <div class="container mx-auto px-4 text-center">
        <h2 class="text-3xl font-bold mb-4">Join Our Newsletter</h2>
        <p class="mb-8 max-w-xl mx-auto">Stay updated with the latest products, exclusive offers, and more!</p>
        
        <form class="max-w-md mx-auto flex">
          <input 
            type="email" 
            placeholder="Your email address" 
            class="flex-grow py-3 px-4 rounded-l-md text-gray-800 focus:outline-none"
            required
          />
          <button type="submit" class="bg-accent-500 hover:bg-accent-600 text-white font-medium py-3 px-6 rounded-r-md transition-colors">
            Subscribe
          </button>
        </form>
      </div>
    </section>
  </div>
</template>

<style scoped>
.spinner {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: #0077ED;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>