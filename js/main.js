import { createApp } from 'vue';
import { createPinia } from 'pinia';
import router from './router';
import App from './App.vue';
import { MotionPlugin } from '@vueuse/motion';
import './bootstrap';

const pinia = createPinia();
const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(MotionPlugin);

// Gestion des erreurs
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue Error:', err);
  console.error('Component:', instance);
  console.error('Info:', info);
  
  // Afficher l'erreur à l'utilisateur si possible
  if (window.showNotification) {
    window.showNotification('Une erreur est survenue: ' + (err.message || err), 'error');
  }
};

// Vérifier que l'élément #app existe
const appElement = document.getElementById('app');
if (!appElement) {
  console.error('Element #app not found in DOM!');
  document.body.innerHTML = '<div style="padding: 20px; color: red;">Erreur: L\'élément #app est introuvable dans le DOM.</div>';
} else {
  app.mount('#app');
  console.log('Vue app mounted successfully');
}
