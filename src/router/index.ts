import { createRouter, createWebHistory } from 'vue-router';
import { supabase } from '../supabase/client';
import { useAuthStore } from '../stores/auth';

// Layouts
import MainLayout from '../layouts/MainLayout.vue';
import AdminLayout from '../layouts/AdminLayout.vue';

// Auth
import Login from '../views/auth/Login.vue';
import Register from '../views/auth/Register.vue';

// Pages
import Home from '../views/Home.vue';
import ProductList from '../views/ProductList.vue';
import ProductDetail from '../views/ProductDetail.vue';
import Cart from '../views/Cart.vue';
import Checkout from '../views/Checkout.vue';
import OrderSuccess from '../views/OrderSuccess.vue';
import Profile from '../views/Profile.vue';
import Orders from '../views/Orders.vue';
import Wishlist from '../views/Wishlist.vue';
import ChatBot from '../views/ChatBot.vue';

// Admin
import Dashboard from '../views/admin/Dashboard.vue';
import ProductManager from '../views/admin/ProductManager.vue';
import OrderManager from '../views/admin/OrderManager.vue';

// 404
import NotFound from '../views/NotFound.vue';

const routes = [
  {
    path: '/',
    component: MainLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: Home,
        meta: { title: 'Home' }
      },
      {
        path: 'products',
        name: 'products',
        component: ProductList,
        meta: { title: 'Products' }
      },
      {
        path: 'products/:id',
        name: 'product-detail',
        component: ProductDetail,
        meta: { title: 'Product Details' }
      },
      {
        path: 'cart',
        name: 'cart',
        component: Cart,
        meta: { title: 'Shopping Cart' }
      },
      {
        path: 'checkout',
        name: 'checkout',
        component: Checkout,
        meta: { requiresAuth: true, title: 'Checkout' }
      },
      {
        path: 'order-success/:id',
        name: 'order-success',
        component: OrderSuccess,
        meta: { requiresAuth: true, title: 'Order Confirmed' }
      },
      {
        path: 'profile',
        name: 'profile',
        component: Profile,
        meta: { requiresAuth: true, title: 'My Profile' }
      },
      {
        path: 'orders',
        name: 'orders',
        component: Orders,
        meta: { requiresAuth: true, title: 'My Orders' }
      },
      {
        path: 'wishlist',
        name: 'wishlist',
        component: Wishlist,
        meta: { requiresAuth: true, title: 'My Wishlist' }
      },
      {
        path: 'chat',
        name: 'chat',
        component: ChatBot,
        meta: { title: 'Customer Support' }
      }
    ]
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true, requiresSeller: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: Dashboard,
        meta: { title: 'Admin Dashboard' }
      },
      {
        path: 'products',
        name: 'admin-products',
        component: ProductManager,
        meta: { title: 'Product Management' }
      },
      {
        path: 'orders',
        name: 'admin-orders',
        component: OrderManager,
        meta: { title: 'Order Management' }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: { guestOnly: true, title: 'Login' }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: { guestOnly: true, title: 'Register' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFound,
    meta: { title: 'Page Not Found' }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return { top: 0 };
    }
  }
});

// Navigation guards
router.beforeEach(async (to, from, next) => {
  // Set document title
  document.title = `${to.meta.title} | Shopify` || 'Shopify';
  
  const authStore = useAuthStore();
  
  // Check if user data is already loaded
  if (!authStore.isInitialized) {
    await authStore.initialize();
  }

  const isLoggedIn = authStore.isAuthenticated;
  const isSeller = authStore.user?.is_seller;
  
  // Routes that require authentication
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isLoggedIn) {
      next({ name: 'login', query: { redirect: to.fullPath } });
      return;
    }
    
    // Routes that require seller privileges
    if (to.matched.some(record => record.meta.requiresSeller) && !isSeller) {
      next({ name: 'home' });
      return;
    }
  }
  
  // Routes for guests only (like login page)
  if (to.matched.some(record => record.meta.guestOnly) && isLoggedIn) {
    next({ name: 'home' });
    return;
  }
  
  next();
});

export default router;