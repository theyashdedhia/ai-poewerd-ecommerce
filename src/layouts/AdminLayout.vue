<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import AdminSidebar from '../components/admin/AdminSidebar.vue';
import AdminHeader from '../components/admin/AdminHeader.vue';

const authStore = useAuthStore();
const router = useRouter();

onMounted(async () => {
  // Check if user is authenticated and is a seller
  if (!authStore.isAuthenticated) {
    router.push('/login');
    return;
  }
  
  if (!authStore.isSeller) {
    router.push('/');
  }
});
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Admin Header -->
    <AdminHeader />
    
    <div class="flex">
      <!-- Sidebar -->
      <AdminSidebar />
      
      <!-- Main content -->
      <div class="flex-1 p-8">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>