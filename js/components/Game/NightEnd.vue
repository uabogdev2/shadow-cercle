<!-- NightEnd.vue -->
<template>
  <div class="h-screen w-screen bg-black flex flex-col items-center justify-center p-4">
    <div class="border-2 border-white p-6 w-full max-w-lg bg-black">
      <h2 class="text-display text-3xl mb-6 text-center border-b-2 border-white pb-4">NIGHT REPORT</h2>
      
      <div v-if="loading" class="text-center py-8">
        <p class="text-mono text-xs animate-pulse">ANALYZING DATA...</p>
      </div>
      
      <div v-else>
        <div v-if="events.length > 0" class="space-y-4 max-h-60 overflow-y-auto font-mono text-sm">
          <div v-for="(event, index) in events" :key="index" class="border border-gray-700 p-2 flex gap-3 items-center">
            <span class="text-2xl">{{ getEventIcon(event.type) }}</span>
            <span class="text-gray-300">{{ event.description.toUpperCase() }}</span>
          </div>
        </div>
        
        <div v-else class="border border-green-900 bg-green-900/10 p-4 text-center">
          <p class="text-green-500 font-mono text-sm">NO ANOMALIES DETECTED</p>
        </div>
        
        <div class="mt-6 text-center border-t border-gray-800 pt-4">
          <p class="text-xs text-gray-600 font-mono">DAY CYCLE INITIATING...</p>
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
  const icons = { 'cupid_match': '💘', 'protect': '🛡️', 'wolf_kill': '🐺', 'wolf_victim': '🩸', 'witch_heal': '💚', 'witch_kill': '💀', 'seer_reveal': '👁️' };
  return icons[type] || '📝';
}

async function loadNightEvents() {
  if (!gameStore.currentGame?.id) { loading.value = false; return; }
  try {
    loading.value = true;
    const response = await axios.get(`/games/${gameStore.currentGame.id}/night-events`);
    if (response.data.success) events.value = response.data.events || [];
  } catch (error) { events.value = []; } finally { loading.value = false; }
}

onMounted(() => loadNightEvents());
</script>
