<template>
  <div class="game-view relative h-screen w-full overflow-hidden">
    <transition name="scale-fade" mode="out-in">
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
import NightProcessing from '@/components/Game/NightProcessing.vue';
import DayStart from '@/components/Game/DayStart.vue';
import DayReveal from '@/components/Game/DayReveal.vue';
import VoteResult from '@/components/Game/VoteResult.vue';
import DayExecution from '@/components/Game/DayExecution.vue';
import NightPhase from '@/components/Game/NightPhase.vue';
import DayPhase from '@/components/Game/DayPhase.vue';
import WitchPhase from '@/components/Game/WitchPhase.vue';
import CupidPhase from '@/components/Game/CupidPhase.vue';
import GuardPhase from '@/components/Game/GuardPhase.vue';
import SeerPhase from '@/components/Game/SeerPhase.vue';
import HunterAction from '@/components/Game/HunterAction.vue';
import DayLastWords from '@/components/Game/DayLastWords.vue';

const route = useRoute();
const gameStore = useGameStore();

const hasLeftRoleReveal = computed(() => gameStore.hasLeftRoleReveal);

const activeComponent = computed(() => {
  const status = gameStore.currentGame?.status;
  const phase = gameStore.phase;

  // Lobby and end states
  if (status === 'lobby') return LobbyView;
  if (status === 'ended' || phase === 'game_end') return GameEnd;
  
  // Role reveal phase
  if (hasLeftRoleReveal.value && phase === 'role_reveal') {
    return NightSleep;
  }
  if (phase === 'role_reveal' && status !== 'ended' && !hasLeftRoleReveal.value) {
    return RoleReveal;
  }
  
  // Night transition phases
  if (phase === 'night_start') return NightStart;
  if (phase === 'night_processing') return NightProcessing;
  
  // Night action phases - each role has its own component
  if (phase === 'night_cupid') {
    if (gameStore.canAct) return CupidPhase;
    return NightSleep;
  }
  
  if (phase === 'night_wolves') {
    if (gameStore.canAct) return NightPhase;
    return NightSleep;
  }
  
  if (phase === 'night_guard') {
    if (gameStore.canAct) return GuardPhase;
    return NightSleep;
  }
  
  if (phase === 'night_witch') {
    if (gameStore.canAct) return WitchPhase;
    return NightSleep;
  }
  
  if (phase === 'night_seer') {
    if (gameStore.canAct) return SeerPhase;
    return NightSleep;
  }
  
  // Hunter phases (can occur during night or day)
  if (phase === 'hunter_action' || phase === 'hunter_day_action') {
    if (gameStore.canAct) return HunterAction;
    return NightSleep;
  }
  
  // Day phases
  if (phase === 'day_reveal') return DayReveal;
  if (phase === 'day_debate') return DayPhase;
  if (phase === 'day_vote') return DayPhase;
  if (phase === 'day_vote_result') return VoteResult;
  if (phase === 'day_last_words') return DayLastWords;
  if (phase === 'day_execution') return DayExecution;

  // Fallback for night status
  if (status === 'night') {
    return NightSleep;
  }
  
  // Fallback for day status
  if (status === 'day') {
    return DayPhase;
  }

  // Default fallback
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
.game-view {
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #020617 0%, #312e81 100%);
  background-attachment: fixed;
}
</style>
