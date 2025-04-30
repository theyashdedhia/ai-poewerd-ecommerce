<template>
    <div class="container mx-auto px-4 py-8 max-w-5xl">
      <h1 class="text-3xl font-bold mb-6 text-center">My Wishlist</h1>
      
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
      
      <div v-else-if="wishlistItems.length === 0" class="text-center py-12 bg-white rounded-lg shadow-md p-8">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <p class="text-gray-600 text-lg mb-6">Your wishlist is empty</p>
        <router-link to="/products" class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition">
          Browse Products
        </router-link>
      </div>
      
      <div v-else>
        <!-- Wishlist Header -->
        <div class="flex justify-between items-center mb-6">
          <p class="text-gray-600">{{ wishlistItems.length }} items in your wishlist</p>
          <div class="flex gap-4">
            <button 
              @click="showGrid = !showGrid" 
              class="text-gray-600 hover:text-gray-900"
            >
              <svg v-if="showGrid" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              @click="clearWishlist"
              class="text-red-600 hover:text-red-700 text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear wishlist
            </button>
          </div>
        </div>
        
        <!-- Grid View -->
        <div v-if="showGrid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div 
            v-for="item in wishlistItems" 
            :key="item.id"
            class="bg-white rounded-lg shadow-md overflow-hidden group"
          >
            <div class="relative">
              <img 
                :src="item.image" 
                :alt="item.name"
                class="w-full h-48 object-cover"
              >
              <div class="absolute top-2 right-2 flex gap-2">
                <button 
                  @click="removeFromWishlist(item.id)"
                  class="bg-white p-2 rounded-full shadow-md hover:bg-red-50 transition"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </button>
              </div>
              <div v-if="item.discount > 0" class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                -{{ item.discount }}%
              </div>
            </div>
            
            <div class="p-4">
              <div class="flex justify-between items-start">
                <h3 class="font-medium text-lg">{{ item.name }}</h3>
                <div class="flex items-center text-amber-400 text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                  </svg>
                  <span class="ml-1">{{ item.rating }}</span>
                </div>
              </div>
              
              <p class="text-gray-500 text-sm mt-1">{{ item.category }}</p>
              
              <div class="mt-4 flex justify-between items-center">
                <div>
                  <span v-if="item.discount > 0" class="text-gray-400 line-through text-sm mr-2">${{ item.originalPrice.toFixed(2) }}</span>
                  <span class="font-bold text-lg">${{ item.currentPrice.toFixed(2) }}</span>
                </div>
                
                <button 
                  @click="addToCart(item)"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition text-sm"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- List View -->
        <div v-else class="bg-white rounded-lg shadow-md overflow-hidden">
          <div 
            v-for="(item, index) in wishlistItems" 
            :key="item.id"
            :class="['flex items-center p-4 gap-4', index !== wishlistItems.length - 1 ? 'border-b' : '']"
          >
            <img 
              :src="item.image" 
              :alt="item.name"
              class="w-20 h-20 object-cover rounded"
            >
            
            <div class="flex-grow">
              <h3 class="font-medium">{{ item.name }}</h3>
              <p class="text-gray-500 text-sm">{{ item.category }}</p>
              <div class="flex items-center text-amber-400 text-sm mt-1">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                </svg>
                <span class="ml-1">{{ item.rating }}</span>
              </div>
            </div>
            
            <div class="text-right">
              <div class="mb-2">
                <span v-if="item.discount > 0" class="text-gray-400 line-through text-sm mr-2">${{ item.originalPrice.toFixed(2) }}</span>
                <span class="font-bold">${{ item.currentPrice.toFixed(2) }}</span>
              </div>
              
              <div class="flex gap-2 justify-end">
                <button 
                  @click="removeFromWishlist(item.id)"
                  class="text-red-600 hover:text-red-700 text-sm"
                >
                  Remove
                </button>
                <button 
                  @click="addToCart(item)"
                  class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded transition text-sm"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Recently Viewed Section -->
      <div class="mt-16">
        <h2 class="text-xl font-bold mb-6">Recently Viewed</h2>
        
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <div 
            v-for="item in recentlyViewed" 
            :key="item.id"
            class="bg-white rounded-lg shadow-sm overflow-hidden group"
          >
            <div class="relative">
              <img 
                :src="item.image" 
                :alt="item.name"
                class="w-full h-36 object-cover group-hover:opacity-90 transition"
              >
              <button 
                @click="toggleWishlist(item)"
                class="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow-md hover:bg-red-50 transition"
              >
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  class="h-4 w-4" 
                  :class="isInWishlist(item.id) ? 'text-red-600 fill-current' : 'text-gray-400'"
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>
            
            <div class="p-3">
              <h3 class="font-medium text-sm line-clamp-1">{{ item.name }}</h3>
              <div class="flex justify-between items-center mt-2">
                <span class="font-bold">${{ item.currentPrice.toFixed(2) }}</span>
                <div class="flex items-center text-amber-400 text-xs">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="currentColor" viewBox="0 0 24 24" stroke="none">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z" />
                  </svg>
                  <span class="ml-1">{{ item.rating }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  
  interface WishlistItem {
    id: string;
    name: string;
    category: string;
    originalPrice: number;
    currentPrice: number;
    discount: number;
    rating: number;
    image: string;
    inStock: boolean;
    dateAdded: Date;
  }
  
  // State
  const wishlistItems = ref<WishlistItem[]>([]);
  const recentlyViewed = ref<WishlistItem[]>([]);
  const isLoading = ref(true);
  const showGrid = ref(true);
  
  // Mock data loading
  onMounted(() => {
    // Simulate API call to get wishlist
    setTimeout(() => {
      wishlistItems.value = [
        {
          id: '1',
          name: 'Wireless Noise Cancelling Headphones',
          category: 'Electronics',
          originalPrice: 349.99,
          currentPrice: 279.99,
          discount: 20,
          rating: 4.8,
          image: '/api/placeholder/400/400',
          inStock: true,
          dateAdded: new Date('2025-04-15')
        },
        {
          id: '2',
          name: 'Smart Fitness Tracker with Heart Rate Monitor',
          category: 'Wearables',
          originalPrice: 129.99,
          currentPrice: 99.99,
          discount: 23,
          rating: 4.5,
          image: '/api/placeholder/400/400',
          inStock: true,
          dateAdded: new Date('2025-04-18')
        },
        {
          id: '3',
          name: 'Ultra HD 4K Smart TV - 55"',
          category: 'Electronics',
          originalPrice: 899.99,
          currentPrice: 799.99,
          discount: 11,
          rating: 4.7,
          image: '/api/placeholder/400/400',
          inStock: false,
          dateAdded: new Date('2025-04-20')
        },
        {
          id: '4',
          name: 'Premium Coffee Maker with Smart Controls',
          category: 'Home & Kitchen',
          originalPrice: 199.99,
          currentPrice: 199.99,
          discount: 0,
          rating: 4.3,
          image: '/api/placeholder/400/400',
          inStock: true,
          dateAdded: new Date('2025-04-22')
        },
        {
          id: '5',
          name: 'Ergonomic Office Chair with Lumbar Support',
          category: 'Furniture',
          originalPrice: 249.99,
          currentPrice: 189.99,
          discount: 24,
          rating: 4.6,
          image: '/api/placeholder/400/400',
          inStock: true,
          dateAdded: new Date('2025-04-25')
        }
      ];
      
      recentlyViewed.value = [
        {
          id: '6',
          name: 'Portable Bluetooth Speaker',
          category: 'Electronics',
          originalPrice: 89.99,
          currentPrice: 69.99,
          discount: 22,
          rating: 4.4,
          image: '/api/placeholder/400/400',
          inStock: true,
          dateAdded: new Date('2025-04-27')
        },
        {
          id: '7',
          name: 'Professional Digital Camera with 4K Video',
          category: 'Photography',
          originalPrice: 1299.99,
          currentPrice: 1199.99,
          discount: 8,
          rating: 4.9,
          image: '/api/placeholder/400/400',
          inStock: true,
          dateAdded: new Date('2025-04-27')
        },
        {
          id: '8',
          name: 'Smart Home Security System',
          category: 'Home Security',
          originalPrice: 399.99,
          currentPrice: 349.99,
          discount: 13,
          rating: 4.7,
          image: '/api/placeholder/400/400',
          inStock: true,
          dateAdded: new Date('2025-04-26')
        },
        {
          id: '9',
          name: 'Wireless Charging Pad for Smartphones',
          category: 'Accessories',
          originalPrice: 49.99,
          currentPrice: 39.99,
          discount: 20,
          rating: 4.5,
          image: '/api/placeholder/400/400',
          inStock: true,
          dateAdded: new Date('2025-04-26')
        }
      ];
      
      isLoading.value = false;
    }, 1000);
  });
  
  // Remove item from wishlist
  const removeFromWishlist = (itemId: string) => {
    wishlistItems.value = wishlistItems.value.filter(item => item.id !== itemId);
  };
  
  // Clear entire wishlist
  const clearWishlist = () => {
    if (confirm('Are you sure you want to clear your entire wishlist?')) {
      wishlistItems.value = [];
    }
  };
  
  // Add item to cart
  const addToCart = (item: WishlistItem) => {
    // In a real app, this would call your cart store or API
    alert(`Added ${item.name} to cart!`);
    // Optionally remove from wishlist after adding to cart
    // removeFromWishlist(item.id);
  };
  
  // Check if an item is in the wishlist
  const isInWishlist = (itemId: string): boolean => {
    return wishlistItems.value.some(item => item.id === itemId);
  };
  
  // Toggle wishlist status for recently viewed items
  const toggleWishlist = (item: WishlistItem) => {
    if (isInWishlist(item.id)) {
      removeFromWishlist(item.id);
    } else {
      wishlistItems.value.push(item);
    }
  };
  </script>