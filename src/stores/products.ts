import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/supabase/client';
import type { Database } from '@/supabase/types';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];

interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  search?: string;
}

export const useProductStore = defineStore('products', () => {
  const products = ref<Product[]>([]);
  const categories = ref<Category[]>([]);
  const featuredProducts = ref<Product[]>([]);
  const isLoading = ref(false);
  const filters = ref<ProductFilters>({});
  
  // Computed properties
  const filteredProducts = computed(() => {
    let result = [...products.value];
    
    // Apply category filter
    if (filters.value.category) {
      result = result.filter(product => product.category_id === filters.value.category);
    }
    
    // Apply price filters
    if (filters.value.minPrice !== undefined) {
      result = result.filter(product => product.price >= (filters.value.minPrice || 0));
    }
    
    if (filters.value.maxPrice !== undefined) {
      result = result.filter(product => product.price <= (filters.value.maxPrice || Infinity));
    }
    
    // Apply search
    if (filters.value.search) {
      const searchTerm = filters.value.search.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(searchTerm) || 
        (product.description && product.description.toLowerCase().includes(searchTerm))
      );
    }
    
    // Apply sorting
    if (filters.value.sortBy) {
      switch (filters.value.sortBy) {
        case 'price_asc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'price_desc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'newest':
          result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
          break;
        // Popular sorting would typically be based on sales or views, we'll just use a simple random sort for now
        case 'popular':
          result.sort(() => Math.random() - 0.5);
          break;
      }
    }
    
    return result;
  });
  
  // Load all products
  async function loadProducts() {
    isLoading.value = true;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true);
        
      if (error) throw error;
      
      products.value = data || [];
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      isLoading.value = false;
    }
  }
  
  // Load featured products
  async function loadFeaturedProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .eq('is_featured', true)
        .limit(6);
        
      if (error) throw error;
      
      featuredProducts.value = data || [];
    } catch (error) {
      console.error('Failed to load featured products:', error);
    }
  }
  
  // Load product categories
  async function loadCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*');
        
      if (error) throw error;
      
      categories.value = data || [];
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }
  
  // Get single product by ID
  async function getProduct(id: string) {
    isLoading.value = true;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          seller:profiles(*),
          category:categories(*)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      return { success: true, product: data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to load product' 
      };
    } finally {
      isLoading.value = false;
    }
  }
  
  // Set filters
  function setFilters(newFilters: ProductFilters) {
    filters.value = { ...filters.value, ...newFilters };
  }
  
  // Reset filters
  function resetFilters() {
    filters.value = {};
  }
  
  // For sellers: Create/Edit product
  async function saveProduct(productData: Partial<Product>, isNew = false) {
    try {
      if (isNew) {
        // Create new product
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();
          
        if (error) throw error;
        
        // Add to local products list
        products.value.push(data);
        
        return { success: true, product: data };
      } else {
        // Update existing product
        if (!productData.id) throw new Error('Product ID is required for updates');
        
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productData.id)
          .select()
          .single();
          
        if (error) throw error;
        
        // Update in local products list
        const index = products.value.findIndex(p => p.id === data.id);
        if (index !== -1) {
          products.value[index] = data;
        }
        
        return { success: true, product: data };
      }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to save product' 
      };
    }
  }
  
  return {
    products,
    categories,
    featuredProducts,
    isLoading,
    filters,
    filteredProducts,
    loadProducts,
    loadFeaturedProducts,
    loadCategories,
    getProduct,
    setFilters,
    resetFilters,
    saveProduct
  };
});