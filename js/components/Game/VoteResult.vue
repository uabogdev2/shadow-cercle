<!-- js/components/Game/VoteResult.vue -->
<template>
  <div class="h-screen w-screen bg-black flex items-center justify-center p-4">
    <div class="w-full max-w-md border-2 border-white p-6 bg-black relative">
      <div class="absolute -top-3 -left-3 border-t-2 border-l-2 border-white w-6 h-6"></div>
      <div class="absolute -bottom-3 -right-3 border-b-2 border-r-2 border-white w-6 h-6"></div>

      <h1 class="text-display text-4xl text-white mb-6 text-center border-b-2 border-white pb-4">
        VOTE TALLY
      </h1>
      
      <div v-if="Object.keys(voteCounts).length > 0" class="mb-8 space-y-2 font-mono">
        <div
          v-for="(count, name) in voteCounts"
          :key="name"
          class="flex justify-between items-center p-2 border border-gray-700"
          :class="{ 'bg-red-900/50 border-red-600': name === designatedPlayer?.user?.name }"
        >
          <span>{{ name }}</span>
          <div class="flex items-center gap-2">
            <div class="h-2 bg-white" :style="{ width: `${count * 10}px` }"></div>
            <span class="font-bold">{{ count }}</span>
          </div>
        </div>
      </div>
      
      <div v-if="designatedPlayer" class="text-center animate-pulse">
        <p class="text-mono text-gray-400 mb-2">TARGET CONFIRMED</p>
        <p class="text-display text-3xl text-red-600 uppercase">{{ designatedPlayer.user?.name }}</p>
        <div class="mt-4 border border-red-600 p-2 text-red-600 font-mono text-xs inline-block uppercase">
            {{ voteResult?.target_role || 'UNKNOWN ROLE' }}
        </div>
      </div>
      
      <div v-else class="text-center border border-green-500 p-4 text-green-500">
        <p class="text-display text-xl">NO CONSENSUS</p>
        <p class="text-mono text-xs mt-2">EXECUTION ABORTED</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import axios from 'axios';

const gameStore = useGameStore();
const voteCounts = ref({});

const voteResult = computed(() => gameStore.currentGame?.state?.vote_result || null);

const designatedPlayer = computed(() => {
  const targetId = voteResult.value?.target_id;
  if (!targetId) return null;
  return gameStore.players.find(p => p.id === targetId);
});

async function fetchVoteDetails() {
  if (!gameStore.currentGame) return;
  try {
    const response = await axios.get(`/games/${gameStore.currentGame.id}/actions`);
    if (response.data.success && response.data.actions) {
      const votes = response.data.actions.filter(a => 
        a.type === 'day_vote' && a.round === gameStore.currentGame?.day_number
      );
      const counts = {};
      votes.forEach(vote => {
        if (vote.target_id) {
          const target = gameStore.players.find(p => p.id === vote.target_id);
          if (target) {
            const name = target.user?.name || 'UNKNOWN';
            counts[name] = (counts[name] || 0) + 1;
          }
        }
      });
      voteCounts.value = counts;
    }
  } catch (error) { console.error(error); }
}

onMounted(() => fetchVoteDetails());
</script>
