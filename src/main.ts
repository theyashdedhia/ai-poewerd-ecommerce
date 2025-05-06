import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, Notify } from 'quasar'
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
app.use(Quasar, {
    plugins: {Notify }, 
    config: {
      
    }
  });

// Mount the app
app.mount('#app');