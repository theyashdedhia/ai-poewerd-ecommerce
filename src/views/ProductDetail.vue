<template>
  <div class="container mx-auto px-4 py-8">
    <div v-if="loading" class="flex justify-center items-center min-h-[400px]">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
    
    <div v-else-if="error" class="text-center py-8">
      <p class="text-red-600">{{ error }}</p>
    </div>
    
    <div v-else-if="product" class="grid md:grid-cols-2 gap-8">
      <!-- Product Images -->
      <div class="relative">
        <img 
          :src="product.image_urls[currentImageIndex]" 
          :alt="product.name"
          class="w-full h-[400px] object-cover rounded-lg"
        >
        <!-- Image Navigation -->
        <div v-if="product.image_urls.length > 1" class="flex justify-center mt-4 gap-2">
          <button 
            v-for="(_, index) in product.image_urls" 
            :key="index"
            @click="currentImageIndex = index"
            :class="[
              'w-3 h-3 rounded-full',
              currentImageIndex === index ? 'bg-gray-800' : 'bg-gray-300'
            ]"
          />
        </div>
      </div>

      <!-- Product Info -->
      <div>
        <h1 class="text-3xl font-bold mb-4">{{ product.name }}</h1>
        <p class="text-2xl font-semibold text-gray-800 mb-4">${{ product.price }}</p>
        <p class="text-gray-600 mb-6">{{ product.description }}</p>
        
        <!-- Stock Status -->
        <p class="mb-4">
          <span class="font-medium">Stock Status:</span>
          <span :class="product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'">
            {{ product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock' }}
          </span>
        </p>

        <!-- Add to Cart -->
        <div class="flex gap-4 mb-6">
          <input 
            type="number" 
            v-model="quantity" 
            min="1" 
            :max="product.stock_quantity"
            class="w-20 px-3 py-2 border rounded-lg"
          >
          <button 
            @click="addToCart"
            :disabled="!product.stock_quantity"
            class="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-400"
          >
            Add to Cart
          </button>
        </div>

        <!-- Add to Wishlist -->
        <button 
          @click="toggleWishlist"
          class="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <span v-if="isInWishlist">Remove from Wishlist</span>
          <span v-else>Add to Wishlist</span>
        </button>
      </div>
    </div>

    <!-- Reviews Section -->
    <div class="mt-12">
      <h2 class="text-2xl font-bold mb-6">Customer Reviews</h2>
      <!-- Add review form and review list components here -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useWishlistStore } from '../stores/wishlist';
import { supabase } from '../supabase/client';
import type { Database } from '../supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

const route = useRoute();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();

const product = ref<Product | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const quantity = ref(1);
const currentImageIndex = ref(0);
const isInWishlist = ref(false);

onMounted(async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', route.params.id)
      .single();

    if (fetchError) throw fetchError;
    if (!data) throw new Error('Product not found');

    product.value = data;
    
    // Check if product is in wishlist
    isInWishlist.value = await wishlistStore.isInWishlist(data.id);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load product';
  } finally {
    loading.value = false;
  }
});

const addToCart = () => {
  if (!product.value) return;
  cartStore.addToCart({
    productId: product.value.id,
    quantity: quantity.value
  });
};

const toggleWishlist = async () => {
  if (!product.value) return;
  if (isInWishlist.value) {
    await wishlistStore.removeFromWishlist(product.value.id);
  } else {
    await wishlistStore.addToWishlist(product.value.id);
  }
  isInWishlist.value = !isInWishlist.value;
};
</script>