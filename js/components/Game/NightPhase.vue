<!-- js/components/Game/NightPhase.vue -->
<template>
  <div class="night-phase phase-surface phase-night" :class="phaseClasses">
    <!-- Background with vignette for wolves -->
    <div class="absolute inset-0 bg-gradient-to-b from-[#0b0c11] via-[#0f1016] to-[#0b0c11]">
      <div v-if="isWerewolf" class="absolute inset-0 vignette-blood"></div>
      <div class="noise-overlay"></div>
    </div>

    <!-- Moon indicator -->
    <div class="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[0_0_40px_rgba(248,250,252,0.3)] opacity-60 z-20"></div>

    <!-- Header -->
    <header class="night-phase-header">
      <div class="paper-card frame-wood night-phase-header-content">
        <div class="night-phase-header-left">
          <div 
            class="night-phase-icon"
            :style="{ background: `${roleColor}20`, border: `1px solid ${roleColor}40` }"
          >
            <component :is="roleIcon" class="night-phase-icon-svg" :style="{ color: roleColor }" />
          </div>
          <div class="night-phase-header-text">
            <p class="night-phase-subtitle">Nuit {{ gameStore.currentGame?.day_number }}</p>
            <p class="night-phase-title" :style="{ color: roleColor }">{{ getPhaseTitle() }}</p>
          </div>
        </div>
        <Timer :seconds="gameStore.timer" variant="circular" size="sm" />
      </div>
    </header>

    <!-- Main Action Area -->
    <main class="night-phase-main">
      <div v-if="gameStore.canAct" class="night-phase-action-area">
        <p class="night-phase-instruction">Sélectionnez votre cible</p>
        <div class="night-phase-players-grid">
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
      </div>
      <div v-else class="night-phase-waiting">
        <div class="paper-card frame-wood night-phase-waiting-card">
          <MoonIcon class="night-phase-waiting-icon" />
          <p class="night-phase-waiting-title">Mode Veille</p>
          <p class="night-phase-waiting-text">En attente des autres joueurs...</p>
        </div>
      </div>
    </main>

    <!-- Footer with action button -->
    <footer class="night-phase-footer">
      <div class="paper-card frame-wood night-phase-footer-content">
        <ActionButton
          v-if="selectedTarget && gameStore.canAct"
          :variant="roleButtonVariant"
          size="lg"
          :full-width="true"
          :glow="true"
          @click="submitAction"
        >
          {{ getButtonText() }}
        </ActionButton>
        <div v-else-if="gameStore.canAct" class="night-phase-footer-message">
          Sélectionnez une cible
        </div>
      </div>
    </footer>

    <!-- Chat Overlay for Wolves -->
    <div 
      v-if="isWerewolf" 
      class="fixed bottom-32 left-4 right-4 z-30 h-40 transition-all duration-300"
      :class="chatExpanded ? 'h-64' : 'h-40'"
    >
      <ChatBox channel="wolves" :is-visible="true" class="h-full shadow-2xl" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Moon as MoonIcon, Eye as EyeIcon, Shield as ShieldIcon, Target as TargetIcon } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';
import ChatBox from '@/components/Chat/ChatBox.vue';

const gameStore = useGameStore();
const selectedTarget = ref(null);
const chatExpanded = ref(false);

const roleConfig = {
  werewolf: { 
    icon: MoonIcon, 
    color: '#EF4444', 
    actionText: "Phase des Loups", 
    selectionColor: 'red', 
    buttonVariant: 'danger', 
    buttonText: 'Dévorer'
  },
  seer: { 
    icon: EyeIcon, 
    color: '#7C3AED', 
    actionText: "Phase de la Voyante", 
    selectionColor: 'violet', 
    buttonVariant: 'magic', 
    buttonText: 'Révéler'
  },
  guard: { 
    icon: ShieldIcon, 
    color: '#3B82F6', 
    actionText: "Phase du Garde", 
    selectionColor: 'blue', 
    buttonVariant: 'primary', 
    buttonText: 'Protéger'
  },
  hunter: {
    icon: TargetIcon, 
    color: '#F59E0B', 
    actionText: "Vengeance du Chasseur", 
    selectionColor: 'gold', 
    buttonVariant: 'primary', 
    buttonText: 'Tirer'
  }
};

const currentRole = computed(() => {
  const phase = gameStore.phase;
  if (phase === 'hunter_action' || phase === 'hunter_day_action') return 'hunter';
  return gameStore.currentPlayer?.role;
});

const config = computed(() => roleConfig[currentRole.value] || roleConfig.guard);
const isWerewolf = computed(() => currentRole.value === 'werewolf' || gameStore.phase === 'night_wolves');
const roleIcon = computed(() => config.value.icon || MoonIcon);
const roleColor = computed(() => config.value.color || '#7C3AED');
const roleSelectionColor = computed(() => config.value.selectionColor || 'violet');
const roleButtonVariant = computed(() => config.value.buttonVariant || 'primary');

const phaseClasses = computed(() => isWerewolf.value ? 'wolves-active' : '');

const availableTargets = computed(() => {
  const currentPhase = gameStore.phase;
  if (isWerewolf.value || currentPhase === 'night_wolves') {
    return gameStore.livingPlayers.filter(p => p.role !== 'werewolf');
  }
  if (currentPhase === 'hunter_action' || currentPhase === 'hunter_day_action') {
    return gameStore.livingPlayers.filter(p => p.id !== gameStore.currentPlayer?.id);
  }
  return gameStore.livingPlayers.filter(p => p.id !== gameStore.currentPlayer?.id);
});

function selectTarget(player) {
  if (player.id !== gameStore.currentPlayer?.id) selectedTarget.value = player;
}

function getPhaseTitle() {
  const phase = gameStore.phase;
  if (phase === 'hunter_action' || phase === 'hunter_day_action') return "Vengeance du Chasseur";
  return config.value.actionText || "Phase de Nuit";
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
  }
  if (actionType) {
    await gameStore.submitAction(actionType, selectedTarget.value.id);
    selectedTarget.value = null;
  }
}
</script>

<style scoped>
.night-phase {
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  color: #e5e7eb;
}

/* Header */
.night-phase-header {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  padding: 1rem;
}

@media (min-width: 768px) {
  .night-phase-header {
    padding: 1.5rem;
  }
}

.night-phase-header-content {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: linear-gradient(135deg, rgba(29, 25, 20, 0.8), rgba(20, 18, 16, 0.9));
  border-radius: 1rem;
}

.night-phase-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.night-phase-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.night-phase-icon-svg {
  width: 1.5rem;
  height: 1.5rem;
}

.night-phase-header-text {
  display: flex;
  flex-direction: column;
}

.night-phase-subtitle {
  color: rgba(245, 245, 220, 0.65);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.night-phase-title {
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0;
  font-family: 'Cinzel', 'Playfair Display', serif;
}

/* Main */
.night-phase-main {
  position: relative;
  z-index: 10;
  flex: 1;
  overflow-y: auto;
  padding-left: 1rem;
  padding-right: 1rem;
  padding-bottom: 1rem;
}

@media (min-width: 768px) {
  .night-phase-main {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

.night-phase-action-area {
  display: flex;
  flex-direction: column;
}

.night-phase-instruction {
  color: rgba(245, 245, 220, 0.7);
  text-align: center;
  margin-bottom: 1rem;
}

.night-phase-players-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.night-phase-waiting {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.night-phase-waiting-card {
  padding: 2rem;
  text-align: center;
  background: linear-gradient(145deg, rgba(26, 19, 14, 0.85), rgba(15, 15, 15, 0.92));
}

.night-phase-waiting-icon {
  width: 3rem;
  height: 3rem;
  color: rgba(167, 139, 250, 0.5);
  margin: 0 auto 1rem;
  display: block;
}

.night-phase-waiting-title {
  color: rgba(245, 245, 220, 0.7);
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.night-phase-waiting-text {
  color: rgba(255, 255, 255, 0.45);
  font-size: 0.875rem;
}

/* Footer */
.night-phase-footer {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  padding: 1rem;
}

@media (min-width: 768px) {
  .night-phase-footer {
    padding: 1.5rem;
  }
}

.night-phase-footer-content {
  padding: 1rem;
  background: linear-gradient(135deg, rgba(26, 20, 15, 0.85), rgba(14, 12, 10, 0.9));
  border-radius: 1rem;
}

.night-phase-footer-message {
  text-align: center;
  color: rgba(245, 245, 220, 0.6);
  padding: 0.5rem 0;
}

.vignette-blood {
  background: radial-gradient(ellipse at center, transparent 30%, rgba(127, 29, 29, 0.25) 100%);
  pointer-events: none;
}

.wolves-active {
  animation: wolf-pulse 4s ease-in-out infinite;
}

@keyframes wolf-pulse {
  0%, 100% {
    filter: brightness(1);
  }
  50% {
    filter: brightness(0.95) hue-rotate(-5deg);
  }
}
</style>
