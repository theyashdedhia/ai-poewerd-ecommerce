import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/supabase/client';
import { useCartStore } from './cart';
import { useAuthStore } from './auth';
import type { Database } from '@/supabase/types';

type Order = Database['public']['Tables']['orders']['Row'] & {
  items?: Database['public']['Tables']['order_items']['Row'][]
};

interface ShippingAddress {
  fullName: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export const useOrderStore = defineStore('orders', () => {
  const authStore = useAuthStore();
  const cartStore = useCartStore();
  
  const orders = ref<Order[]>([]);
  const isLoading = ref(false);
  
  // Load user orders
  async function loadOrders() {
    if (!authStore.isAuthenticated) return;
    
    isLoading.value = true;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('user_id', authStore.user?.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      orders.value = data || [];
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      isLoading.value = false;
    }
  }
  
  // Get a single order by ID
  async function getOrder(id: string) {
    isLoading.value = true;
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          items:order_items(*)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      return { success: true, order: data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to load order' 
      };
    } finally {
      isLoading.value = false;
    }
  }
  
  // Create a new order
  async function createOrder(shippingAddress: ShippingAddress, paymentMethodId?: string) {
    if (!authStore.isAuthenticated) {
      return { 
        success: false, 
        error: 'You must be logged in to place an order' 
      };
    }
    
    if (cartStore.items.length === 0) {
      return { 
        success: false, 
        error: 'Your cart is empty' 
      };
    }
    
    try {
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: authStore.user?.id,
          total_amount: cartStore.totalPrice,
          shipping_address: shippingAddress,
          payment_intent_id: paymentMethodId, // This would be used if implementing a payment processor
          status: 'pending'
        })
        .select()
        .single();
        
      if (orderError) throw orderError;
      
      // Create order items
      const orderItems = cartStore.items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product.name,
        price: item.product.price,
        quantity: item.quantity
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) throw itemsError;
      
      // Clear the cart
      await cartStore.clearCart();
      
      return { 
        success: true, 
        orderId: order.id 
      };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to create order' 
      };
    }
  }
  
  // For sellers: Update order status
  async function updateOrderStatus(orderId: string, status: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);
        
      if (error) throw error;
      
      // Update in local state
      const orderIndex = orders.value.findIndex(o => o.id === orderId);
      if (orderIndex !== -1) {
        orders.value[orderIndex].status = status;
      }
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to update order status' 
      };
    }
  }
  
  // Get count of orders by status (for seller dashboard)
  async function getOrderStats() {
    if (!authStore.isSeller) {
      return { success: false, error: 'Unauthorized' };
    }
    
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('status, count')
        .eq('user_id', authStore.user?.id)
        .group('status');
        
      if (error) throw error;
      
      // Transform to a more useful format
      const stats: Record<string, number> = {};
      
      if (data) {
        data.forEach(item => {
          stats[item.status] = item.count;
        });
      }
      
      return { success: true, stats };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to get order stats' 
      };
    }
  }
  
  return {
    orders,
    isLoading,
    loadOrders,
    getOrder,
    createOrder,
    updateOrderStatus,
    getOrderStats
  };
});