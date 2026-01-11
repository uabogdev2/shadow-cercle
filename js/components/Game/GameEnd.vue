<!-- js/components/Game/GameEnd.vue -->
<template>
  <div class="h-screen w-screen bg-black flex flex-col items-center justify-center p-4 text-center overflow-hidden">
    <div class="border-4 p-8 w-full max-w-2xl bg-black relative z-10" :class="winnerColorClass">
      <h1 class="text-display text-6xl md:text-8xl mb-4 tracking-tighter uppercase leading-none">
        {{ title }}
      </h1>

      <div class="h-1 w-full bg-current mb-6"></div>

      <p class="text-mono text-xl uppercase mb-8 tracking-widest">{{ subtitle }}</p>

      <div class="border-2 border-current p-4 mb-8 max-h-64 overflow-y-auto">
        <h3 class="text-mono text-sm uppercase border-b border-current pb-2 mb-2">Operation Report</h3>
        <ul class="space-y-1">
          <li v-for="player in gameStore.players" :key="player.id" class="flex justify-between font-mono text-sm">
            <span>{{ player.user?.name }}</span>
            <span>{{ player.role.toUpperCase() }}</span>
          </li>
        </ul>
      </div>

      <div class="flex gap-4 justify-center">
        <button @click="goHome" class="btn-brutal px-8 py-3 bg-white text-black hover:bg-gray-300 border-none">
          EXIT
        </button>
      </div>
    </div>

    <!-- Background Noise -->
    <div class="absolute inset-0 opacity-10 pointer-events-none" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIi8+Cjwvc3ZnPg==');"></div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';

const router = useRouter();
const gameStore = useGameStore();

const winner = computed(() => {
  const gameWinner = gameStore.currentGame?.state?.winner;
  if (gameWinner === 'village' || gameWinner === 'villagers') return 'village';
  if (gameWinner === 'werewolf' || gameWinner === 'werewolves') return 'werewolves';
  return 'draw';
});

const winnerColorClass = computed(() => {
    if (winner.value === 'village') return 'border-green-500 text-green-500';
    if (winner.value === 'werewolves') return 'border-red-600 text-red-600';
    return 'border-white text-white';
});

const title = computed(() => {
  if (winner.value === 'village') return "VICTORY";
  if (winner.value === 'werewolves') return "DEFEAT";
  return "STALEMATE";
});

const subtitle = computed(() => {
  if (winner.value === 'village') return "Threat Neutralized";
  if (winner.value === 'werewolves') return "Outpost Lost";
  return "No Clear Outcome";
});

const goHome = () => {
  gameStore.resetGame();
  router.push({ name: 'home' });
};
</script>
