<template>
  <div id="app" class="h-screen w-full flex flex-col bg-black text-white overflow-hidden font-mono">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    
    <!-- Notifications - Brutalist Alert -->
    <div v-if="notification.show"
         class="fixed top-0 left-0 w-full p-4 z-50 pointer-events-none flex justify-center">
      <div class="panel-brutal border-2 bg-black p-4 flex items-center gap-4 shadow-none pointer-events-auto min-w-[300px]"
           :class="getNotificationClass(notification.type)">

        <component :is="notificationIcon" class="w-6 h-6" />
        <span class="font-mono text-sm uppercase tracking-wider font-bold">{{ notification.message }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { 
  Info, 
  CheckSquare,
  AlertOctagon,
  AlertTriangle,
  Moon,
  Sun,
  Skull
} from 'lucide-vue-next';

const authStore = useAuthStore();
const notification = ref({ show: false, message: '', type: 'info' });

const notificationIcon = computed(() => {
  const icons = {
    info: Info,
    success: CheckSquare,
    error: AlertOctagon,
    warning: AlertTriangle,
    night: Moon,
    day: Sun,
    danger: Skull
  };
  return icons[notification.value.type] || Info;
});

function getNotificationClass(type) {
    switch(type) {
        case 'error': return 'border-red-600 text-red-600 animate-blink';
        case 'success': return 'border-green-500 text-green-500';
        case 'warning': return 'border-yellow-500 text-yellow-500';
        case 'danger': return 'border-red-600 text-red-600 animate-blink bg-red-900/20';
        default: return 'border-white text-white';
    }
}

function showNotification(message, type = 'info', duration = 3000) {
  notification.value = { show: true, message, type };
  setTimeout(() => {
    notification.value.show = false;
  }, duration);
}

// Exposer la fonction pour utilisation globale
window.showNotification = showNotification;

onMounted(async () => {
  await authStore.checkAuth();
});
</script>

<style>
/* Reset global si nécessaire en plus de tailwind */
body {
    background: black;
}
</style>
