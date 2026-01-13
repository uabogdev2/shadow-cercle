<template>
  <div id="app" class="min-h-screen w-full flex flex-col bg-eclipse text-white overflow-hidden">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    
    <!-- Notifications - Éclipse Style -->
    <transition name="notification">
      <div v-if="notification.show"
           class="fixed top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
        <div class="notification-card flex items-center gap-3 px-5 py-3 pointer-events-auto"
             :class="getNotificationClass(notification.type)">
          <component :is="notificationIcon" class="w-5 h-5 flex-shrink-0" />
          <span class="text-sm font-medium">{{ notification.message }}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { 
  Info, 
  CheckCircle,
  AlertCircle,
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
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    night: Moon,
    day: Sun,
    danger: Skull
  };
  return icons[notification.value.type] || Info;
});

function getNotificationClass(type) {
    switch(type) {
        case 'error': return 'notification-error';
        case 'success': return 'notification-success';
        case 'warning': return 'notification-warning';
        case 'danger': return 'notification-danger';
        default: return 'notification-info';
    }
}

function showNotification(message, type = 'info', duration = 3000) {
  notification.value = { show: true, message, type };
  setTimeout(() => {
    notification.value.show = false;
  }, duration);
}

// Expose function globally
window.showNotification = showNotification;

onMounted(async () => {
  await authStore.checkAuth();
});
</script>

<style>
/* App global styles */
.bg-eclipse {
  background: linear-gradient(135deg, #020617 0%, #312e81 100%);
  background-attachment: fixed;
}

/* Notification styles */
.notification-card {
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.notification-info {
  border-color: rgba(99, 102, 241, 0.3);
  color: #a5b4fc;
}

.notification-success {
  border-color: rgba(16, 185, 129, 0.3);
  color: #6ee7b7;
}

.notification-error {
  border-color: rgba(239, 68, 68, 0.3);
  color: #fca5a5;
}

.notification-warning {
  border-color: rgba(245, 158, 11, 0.3);
  color: #fcd34d;
}

.notification-danger {
  border-color: rgba(239, 68, 68, 0.5);
  background: rgba(127, 29, 29, 0.5);
  color: #fca5a5;
}

/* Notification animation */
.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}
</style>
