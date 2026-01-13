<!-- DayReveal.vue -->
<template>
  <div class="h-screen w-screen bg-black flex flex-col items-center justify-center p-4">
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-display text-5xl text-white mb-2">MORNING REPORT</h1>
      <p class="text-mono text-xs text-gray-500 uppercase">Day {{ gameStore.currentGame?.day_number }}</p>
      <div class="h-1 bg-white w-24 mx-auto mt-2"></div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="text-mono text-xs animate-pulse">LOADING DATA...</div>

    <!-- Deaths section -->
    <div v-else-if="nightDeaths.length > 0" class="w-full max-w-md">
      <div class="border-2 border-red-600 p-4">
        <h2 class="text-mono text-red-600 text-sm uppercase mb-4 border-b border-red-900 pb-2 flex items-center justify-between">
          <span>CASUALTIES DETECTED</span>
          <span class="text-red-400">{{ nightDeaths.length }}</span>
        </h2>
        
        <div class="space-y-4">
          <div 
            v-for="death in nightDeaths" 
            :key="death.id" 
            class="border border-red-900/50 p-3 bg-red-900/10"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <p class="text-display text-xl text-white">{{ death.user?.name?.toUpperCase() }}</p>
                <p class="text-mono text-xs text-gray-500">{{ getRoleName(death.role).toUpperCase() }}</p>
              </div>
              <div class="text-2xl">{{ getRoleIcon(death.role) }}</div>
            </div>
            <div class="flex items-center gap-2">
              <span class="w-2 h-2 bg-red-600"></span>
              <span class="text-mono text-xs text-red-600 uppercase">{{ getDeathReason(death.reason) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No deaths -->
    <div v-else class="border-2 border-green-600 p-6 w-full max-w-md text-center">
      <div class="w-12 h-12 border-2 border-green-500 mx-auto mb-4 flex items-center justify-center">
        <span class="text-green-500 text-2xl">✓</span>
      </div>
      <p class="text-display text-2xl text-green-500">ZERO CASUALTIES</p>
      <p class="text-mono text-xs text-green-700 mt-2 uppercase">All personnel accounted for</p>
    </div>

    <!-- Timer / Continue -->
    <div class="mt-8 text-center">
      <Timer :seconds="gameStore.timer" variant="digital" size="sm" />
      <p class="text-mono text-xs text-gray-600 mt-4 uppercase animate-pulse">PREPARING DEBATE PROTOCOL...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import Timer from '@/components/UI/Timer.vue';

const gameStore = useGameStore();
const nightDeaths = ref([]);
const loading = ref(true);

// Computed property for raw night deaths data from game state
const rawNightDeaths = computed(() => gameStore.currentGame?.state?.night_deaths || []);

function updateNightDeaths() {
  const deaths = rawNightDeaths.value;
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
  } else {
    nightDeaths.value = [];
  }
  loading.value = false;
}

function getRoleName(role) {
  const roleNames = {
    werewolf: 'Werewolf',
    seer: 'Seer',
    witch: 'Witch',
    guard: 'Guard',
    hunter: 'Hunter',
    cupid: 'Cupid',
    elder: 'Elder',
    fool: 'Fool',
    villager: 'Civilian'
  };
  return roleNames[role] || role || 'Unknown';
}

function getRoleIcon(role) {
  const icons = {
    werewolf: '🐺',
    seer: '🔮',
    witch: '🧪',
    guard: '🛡️',
    hunter: '🔫',
    cupid: '💘',
    elder: '👴',
    fool: '🃏',
    villager: '🧑'
  };
  return icons[role] || '❓';
}

function getDeathReason(reason) {
  const reasons = {
    wolf_kill: 'Killed by Wolves',
    witch_kill: 'Poisoned by Witch',
    hunter_shoot: 'Shot by Hunter',
    lover_death: 'Died of Heartbreak',
    vote: 'Executed by Village',
    unknown: 'Cause Unknown'
  };
  return reasons[reason] || reason || 'Unknown Cause';
}

onMounted(() => updateNightDeaths());
watch(rawNightDeaths, () => updateNightDeaths(), { deep: true });
</script>
