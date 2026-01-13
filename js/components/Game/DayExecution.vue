<!-- DayExecution.vue -->
<template>
  <div class="day-execution h-screen w-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <!-- Dark dramatic background -->
    <div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-red-950/20 to-slate-950">
      <!-- Spotlight effect -->
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-white/5 rounded-full filter blur-3xl"></div>
    </div>

    <!-- Vignette -->
    <div class="absolute inset-0 vignette-dark pointer-events-none"></div>

    <!-- Content -->
    <div v-if="executedPlayer" class="relative z-10 text-center max-w-md w-full">
      <!-- Verdict badge -->
      <div class="mb-6">
        <span class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 border border-red-500/30 text-red-400 text-sm uppercase tracking-wider">
          <GavelIcon class="w-4 h-4" />
          Verdict rendu
        </span>
      </div>

      <!-- Player card - dramatic reveal -->
      <div class="glass-card p-8 border-red-500/30 mb-8 relative overflow-hidden">
        <!-- Red accent line -->
        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent"></div>
        
        <div class="mb-6">
          <div class="w-24 h-24 rounded-full bg-slate-800 border-2 border-red-500/50 mx-auto mb-4 flex items-center justify-center">
            <span class="text-4xl font-display text-white">
              {{ executedPlayer.user?.name?.[0]?.toUpperCase() }}
            </span>
          </div>
          <h2 class="text-2xl font-medium text-white mb-1">{{ executedPlayer.user?.name }}</h2>
          <p class="text-red-400 uppercase tracking-wider text-sm">Éliminé par le village</p>
        </div>

        <div class="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-6"></div>

        <div class="text-center">
          <p class="text-slate-500 text-xs uppercase tracking-wider mb-2">Identité révélée</p>
          <div class="flex items-center justify-center gap-3">
            <span class="text-4xl">{{ getRoleIcon(executedPlayer.role) }}</span>
            <span 
              class="text-cinzel text-2xl"
              :style="{ color: getRoleColor(executedPlayer.role) }"
            >
              {{ getRoleName(executedPlayer.role) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Timer -->
      <div class="text-center">
        <Timer :seconds="gameStore.timer" variant="minimal" size="sm" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Gavel as GavelIcon } from 'lucide-vue-next';
import Timer from '@/components/UI/Timer.vue';

const gameStore = useGameStore();
const executedPlayer = ref(null);

function getRoleName(role) {
  const names = {
    werewolf: 'Loup-Garou',
    seer: 'Voyante',
    witch: 'Sorcière',
    guard: 'Garde',
    hunter: 'Chasseur',
    cupid: 'Cupidon',
    elder: 'Ancien',
    fool: 'Idiot',
    villager: 'Villageois'
  };
  return names[role] || role;
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

function getRoleColor(role) {
  const colors = {
    werewolf: '#EF4444',
    seer: '#7C3AED',
    witch: '#EC4899',
    guard: '#3B82F6',
    hunter: '#F59E0B',
    cupid: '#F43F5E',
    elder: '#6B7280',
    fool: '#8B5CF6',
    villager: '#10B981'
  };
  return colors[role] || '#94A3B8';
}

onMounted(() => {
  const voteResult = gameStore.currentGame?.state?.vote_result;
  if (voteResult && voteResult.target_id) {
    executedPlayer.value = gameStore.players.find(p => p.id === voteResult.target_id);
  } else {
    const designatedId = gameStore.currentGame?.state?.designated_player_id;
    if (designatedId) executedPlayer.value = gameStore.players.find(p => p.id === designatedId);
  }
});
</script>

<style scoped>
.day-execution {
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

.glass-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.7) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.vignette-dark {
  background: radial-gradient(ellipse at center, transparent 20%, rgba(0, 0, 0, 0.6) 100%);
}
</style>
