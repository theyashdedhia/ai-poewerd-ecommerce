<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductStore } from '../stores/products';
import ProductCard from '../components/products/ProductCard.vue';

const productStore = useProductStore();
const route = useRoute();
const router = useRouter();

// Filter state
const searchQuery = ref('');
const selectedCategory = ref('');
const minPrice = ref<number | null>(null);
const maxPrice = ref<number | null>(null);
const sortBy = ref<string>('');
const showFilters = ref(false);

// Load products and categories on mount
onMounted(async () => {
  // Initialize filters from URL query parameters
  if (route.query.search) {
    searchQuery.value = route.query.search as string;
  }
  
  if (route.query.category) {
    selectedCategory.value = route.query.category as string;
  }
  
  if (route.query.minPrice) {
    minPrice.value = parseFloat(route.query.minPrice as string);
  }
  
  if (route.query.maxPrice) {
    maxPrice.value = parseFloat(route.query.maxPrice as string);
  }
  
  if (route.query.sortBy) {
    sortBy.value = route.query.sortBy as string;
  }
  
  // Apply filters
  applyFilters();
  
  // Load data
  await Promise.all([
    productStore.loadProducts(),
    productStore.loadCategories()
  ]);
});

// Apply filters to the product store
const applyFilters = () => {
  productStore.setFilters({
    category: selectedCategory.value || undefined,
    minPrice: minPrice.value || undefined,
    maxPrice: maxPrice.value || undefined,
    sortBy: sortBy.value as any || undefined,
    search: searchQuery.value || undefined
  });
  
  // Update URL with filters
  router.replace({
    query: {
      ...(searchQuery.value ? { search: searchQuery.value } : {}),
      ...(selectedCategory.value ? { category: selectedCategory.value } : {}),
      ...(minPrice.value ? { minPrice: minPrice.value.toString() } : {}),
      ...(maxPrice.value ? { maxPrice: maxPrice.value.toString() } : {}),
      ...(sortBy.value ? { sortBy: sortBy.value } : {})
    }
  });
};

// Reset all filters
const resetFilters = () => {
  searchQuery.value = '';
  selectedCategory.value = '';
  minPrice.value = null;
  maxPrice.value = null;
  sortBy.value = '';
  
  productStore.resetFilters();
  
  // Clear URL query params
  router.replace({ query: {} });
};

// Toggle mobile filters
const toggleFilters = () => {
  showFilters.value = !showFilters.value;
};

// Watch for changes in route query parameters
watch(() => route.query, (newQuery) => {
  if (newQuery.search !== searchQuery.value) {
    searchQuery.value = (newQuery.search as string) || '';
  }
  
  if (newQuery.category !== selectedCategory.value) {
    selectedCategory.value = (newQuery.category as string) || '';
  }
  
  if (newQuery.minPrice !== (minPrice.value?.toString() || undefined)) {
    minPrice.value = newQuery.minPrice ? parseFloat(newQuery.minPrice as string) : null;
  }
  
  if (newQuery.maxPrice !== (maxPrice.value?.toString() || undefined)) {
    maxPrice.value = newQuery.maxPrice ? parseFloat(newQuery.maxPrice as string) : null;
  }
  
  if (newQuery.sortBy !== sortBy.value) {
    sortBy.value = (newQuery.sortBy as string) || '';
  }
  
  applyFilters();
}, { deep: true });

// Filtered and sorted products based on the selected filters
const resultsCount = computed(() => {
  return productStore.filteredProducts.length;
});
</script>

<template>
  <div class="bg-gray-50 min-h-screen py-8">
    <div class="container mx-auto px-4">
      <h1 class="text-3xl font-bold mb-8">Shop All Products</h1>
      
      <div class="flex flex-col md:flex-row gap-8">
        <!-- Mobile filter toggle -->
        <button 
          @click="toggleFilters"
          class="md:hidden btn btn-outline w-full mb-4 flex items-center justify-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
        </button>
        
        <!-- Filters sidebar -->
        <aside 
          class="w-full md:w-64 space-y-6 transition-all duration-300"
          :class="{ 'hidden md:block': !showFilters }"
        >
          <div class="bg-white rounded-lg shadow-sm p-4">
            <h3 class="font-semibold text-lg mb-4">Search</h3>
            <div class="relative">
              <input 
                type="text" 
                v-model="searchQuery"
                @input="applyFilters"
                placeholder="Search products..." 
                class="input pl-10"
              />
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-4">
            <h3 class="font-semibold text-lg mb-4">Categories</h3>
            <div class="space-y-2">
              <div class="flex items-center">
                <input 
                  type="radio" 
                  id="all-categories" 
                  name="category"
                  :value="''"
                  v-model="selectedCategory"
                  @change="applyFilters"
                  class="h-4 w-4 text-primary-500 focus:ring-primary-400 border-gray-300 rounded-full"
                />
                <label for="all-categories" class="ml-2 text-gray-700">All Categories</label>
              </div>
              
              <div 
                v-for="category in productStore.categories" 
                :key="category.id"
                class="flex items-center"
              >
                <input 
                  type="radio" 
                  :id="`category-${category.id}`" 
                  name="category"
                  :value="category.id"
                  v-model="selectedCategory"
                  @change="applyFilters"
                  class="h-4 w-4 text-primary-500 focus:ring-primary-400 border-gray-300 rounded-full"
                />
                <label :for="`category-${category.id}`" class="ml-2 text-gray-700">{{ category.name }}</label>
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-4">
            <h3 class="font-semibold text-lg mb-4">Price Range</h3>
            <div class="space-y-4">
              <div>
                <label for="min-price" class="block text-sm text-gray-600 mb-1">Min Price ($)</label>
                <input 
                  type="number" 
                  id="min-price" 
                  v-model="minPrice" 
                  @change="applyFilters"
                  min="0" 
                  placeholder="0" 
                  class="input"
                />
              </div>
              
              <div>
                <label for="max-price" class="block text-sm text-gray-600 mb-1">Max Price ($)</label>
                <input 
                  type="number" 
                  id="max-price" 
                  v-model="maxPrice" 
                  @change="applyFilters"
                  min="0" 
                  placeholder="1000" 
                  class="input"
                />
              </div>
            </div>
          </div>
          
          <div class="bg-white rounded-lg shadow-sm p-4">
            <h3 class="font-semibold text-lg mb-4">Sort By</h3>
            <select 
              v-model="sortBy" 
              @change="applyFilters"
              class="input"
            >
              <option value="">Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
            </select>
          </div>
          
          <button 
            @click="resetFilters"
            class="btn btn-outline w-full"
          >
            Reset Filters
          </button>
        </aside>
        
        <!-- Products grid -->
        <div class="flex-1">
          <div class="mb-6 flex justify-between items-center">
            <p class="text-gray-600">
              Showing <span class="font-medium">{{ resultsCount }}</span> products
            </p>
            
            <!-- Desktop Sort By -->
            <div class="hidden md:block">
              <select 
                v-model="sortBy" 
                @change="applyFilters"
                class="input"
              >
                <option value="">Sort: Default</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
                <option value="popular">Most Popular</option>
              </select>
            </div>
          </div>
          
          <div v-if="productStore.isLoading" class="flex justify-center py-12">
            <div class="spinner"></div>
          </div>
          
          <div v-else-if="productStore.filteredProducts.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 class="text-xl font-medium text-gray-900 mb-2">No Products Found</h3>
            <p class="text-gray-600 mb-6">
              We couldn't find any products matching your criteria. Try adjusting your filters.
            </p>
            <button @click="resetFilters" class="btn btn-primary">
              Reset Filters
            </button>
          </div>
          
          <div 
            v-else
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            <transition-group name="product-grid">
              <ProductCard 
                v-for="product in productStore.filteredProducts" 
                :key="product.id"
                :product="product"
              />
            </transition-group>
          </div>
        </div>
      </div>
    </div>
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