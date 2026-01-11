<template>
  <div class="game-view relative h-screen w-screen overflow-hidden bg-midnight-blue">
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
// NightLovers supprimé - pas dans le flow canon
import DayPhase from '@/components/Game/DayPhase.vue';
import WitchPhase from '@/components/Game/WitchPhase.vue';
import CupidPhase from '@/components/Game/CupidPhase.vue';
import DayLastWords from '@/components/Game/DayLastWords.vue';

const route = useRoute();
const gameStore = useGameStore();

// CORRECTION: Utiliser le flag du store au lieu d'une variable locale
const hasLeftRoleReveal = computed(() => gameStore.hasLeftRoleReveal);

const activeComponent = computed(() => {
  const status = gameStore.currentGame?.status;
  const phase = gameStore.phase;

  if (status === 'lobby') {
    // Reset géré par le store
    return LobbyView;
  }
  if (status === 'ended') return GameEnd;
  
  // CORRECTION CRITIQUE: Ne JAMAIS revenir à role_reveal une fois qu'on l'a quitté
  // Si hasLeftRoleReveal est true, ignorer complètement role_reveal même si la phase le dit
  if (hasLeftRoleReveal.value && phase === 'role_reveal') {
    console.warn('⚠️ [GameView] Ignoring role_reveal phase because hasLeftRoleReveal = true');
    // Afficher NightSleep en attendant la vraie phase
    return NightSleep;
  }
  
  // High-priority, full-screen phases
  // IMPORTANT: Ne montrer RoleReveal que si on est vraiment en phase role_reveal
  // et qu'on n'a pas déjà quitté cette phase
  if (phase === 'role_reveal' && status !== 'ended' && !hasLeftRoleReveal.value) {
    return RoleReveal;
  }
  if (phase === 'night_start') return NightStart; // Custom transition component
  // night_lovers supprimé - pas dans le flow canon (cupid -> wolves directement)
  if (phase === 'night_cupid') return CupidPhase; // CORRECTION: Composant spécialisé pour Cupidon
  if (phase === 'night_witch') return WitchPhase; // CORRECTION: Composant spécialisé pour la Sorcière
  if (phase === 'day_reveal') return DayStart;
  if (phase === 'day_vote_result') return VoteResult;
  if (phase === 'day_last_words') return DayLastWords; // CORRECTION: Composant pour les derniers mots
  if (phase === 'day_execution') return DayExecution;

  // Default phases
  if (status === 'night') {
    // FLOW CANON: Afficher NightPhase pour toutes les phases de nuit qui nécessitent une action
    // MAIS SEULEMENT si le joueur peut agir dans cette phase
    const nightActionPhases = ['night_wolves', 'night_guard', 'night_seer', 'hunter_action', 'hunter_day_action'];
    if (phase && nightActionPhases.includes(phase)) {
      // Vérifier si le joueur peut agir dans cette phase
      if (gameStore.canAct) {
        return NightPhase;
      } else {
        // Le joueur ne peut pas agir, afficher NightSleep
        return NightSleep;
      }
    }
    
    // Vérifier aussi pour night_cupid et night_witch
    if (phase === 'night_cupid') {
      if (gameStore.canAct) {
        return CupidPhase;
      } else {
        return NightSleep;
      }
    }
    
    if (phase === 'night_witch') {
      if (gameStore.canAct) {
        return WitchPhase;
      } else {
        return NightSleep;
      }
    }
    
    // FLOW CANON: Pour toutes les autres phases de nuit (processing, start), afficher NightSleep
    return NightSleep;
  }
  
  if (status === 'day') {
    // Pour day_vote, vérifier si le joueur peut voter
    if (phase === 'day_vote') {
      if (gameStore.canAct) {
        return DayPhase;
      } else {
        // Le joueur ne peut pas voter (mort), afficher quand même DayPhase mais sans possibilité de vote
        return DayPhase;
      }
    }
    // Pour day_debate, tout le monde voit le débat
    return DayPhase;
  }

  // Fallback to a loading or empty state if needed
  return NightSleep; // Default to a safe, neutral component
});

onMounted(async () => {
  const gameId = route.params.id;
  if (gameId && (!gameStore.currentGame || gameStore.currentGame.id !== parseInt(gameId))) {
    // Charger le jeu via l'API si nécessaire
    try {
      const response = await axios.get(`/games/${gameId}`);
      if (response.data.success && response.data.game) {
        // CORRECTION: Initialiser correctement la phase depuis l'API
        const game = response.data.game;
        gameStore.currentGame = game;
        gameStore.players = game.players || [];
        
        // Initialiser la phase depuis le jeu chargé
        if (game.phase) {
          // CORRECTION: Utiliser la méthode du store pour mettre à jour la phase
          // Le store gère maintenant hasLeftRoleReveal
          gameStore.phase = game.phase;
          console.log('🔄 [GameView] Phase initialized from API:', game.phase);
          
          // Le store gère automatiquement hasLeftRoleReveal lors de la mise à jour de la phase
          // Pas besoin de le faire manuellement ici
        }
      }
    } catch (error) {
      console.error('Error fetching game:', error);
    }
  }
  
  // S'abonner aux channels WebSocket une fois le jeu chargé
  if (gameStore.currentGame) {
    gameStore.joinGameChannel(gameStore.currentGame.id);
  }
});

// S'abonner aux channels WebSocket quand le jeu est disponible
watch(() => gameStore.currentGame, (newGame) => {
  if (newGame && newGame.id) {
    gameStore.joinGameChannel(newGame.id);
  }
}, { immediate: true });

// For debugging purposes
watch([() => gameStore.phase, () => gameStore.currentGame?.status], ([newPhase, newStatus], [oldPhase, oldStatus]) => {
  if (newPhase !== oldPhase || newStatus !== oldStatus) {
    // Le store gère maintenant hasLeftRoleReveal automatiquement
    console.log(`[GameView] State Change -> Status: ${oldStatus} -> ${newStatus}, Phase: ${oldPhase} -> ${newPhase}, Component: ${activeComponent.value?.__name || 'N/A'}`);
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (max-width: 360px) {
  .game-view {
    overflow: hidden;
  }
}

/* Prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.01ms;
  }
}
</style>

