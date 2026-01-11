<!-- DayLastWords.vue -->
<template>
  <div class="h-screen w-screen bg-black flex flex-col items-center justify-center p-4">
    <div v-if="executedPlayer" class="max-w-xl w-full text-center">
      <div class="border-b-2 border-white pb-4 mb-6">
        <h1 class="text-display text-4xl text-white">FINAL STATEMENT</h1>
        <p class="text-mono text-xs text-gray-500 uppercase mt-2">PRISONER: {{ executedPlayer.user?.name }}</p>
      </div>
      
      <div class="p-8 border border-gray-800 bg-gray-900/50 relative">
        <div class="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white"></div>
        <div class="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white"></div>
        <p class="text-mono text-lg text-white italic">"..."</p>
      </div>
      
      <p class="text-mono text-xs text-gray-600 mt-8 uppercase animate-pulse">CHANNEL OPEN FOR 30 SECONDS</p>
    </div>
    <div v-else class="text-center border border-gray-800 p-4">
      <p class="text-mono text-gray-500">NO EXECUTION - NO LAST WORDS</p>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';

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
