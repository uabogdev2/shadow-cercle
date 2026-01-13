<!-- DayLastWords.vue -->
<template>
  <div class="last-words h-screen w-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 phase-day">
      <div class="noise-overlay"></div>
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-red-900/20 rounded-full filter blur-3xl"></div>
    </div>

    <!-- Content -->
    <div v-if="executedPlayer" class="relative z-10 max-w-md w-full text-center">
      <div class="mb-6">
        <h1 class="text-cinzel text-2xl text-amber-400 mb-2">Dernières Paroles</h1>
        <div class="h-px w-24 mx-auto bg-gradient-to-r from-transparent via-amber-500/50 to-transparent"></div>
      </div>
      
      <div class="glass-card p-8 mb-6">
        <div class="w-16 h-16 rounded-full bg-slate-800 border-2 border-red-500/50 mx-auto mb-4 flex items-center justify-center">
          <span class="text-2xl font-display text-white">
            {{ executedPlayer.user?.name?.[0]?.toUpperCase() }}
          </span>
        </div>
        
        <p class="text-white text-xl font-medium mb-4">{{ executedPlayer.user?.name }}</p>
        
        <div class="p-4 rounded-xl bg-slate-800/50 border border-white/5">
          <QuoteIcon class="w-6 h-6 text-slate-600 mb-2 mx-auto" />
          <p class="text-slate-400 italic">Le condamné peut maintenant s'exprimer...</p>
        </div>
      </div>
      
      <div class="flex items-center justify-center gap-2 text-slate-500 text-sm">
        <ClockIcon class="w-4 h-4" />
        <span>30 secondes pour les dernières paroles</span>
      </div>
    </div>
    
    <div v-else class="relative z-10 glass-card p-8 text-center">
      <p class="text-slate-400">Pas d'exécution prévue</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Quote as QuoteIcon, Clock as ClockIcon } from 'lucide-vue-next';

const gameStore = useGameStore();
const executedPlayer = ref(null);

function updateExecutedPlayer() {
  const voteResult = gameStore.currentGame?.state?.vote_result;
  if (voteResult && voteResult.target_id) {
    executedPlayer.value = gameStore.players.find(p => p.id === voteResult.target_id);
  } else {
    executedPlayer.value = null;
  }
}

onMounted(() => updateExecutedPlayer());
watch(() => gameStore.currentGame?.state?.vote_result, () => updateExecutedPlayer(), { deep: true });
</script>

<style scoped>
.last-words {
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
