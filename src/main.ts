import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import './style.css';

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

// Create the app
const app = createApp(App);

// Use plugins
app.use(createPinia());
app.use(router);

// Mount the app
app.mount('#app');