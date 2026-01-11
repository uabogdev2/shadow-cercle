<template>
  <div class="execution-container relative h-screen w-screen overflow-hidden bg-black flex items-center justify-center p-4 animate-fade-in">
    <!-- Spotlight -->
    <div class="spotlight absolute z-0 animate-flicker"></div>

    <div v-if="executedPlayer" class="relative z-10 text-center flex flex-col items-center animate-scale-in">
      <p class="font-serif text-2xl font-bold text-cream text-shadow-lg mb-6">
        Le village a rendu son verdict.
      </p>
      
      <div class="condemned-player mb-8 animate-shake">
        <PlayerCard
          :name="executedPlayer.user?.name || 'Joueur'"
          status="dead"
          class="w-40"
        />
      </div>
      
      <h2 class="font-serif text-3xl font-bold text-blood-red text-shadow-lg mb-6 animate-pulse">
        {{ executedPlayer.user?.name }} a été éliminé.
      </h2>

      <div class="role-reveal-container mt-6 animate-fade-in-up" style="animation-delay: 1s; animation-fill-mode: both;">
        <p class="text-cream/70 font-sans mb-2">Son rôle était...</p>
        <div class="revealed-role font-serif text-2xl font-bold text-soft-gold text-shadow-lg">
          {{ getRoleName(executedPlayer.role) }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import PlayerCard from '@/components/Player/PlayerCard.vue';

const gameStore = useGameStore();
const executedPlayer = ref(null);

const getRoleName = (role) => {
  const names = {
    werewolf: 'Loup-Garou',
    seer: 'Voyante',
    witch: 'Sorcière',
    guard: 'Garde',
    cupid: 'Cupidon',
    hunter: 'Chasseur',
    elder: 'Ancien',
    fool: 'Fou',
    villager: 'Villageois'
  };
  return names[role] || role;
};

onMounted(() => {
  // CORRECTION: Lire vote_result depuis le state (comme le backend)
  const voteResult = gameStore.currentGame?.state?.vote_result;
  if (voteResult && voteResult.target_id) {
    executedPlayer.value = gameStore.players.find(p => p.id === voteResult.target_id);
  } else {
    // Fallback pour compatibilité
    const designatedId = gameStore.currentGame?.state?.designated_player_id;
    if (designatedId) {
      executedPlayer.value = gameStore.players.find(p => p.id === designatedId);
    }
  }
});
</script>

<style scoped>
.execution-container {
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

.revealed-role {
  animation: reveal 1s ease-out forwards;
  opacity: 0;
}

@keyframes reveal {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .execution-container {
    padding: 1rem;
  }
  
  .spotlight {
    width: 200px;
    height: 200px;
  }
  
  .execution-container :deep(p) {
    font-size: 1.25rem;
  }
  
  .execution-container :deep(h2) {
    font-size: 1.5rem;
  }
  
  .condemned-player :deep(.player-card) {
    width: 8rem;
  }
  
  .revealed-role {
    font-size: 1.5rem;
  }
}

@media (max-width: 640px) {
  .execution-container {
    padding: 0.875rem;
  }
  
  .spotlight {
    width: 180px;
    height: 180px;
  }
  
  .execution-container :deep(p) {
    font-size: 1.125rem;
  }
  
  .execution-container :deep(h2) {
    font-size: 1.375rem;
  }
  
  .condemned-player :deep(.player-card) {
    width: 7rem;
  }
  
  .revealed-role {
    font-size: 1.375rem;
  }
}

@media (max-width: 360px) {
  .execution-container {
    padding: 0.75rem;
  }
  
  .spotlight {
    width: 150px;
    height: 150px;
  }
  
  .execution-container :deep(p) {
    font-size: 1rem;
  }
  
  .execution-container :deep(h2) {
    font-size: 1.25rem;
  }
  
  .condemned-player {
    margin-bottom: 1rem;
  }
  
  .condemned-player :deep(.player-card) {
    width: 6rem;
  }
  
  .revealed-role {
    font-size: 1.25rem;
  }
  
  .role-reveal-container :deep(p) {
    font-size: 0.875rem;
  }
}

/* Prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .condemned-player {
    animation: none;
  }
  
  .revealed-role {
    animation: none;
    opacity: 1;
  }
  
  .animate-pulse {
    animation: none;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .spotlight {
    width: 250px;
    height: 250px;
  }
  
  .execution-container :deep(h2) {
    font-size: 1.75rem;
  }
  
  .condemned-player :deep(.player-card) {
    width: 10rem;
  }
}

@media (min-width: 1024px) {
  .spotlight {
    width: 400px;
    height: 400px;
  }
}
</style>
