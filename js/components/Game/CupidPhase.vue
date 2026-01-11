<template>
  <div class="night-phase-container cupid-phase">
    <!-- Header -->
    <header class="phase-header">
      <div class="header-left">
        <Heart class="header-icon" style="color: #EC4899" />
        <div>
          <p class="night-title">Nuit {{ gameStore.currentGame?.day_number }}</p>
          <p class="phase-subtitle" style="color: #EC4899">
            Phase Cupidon
          </p>
        </div>
      </div>
      <Timer :seconds="gameStore.timer" variant="circular" size="sm" />
    </header>

    <!-- Main Action Area -->
    <main class="phase-main">
      <!-- Si le joueur peut agir (Cupidon), afficher l'interface d'action -->
      <template v-if="gameStore.canAct">
        <div class="instruction glass-surface rounded-xl p-4 mb-6 max-w-md w-full text-center">
          <p class="text-cream/90 font-sans mb-2">💘 Choisissez 2 joueurs à lier en amoureux</p>
          <p class="text-sm text-cream/70">
            Si l'un meurt, l'autre mourra aussi
          </p>
        </div>

        <div class="action-grid">
          <PlayerCard
            v-for="player in availableTargets"
            :key="player.id"
            :name="player.user?.name || 'Joueur'"
            :status="player.is_alive ? 'alive' : 'dead'"
            :is-selected="isSelected(player)"
            selection-color="pink-400"
            @click="toggleSelection(player)"
          />
        </div>

        <div v-if="selectedPlayers.length > 0" class="selected-info glass-surface rounded-xl p-4 mt-4 max-w-md w-full text-center">
          <p class="text-cream/90 font-sans mb-2">Joueurs sélectionnés :</p>
          <div class="flex gap-2 justify-center flex-wrap">
            <span 
              v-for="player in selectedPlayers" 
              :key="player.id"
              class="selected-badge"
            >
              {{ player.user?.name }}
            </span>
          </div>
        </div>
      </template>
      <!-- Si le joueur ne peut pas agir, afficher un message -->
      <div v-else class="no-action-message glass-surface rounded-xl p-6 text-center max-w-md w-full">
        <p class="text-cream/90 font-sans text-lg mb-2">🌙 Ce n'est pas votre tour</p>
        <p class="text-cream/70 font-sans text-sm">
          Attendez que Cupidon agisse...
        </p>
      </div>
    </main>

    <!-- Footer Action Button -->
    <footer class="phase-footer">
      <ActionButton
        v-if="selectedPlayers.length === 2 && gameStore.canAct"
        variant="magic"
        size="lg"
        :full-width="true"
        @click="submitAction"
      >
        Lier {{ selectedPlayers[0].user?.name }} ❤️ {{ selectedPlayers[1].user?.name }}
      </ActionButton>
      <p v-else-if="gameStore.canAct" class="text-cream/60 text-center text-sm">
        Sélectionnez 2 joueurs pour les lier
      </p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Heart } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';

const gameStore = useGameStore();
const selectedPlayers = ref([]);

// Cibles disponibles (tous les joueurs vivants sauf soi-même)
const availableTargets = computed(() => {
  return gameStore.livingPlayers.filter(p => p.id !== gameStore.currentPlayer?.id);
});

function isSelected(player) {
  return selectedPlayers.value.some(p => p.id === player.id);
}

function toggleSelection(player) {
  const index = selectedPlayers.value.findIndex(p => p.id === player.id);
  
  if (index >= 0) {
    // Déselectionner
    selectedPlayers.value.splice(index, 1);
  } else {
    // Sélectionner (max 2)
    if (selectedPlayers.value.length < 2) {
      selectedPlayers.value.push(player);
    } else {
      // Remplacer le premier par le nouveau
      selectedPlayers.value[0] = player;
    }
  }
}

async function submitAction() {
  if (selectedPlayers.value.length !== 2) return;
  
  // CORRECTION: Cupidon doit envoyer player1_id et player2_id dans data
  await gameStore.submitAction('cupid_match', null, {
    player1_id: selectedPlayers.value[0].id,
    player2_id: selectedPlayers.value[1].id
  });
  
  selectedPlayers.value = [];
}
</script>

<style scoped>
.cupid-phase {
  background: radial-gradient(ellipse at top, rgba(236, 72, 153, 0.15), transparent 60%), 
              radial-gradient(ellipse at bottom, #000000, var(--color-midnight-blue) 80%);
}

.night-phase-container {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  overflow: hidden;
}

.phase-header {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  width: 2rem;
  height: 2rem;
}

.night-title {
  font-family: var(--font-serif);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-cream);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  margin: 0;
}

.phase-subtitle {
  font-size: 0.875rem;
  font-family: var(--font-sans);
  margin: 0;
}

.phase-main {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  padding: 1rem 0;
}

.glass-surface {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.instruction {
  text-align: center;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  width: 100%;
  max-width: 32rem;
  padding: 0 1rem;
}

.selected-info {
  text-align: center;
}

.selected-badge {
  background: rgba(236, 72, 153, 0.3);
  border: 1px solid rgba(236, 72, 153, 0.5);
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  color: var(--color-cream);
  font-weight: 600;
}

.phase-footer {
  position: relative;
  z-index: 10;
  padding: 1rem 0;
}

/* Scrollbar personnalisée pour phase-main */
.phase-main {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.phase-main::-webkit-scrollbar {
  width: 6px;
}

.phase-main::-webkit-scrollbar-track {
  background: transparent;
}

.phase-main::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}

.phase-main::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

@media (min-width: 640px) and (max-width: 767px) {
  .action-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.875rem;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .action-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }
  
  .night-phase-container {
    padding: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .action-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 360px) {
  .night-phase-container {
    padding: 0.5rem;
  }
  
  .phase-header {
    padding: 0.375rem 0;
  }
  
  .header-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .night-title {
    font-size: 0.875rem;
  }
  
  .phase-subtitle {
    font-size: 0.625rem;
  }
  
  .instruction,
  .selected-info {
    padding: 0.75rem;
    margin-bottom: 0.5rem;
  }
  
  .instruction p,
  .selected-info p {
    font-size: 0.75rem;
  }
  
  .action-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0 0.25rem;
  }
  
  .selected-badge {
    padding: 0.375rem 0.75rem;
    font-size: 0.75rem;
  }
  
  .phase-main {
    padding: 0.25rem 0;
  }
  
  .phase-footer {
    padding: 0.75rem 0;
  }
  
  .no-action-message {
    padding: 0.875rem;
  }
  
  .no-action-message p {
    font-size: 0.875rem;
  }
}

@media (min-width: 375px) and (max-width: 414px) {
  .night-phase-container {
    padding: 0.875rem;
  }
  
  .action-grid {
    gap: 0.625rem;
  }
}

.no-action-message {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  word-wrap: break-word;
  white-space: normal;
  overflow-wrap: break-word;
}

.no-action-message p {
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.5;
}
</style>
