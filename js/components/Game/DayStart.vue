<!-- DayStart.vue -->
<template>
  <div class="day-start h-screen w-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <!-- Day Background -->
    <div class="absolute inset-0 bg-gradient-to-b from-amber-100/10 via-slate-900 to-slate-950">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full filter blur-3xl"></div>
    </div>

    <!-- Sun -->
    <div class="absolute top-10 right-10 w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.4)]"></div>

    <div class="relative z-10 text-center mb-8">
      <h1 class="text-cinzel text-3xl text-amber-400 mb-2">Le Jour se Lève</h1>
      <div class="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
    </div>

    <div v-if="loading" class="relative z-10">
      <div class="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
    </div>

    <div v-else-if="nightDeaths.length > 0" class="relative z-10 w-full max-w-md glass-card p-6 border-red-500/30">
      <div class="flex items-center justify-center gap-3 mb-6">
        <SkullIcon class="w-6 h-6 text-red-500" />
        <h2 class="text-red-400 text-lg font-medium">Victimes de la nuit</h2>
      </div>
      
      <div class="space-y-4">
        <div v-for="death in nightDeaths" :key="death.id" class="p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-white text-lg font-medium">{{ death.user?.name }}</p>
              <p class="text-slate-400 text-sm">{{ getRoleName(death.role) }}</p>
            </div>
            <span class="text-red-400 text-sm">{{ getDeathReason(death.reason) }}</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="relative z-10 glass-card p-8 text-center border-emerald-500/30">
      <CheckCircleIcon class="w-12 h-12 text-emerald-500 mx-auto mb-4" />
      <h2 class="text-emerald-400 text-xl font-medium">Nuit Paisible</h2>
      <p class="text-slate-400 text-sm mt-2">Personne n'est mort cette nuit</p>
    </div>

    <p class="relative z-10 text-slate-500 text-sm mt-8 animate-pulse">Préparation du débat...</p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Skull as SkullIcon, CheckCircle as CheckCircleIcon } from 'lucide-vue-next';

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
        user: player?.user || { name: death.name || 'Inconnu' },
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
  const names = {
    werewolf: 'Loup-Garou', seer: 'Voyante', witch: 'Sorcière', guard: 'Garde',
    hunter: 'Chasseur', cupid: 'Cupidon', elder: 'Ancien', fool: 'Idiot', villager: 'Villageois'
  };
  return names[role] || role;
}

function getDeathReason(reason) {
  const reasons = {
    wolf_kill: 'Dévoré', witch_kill: 'Empoisonné', hunter_shoot: 'Abattu', 
    lover_death: 'Chagrin', vote: 'Exécuté'
  };
  return reasons[reason] || reason;
}

onMounted(() => updateNightDeaths());
watch(() => gameStore.currentGame?.state?.night_deaths, () => updateNightDeaths(), { deep: true });
</script>

<style scoped>
.day-start {
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
