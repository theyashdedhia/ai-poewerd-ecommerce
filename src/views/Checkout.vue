<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">Checkout</h1>
    
    <div class="grid md:grid-cols-2 gap-8">
      <!-- Shipping Information -->
      <div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold mb-4">Shipping Information</h2>
          
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium mb-1">Full Name</label>
              <input 
                v-model="shippingInfo.fullName"
                type="text"
                required
                class="input"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Street Address</label>
              <input 
                v-model="shippingInfo.streetAddress"
                type="text"
                required
                class="input"
              >
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">City</label>
                <input 
                  v-model="shippingInfo.city"
                  type="text"
                  required
                  class="input"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-1">State</label>
                <input 
                  v-model="shippingInfo.state"
                  type="text"
                  required
                  class="input"
                >
              </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium mb-1">Postal Code</label>
                <input 
                  v-model="shippingInfo.postalCode"
                  type="text"
                  required
                  class="input"
                >
              </div>
              
              <div>
                <label class="block text-sm font-medium mb-1">Country</label>
                <input 
                  v-model="shippingInfo.country"
                  type="text"
                  required
                  class="input"
                >
              </div>
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Phone</label>
              <input 
                v-model="shippingInfo.phone"
                type="tel"
                required
                class="input"
              >
            </div>
          </form>
        </div>
        
        <!-- Payment Information -->
        <div class="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 class="text-xl font-bold mb-4">Payment Information</h2>
          <!-- Payment form will be added here -->
          <p class="text-gray-600">Payment integration coming soon</p>
        </div>
      </div>
      
      <!-- Order Summary -->
      <div>
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h2 class="text-xl font-bold mb-4">Order Summary</h2>
          
          <div class="space-y-4 mb-6">
            <div 
              v-for="item in cartStore.items" 
              :key="item.id"
              class="flex items-center gap-4"
            >
              <img 
                :src="item.product.image_urls[0]" 
                :alt="item.product.name"
                class="w-16 h-16 object-cover rounded"
              >
              
              <div class="flex-grow">
                <h3 class="font-medium">{{ item.product.name }}</h3>
                <p class="text-gray-600">Qty: {{ item.quantity }}</p>
              </div>
              
              <p class="font-medium">
                ${{ (item.quantity * item.product.price).toFixed(2) }}
              </p>
            </div>
          </div>
          
          <div class="border-t pt-4 space-y-2">
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
          
          <button 
            @click="placeOrder"
            class="btn btn-primary w-full mt-6"
            :disabled="isProcessing"
          >
            {{ isProcessing ? 'Processing...' : 'Place Order' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '../stores/cart';
import { useOrderStore } from '../stores/orders';
import { toast } from 'vue3-toastify';

const router = useRouter();
const cartStore = useCartStore();
const orderStore = useOrderStore();

const isProcessing = ref(false);

const shippingInfo = ref({
  fullName: '',
  streetAddress: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: ''
});

const placeOrder = async () => {
  if (!shippingInfo.value.fullName) {
    toast.error('Please fill in shipping information');
    return;
  }
  
  isProcessing.value = true;
  
  try {
    const result = await orderStore.createOrder(shippingInfo.value);
    
    if (result.success) {
      router.push(`/order-success/${result.orderId}`);
    } else {
      toast.error(result.error || 'Failed to place order');
    }
  } catch (error) {
    console.error('Order error:', error);
    toast.error('An unexpected error occurred');
  } finally {
    isProcessing.value = false;
  }
};
</script>