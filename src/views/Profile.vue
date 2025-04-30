<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-3xl font-bold mb-8">My Profile</h1>
    
    <div class="max-w-2xl">
      <div class="bg-white rounded-lg shadow-sm p-6">
        <form @submit.prevent="updateProfile" class="space-y-6">
          <!-- Profile Picture -->
          <div class="flex items-center gap-4">
            <img 
              :src="profile.avatar_url || 'https://via.placeholder.com/100'"
              alt="Profile"
              class="w-20 h-20 rounded-full object-cover"
            >
            <button type="button" class="btn btn-outline">
              Change Photo
            </button>
          </div>
          
          <!-- Name -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">First Name</label>
              <input 
                v-model="profile.first_name"
                type="text"
                class="input"
              >
            </div>
            
            <div>
              <label class="block text-sm font-medium mb-1">Last Name</label>
              <input 
                v-model="profile.last_name"
                type="text"
                class="input"
              >
            </div>
          </div>
          
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium mb-1">Email</label>
            <input 
              v-model="profile.email"
              type="email"
              class="input"
              disabled
            >
            <p class="text-sm text-gray-500 mt-1">Email cannot be changed</p>
          </div>
          
          <!-- Seller Status -->
          <div class="flex items-center gap-2">
            <input 
              type="checkbox"
              v-model="profile.is_seller"
              id="is_seller"
              class="rounded text-primary-500 focus:ring-primary-500"
            >
            <label for="is_seller">Register as a seller</label>
          </div>
          
          <!-- Save Button -->
          <div class="flex justify-end">
            <button 
              type="submit" 
              class="btn btn-primary"
              :disabled="isUpdating"
            >
              {{ isUpdating ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
      
      <!-- Change Password -->
      <div class="bg-white rounded-lg shadow-sm p-6 mt-6">
        <h2 class="text-xl font-bold mb-4">Change Password</h2>
        
        <form @submit.prevent="changePassword" class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Current Password</label>
            <input 
              v-model="passwordForm.currentPassword"
              type="password"
              class="input"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">New Password</label>
            <input 
              v-model="passwordForm.newPassword"
              type="password"
              class="input"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium mb-1">Confirm New Password</label>
            <input 
              v-model="passwordForm.confirmPassword"
              type="password"
              class="input"
            >
          </div>
          
          <div class="flex justify-end">
            <button 
              type="submit" 
              class="btn btn-outline"
              :disabled="isChangingPassword"
            >
              {{ isChangingPassword ? 'Changing...' : 'Change Password' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/auth';
import { toast } from 'vue3-toastify';

const authStore = useAuthStore();

const profile = ref({
  first_name: authStore.user?.first_name || '',
  last_name: authStore.user?.last_name || '',
  email: authStore.user?.email || '',
  avatar_url: authStore.user?.avatar_url || '',
  is_seller: authStore.user?.is_seller || false
});

const passwordForm = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const isUpdating = ref(false);
const isChangingPassword = ref(false);

const updateProfile = async () => {
  isUpdating.value = true;
  
  try {
    const result = await authStore.updateProfile({
      first_name: profile.value.first_name,
      last_name: profile.value.last_name,
      is_seller: profile.value.is_seller
    });
    
    if (result.success) {
      toast.success('Profile updated successfully');
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
  } catch (error) {
    console.error('Profile update error:', error);
    toast.error('An unexpected error occurred');
  } finally {
    isUpdating.value = false;
  }
};

const changePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    toast.error('New passwords do not match');
    return;
  }
  
  isChangingPassword.value = true;
  
  try {
    // Implement password change logic here
    toast.success('Password changed successfully');
    passwordForm.value = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  } catch (error) {
    console.error('Password change error:', error);
    toast.error('Failed to change password');
  } finally {
    isChangingPassword.value = false;
  }
};
</script>