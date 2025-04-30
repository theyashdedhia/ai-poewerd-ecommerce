import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../supabase/client';
import { useAuthStore } from './auth';
import type { Database } from '@/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];
type CartItem = Database['public']['Tables']['cart_items']['Row'] & { product: Product };

export const useCartStore = defineStore('cart', () => {
  const authStore = useAuthStore();
  const items = ref<CartItem[]>([]);
  const isLoading = ref(false);
  
  // Computed properties
  const totalItems = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0);
  });
  
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);
  });
  
  // Load cart from Supabase if user is logged in, otherwise from localStorage
  async function loadCart() {
    isLoading.value = true;
    
    try {
      if (authStore.isAuthenticated) {
        // If user is logged in, fetch from Supabase
        const { data, error } = await supabase
          .from('cart_items')
          .select(`
            *,
            product:product_id (
              *
            )
          `)
          .eq('user_id', authStore.user?.id);
          
        if (error) throw error;
        
        items.value = data as CartItem[];
      } else {
        // If not logged in, get from localStorage
        const storedCart = localStorage.getItem('cart');
        if (storedCart) {
          items.value = JSON.parse(storedCart);
        }
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    } finally {
      isLoading.value = false;
    }
  }
  
  // Add item to cart
  async function addItem(productId: string, quantity: number = 1) {
    try {
      // Check if product exists
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();
      
      if (productError) throw productError;
      
      // Check if item is already in cart
      const existingItem = items.value.find(item => item.product_id === productId);
      
      if (authStore.isAuthenticated) {
        // User is logged in, update in Supabase
        if (existingItem) {
          // Update quantity
          const newQuantity = existingItem.quantity + quantity;
          
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', existingItem.id);
            
          if (error) throw error;
          
          // Update local state
          existingItem.quantity = newQuantity;
        } else {
          // Add new item
          const { data, error } = await supabase
            .from('cart_items')
            .insert({
              user_id: authStore.user?.id,
              product_id: productId,
              quantity
            })
            .select(`
              *,
              product:product_id (
                *
              )
            `)
            .single();
            
          if (error) throw error;
          
          // Add to local state
          items.value.push(data as CartItem);
        }
      } else {
        // User is not logged in, use localStorage
        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          items.value.push({
            id: Date.now().toString(),
            user_id: 'guest',
            product_id: productId,
            quantity,
            product: product as Product,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
        
        // Save to localStorage
        localStorage.setItem('cart', JSON.stringify(items.value));
      }
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to add item to cart' 
      };
    }
  }
  
  // Update item quantity
  async function updateQuantity(itemId: string, quantity: number) {
    try {
      if (quantity < 1) {
        return await removeItem(itemId);
      }
      
      const itemIndex = items.value.findIndex(item => item.id === itemId);
      if (itemIndex === -1) throw new Error('Item not found in cart');
      
      if (authStore.isAuthenticated) {
        // Update in Supabase
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('id', itemId);
          
        if (error) throw error;
      }
      
      // Update local state
      items.value[itemIndex].quantity = quantity;
      
      // Update localStorage if not authenticated
      if (!authStore.isAuthenticated) {
        localStorage.setItem('cart', JSON.stringify(items.value));
      }
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to update quantity' 
      };
    }
  }
  
  // Remove item from cart
  async function removeItem(itemId: string) {
    try {
      if (authStore.isAuthenticated) {
        // Remove from Supabase
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('id', itemId);
          
        if (error) throw error;
      }
      
      // Remove from local state
      items.value = items.value.filter(item => item.id !== itemId);
      
      // Update localStorage if not authenticated
      if (!authStore.isAuthenticated) {
        localStorage.setItem('cart', JSON.stringify(items.value));
      }
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to remove item' 
      };
    }
  }
  
  // Clear the entire cart
  async function clearCart() {
    try {
      if (authStore.isAuthenticated) {
        // Clear from Supabase
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', authStore.user?.id);
          
        if (error) throw error;
      }
      
      // Clear local state
      items.value = [];
      
      // Clear localStorage if not authenticated
      if (!authStore.isAuthenticated) {
        localStorage.removeItem('cart');
      }
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to clear cart' 
      };
    }
  }
  
  // Transfer localStorage cart to database after login
  async function transferCartToDatabase() {
    if (!authStore.isAuthenticated) return;
    
    try {
      const storedCart = localStorage.getItem('cart');
      if (!storedCart) return;
      
      const localCart = JSON.parse(storedCart) as CartItem[];
      
      // Get existing cart items from database
      const { data: existingItems, error: fetchError } = await supabase
        .from('cart_items')
        .select('product_id, quantity')
        .eq('user_id', authStore.user?.id);
        
      if (fetchError) throw fetchError;
      
      // Prepare items to insert or update
      for (const item of localCart) {
        const existingItem = existingItems?.find(i => i.product_id === item.product_id);
        
        if (existingItem) {
          // Update quantity of existing item
          await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + item.quantity })
            .eq('user_id', authStore.user?.id)
            .eq('product_id', item.product_id);
        } else {
          // Insert new item
          await supabase
            .from('cart_items')
            .insert({
              user_id: authStore.user?.id,
              product_id: item.product_id,
              quantity: item.quantity
            });
        }
      }
      
      // Clear localStorage
      localStorage.removeItem('cart');
      
      // Reload cart from database
      await loadCart();
    } catch (error) {
      console.error('Failed to transfer cart:', error);
    }
  }
  
  return {
    items,
    isLoading,
    totalItems,
    totalPrice,
    loadCart,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    transferCartToDatabase
  };
});