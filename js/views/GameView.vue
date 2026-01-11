<template>
  <div class="game-view relative h-screen w-full overflow-hidden bg-black text-white font-mono">
    <transition name="fade" mode="out-in">
      <component :is="activeComponent" />
    </transition>
  </div>
</template>

<script setup>
import { computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import axios from 'axios';

// Import all possible game state components
import LobbyView from './LobbyView.vue';
import GameEnd from '@/components/Game/GameEnd.vue';
import RoleReveal from '@/components/Game/RoleReveal.vue';
import NightStart from '@/components/Game/NightStart.vue';
import NightSleep from '@/components/Game/NightSleep.vue';
import DayStart from '@/components/Game/DayStart.vue';
import VoteResult from '@/components/Game/VoteResult.vue';
import DayExecution from '@/components/Game/DayExecution.vue';
import NightPhase from '@/components/Game/NightPhase.vue';
import DayPhase from '@/components/Game/DayPhase.vue';
import WitchPhase from '@/components/Game/WitchPhase.vue';
import CupidPhase from '@/components/Game/CupidPhase.vue';
import DayLastWords from '@/components/Game/DayLastWords.vue';

const route = useRoute();
const gameStore = useGameStore();

const hasLeftRoleReveal = computed(() => gameStore.hasLeftRoleReveal);

const activeComponent = computed(() => {
  const status = gameStore.currentGame?.status;
  const phase = gameStore.phase;

  if (status === 'lobby') return LobbyView;
  if (status === 'ended') return GameEnd;
  
  if (hasLeftRoleReveal.value && phase === 'role_reveal') {
    return NightSleep;
  }
  
  if (phase === 'role_reveal' && status !== 'ended' && !hasLeftRoleReveal.value) {
    return RoleReveal;
  }
  if (phase === 'night_start') return NightStart;
  if (phase === 'night_cupid') return CupidPhase;
  if (phase === 'night_witch') return WitchPhase;
  if (phase === 'day_reveal') return DayStart;
  if (phase === 'day_vote_result') return VoteResult;
  if (phase === 'day_last_words') return DayLastWords;
  if (phase === 'day_execution') return DayExecution;

  if (status === 'night') {
    const nightActionPhases = ['night_wolves', 'night_guard', 'night_seer', 'hunter_action', 'hunter_day_action'];
    if (phase && nightActionPhases.includes(phase)) {
      if (gameStore.canAct) return NightPhase;
      else return NightSleep;
    }
    
    if (phase === 'night_cupid') {
      if (gameStore.canAct) return CupidPhase;
      else return NightSleep;
    }
    
    if (phase === 'night_witch') {
      if (gameStore.canAct) return WitchPhase;
      else return NightSleep;
    }
    
    return NightSleep;
  }
  
  if (status === 'day') {
    return DayPhase;
  }

  return NightSleep;
});

onMounted(async () => {
  const gameId = route.params.id;
  if (gameId && (!gameStore.currentGame || gameStore.currentGame.id !== parseInt(gameId))) {
    try {
      const response = await axios.get(`/games/${gameId}`);
      if (response.data.success && response.data.game) {
        const game = response.data.game;
        gameStore.currentGame = game;
        gameStore.players = game.players || [];
        
        if (game.phase) {
          gameStore.phase = game.phase;
        }
      }
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  }
  
  if (gameStore.currentGame) {
    gameStore.joinGameChannel(gameStore.currentGame.id);
  }
});

watch(() => gameStore.currentGame, (newGame) => {
  if (newGame && newGame.id) {
    gameStore.joinGameChannel(newGame.id);
  }
}, { immediate: true });
</script>

<style scoped>
/* Brutalist transitions are handled globally in animations.css */
</style>
