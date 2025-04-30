<template>
    <div class="container mx-auto px-4 py-8">
      <div class="flex justify-between items-center mb-8">
        <h1 class="text-3xl font-bold">Order Manager</h1>
        <div class="flex gap-2">
          <button @click="exportOrders" class="btn btn-secondary">
            Export
          </button>
        </div>
      </div>
      
      <div class="bg-white rounded-lg shadow-sm overflow-hidden">
        <div class="flex justify-between items-center p-4 border-b">
          <div class="relative w-64">
            <input 
              type="text" 
              v-model="searchQuery"
              placeholder="Search orders..."
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
            <svg class="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
          </div>
          
          <div class="flex gap-2">
            <select v-model="statusFilter" class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            
            <input 
              type="date" 
              v-model="dateFilter"
              class="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
          </div>
        </div>
        
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-blue-600 hover:underline">
                <router-link :to="`/admin/orders/${order.id}`">{{ order.id }}</router-link>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ order.customer.name }}</div>
                <div class="text-sm text-gray-500">{{ order.customer.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(order.date) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${{ order.amount.toFixed(2) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <select 
                  v-model="order.status" 
                  @change="updateOrderStatus(order.id, order.status)"
                  :class="`px-2 py-1 text-xs leading-5 font-semibold rounded-full ${getStatusClass(order.status)}`"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <router-link :to="`/admin/orders/${order.id}`" class="text-blue-600 hover:text-blue-900 mr-3">View</router-link>
                <button @click="printInvoice(order.id)" class="text-gray-600 hover:text-gray-900 mr-3">Print</button>
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
                Showing <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to <span class="font-medium">{{ Math.min(currentPage * itemsPerPage, orders.length) }}</span> of <span class="font-medium">{{ orders.length }}</span> results
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
  
  interface Customer {
    name: string;
    email: string;
  }
  
  interface Order {
    id: string;
    customer: Customer;
    date: string;
    amount: number;
    status: string;
  }
  
  const searchQuery = ref('');
  const statusFilter = ref('');
  const dateFilter = ref('');
  const currentPage = ref(1);
  const itemsPerPage = 10;
  
  const orders = ref<Order[]>([
    { id: 'ORD-001', customer: { name: 'John Doe', email: 'john@example.com' }, date: '2023-05-15', amount: 125.99, status: 'completed' },
    { id: 'ORD-002', customer: { name: 'Jane Smith', email: 'jane@example.com' }, date: '2023-05-14', amount: 89.50, status: 'processing' },
    { id: 'ORD-003', customer: { name: 'Robert Johnson', email: 'robert@example.com' }, date: '2023-05-13', amount: 210.00, status: 'shipped' },
    { id: 'ORD-004', customer: { name: 'Emily Davis', email: 'emily@example.com' }, date: '2023-05-12', amount: 65.75, status: 'pending' },
    { id: 'ORD-005', customer: { name: 'Michael Wilson', email: 'michael@example.com' }, date: '2023-05-11', amount: 154.30, status: 'completed' },
    { id: 'ORD-006', customer: { name: 'Sarah Brown', email: 'sarah@example.com' }, date: '2023-05-10', amount: 98.20, status: 'cancelled' },
    { id: 'ORD-007', customer: { name: 'David Taylor', email: 'david@example.com' }, date: '2023-05-09', amount: 75.60, status: 'completed' },
    { id: 'ORD-008', customer: { name: 'Jessica Anderson', email: 'jessica@example.com' }, date: '2023-05-08', amount: 210.45, status: 'shipped' },
  ]);
  
  const filteredOrders = computed(() => {
    let result = orders.value;
    
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase();
      result = result.filter(o => 
        o.id.toLowerCase().includes(query) || 
        o.customer.name.toLowerCase().includes(query) ||
        o.customer.email.toLowerCase().includes(query)
      );
    }
    
    if (statusFilter.value) {
      result = result.filter(o => o.status === statusFilter.value);
    }
    
    if (dateFilter.value) {
      result = result.filter(o => o.date === dateFilter.value);
    }
    
    return result;
  });
  
  const paginatedOrders = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredOrders.value.slice(start, end);
  });
  
  const totalPages = computed(() => {
    return Math.ceil(filteredOrders.value.length / itemsPerPage);
  });
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  const getStatusClass = (status: string) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  const updateOrderStatus = (orderId: string, newStatus: string) => {
    const order = orders.value.find(o => o.id === orderId);
    if (order) {
      order.status = newStatus;
      // In a real app, you would make an API call here
    }
  };
  
  const exportOrders = () => {
    alert('Exporting orders...');
    // In a real app, this would generate a CSV or Excel file
  };
  
  const printInvoice = (orderId: string) => {
    alert(`Printing invoice for order ${orderId}`);
    // In a real app, this would open a print dialog with the invoice
  };
  </script>