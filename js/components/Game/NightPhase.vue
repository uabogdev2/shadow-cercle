<!-- js/components/Game/NightPhase.vue -->
<template>
  <div class="h-screen w-screen bg-black flex flex-col p-4 relative overflow-hidden" :class="phaseClasses">
    <!-- Vignette -->
    <div v-if="isWerewolf" class="absolute inset-0 pointer-events-none z-0" style="background: radial-gradient(circle, transparent 50%, #7f1d1d 150%);"></div>

    <!-- Header -->
    <header class="relative z-10 flex justify-between items-center border-b border-gray-700 pb-3 mb-3">
      <div class="flex items-center gap-3">
        <component :is="roleIcon" class="w-6 h-6 sm:w-8 sm:h-8" :style="{ color: roleColor }" />
        <div>
          <p class="text-mono text-[10px] sm:text-xs uppercase text-gray-500">NIGHT SEQUENCE {{ gameStore.currentGame?.day_number }}</p>
          <p class="text-display text-lg sm:text-xl uppercase leading-none" :style="{ color: roleColor }">{{ getPhaseTitle() }}</p>
        </div>
      </div>
      <Timer :seconds="gameStore.timer" variant="digital" size="sm" />
    </header>

    <!-- Main Action Area -->
    <main class="relative z-10 flex-1 overflow-y-auto min-h-0">
      <div v-if="gameStore.canAct" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pb-20">
        <PlayerCard
          v-for="player in availableTargets"
          :key="player.id"
          :name="player.user?.name || 'TARGET'"
          :status="player.is_alive ? 'alive' : 'dead'"
          :is-selected="selectedTarget?.id === player.id"
          :selection-color="roleSelectionColor"
          @click="selectTarget(player)"
        />
      </div>
      <div v-else class="flex flex-col items-center justify-center h-full border-2 border-dashed border-gray-800 p-8 m-4">
        <p class="text-display text-2xl text-gray-700 mb-2">STANDBY MODE</p>
        <p class="text-mono text-xs text-gray-600 uppercase text-center">Waiting for operational sync...</p>
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-30 pt-3 border-t border-gray-800 mt-auto bg-black">
      <ActionButton
        v-if="selectedTarget && gameStore.canAct"
        :variant="roleButtonVariant"
        size="lg"
        :full-width="true"
        @click="submitAction"
      >
        {{ getButtonText().toUpperCase() }}
      </ActionButton>
    </footer>

    <!-- Chat Overlay for Wolves -->
    <div v-if="isWerewolf" class="absolute bottom-20 left-2 right-2 z-20 h-40 opacity-90 hover:opacity-100 transition-opacity">
      <ChatBox channel="wolves" :is-visible="true" class="h-full shadow-lg border-red-900" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Moon, Eye, Shield, Target } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';
import ChatBox from '@/components/Chat/ChatBox.vue';

const gameStore = useGameStore();
const selectedTarget = ref(null);

const roleConfig = {
  werewolf: { 
    icon: Moon, color: '#ef4444', actionText: "ELIMINATE TARGET", selectionColor: 'red-600', buttonVariant: 'danger', buttonText: 'DEVOUR'
  },
  seer: { 
    icon: Eye, color: '#a855f7', actionText: "SCAN IDENTITY", selectionColor: 'purple-500', buttonVariant: 'magic', buttonText: 'REVEAL'
  },
  guard: { 
    icon: Shield, color: '#3b82f6', actionText: "SECURE TARGET", selectionColor: 'blue-500', buttonVariant: 'primary', buttonText: 'PROTECT'
  },
  hunter: {
    icon: Target, color: '#f59e0b', actionText: "RETALIATE", selectionColor: 'yellow-500', buttonVariant: 'danger', buttonText: 'FIRE'
  }
};

const currentRole = computed(() => {
  const phase = gameStore.phase;
  if (phase === 'hunter_action' || phase === 'hunter_day_action') return 'hunter';
  return gameStore.currentPlayer?.role;
});

const config = computed(() => roleConfig[currentRole.value] || roleConfig.guard);
const isWerewolf = computed(() => currentRole.value === 'werewolf' || gameStore.phase === 'night_wolves');
const roleIcon = computed(() => config.value.icon || Moon);
const roleColor = computed(() => config.value.color || 'white');
const roleActionText = computed(() => config.value.actionText || "PROTOCOL INITIATED");
const roleSelectionColor = computed(() => config.value.selectionColor || 'white');
const roleButtonVariant = computed(() => config.value.buttonVariant || 'primary');

const phaseClasses = computed(() => isWerewolf.value ? 'border-red-900/30' : '');

const availableTargets = computed(() => {
  const currentPhase = gameStore.phase;
  if (isWerewolf.value || currentPhase === 'night_wolves') return gameStore.livingPlayers.filter(p => p.role !== 'werewolf');
  if (currentPhase === 'hunter_action' || currentPhase === 'hunter_day_action') return gameStore.livingPlayers.filter(p => p.id !== gameStore.currentPlayer?.id);
  return gameStore.livingPlayers.filter(p => p.id !== gameStore.currentPlayer?.id);
});

function selectTarget(player) {
  if (player.id !== gameStore.currentPlayer?.id) selectedTarget.value = player;
}

function getPhaseTitle() {
  const phase = gameStore.phase;
  if (phase === 'hunter_action' || phase === 'hunter_day_action') return "HUNTER RETALIATION";
  return roleActionText.value;
}

function getButtonText() {
  if (!selectedTarget.value) return '';
  const baseText = config.value.buttonText || 'CONFIRM';
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
