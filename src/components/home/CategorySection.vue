<script setup lang="ts">
import type { Database } from '@/supabase/types';

type Category = Database['public']['Tables']['categories']['Row'];

defineProps<{
  categories: Category[];
}>();

// Mapping of category slugs to image URLs
const categoryImages: Record<string, string> = {
  'electronics': 'https://images.pexels.com/photos/1779487/pexels-photo-1779487.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'clothing': 'https://images.pexels.com/photos/934070/pexels-photo-934070.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'home-kitchen': 'https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'books': 'https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  'beauty': 'https://images.pexels.com/photos/2253834/pexels-photo-2253834.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
  // Default image for any category without a specific image
  'default': 'https://images.pexels.com/photos/5632379/pexels-photo-5632379.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2'
};

const getCategoryImage = (categorySlug: string) => {
  return categoryImages[categorySlug] || categoryImages.default;
};
</script>

<template>
  <section class="py-16">
    <div class="container mx-auto px-4">
      <h2 class="text-3xl font-bold text-center mb-12">Shop by Category</h2>
      
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <router-link
          v-for="category in categories"
          :key="category.id"
          :to="`/products?category=${category.id}`"
          class="group"
        >
          <div class="relative overflow-hidden rounded-lg shadow-md h-64 transition-transform transform group-hover:scale-[1.02]">
            <img 
              :src="getCategoryImage(category.slug)" 
              :alt="category.name"
              class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
            <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
              <div>
                <h3 class="text-xl font-bold text-white mb-2">{{ category.name }}</h3>
                <p class="text-gray-200 text-sm">{{ category.description }}</p>
              </div>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </section>
</template>