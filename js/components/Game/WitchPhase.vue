<template>
  <div class="night-phase-container witch-phase">
    <!-- Header -->
    <header class="phase-header">
      <div class="header-left">
        <FlaskConical class="header-icon" style="color: var(--color-neon-cyan)" />
        <div>
          <p class="night-title">Nuit {{ gameStore.currentGame?.day_number }}</p>
          <p class="phase-subtitle" style="color: var(--color-neon-cyan)">
            Phase Sorcière
          </p>
        </div>
      </div>
      <Timer :seconds="gameStore.timer" variant="circular" size="sm" />
    </header>

    <!-- Main Action Area -->
    <main class="phase-main">
      <!-- Si le joueur peut agir (Sorcière), afficher l'interface d'action -->
      <template v-if="gameStore.canAct">
        <!-- CORRECTION BUG CRITIQUE #1: Afficher la cible des loups depuis le state -->
        <div v-if="wolvesTarget" class="wolves-target-info glass-surface rounded-xl p-4 mb-6 max-w-md w-full">
          <p class="text-cream/90 font-sans mb-2">👁️ Vous voyez que les loups ont attaqué :</p>
          <p class="text-2xl font-bold font-serif" style="color: var(--color-neon-cyan)">
            {{ wolvesTarget.user?.name }}
          </p>
          <p v-if="wolvesTarget.is_protected" class="text-sm mt-2" style="color: var(--color-soft-gold)">
            🛡️ (Protégé par le Garde)
          </p>
        </div>

        <div v-else class="wolves-target-info glass-surface rounded-xl p-4 mb-6 max-w-md w-full">
          <p class="text-cream/70 font-sans">
            ℹ️ Aucune attaque des loups cette nuit
          </p>
        </div>

        <!-- Potion de Vie -->
        <div v-if="hasHealPotion" class="potion-section glass-surface rounded-xl p-4 mb-4 max-w-md w-full">
          <h3 class="text-lg font-bold text-cream mb-3">💚 Potion de Vie</h3>
          <p class="text-sm text-cream/80 mb-3">
            Ressuscite la victime des loups (utilisable 1 fois)
          </p>
          <ActionButton
            v-if="wolvesTarget"
            variant="success"
            size="md"
            :full-width="true"
            @click="useHealPotion"
          >
            Sauver {{ wolvesTarget.user?.name }}
          </ActionButton>
          <p v-else class="text-sm text-cream/60">
            Aucune victime à sauver
          </p>
        </div>

        <!-- Potion de Mort -->
        <div v-if="hasKillPotion" class="potion-section glass-surface rounded-xl p-4 mb-4 max-w-md w-full">
          <h3 class="text-lg font-bold text-cream mb-3">💀 Potion de Mort</h3>
          <p class="text-sm text-cream/80 mb-3">
            Tue un joueur (utilisable 1 fois, ignore la protection)
          </p>
          <div class="action-grid">
            <PlayerCard
              v-for="player in availableKillTargets"
              :key="player.id"
              :name="player.user?.name || 'Joueur'"
              :status="player.is_alive ? 'alive' : 'dead'"
              :is-selected="selectedKillTarget?.id === player.id"
              selection-color="neon-cyan"
              @click="selectKillTarget(player)"
            />
          </div>
          <ActionButton
            v-if="selectedKillTarget"
            variant="danger"
            size="md"
            :full-width="true"
            class="mt-3"
            @click="useKillPotion"
          >
            Tuer {{ selectedKillTarget.user?.name }}
          </ActionButton>
        </div>

        <!-- Bouton Skip -->
        <div class="skip-section mt-4">
          <ActionButton
            variant="secondary"
            size="md"
            :full-width="true"
            @click="skipAction"
          >
            Ne rien faire
          </ActionButton>
        </div>
      </template>
      <!-- Si le joueur ne peut pas agir, afficher un message -->
      <div v-else class="no-action-message glass-surface rounded-xl p-6 text-center max-w-md w-full">
        <p class="text-cream/90 font-sans text-lg mb-2 whitespace-normal">🌙 Ce n'est pas votre tour</p>
        <p class="text-cream/70 font-sans text-sm whitespace-normal break-words">
          Attendez que la Sorcière agisse...
        </p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { FlaskConical } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';

const gameStore = useGameStore();
const selectedKillTarget = ref(null);

// CORRECTION BUG CRITIQUE #1: Lire la cible des loups depuis le state
const wolvesTarget = computed(() => {
  const state = gameStore.currentGame?.state || {};
  const wolvesTargetId = state.wolves_target_id;
  if (wolvesTargetId) {
    const target = gameStore.players.find(p => p.id === wolvesTargetId);
    if (target) {
      // Recharger pour avoir is_protected à jour
      return gameStore.players.find(p => p.id === wolvesTargetId);
    }
  }
  return null;
});

// Watcher pour mettre à jour si le state change
watch(() => gameStore.currentGame?.state?.wolves_target_id, (newId) => {
  console.log('🧙‍♀️ [WitchPhase] Wolves target updated:', newId);
}, { immediate: true });

// Vérifier les potions disponibles
const witchPlayer = computed(() => gameStore.currentPlayer);
const hasHealPotion = computed(() => {
  const metadata = witchPlayer.value?.metadata || {};
  return metadata.heal_potion !== false;
});

const hasKillPotion = computed(() => {
  const metadata = witchPlayer.value?.metadata || {};
  return metadata.kill_potion !== false;
});

// Cibles disponibles pour la potion de mort (tous les joueurs vivants sauf soi-même)
const availableKillTargets = computed(() => {
  return gameStore.livingPlayers.filter(p => p.id !== witchPlayer.value?.id);
});

function selectKillTarget(player) {
  if (player.id !== witchPlayer.value?.id) {
    selectedKillTarget.value = player;
  }
}

async function useHealPotion() {
  if (!wolvesTarget.value) return;
  
  await gameStore.submitAction('witch_potion', wolvesTarget.value.id, {
    potion_type: 'heal'
  });
}

async function useKillPotion() {
  if (!selectedKillTarget.value) return;
  
  await gameStore.submitAction('witch_potion', selectedKillTarget.value.id, {
    potion_type: 'kill'
  });
  
  selectedKillTarget.value = null;
}

async function skipAction() {
  await gameStore.submitAction('witch_potion', null, {
    potion_type: 'skip'
  });
}
</script>

<style scoped>
.witch-phase {
  background: radial-gradient(ellipse at top, rgba(6, 182, 212, 0.15), transparent 60%), 
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
  justify-content: flex-start;
  align-items: center;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem 0;
  min-height: 0;
  max-height: calc(100vh - 200px);
  -webkit-overflow-scrolling: touch;
}

.glass-surface {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.wolves-target-info {
  text-align: center;
}

.potion-section {
  text-align: center;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  width: 100%;
  margin-top: 1rem;
}

.skip-section {
  width: 100%;
  max-width: 32rem;
  flex-shrink: 0;
}

.potion-section {
  flex-shrink: 0;
  margin-bottom: 1rem;
}

.wolves-target-info {
  flex-shrink: 0;
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
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
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
  
  .wolves-target-info,
  .potion-section {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }
  
  .wolves-target-info p,
  .potion-section h3 {
    font-size: 0.875rem;
  }
  
  .action-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .phase-main {
    max-height: calc(100vh - 180px);
    padding: 0.5rem 0;
  }
  
  .no-action-message {
    padding: 1rem;
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
