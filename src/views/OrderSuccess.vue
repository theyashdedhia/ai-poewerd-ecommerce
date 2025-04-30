<template>
  <div class="container mx-auto px-4 py-12">
    <div class="max-w-2xl mx-auto text-center">
      <div class="mb-8 text-green-500">
        <!-- Success checkmark circle -->
        <div class="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          ✓
        </div>
      </div>
      
      <h1 class="text-3xl font-bold mb-4">Order Confirmed!</h1>
      <p class="text-gray-600 mb-8">
        Thank you for your purchase. Your order has been successfully placed.
      </p>
      
      <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 class="text-xl font-bold mb-4">Order Details</h2>
        
        <div class="text-left">
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-sm text-gray-600">Order Number</p>
              <p class="font-medium">{{ order?.id }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-600">Order Date</p>
              <p class="font-medium">{{ formatDate(order?.created_at) }}</p>
            </div>
          </div>
          
          <div class="border-t pt-4">
            <h3 class="font-medium mb-2">Items Ordered</h3>
            <div class="space-y-4">
              <div 
                v-for="item in order?.items" 
                :key="item.id"
                class="flex items-center gap-4"
              >
                <div class="flex-grow">
                  <p class="font-medium">{{ item.product_name }}</p>
                  <p class="text-sm text-gray-600">Quantity: {{ item.quantity }}</p>
                </div>
                <p class="font-medium">${{ item.price.toFixed(2) }}</p>
              </div>
            </div>
          </div>
          
          <div class="border-t mt-4 pt-4">
            <div class="flex justify-between font-bold">
              <span>Total</span>
              <span>${{ order?.total_amount.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="flex justify-center gap-4">
        <router-link to="/orders" class="btn btn-outline">
          View All Orders
        </router-link>
        <router-link to="/products" class="btn btn-primary">
          Continue Shopping
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useOrderStore } from '../stores/orders';

const route = useRoute();
const orderStore = useOrderStore();
const order = ref(null);

onMounted(async () => {
  const result = await orderStore.getOrder(route.params.id as string);
  if (result.success) {
    order.value = result.order;
  }
});

const formatDate = (dateString?: string) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString();
};
</script>