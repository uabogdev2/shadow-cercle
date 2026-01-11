<template>
  <div id="app">
    <router-view />
    
    <!-- Notifications - Toast Glassmorphic -->
    <Transition
      enter-active-class="notification-enter-active"
      leave-active-class="notification-leave-active"
      enter-from-class="notification-enter-from"
      leave-to-class="notification-leave-to"
    >
      <div
        v-if="notification.show"
        class="notification"
        :class="['notification--' + notification.type]"
      >
        <component :is="notificationIcon" class="notification__icon" />
        <span class="notification__message">{{ notification.message }}</span>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { 
  Info, 
  CheckCircle2, 
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
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    night: Moon,
    day: Sun,
    danger: Skull
  };
  return icons[notification.value.type] || Info;
});

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

<style scoped>
/* ============================================
   NOTIFICATIONS - Toast Glassmorphic
   ============================================ */

.notification {
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  
  display: flex;
  align-items: center;
  gap: 0.75rem;
  
  padding: 1rem 1.5rem;
  max-width: 90%;
  min-width: 280px;
  
  background: var(--color-glass-surface);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-glass-border);
  border-radius: var(--radius-lg);
  
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

.notification__icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.notification__message {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  color: var(--color-text-light);
}

/* Variants par type */
.notification--info {
  border-left: 3px solid #4299E1;
}

.notification--info .notification__icon {
  color: #4299E1;
}

.notification--success {
  border-left: 3px solid #48BB78;
}

.notification--success .notification__icon {
  color: #48BB78;
}

.notification--error {
  border-left: 3px solid var(--color-blood-red);
}

.notification--error .notification__icon {
  color: var(--color-blood-red);
}

.notification--warning {
  border-left: 3px solid #ED8936;
}

.notification--warning .notification__icon {
  color: #ED8936;
}

.notification--night {
  border-left: 3px solid var(--color-electric-violet);
}

.notification--night .notification__icon {
  color: var(--color-electric-violet);
}

.notification--day {
  border-left: 3px solid var(--color-soft-gold);
}

.notification--day .notification__icon {
  color: var(--color-soft-gold);
}

.notification--danger {
  border-left: 3px solid var(--color-blood-red);
  box-shadow: 0 0 15px rgba(239, 68, 68, 0.3);
}

.notification--danger .notification__icon {
  color: var(--color-blood-red);
}

/* Animations */
.notification-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.notification-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-1rem);
}

.notification-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-1rem);
}

/* Responsive */
@media (max-width: 768px) {
  .notification {
    left: 1rem;
    right: 1rem;
    max-width: none;
    min-width: auto;
    transform: none;
  }
  
  .notification-enter-from,
  .notification-leave-to {
    transform: translateY(-1rem);
  }
}

@media (max-width: 360px) {
  .notification {
    left: 0.75rem;
    right: 0.75rem;
    padding: 0.75rem 1rem;
  }
  
  .notification__icon {
    width: 1rem;
    height: 1rem;
  }
  
  .notification__message {
    font-size: 0.75rem;
  }
}

/* Respecter prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .notification-enter-active,
  .notification-leave-active {
    transition: opacity 0.01ms;
  }
  
  .notification-enter-from,
  .notification-leave-to {
    transform: none;
  }
}
</style>

