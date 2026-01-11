<template>
  <div class="night-end-container relative h-screen w-screen overflow-hidden bg-midnight-blue flex items-center justify-center p-4 animate-fade-in">
    <!-- Background -->
    <div class="absolute inset-0 bg-deep-indigo/20 z-0"></div>

    <!-- Results Card -->
    <div class="results-card glass-surface border-glass-border rounded-2xl shadow-lg p-6 max-w-2xl w-full animate-scale-in">
      <h2 class="font-serif text-2xl font-bold text-cream text-center mb-6 text-shadow-sm">
        🌙 Résultats de la nuit
      </h2>
      
      <div v-if="loading" class="text-center py-8">
        <div class="spinner mx-auto mb-4"></div>
        <p class="text-cream/60 font-sans">Chargement des événements...</p>
      </div>
      
      <div v-else>
        <!-- Événements -->
        <div v-if="events.length > 0" class="events-section">
          <div class="events-list space-y-3 custom-scrollbar scrollbar-dark">
            <div 
              v-for="(event, index) in events" 
              :key="index"
              :class="['event-item', `event-${event.type}`, 'animate-slide-in-left']"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div class="event-icon text-3xl">{{ getEventIcon(event.type) }}</div>
              <div class="event-description font-sans text-text-light">
                {{ event.description }}
              </div>
            </div>
          </div>
        </div>
        
        <!-- Aucun événement -->
        <div v-else class="no-events glass-surface border-green-500/30 rounded-lg p-6 text-center animate-fade-in">
          <p class="text-green-400 font-sans text-lg font-semibold">
            ✅ Rien ne s'est passé cette nuit
          </p>
        </div>
        
        <!-- Message de transition -->
        <div class="transition-message text-center mt-6 pt-6 border-t border-glass-border animate-fade-in-up">
          <p class="text-cream/60 font-sans text-sm italic">
            Le jour se lève bientôt...
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import axios from 'axios';

const gameStore = useGameStore();
const events = ref([]);
const loading = ref(true);

function getEventIcon(type) {
  const icons = {
    'cupid_match': '💘',
    'protect': '🛡️',
    'wolf_kill': '🐺',
    'wolf_victim': '🐺',
    'witch_heal': '🧪',
    'witch_kill': '☠️',
    'seer_reveal': '🔮'
  };
  return icons[type] || '📋';
}

async function loadNightEvents() {
  if (!gameStore.currentGame?.id) {
    loading.value = false;
    return;
  }
  
  try {
    loading.value = true;
    const response = await axios.get(`/games/${gameStore.currentGame.id}/night-events`);
    if (response.data.success) {
      events.value = response.data.events || [];
    }
  } catch (error) {
    console.error('Error loading night events:', error);
    events.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadNightEvents();
});
</script>

<style scoped>
.event-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: var(--radius-lg);
  border-left: 4px solid;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(8px);
}

.event-icon {
  min-width: 3rem;
  text-align: center;
  font-size: 2rem;
}

.event-description {
  flex: 1;
  font-size: 1rem;
  line-height: 1.5;
}

.events-section {
  width: 100%;
}

.events-list {
  max-height: 50vh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  padding-right: 0.5rem;
}

/* Scrollbar personnalisée pour events-list */
.events-list {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.events-list::-webkit-scrollbar {
  width: 6px;
}

.events-list::-webkit-scrollbar-track {
  background: transparent;
}

.events-list::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}

.events-list::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Event types colors */
.event-cupid_match {
  border-color: #EC4899;
  background: rgba(236, 72, 153, 0.2);
}

.event-protect {
  border-color: #4299E1;
  background: rgba(66, 153, 225, 0.2);
}

.event-wolf_kill,
.event-wolf_victim {
  border-color: var(--color-blood-red);
  background: rgba(239, 68, 68, 0.2);
}

.event-witch_heal {
  border-color: #48BB78;
  background: rgba(72, 187, 120, 0.2);
}

.event-witch_kill {
  border-color: #DC2626;
  background: rgba(239, 68, 68, 0.3);
}

.event-seer_reveal {
  border-color: var(--color-electric-violet);
  background: rgba(124, 58, 237, 0.2);
}

/* Responsive */
@media (max-width: 768px) {
  .results-card {
    padding: 1.5rem;
  }
  
  .events-list {
    max-height: 40vh;
  }
  
  .event-item {
    padding: 0.75rem;
    gap: 0.75rem;
  }
  
  .event-icon {
    font-size: 1.5rem;
    min-width: 2rem;
  }
  
  .event-description {
    font-size: 0.875rem;
  }
}

@media (max-width: 360px) {
  .night-end-container {
    padding: 0.75rem;
  }
  
  .results-card {
    padding: 1rem;
  }
  
  .results-card :deep(h2) {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }
  
  .events-list {
    max-height: 35vh;
    padding-right: 0.25rem;
  }
  
  .event-item {
    padding: 0.5rem;
    gap: 0.5rem;
  }
  
  .event-icon {
    font-size: 1.25rem;
    min-width: 1.75rem;
  }
  
  .event-description {
    font-size: 0.75rem;
  }
  
  .transition-message :deep(p) {
    font-size: 0.625rem;
  }
  
  .no-events :deep(p) {
    font-size: 0.875rem;
  }
}

/* Prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .event-item {
    animation: none;
  }
  
  .animate-slide-in-left {
    animation: none;
  }
}
</style>
