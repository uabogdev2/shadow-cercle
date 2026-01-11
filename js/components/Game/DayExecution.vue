<!-- DayExecution.vue -->
<template>
  <div class="h-screen w-screen bg-black flex flex-col items-center justify-center p-4 border-4 border-red-600">
    <div v-if="executedPlayer" class="text-center">
      <p class="text-mono text-red-600 mb-4 uppercase tracking-widest">JUDGMENT RENDERED</p>
      
      <div class="border-2 border-white p-8 mb-8 inline-block bg-white text-black">
        <h2 class="text-display text-5xl uppercase">{{ executedPlayer.user?.name }}</h2>
      </div>
      
      <p class="text-display text-2xl text-red-600 mb-2">ELIMINATED</p>

      <div class="mt-8 border-t border-red-900 pt-4">
        <p class="text-mono text-xs text-gray-500 mb-2">IDENTITY CONFIRMED:</p>
        <p class="text-display text-3xl text-white uppercase">{{ getRoleName(executedPlayer.role) }}</p>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const gameStore = useGameStore();
const executedPlayer = ref(null);
const getRoleName = (role) => role;

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
