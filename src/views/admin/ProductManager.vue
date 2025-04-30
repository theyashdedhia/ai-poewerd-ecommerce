<template>
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Product Manager</h1>
        <router-link to="/admin/products/new" class="btn btn-primary">
          Add Product
        </router-link>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="flex justify-between items-center p-4 border-b">
          <div class="relative w-64">
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Search products..."
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          
          <div class="flex gap-2">
            <select v-model="categoryFilter" class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Categories</option>
              <option v-for="category in categories" :key="category" :value="category">{{ category }}</option>
            </select>
            
            <select v-model="statusFilter" class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>
        
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in filteredProducts" :key="product.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10">
                    <img class="h-10 w-10 rounded-md object-cover" :src="product.image_urls[0]" :alt="product.name">
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                    <div class="text-sm text-gray-500">SKU: {{ product.sku }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ product.category }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${{ product.price.toFixed(2) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ product.stock_quantity }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(product.status)}`">
                  {{ product.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <router-link :to="`/admin/products/${product.id}`" class="text-blue-600 hover:text-blue-900 mr-3">Edit</router-link>
                <button @click="confirmDelete(product.id)" class="text-red-600 hover:text-red-900">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button @click="currentPage--" :disabled="currentPage === 1" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Previous
            </button>
            <button @click="currentPage++" :disabled="currentPage === totalPages" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                Showing <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, products.length) }}</span> of <span class="font-medium">{{ products.length }}</span> results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button @click="currentPage--" :disabled="currentPage === 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">Previous</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button v-for="page in totalPages" :key="page" @click="currentPage = page" :class="`${currentPage === page ? 'bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'} relative inline-flex items-center px-4 py-2 border text-sm font-medium`">
                  {{ page }}
                </button>
                <button @click="currentPage++" :disabled="currentPage === totalPages" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">Next</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  
  interface Product {
    id: string;
    name: string;
    sku: string;
    category: string;
    price: number;
    stock_quantity: number;
    status: string;
    image_urls: string[];
  }
  
  const searchQuery = ref('');
  const categoryFilter = ref('');
  const statusFilter = ref('');
  const currentPage = ref(1);
  const itemsPerPage = 10;
  
  const categories = ['Electronics', 'Clothing', 'Home', 'Books', 'Toys'];
  
  const products = ref<Product[]>([
    { id: '1', name: 'Wireless Headphones', sku: 'WH-1000', category: 'Electronics', price: 199.99, stock_quantity: 45, status: 'published', image_urls: ['https://example.com/headphones.jpg'] },
    { id: '2', name: 'Cotton T-Shirt', sku: 'CT-200', category: 'Clothing', price: 24.99, stock_quantity: 120, status: 'published', image_urls: ['https://example.com/tshirt.jpg'] },
    { id: '3', name: 'Smart Watch', sku: 'SW-300', category: 'Electronics', price: 249.99, stock_quantity: 30, status: 'published', image_urls: ['https://example.com/watch.jpg'] },
    { id: '4', name: 'Coffee Table Book', sku: 'CTB-400', category: 'Books', price: 39.99, stock_quantity: 25, status: 'draft', image_urls: ['https://example.com/book.jpg'] },
    { id: '5', name: 'Throw Pillow', sku: 'TP-500', category: 'Home', price: 19.99, stock_quantity: 80, status: 'published', image_urls: ['https://example.com/pillow.jpg'] },
    { id: '6', name: 'Bluetooth Speaker', sku: 'BS-600', category: 'Electronics', price: 89.99, stock_quantity: 15, status: 'published', image_urls: ['https://example.com/speaker.jpg'] },
    { id: '7', name: 'Running Shoes', sku: 'RS-700', category: 'Clothing', price: 79.99, stock_quantity: 50, status: 'published', image_urls: ['https://example.com/shoes.jpg'] },
    { id: '8', name: 'Desk Lamp', sku: 'DL-800', category: 'Home', price: 34.99, stock_quantity: 40, status: 'archived', image_urls: ['https://example.com/lamp.jpg'] },
  ]);
  
  const filteredProducts = computed(() => {
    let result = products.value;
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.sku.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
      );
    }
    
    if (categoryFilter.value) {
      result = result.filter(p => p.category === categoryFilter.value);
    }
    
    if (statusFilter.value) {
      result = result.filter(p => p.status === statusFilter.value);
    }
    
    return result;
  });
  
  const paginatedProducts = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredProducts.value.slice(start, end);
  });
  
  const totalPages = computed(() => {
    return Math.ceil(filteredProducts.value.length / itemsPerPage);
  });
  
  const getStatusClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const confirmDelete = (productId: string) => {
    if (confirm('Are you sure you want to delete this product?')) {
      products.value = products.value.filter(p => p.id !== productId);
    }
  };
  </script>