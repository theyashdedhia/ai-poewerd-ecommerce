import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Database } from '@/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export const useAuthStore = defineStore('auth', () => {
  const user = ref<(Profile | null)>(null);
  const isInitialized = ref(false);
  
  const isAuthenticated = computed(() => !!user.value);
  
  // Initialize the store with the current session
  async function initialize() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        await fetchUserProfile(session.user);
      }
    } catch (error) {
      console.error('Error initializing auth store:', error);
    } finally {
      isInitialized.value = true;
    }
  }
  
  // Fetch user profile data
  async function fetchUserProfile(authUser: User) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUser.id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        user.value = data;
      } else {
        user.value = null;
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      user.value = null;
    }
  }
  
  // Login user
  async function login(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        await fetchUserProfile(data.user);
      }
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to login' 
      };
    }
  }
  
  // Register user
  async function register(email: string, password: string, firstName: string, lastName: string, isSeller: boolean = false) {
    try {
      // 1. Create the auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (authError) throw authError;
      
      if (!authData.user) {
        throw new Error('User registration failed');
      }
      
      // 2. Create the profile
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: authData.user.id,
          email,
          first_name: firstName,
          last_name: lastName,
          is_seller: isSeller
        }
      ]);
      
      if (profileError) throw profileError;
      
      // 3. Fetch complete profile
      await fetchUserProfile(authData.user);
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to register' 
      };
    }
  }
  
  // Update user profile
  async function updateProfile(profileData: Partial<Profile>) {
    try {
      if (!user.value) throw new Error('No user logged in');
      
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.value.id);
        
      if (error) throw error;
      
      // Refresh user data
      user.value = {
        ...user.value,
        ...profileData
      };
      
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to update profile' 
      };
    }
  }
  
  // Logout
  async function logout() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      user.value = null;
      return { success: true };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.message || 'Failed to logout' 
      };
    }
  }
  
  // Check if user is a seller
  const isSeller = computed(() => user.value?.is_seller || false);
  
  return {
    user,
    isInitialized,
    isAuthenticated,
    isSeller,
    initialize,
    login,
    register,
    logout,
    updateProfile,
    fetchUserProfile
  };
});