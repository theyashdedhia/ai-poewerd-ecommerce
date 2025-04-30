import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/supabase/client';
import { useAuthStore } from './auth';
import type { Database } from '@/supabase/types';

type Wishlist = Database['public']['Tables']['wishlists']['Row'] & {
  product: Database['public']['Tables']['products']['Row']
};

export const useWishlistStore = defineStore('wishlist', () => {
  const authStore = useAuthStore();
  const wishlistItems = ref<Wishlist[]>([]);
  const isLoading = ref(false);
  
  // Load wishlist
  async function loadWishlist() {
    if (!authStore.isAuthenticated) return;
    
    isLoading.value = true;
    
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .select(`
          *,
          product:product_id(*)
        `)
        .eq('user_id', authStore.user?.id);
        
      if (error) throw error;
      
      wishlistItems.value = data || [];
    } catch (error) {
      console.error('Failed to load wishlist:', error);
    } finally {
      isLoading.value = false;
    }
  }
  
  // Add to wishlist
  async function addToWishlist(productId: string) {
    if (!authStore.isAuthenticated) {
      return { 
        success: false, 
        error: 'You must be logged in to add items to your wishlist' 
      };
    }
    
    try {
      const { data, error } = await supabase
        .from('wishlists')
        .insert({
          user_id: authStore.user?.id,
          product_id: productId
        })
        .select(`
          *,
          product:product_id(*)
        `)
        .single();
        
      if (error) {
        // If the error is a duplicate, ignore it (user already has this in wishlist)
        if (error.code === '23505') {
          return { success: true };
        }
        throw error;
      }
      
      wishlistItems.value.push(data);
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to add to wishlist' 
      };
    }
  }
  
  // Remove from wishlist
  async function removeFromWishlist(wishlistId: string) {
    try {
      const { error } = await supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistId);
        
      if (error) throw error;
      
      // Update local state
      wishlistItems.value = wishlistItems.value.filter(item => item.id !== wishlistId);
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to remove from wishlist' 
      };
    }
  }
  
  // Check if product is in wishlist
  function isInWishlist(productId: string) {
    return wishlistItems.value.some(item => item.product_id === productId);
  }
  
  // Get wishlist item by product ID
  function getWishlistItem(productId: string) {
    return wishlistItems.value.find(item => item.product_id === productId);
  }
  
  return {
    wishlistItems,
    isLoading,
    loadWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    getWishlistItem
  };
});