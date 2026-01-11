<template>
  <div 
    class="night-phase-container"
    :style="containerStyle"
    :class="containerClasses"
  >
    <!-- Vignettage pour Loups -->
    <div v-if="isWerewolf" class="vignette"></div>

    <!-- Header -->
    <header class="phase-header">
      <div class="header-left">
        <component :is="roleIcon" class="header-icon" :style="{ color: roleColor }" />
        <div>
          <p class="night-title">Nuit {{ gameStore.currentGame?.day_number }}</p>
          <p class="phase-subtitle" :style="{ color: roleColor }">
            {{ getPhaseTitle() }}
          </p>
        </div>
      </div>
      <Timer :seconds="gameStore.timer" variant="circular" size="sm" />
    </header>

    <!-- Main Action Area -->
    <main class="phase-main">
      <!-- Si le joueur peut agir, afficher la grille d'action -->
      <div v-if="gameStore.canAct" class="action-grid">
        <PlayerCard
          v-for="player in availableTargets"
          :key="player.id"
          :name="player.user?.name || 'Joueur'"
          :status="player.is_alive ? 'alive' : 'dead'"
          :is-selected="selectedTarget?.id === player.id"
          :selection-color="roleSelectionColor"
          @click="selectTarget(player)"
        />
      </div>
      <!-- Si le joueur ne peut pas agir, afficher un message -->
      <div v-else class="no-action-message glass-surface rounded-xl p-6 text-center max-w-md w-full">
        <p class="text-cream/90 font-sans text-lg mb-2">🌙 Ce n'est pas votre tour</p>
        <p class="text-cream/70 font-sans text-sm">
          Attendez que les autres joueurs agissent...
        </p>
      </div>
    </main>

    <!-- Footer Action Button -->
    <footer class="phase-footer">
      <ActionButton
        v-if="selectedTarget && gameStore.canAct"
        :variant="roleButtonVariant"
        size="lg"
        :full-width="true"
        @click="submitAction"
      >
        {{ getButtonText() }}
      </ActionButton>
    </footer>

    <!-- Werewolf Chat Overlay -->
    <div v-if="isWerewolf" class="chat-overlay">
      <ChatBox channel="wolves" :is-visible="true" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Moon, Eye, FlaskConical, Shield, Heart, Target } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';
import ChatBox from '@/components/Chat/ChatBox.vue';

const gameStore = useGameStore();
const selectedTarget = ref(null);

// FLOW CANON: Configuration des rôles pour NightPhase
// NOTE: witch et cupid ont leurs propres composants (WitchPhase.vue et CupidPhase.vue)
// NOTE: hunter est géré dans NightPhase pour hunter_action et hunter_day_action
const roleConfig = {
  werewolf: { 
    icon: Moon, 
    color: 'var(--color-blood-red)', 
    actionText: "Choisissez qui dévorer", 
    selectionColor: 'blood-red', 
    buttonVariant: 'danger',
    buttonText: 'Dévorer'
  },
  seer: { 
    icon: Eye, 
    color: 'var(--color-electric-violet)', 
    actionText: "Sondez l'âme d'un joueur", 
    selectionColor: 'electric-violet', 
    buttonVariant: 'magic',
    buttonText: 'Confirmer'
  },
  guard: { 
    icon: Shield, 
    color: 'var(--color-soft-gold)', 
    actionText: "Protégez un joueur", 
    selectionColor: 'soft-gold', 
    buttonVariant: 'primary',
    buttonText: 'Protéger'
  },
  hunter: {
    icon: Target, // Icône Chasseur
    color: 'var(--color-soft-gold)',
    actionText: "Choisissez qui tuer",
    selectionColor: 'blood-red',
    buttonVariant: 'danger',
    buttonText: 'Tirer'
  },
  // NOTE: witch et cupid ont leurs propres composants (WitchPhase.vue et CupidPhase.vue)
};

// FLOW CANON: Déterminer le rôle et la configuration selon la phase actuelle
const currentRole = computed(() => {
  const phase = gameStore.phase;
  
  // Pour hunter_action et hunter_day_action, le rôle est toujours hunter
  if (phase === 'hunter_action' || phase === 'hunter_day_action') {
    return 'hunter';
  }
  
  // Sinon, utiliser le rôle du joueur actuel
  return gameStore.currentPlayer?.role;
});

const config = computed(() => roleConfig[currentRole.value] || roleConfig.guard);

const isWerewolf = computed(() => currentRole.value === 'werewolf' || gameStore.phase === 'night_wolves');
const roleIcon = computed(() => config.value.icon || Moon);
const roleColor = computed(() => config.value.color || 'white');
const roleActionText = computed(() => config.value.actionText || "La nuit tombe...");
const roleSelectionColor = computed(() => config.value.selectionColor || 'soft-gold');
const roleButtonVariant = computed(() => config.value.buttonVariant || 'primary');

const containerStyle = computed(() => {
  const baseGradient = `radial-gradient(ellipse at top, ${roleColor.value}15, transparent 60%), radial-gradient(ellipse at bottom, #000000, var(--color-midnight-blue) 80%)`;
  return {
    background: baseGradient,
  };
});

const containerClasses = computed(() => {
  const classes = [];
  if (isWerewolf.value) {
    classes.push('werewolf-phase');
  }
  return classes.join(' ');
});

const availableTargets = computed(() => {
  const currentPhase = gameStore.phase;
  
  // FLOW CANON: Différentes cibles selon la phase et le rôle
  if (isWerewolf.value || currentPhase === 'night_wolves') {
    // Les loups ne peuvent pas voter pour eux-mêmes
    return gameStore.livingPlayers.filter(p => p.role !== 'werewolf');
  }
  
  if (currentPhase === 'hunter_action' || currentPhase === 'hunter_day_action') {
    // Le chasseur peut tirer sur n'importe quel joueur vivant sauf lui-même
    return gameStore.livingPlayers.filter(p => p.id !== gameStore.currentPlayer?.id);
  }
  
  // Par défaut, tous les joueurs vivants sauf soi-même
  return gameStore.livingPlayers.filter(p => p.id !== gameStore.currentPlayer?.id);
});

function selectTarget(player) {
  if (player.id !== gameStore.currentPlayer?.id) {
    selectedTarget.value = player;
  }
}

function getPhaseTitle() {
  const phase = gameStore.phase;
  
  // FLOW CANON: Titres selon la phase
  if (phase === 'hunter_action') {
    return "Le Chasseur peut tirer";
  }
  if (phase === 'hunter_day_action') {
    return "Le Chasseur peut tirer";
  }
  
  // Sinon, utiliser le texte du rôle
  return roleActionText.value;
}

function getButtonText() {
  if (!selectedTarget.value) return '';
  const baseText = config.value.buttonText || 'Confirmer';
  return `${baseText} ${selectedTarget.value.user?.name || ''}`;
}

async function submitAction() {
  if (!selectedTarget.value) return;

  let actionType = '';
  switch (currentRole.value) {
    case 'werewolf': actionType = 'kill_vote'; break;
    case 'seer': actionType = 'reveal_role'; break;
    case 'guard': actionType = 'protect'; break;
    case 'hunter': actionType = 'hunter_shoot'; break;
    // NOTE: witch et cupid ont leurs propres composants avec logique spécialisée
  }

  if (actionType) {
    await gameStore.submitAction(actionType, selectedTarget.value.id);
    selectedTarget.value = null;
  }
}
</script>

<style scoped>
.night-phase-container {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: radial-gradient(ellipse at top, rgba(124, 58, 237, 0.1), transparent 60%), 
              radial-gradient(ellipse at bottom, #000000, var(--color-midnight-blue) 80%);
  overflow: hidden;
}

.werewolf-phase {
  background: radial-gradient(ellipse at top, rgba(239, 68, 68, 0.15), transparent 60%), 
              radial-gradient(ellipse at bottom, #000000, var(--color-midnight-blue) 80%);
}

.vignette {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
  background: radial-gradient(ellipse at center, transparent 40%, rgba(0, 0, 0, 0.6) 100%);
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
  overflow-x: hidden;
  min-height: 0;
  max-height: calc(100vh - 200px); /* Header + Footer */
  padding: 0.5rem 0;
  -webkit-overflow-scrolling: touch;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  width: 100%;
  max-width: 32rem;
  padding: 0 1rem;
  flex-shrink: 0;
}

.phase-footer {
  position: relative;
  z-index: 10;
  padding: 1rem 0;
}

.chat-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem;
  z-index: 20;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

/* Responsive */
@media (min-width: 640px) {
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
    gap: 1rem;
  }
  
  .night-phase-container {
    padding: 1.5rem;
  }
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

@media (min-width: 768px) and (max-width: 1023px) {
  .night-phase-container {
    padding: 1.25rem;
  }
  
  .action-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }
}

@media (max-width: 640px) {
  .phase-header {
    padding: 0.5rem 0;
  }
  
  .header-icon {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .night-title {
    font-size: 1rem;
  }
  
  .phase-subtitle {
    font-size: 0.75rem;
  }
  
  .action-grid {
    gap: 0.5rem;
    padding: 0 0.5rem;
  }
  
  .night-phase-container {
    padding: 0.75rem;
  }
  
  .chat-overlay {
    padding: 0.75rem;
  }
  
  .phase-main {
    max-height: calc(100vh - 180px);
  }
  
  .no-action-message {
    padding: 1rem;
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
  
  .action-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0 0.25rem;
  }
  
  .phase-main {
    max-height: calc(100vh - 160px);
    padding: 0.25rem 0;
  }
  
  .phase-footer {
    padding: 0.75rem 0;
  }
  
  .no-action-message {
    padding: 1rem;
  }
  
  .no-action-message p {
    font-size: 0.875rem;
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
