<!-- DayReveal.vue -->
<template>
  <div class="day-reveal h-screen w-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <!-- Day Background -->
    <div class="absolute inset-0 bg-gradient-to-b from-amber-100/10 via-slate-900 to-slate-950">
      <!-- Sun rays -->
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full filter blur-3xl"></div>
    </div>

    <!-- Sun indicator -->
    <div class="absolute top-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.4)] z-20"></div>

    <!-- Header -->
    <div class="relative z-10 text-center mb-8">
      <h1 class="text-cinzel text-3xl text-amber-400 mb-2">Le Jour se Lève</h1>
      <p class="text-slate-400">Jour {{ gameStore.currentGame?.day_number }}</p>
      <div class="h-px w-24 mx-auto mt-3 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="relative z-10">
      <div class="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
    </div>

    <!-- Deaths section -->
    <div v-else-if="nightDeaths.length > 0" class="relative z-10 w-full max-w-md">
      <div class="glass-card p-6 border-red-500/30">
        <div class="flex items-center justify-center gap-3 mb-6">
          <SkullIcon class="w-6 h-6 text-red-500" />
          <h2 class="text-red-400 text-lg font-medium">
            {{ nightDeaths.length > 1 ? 'Victimes de la nuit' : 'Victime de la nuit' }}
          </h2>
        </div>
        
        <div class="space-y-4">
          <div 
            v-for="death in nightDeaths" 
            :key="death.id" 
            class="p-4 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <div class="flex items-center justify-between mb-3">
              <div>
                <p class="text-white text-xl font-medium">{{ death.user?.name }}</p>
                <p class="text-slate-400 text-sm">{{ getRoleName(death.role) }}</p>
              </div>
              <span class="text-4xl">{{ getRoleIcon(death.role) }}</span>
            </div>
            <div class="flex items-center gap-2 text-red-400 text-sm">
              <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
              <span>{{ getDeathReason(death.reason) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No deaths -->
    <div v-else class="relative z-10 w-full max-w-md">
      <div class="glass-card p-8 text-center border-emerald-500/30">
        <div class="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 mx-auto mb-4 flex items-center justify-center">
          <CheckCircleIcon class="w-8 h-8 text-emerald-500" />
        </div>
        <h2 class="text-emerald-400 text-xl font-medium mb-2">Nuit Paisible</h2>
        <p class="text-slate-400">Personne n'est mort cette nuit</p>
      </div>
    </div>

    <!-- Timer -->
    <div class="relative z-10 mt-8 text-center">
      <Timer :seconds="gameStore.timer" variant="minimal" size="md" />
      <p class="text-slate-500 text-sm mt-3 animate-pulse">Le débat va bientôt commencer...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Skull as SkullIcon, CheckCircle as CheckCircleIcon } from 'lucide-vue-next';
import Timer from '@/components/UI/Timer.vue';

const gameStore = useGameStore();
const nightDeaths = ref([]);
const loading = ref(true);

const rawNightDeaths = computed(() => gameStore.currentGame?.state?.night_deaths || []);

function updateNightDeaths() {
  const deaths = rawNightDeaths.value;
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
  const roleNames = {
    werewolf: 'Loup-Garou',
    seer: 'Voyante',
    witch: 'Sorcière',
    guard: 'Garde',
    hunter: 'Chasseur',
    cupid: 'Cupidon',
    elder: 'Ancien',
    fool: 'Idiot du Village',
    villager: 'Villageois'
  };
  return roleNames[role] || role || 'Inconnu';
}

function getRoleIcon(role) {
  const icons = {
    werewolf: '🐺',
    seer: '🔮',
    witch: '🧪',
    guard: '🛡️',
    hunter: '🏹',
    cupid: '💘',
    elder: '👴',
    fool: '🃏',
    villager: '🏠'
  };
  return icons[role] || '❓';
}

function getDeathReason(reason) {
  const reasons = {
    wolf_kill: 'Dévoré par les loups',
    witch_kill: 'Empoisonné par la sorcière',
    hunter_shoot: 'Abattu par le chasseur',
    lover_death: 'Mort de chagrin',
    vote: 'Exécuté par le village',
    unknown: 'Cause inconnue'
  };
  return reasons[reason] || reason || 'Cause inconnue';
}

onMounted(() => updateNightDeaths());
watch(rawNightDeaths, () => updateNightDeaths(), { deep: true });
</script>

<style scoped>
.day-reveal {
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
