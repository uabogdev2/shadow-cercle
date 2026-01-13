<!-- DayReveal.vue -->
<template>
  <div class="day-reveal phase-surface phase-day h-screen w-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <!-- Day Background -->
    <div class="absolute inset-0">
      <div class="absolute inset-0 phase-day opacity-90"></div>
      <div class="absolute top-[-2rem] left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/14 rounded-full blur-[120px]"></div>
      <div class="absolute bottom-[-3rem] right-10 w-80 h-80 bg-amber-400/12 rounded-full blur-[140px]"></div>
      <div class="noise-overlay"></div>
    </div>

    <!-- Sun indicator -->
    <div class="absolute top-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_0_50px_rgba(245,158,11,0.4)] z-20"></div>

    <!-- Header -->
    <div class="relative z-10 text-center mb-8">
      <h1 class="text-cinzel text-3xl text-[#D97706] mb-2">Le Jour se Lève</h1>
      <p class="text-[#F5F5DC]/80">Jour {{ gameStore.currentGame?.day_number }}</p>
      <div class="h-px w-24 mx-auto mt-3 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="relative z-10">
      <div class="w-8 h-8 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin"></div>
    </div>

    <!-- Deaths section -->
    <div v-else-if="nightDeaths.length > 0" class="relative z-10 w-full max-w-md">
      <div class="paper-card frame-wood p-6 border border-[#991b1b]/50 bg-[#150c0c]/85 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
        <div class="flex items-center justify-center gap-3 mb-6">
          <SkullIcon class="w-6 h-6 text-[#991B1B]" />
          <h2 class="text-[#F5F5DC] text-lg font-medium">
            {{ nightDeaths.length > 1 ? 'Victimes de la nuit' : 'Victime de la nuit' }}
          </h2>
        </div>
        
        <div class="space-y-4">
          <div 
            v-for="death in nightDeaths" 
            :key="death.id" 
            class="p-4 rounded-xl bg-[#1a0f0f]/70 border border-[#991b1b]/40"
          >
            <div class="flex items-center justify-between mb-3">
              <div>
                <p class="text-[#F5F5DC] text-xl font-medium">{{ death.user?.name }}</p>
                <p class="text-[#F5F5DC]/70 text-sm">{{ getRoleName(death.role) }}</p>
              </div>
              <span class="text-4xl">{{ getRoleIcon(death.role) }}</span>
            </div>
            <div class="flex items-center gap-2 text-[#F87171] text-sm">
              <div class="w-1.5 h-1.5 rounded-full bg-[#991b1b]"></div>
              <span>{{ getDeathReason(death.reason) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- No deaths -->
    <div v-else class="relative z-10 w-full max-w-md">
      <div class="paper-card frame-wood p-8 text-center border border-[#0F766E]/50 bg-[#0d1417]/85 shadow-[0_18px_60px_rgba(0,0,0,0.5)]">
        <div class="w-16 h-16 rounded-full bg-[#0F766E]/25 border border-[#0F766E]/40 mx-auto mb-4 flex items-center justify-center">
          <CheckCircleIcon class="w-8 h-8 text-[#0F766E]" />
        </div>
        <h2 class="text-[#F5F5DC] text-xl font-medium mb-2">Nuit Paisible</h2>
        <p class="text-[#F5F5DC]/75">Personne n'est mort cette nuit</p>
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
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
}

.text-cinzel {
  font-family: 'Cinzel', 'Playfair Display', serif;
}
</style>
