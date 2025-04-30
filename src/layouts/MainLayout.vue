<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useCartStore } from '../stores/cart';
import NavBar from '../components/layout/NavBar.vue';
import Footer from '../components/layout/Footer.vue';

const authStore = useAuthStore();
const cartStore = useCartStore();
const router = useRouter();

const isScrolled = ref(false);

// Handle scrolling for transparent navbar effect
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  handleScroll(); // Check initial scroll position
});

// Clean up event listener
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// Listen for authentication changes
watch(() => authStore.isAuthenticated, async (isAuthenticated) => {
  if (isAuthenticated) {
    // If user just logged in, reload cart from database
    await cartStore.loadCart();
  }
});
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Header/Navbar -->
    <NavBar :is-scrolled="isScrolled" />
    
    <!-- Main content -->
    <main class="flex-grow">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- Footer -->
    <Footer />
  </div>
</template>

<style scoped>
.page-enter-active,
.page-leave-active {
  transition: opacity 0.2s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
}
</style>