<template>
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      <div class="grid md:grid-cols-3 gap-6">
        <!-- Stats Cards -->
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-gray-500 text-sm font-medium">Total Products</h3>
          <p class="text-2xl font-bold mt-2">{{ stats.totalProducts }}</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-gray-500 text-sm font-medium">Total Orders</h3>
          <p class="text-2xl font-bold mt-2">{{ stats.totalOrders }}</p>
        </div>
        
        <div class="bg-white rounded-lg shadow-sm p-6">
          <h3 class="text-gray-500 text-sm font-medium">Revenue</h3>
          <p class="text-2xl font-bold mt-2">${{ stats.totalRevenue.toFixed(2) }}</p>
        </div>
      </div>
      
      <!-- Recent Orders -->
      <div class="mt-8 bg-white rounded-lg shadow-sm p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold">Recent Orders</h2>
          <router-link to="/admin/orders" class="text-sm text-blue-600 hover:underline">View All</router-link>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in recentOrders" :key="order.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline">
                  <router-link :to="`/admin/orders/${order.id}`">{{ order.id }}</router-link>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">{{ order.customer }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">{{ formatDate(order.date) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">${{ order.amount.toFixed(2) }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`">
                    {{ order.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  
  interface Stats {
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number;
  }
  
  interface Order {
    id: string;
    customer: string;
    date: string;
    amount: number;
    status: string;
  }
  
  const stats = ref<Stats>({
    totalProducts: 124,
    totalOrders: 56,
    totalRevenue: 12540.00
  });
  
  const recentOrders = ref<Order[]>([
    { id: 'ORD-001', customer: 'John Doe', date: '2023-05-15', amount: 125.99, status: 'Completed' },
    { id: 'ORD-002', customer: 'Jane Smith', date: '2023-05-14', amount: 89.50, status: 'Processing' },
    { id: 'ORD-003', customer: 'Robert Johnson', date: '2023-05-13', amount: 210.00, status: 'Shipped' },
    { id: 'ORD-004', customer: 'Emily Davis', date: '2023-05-12', amount: 65.75, status: 'Pending' },
    { id: 'ORD-005', customer: 'Michael Wilson', date: '2023-05-11', amount: 154.30, status: 'Completed' }
  ]);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  </script>