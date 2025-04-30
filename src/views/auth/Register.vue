<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { toast } from 'vue3-toastify';

const authStore = useAuthStore();
const router = useRouter();

const firstName = ref('');
const lastName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const isSeller = ref(false);
const isLoading = ref(false);
const showPassword = ref(false);

const register = async () => {
  // Validate inputs
  if (!firstName.value || !lastName.value || !email.value || !password.value) {
    toast.error('Please fill in all required fields');
    return;
  }
  
  if (password.value !== confirmPassword.value) {
    toast.error('Passwords do not match');
    return;
  }
  
  if (password.value.length < 8) {
    toast.error('Password must be at least 8 characters long');
    return;
  }
  
  isLoading.value = true;
  
  try {
    const result = await authStore.register(
      email.value, 
      password.value, 
      firstName.value, 
      lastName.value,
      isSeller.value
    );
    
    if (result.success) {
      toast.success('Registration successful! Welcome to Shopify.');
      router.push('/');
    } else {
      toast.error(result.error || 'Registration failed');
    }
  } catch (error) {
    console.error('Registration error:', error);
    toast.error('An unexpected error occurred');
  } finally {
    isLoading.value = false;
  }
};

const togglePasswordVisibility = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full bg-white rounded-lg shadow-md p-8 animate-fadeIn">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">Create an Account</h1>
        <p class="text-gray-600">Sign up to start shopping with us</p>
      </div>
      
      <form @submit.prevent="register" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="firstName" class="block text-sm font-medium text-gray-700 mb-1">First Name</label>
            <input
              id="firstName"
              v-model="firstName"
              type="text"
              required
              class="input"
              placeholder="John"
            />
          </div>
          
          <div>
            <label for="lastName" class="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
            <input
              id="lastName"
              v-model="lastName"
              type="text"
              required
              class="input"
              placeholder="Doe"
            />
          </div>
        </div>
        
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="input"
            placeholder="your@email.com"
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              class="input pr-10"
              placeholder="••••••••"
            />
            <button
              type="button"
              @click="togglePasswordVisibility"
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 focus:outline-none"
            >
              <svg v-if="showPassword" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            class="input"
            placeholder="••••••••"
          />
        </div>
        
        <div class="flex items-center">
          <input
            id="isSeller"
            v-model="isSeller"
            type="checkbox"
            class="h-4 w-4 text-primary-500 focus:ring-primary-400 border-gray-300 rounded"
          />
          <label for="isSeller" class="ml-2 block text-sm text-gray-700">
            Register as a seller
          </label>
        </div>
        
        <div>
          <button
            type="submit"
            class="w-full btn btn-primary py-3"
            :disabled="isLoading"
          >
            <span v-if="isLoading">Creating account...</span>
            <span v-else>Create Account</span>
          </button>
        </div>
      </form>
      
      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Already have an account? 
          <router-link to="/login" class="font-medium text-primary-500 hover:text-primary-600">
            Sign in
          </router-link>
        </p>
      </div>
    </div>
  </div>
</template>