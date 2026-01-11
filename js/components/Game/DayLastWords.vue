<template>
  <div class="last-words-container relative h-screen w-screen overflow-hidden bg-black flex items-center justify-center p-4 animate-fade-in">
    <!-- Spotlight -->
    <div class="spotlight absolute z-0 animate-flicker"></div>

    <div v-if="executedPlayer" class="relative z-10 text-center flex flex-col items-center animate-scale-in max-w-2xl">
      <p class="font-serif text-2xl font-bold text-cream text-shadow-lg mb-6">
        Derniers Mots
      </p>
      
      <div class="condemned-player mb-8 animate-shake">
        <PlayerCard
          :name="executedPlayer.user?.name || 'Joueur'"
          status="alive"
          class="w-40"
        />
      </div>
      
      <h2 class="font-serif text-3xl font-bold text-soft-gold text-shadow-lg mb-6">
        {{ executedPlayer.user?.name }}
      </h2>
      
      <p class="text-cream/80 font-sans text-lg mb-4">
        Vous avez été désigné par le village.
      </p>
      
      <p class="text-cream/60 font-sans text-base">
        Vous avez quelques instants pour prononcer vos derniers mots...
      </p>
    </div>
    
    <div v-else class="relative z-10 text-center animate-scale-in">
      <p class="text-cream/60 font-sans">
        Aucun joueur n'a été exécuté (vote blanc)
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import PlayerCard from '@/components/Player/PlayerCard.vue';

const gameStore = useGameStore();
const executedPlayer = ref(null);

// CORRECTION BUG #6: Lire uniquement le joueur exécuté depuis vote_result
onMounted(() => {
  updateExecutedPlayer();
});

watch(() => gameStore.currentGame?.state?.vote_result, () => {
  updateExecutedPlayer();
}, { deep: true });

function updateExecutedPlayer() {
  const voteResult = gameStore.currentGame?.state?.vote_result;
  if (voteResult && voteResult.target_id) {
    executedPlayer.value = gameStore.players.find(p => p.id === voteResult.target_id);
  } else {
    executedPlayer.value = null;
  }
}
</script>

<style scoped>
.last-words-container {
  background: #000;
}

.spotlight {
  top: 50%;
  left: 50%;
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  transform: translate(-50%, -50%) translateY(-50px);
  pointer-events: none;
}

.condemned-player {
  animation: shake 0.5s ease-in-out infinite alternate;
}

@keyframes shake {
  0% { transform: translateX(0); }
  100% { transform: translateX(5px); }
}

@keyframes flicker {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.animate-flicker {
  animation: flicker 2s ease-in-out infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .last-words-container {
    padding: 1rem;
  }
  
  .spotlight {
    width: 200px;
    height: 200px;
  }
  
  .last-words-container :deep(p) {
    font-size: 1rem;
  }
  
  .last-words-container :deep(h2) {
    font-size: 1.5rem;
  }
  
  .condemned-player :deep(.player-card) {
    width: 8rem;
  }
}

@media (max-width: 640px) {
  .last-words-container {
    padding: 0.875rem;
  }
  
  .spotlight {
    width: 180px;
    height: 180px;
  }
  
  .last-words-container :deep(p) {
    font-size: 0.9375rem;
  }
  
  .last-words-container :deep(h2) {
    font-size: 1.375rem;
  }
  
  .condemned-player :deep(.player-card) {
    width: 7rem;
  }
}

@media (max-width: 360px) {
  .last-words-container {
    padding: 0.75rem;
  }
  
  .spotlight {
    width: 150px;
    height: 150px;
  }
  
  .last-words-container :deep(p) {
    font-size: 0.875rem;
  }
  
  .last-words-container :deep(h2) {
    font-size: 1.25rem;
  }
  
  .condemned-player {
    margin-bottom: 1rem;
  }
  
  .condemned-player :deep(.player-card) {
    width: 6rem;
  }
}

/* Prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .condemned-player {
    animation: none;
  }
  
  .animate-flicker {
    animation: none;
  }
}
</style>
