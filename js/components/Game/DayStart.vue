<!-- DayStart.vue -->
<template>
  <div class="h-screen w-screen bg-black flex flex-col items-center justify-center p-4">
    <div class="text-center mb-8 animate-pulse">
      <h1 class="text-display text-5xl text-white mb-2">MORNING REPORT</h1>
      <div class="h-1 bg-white w-24 mx-auto"></div>
    </div>

    <div v-if="loading" class="text-mono text-xs">LOADING DATA...</div>

    <div v-else-if="nightDeaths.length > 0" class="w-full max-w-md border-2 border-red-600 p-4">
      <h2 class="text-mono text-red-600 text-sm uppercase mb-4 border-b border-red-900 pb-2">CASUALTIES DETECTED</h2>
      <div class="space-y-4">
        <div v-for="death in nightDeaths" :key="death.id" class="flex justify-between items-end">
          <div>
            <p class="text-display text-2xl text-white">{{ death.user?.name.toUpperCase() }}</p>
            <p class="text-mono text-xs text-gray-500">{{ getRoleName(death.role).toUpperCase() }}</p>
          </div>
          <span class="text-mono text-xs text-red-600">[{{ getDeathReason(death.reason).toUpperCase() }}]</span>
        </div>
      </div>
    </div>

    <div v-else class="border-2 border-green-600 p-6 w-full max-w-md text-center">
      <p class="text-display text-2xl text-green-500">ZERO CASUALTIES</p>
    </div>

    <p class="text-mono text-xs text-gray-600 mt-8 uppercase">PREPARING DEBATE PROTOCOL...</p>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore();
const nightDeaths = ref([]);
const loading = ref(true);

function updateNightDeaths() {
  const deaths = gameStore.currentGame?.state?.night_deaths || [];
  if (deaths.length > 0) {
    nightDeaths.value = deaths.map(death => {
      const player = gameStore.players.find(p => p.id === death.player_id);
      return {
        id: death.player_id,
        user: player?.user || { name: death.name || 'UNKNOWN' },
        role: death.role || player?.role || 'unknown',
        reason: death.reason || 'unknown'
      };
    });
  } else { nightDeaths.value = []; }
  loading.value = false;
}

const getRoleName = (role) => role;
const getDeathReason = (reason) => reason;

onMounted(() => updateNightDeaths());
watch(() => gameStore.currentGame?.state?.night_deaths, () => updateNightDeaths(), { deep: true });
</script>
