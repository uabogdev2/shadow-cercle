import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import HomeView from '@/views/HomeView.vue';
import LobbyView from '@/views/LobbyView.vue';
import GameView from '@/views/GameView.vue';

const routes = [
  { 
    path: '/', 
    name: 'home',
    component: HomeView 
  },
  { 
    path: '/lobby/:code', 
    name: 'lobby',
    component: LobbyView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/game/:id', 
    name: 'game',
    component: GameView,
    meta: { requiresAuth: true }
  },
  { 
    path: '/join/:code', 
    name: 'join',
    redirect: to => ({ name: 'lobby', params: { code: to.params.code } })
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Garde d'authentification
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  // Si on a un token mais pas d'utilisateur, essayer de récupérer l'utilisateur
  if (!authStore.user && authStore.token) {
    try {
      await authStore.fetchUserInfo();
    } catch (error) {
      // Si ça échoue et que c'est une erreur 401, le token est invalide
      if (error.response?.status === 401) {
        console.log('⚠️ Token invalide, redirection vers home');
      }
      // Sinon, on laisse passer (erreur réseau, etc.)
    }
  }
  
  // Si la route nécessite une authentification
  if (to.meta.requiresAuth) {
    if (!authStore.user) {
      console.log('🚫 Route protégée, utilisateur non connecté, redirection vers home');
      next('/');
    } else {
      console.log('✅ Route protégée, utilisateur connecté:', authStore.user.name);
      next();
    }
  } else {
    next();
  }
});

export default router;

