<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Shopping Cart</h1>
    
    <div v-if="cartStore.isLoading" class="flex justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
    </div>
    
    <div v-else-if="cartStore.items.length === 0" class="text-center py-12">
      <p class="text-gray-600 mb-6">Your cart is empty</p>
      <router-link to="/products" class="btn btn-primary">
        Continue Shopping
      </router-link>
    </div>
    
    <div v-else class="grid md:grid-cols-3 gap-8">
      <!-- Cart Items -->
      <div class="md:col-span-2 space-y-4">
        <div 
          v-for="item in cartStore.items" 
          :key="item.id"
          class="bg-white rounded-lg shadow-sm p-4 flex items-center gap-4"
        >
          <img 
            :src="item.product.image_urls[0]" 
            :alt="item.product.name"
            class="w-24 h-24 object-cover rounded"
          >
          
          <div class="flex-grow">
            <h3 class="font-medium">{{ item.product.name }}</h3>
            <p class="text-gray-600">${{ item.product.price }}</p>
            
            <div class="flex items-center gap-2 mt-2">
              <button 
                @click="updateQuantity(item.id, item.quantity - 1)"
                class="p-1 rounded hover:bg-gray-100"
                :disabled="item.quantity <= 1"
              >
                -
              </button>
              <input 
                type="number" 
                v-model="item.quantity"
                min="1"
                :max="item.product.stock_quantity"
                class="w-16 text-center border rounded p-1"
                @change="updateQuantity(item.id, parseInt($event.target.value))"
              >
              <button 
                @click="updateQuantity(item.id, item.quantity + 1)"
                class="p-1 rounded hover:bg-gray-100"
                :disabled="item.quantity >= item.product.stock_quantity"
              >
                +
              </button>
            </div>
          </div>
          
          <div class="text-right">
            <p class="font-medium">${{ (item.quantity * item.product.price).toFixed(2) }}</p>
            <button 
              @click="removeItem(item.id)"
              class="text-red-600 hover:text-red-700 text-sm mt-2"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
      
      <!-- Order Summary -->
      <div class="bg-white rounded-lg shadow-sm p-6 h-fit">
        <h2 class="text-xl font-bold mb-4">Order Summary</h2>
        
        <div class="space-y-2 mb-4">
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Shipping</span>
            <span>Free</span>
          </div>
          <div class="border-t pt-2 font-bold flex justify-between">
            <span>Total</span>
            <span>${{ cartStore.totalPrice.toFixed(2) }}</span>
          </div>
        </div>
        
        <router-link 
          to="/checkout"
          class="btn btn-primary w-full"
          :disabled="cartStore.items.length === 0"
        >
          Proceed to Checkout
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCartStore } from '../stores/cart';

const cartStore = useCartStore();

const updateQuantity = async (itemId: string, quantity: number) => {
  await cartStore.updateQuantity(itemId, quantity);
};

const removeItem = async (itemId: string) => {
  await cartStore.removeItem(itemId);
};
</script>