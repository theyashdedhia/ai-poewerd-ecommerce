<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'vue3-toastify';
import type { Database } from '@/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];

const props = defineProps<{
  product: Product;
}>();

const router = useRouter();
const cartStore = useCartStore();
const wishlistStore = useWishlistStore();
const authStore = useAuthStore();

const isAddingToCart = ref(false);
const showQuickView = ref(false);

const addToCart = async () => {
  isAddingToCart.value = true;
  
  try {
    const result = await cartStore.addItem(props.product.id);
    
    if (result.success) {
      toast.success('Added to cart!');
    } else {
      toast.error(result.error || 'Failed to add to cart');
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    toast.error('An unexpected error occurred');
  } finally {
    isAddingToCart.value = false;
  }
};

const toggleWishlist = async () => {
  if (!authStore.isAuthenticated) {
    toast.info('Please login to save items to your wishlist');
    return;
  }
  
  try {
    const isInWishlist = wishlistStore.isInWishlist(props.product.id);
    
    if (isInWishlist) {
      const wishlistItem = wishlistStore.getWishlistItem(props.product.id);
      if (wishlistItem) {
        const result = await wishlistStore.removeFromWishlist(wishlistItem.id);
        
        if (result.success) {
          toast.success('Removed from wishlist');
        } else {
          toast.error(result.error || 'Failed to remove from wishlist');
        }
      }
    } else {
      const result = await wishlistStore.addToWishlist(props.product.id);
      
      if (result.success) {
        toast.success('Added to wishlist');
      } else {
        toast.error(result.error || 'Failed to add to wishlist');
      }
    }
  } catch (error) {
    console.error('Error updating wishlist:', error);
    toast.error('An unexpected error occurred');
  }
};

const navigateToProduct = () => {
  router.push(`/products/${props.product.id}`);
};

// Get the first image or use a placeholder
const productImage = computed(() => {
  if (props.product.image_urls && props.product.image_urls.length > 0) {
    return props.product.image_urls[0];
  }
  return 'https://images.pexels.com/photos/5632398/pexels-photo-5632398.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2';
});

// Format price with 2 decimal places
const formattedPrice = computed(() => {
  return `$${props.product.price.toFixed(2)}`;
});

// Check if product is in wishlist
const isInWishlist = computed(() => {
  return wishlistStore.isInWishlist(props.product.id);
});
</script>

<template>
  <div class="group card overflow-hidden transition-all duration-300">
    <!-- Product Image (clickable) -->
    <div 
      class="relative h-64 overflow-hidden cursor-pointer"
      @click="navigateToProduct"
    >
      <img 
        :src="productImage" 
        :alt="product.name" 
        class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
      />
      
      <!-- Wishlist Button -->
      <button 
        @click.stop="toggleWishlist"
        class="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-100 transition-colors z-10"
        :class="{ 'text-red-500': isInWishlist }"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" :fill="isInWishlist ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>
      
      <!-- Quick Action Buttons (appear on hover) -->
      <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 py-3 px-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <div class="flex justify-between items-center">
          <button 
            @click.stop="showQuickView = true"
            class="text-white hover:text-accent-300 text-sm transition-colors"
          >
            Quick View
          </button>
          <button 
            @click.stop="navigateToProduct"
            class="text-white hover:text-accent-300 text-sm transition-colors"
          >
            Details
          </button>
        </div>
      </div>
    </div>
    
    <!-- Product Info -->
    <div class="p-4">
      <h3 
        class="text-lg font-medium mb-1 hover:text-primary-500 cursor-pointer truncate"
        @click="navigateToProduct"
      >
        {{ product.name }}
      </h3>
      <p class="text-gray-500 text-sm mb-3 line-clamp-2 h-10">
        {{ product.description || 'No description available' }}
      </p>
      
      <div class="flex justify-between items-center">
        <span class="font-bold text-gray-900">{{ formattedPrice }}</span>
        
        <button 
          @click="addToCart"
          class="btn btn-sm btn-primary"
          :disabled="isAddingToCart"
        >
          <span v-if="isAddingToCart">Adding...</span>
          <span v-else>Add to Cart</span>
        </button>
      </div>
    </div>
    
    <!-- Quick View Modal -->
    <Teleport to="body">
      <div v-if="showQuickView" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto animate-fadeIn">
          <div class="flex justify-between p-4 border-b">
            <h3 class="text-lg font-bold">{{ product.name }}</h3>
            <button @click="showQuickView = false" class="text-gray-500 hover:text-gray-700">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div class="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <img 
                :src="productImage" 
                :alt="product.name"
                class="w-full h-auto rounded" 
              />
            </div>
            
            <div>
              <p class="text-xl font-bold text-gray-900 mb-2">{{ formattedPrice }}</p>
              <p class="text-gray-600 mb-4">{{ product.description }}</p>
              
              <div class="mb-4">
                <p class="text-sm font-medium mb-1">Availability:</p>
                <p class="text-sm" :class="product.stock_quantity > 0 ? 'text-green-600' : 'text-red-600'">
                  {{ product.stock_quantity > 0 ? `In Stock (${product.stock_quantity} available)` : 'Out of Stock' }}
                </p>
              </div>
              
              <div class="flex gap-2">
                <button 
                  @click="addToCart" 
                  class="flex-1 btn btn-primary"
                  :disabled="isAddingToCart || product.stock_quantity <= 0"
                >
                  <span v-if="isAddingToCart">Adding...</span>
                  <span v-else>Add to Cart</span>
                </button>
                
                <button 
                  @click="navigateToProduct" 
                  class="btn btn-outline"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>