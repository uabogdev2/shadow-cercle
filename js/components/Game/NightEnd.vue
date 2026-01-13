<!-- NightEnd.vue -->
<template>
  <div class="night-end h-screen w-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/80 to-slate-950">
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-500/10 rounded-full filter blur-3xl"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 w-full max-w-md">
      <div class="glass-card p-6">
        <h2 class="text-cinzel text-2xl text-violet-300 mb-6 text-center">Rapport de Nuit</h2>
        
        <div v-if="loading" class="text-center py-8">
          <div class="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin mx-auto"></div>
          <p class="text-slate-500 text-sm mt-4">Analyse en cours...</p>
        </div>
        
        <div v-else>
          <div v-if="events.length > 0" class="space-y-3 max-h-60 overflow-y-auto">
            <div 
              v-for="(event, index) in events" 
              :key="index" 
              class="p-3 rounded-xl bg-slate-800/50 border border-slate-700/30 flex gap-3 items-center"
            >
              <span class="text-2xl">{{ getEventIcon(event.type) }}</span>
              <span class="text-slate-300 text-sm">{{ event.description }}</span>
            </div>
          </div>
          
          <div v-else class="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <CheckCircleIcon class="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p class="text-emerald-400">Rien à signaler</p>
          </div>
          
          <div class="mt-6 text-center">
            <p class="text-slate-500 text-sm">Le jour va bientôt se lever...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { CheckCircle as CheckCircleIcon } from 'lucide-vue-next';
import axios from 'axios';

const gameStore = useGameStore();
const events = ref([]);
const loading = ref(true);

function getEventIcon(type) {
  const icons = { 
    'cupid_match': '💘', 
    'protect': '🛡️', 
    'wolf_kill': '🐺', 
    'wolf_victim': '🩸', 
    'witch_heal': '💚', 
    'witch_kill': '💀', 
    'seer_reveal': '👁️' 
  };
  return icons[type] || '📝';
}

async function loadNightEvents() {
  if (!gameStore.currentGame?.id) { 
    loading.value = false; 
    return; 
  }
  try {
    loading.value = true;
    const response = await axios.get(`/games/${gameStore.currentGame.id}/night-events`);
    if (response.data.success) events.value = response.data.events || [];
  } catch (error) { 
    events.value = []; 
  } finally { 
    loading.value = false; 
  }
}

onMounted(() => loadNightEvents());
</script>

<style scoped>
.night-end {
  min-height: 100vh;
  min-height: 100dvh;
}

.text-cinzel {
  font-family: 'Cinzel', 'Playfair Display', serif;
}

.glass-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
</style>
