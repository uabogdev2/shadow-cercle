<!-- js/components/Game/NightPhase.vue -->
<template>
  <div class="night-phase h-screen w-screen flex flex-col relative overflow-hidden" :class="phaseClasses">
    <!-- Background with vignette for wolves -->
    <div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/80 to-slate-950">
      <div v-if="isWerewolf" class="absolute inset-0 vignette-blood"></div>
    </div>

    <!-- Moon indicator -->
    <div class="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[0_0_40px_rgba(248,250,252,0.3)] opacity-60 z-20"></div>

    <!-- Header -->
    <header class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="glass-card p-4 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div 
            class="w-12 h-12 rounded-xl flex items-center justify-center"
            :style="{ background: `${roleColor}20`, border: `1px solid ${roleColor}40` }"
          >
            <component :is="roleIcon" class="w-6 h-6" :style="{ color: roleColor }" />
          </div>
          <div>
            <p class="text-slate-500 text-xs uppercase tracking-wider">Nuit {{ gameStore.currentGame?.day_number }}</p>
            <p class="text-lg font-medium" :style="{ color: roleColor }">{{ getPhaseTitle() }}</p>
          </div>
        </div>
        <Timer :seconds="gameStore.timer" variant="circular" size="sm" />
      </div>
    </header>

    <!-- Main Action Area -->
    <main class="relative z-10 flex-1 overflow-y-auto px-4 md:px-6 pb-4">
      <div v-if="gameStore.canAct">
        <p class="text-slate-400 text-center mb-4">Sélectionnez votre cible</p>
        <div class="grid grid-cols-2 gap-3">
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
      <div v-else class="h-full flex flex-col items-center justify-center">
        <div class="glass-card p-8 text-center">
          <MoonIcon class="w-12 h-12 text-violet-400/50 mx-auto mb-4" />
          <p class="text-slate-400 text-lg mb-2">Mode Veille</p>
          <p class="text-slate-600 text-sm">En attente des autres joueurs...</p>
        </div>
      </div>
    </main>

    <!-- Footer with action button -->
    <footer class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="glass-card p-4">
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
        <div v-else-if="gameStore.canAct" class="text-center text-slate-500 py-2">
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
  min-height: 100vh;
  min-height: 100dvh;
}

.glass-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.vignette-blood {
  background: radial-gradient(ellipse at center, transparent 30%, rgba(127, 29, 29, 0.4) 100%);
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
