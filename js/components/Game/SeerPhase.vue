<!-- SeerPhase.vue -->
<template>
  <div class="h-screen w-screen bg-black flex flex-col p-4 border-2 border-purple-900">
    <!-- Header -->
    <header class="flex justify-between items-center border-b border-purple-900 pb-4 mb-4">
      <div class="flex items-center gap-4">
        <Eye class="w-8 h-8 text-purple-500" />
        <div>
          <p class="text-mono text-xs text-purple-700">NIGHT SEQUENCE {{ gameStore.currentGame?.day_number }}</p>
          <p class="text-display text-xl text-purple-500">SEER PROTOCOL</p>
        </div>
      </div>
      <Timer :seconds="gameStore.timer" variant="digital" size="sm" />
    </header>

    <main class="flex-1 overflow-y-auto">
      <template v-if="gameStore.canAct">
        <!-- Role Revelation Result -->
        <div v-if="revealedRole" class="flex flex-col items-center justify-center py-8">
          <div class="border-4 border-purple-500 p-8 bg-purple-900/20 text-center mb-4">
            <p class="text-mono text-xs text-purple-400 uppercase mb-2">IDENTITY REVEALED</p>
            <p class="text-display text-2xl text-white mb-2">{{ revealedPlayerName }}</p>
            <div class="h-1 bg-purple-500 w-full mb-4"></div>
            <p class="text-display text-4xl uppercase" :style="{ color: getRoleColor(revealedRole) }">
              {{ getRoleName(revealedRole) }}
            </p>
            <p class="text-mono text-xs mt-4" :class="isWerewolfRevealed ? 'text-red-500' : 'text-green-500'">
              {{ isWerewolfRevealed ? '⚠️ THREAT DETECTED' : '✓ CIVILIAN CONFIRMED' }}
            </p>
          </div>
          <p class="text-mono text-xs text-gray-500 animate-pulse">DATA RECORDED</p>
        </div>

        <!-- Player Selection (if not yet revealed) -->
        <template v-else>
          <div class="mb-4">
            <p class="text-mono text-sm text-purple-400 mb-4 text-center uppercase">Select target to reveal identity</p>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <PlayerCard
              v-for="player in availableTargets"
              :key="player.id"
              :name="player.user?.name || 'TARGET'"
              :status="player.is_alive ? 'alive' : 'dead'"
              :is-selected="selectedTarget?.id === player.id"
              selection-color="purple-500"
              @click="selectTarget(player)"
            />
          </div>
        </template>
      </template>

      <div v-else class="flex flex-col items-center justify-center h-full border-2 border-dashed border-purple-900 p-8">
        <Eye class="w-16 h-16 text-purple-900 mb-4" />
        <p class="text-display text-2xl text-purple-900 mb-2">SEER VISION</p>
        <p class="text-mono text-xs text-purple-800 uppercase">Waiting for revelation...</p>
      </div>
    </main>

    <footer class="pt-4 border-t border-purple-900 mt-auto">
      <ActionButton
        v-if="selectedTarget && gameStore.canAct && !revealedRole"
        variant="magic"
        size="lg"
        :full-width="true"
        :loading="isRevealing"
        @click="submitReveal"
      >
        REVEAL {{ selectedTarget.user?.name.toUpperCase() }}
      </ActionButton>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Eye } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';

const gameStore = useGameStore();
const selectedTarget = ref(null);
const revealedRole = ref(null);
const revealedPlayerName = ref(null);
const isRevealing = ref(false);

const seerPlayer = computed(() => gameStore.currentPlayer);

// Available targets: living players except self
const availableTargets = computed(() => {
  return gameStore.livingPlayers.filter(p => p.id !== seerPlayer.value?.id);
});

const isWerewolfRevealed = computed(() => revealedRole.value === 'werewolf');

function selectTarget(player) {
  if (player.id !== seerPlayer.value?.id) {
    selectedTarget.value = player;
  }
}

function getRoleName(role) {
  const roleNames = {
    werewolf: 'WEREWOLF',
    seer: 'SEER',
    witch: 'WITCH',
    guard: 'GUARD',
    hunter: 'HUNTER',
    cupid: 'CUPID',
    elder: 'ELDER',
    fool: 'FOOL',
    villager: 'CIVILIAN'
  };
  return roleNames[role] || role?.toUpperCase() || 'UNKNOWN';
}

function getRoleColor(role) {
  const roleColors = {
    werewolf: '#ef4444', // red
    seer: '#a855f7', // purple
    witch: '#ec4899', // pink
    guard: '#3b82f6', // blue
    hunter: '#f59e0b', // yellow
    cupid: '#f43f5e', // rose
    elder: '#6b7280', // gray
    fool: '#8b5cf6', // violet
    villager: '#10b981' // green
  };
  return roleColors[role] || '#ffffff';
}

async function submitReveal() {
  if (!selectedTarget.value || isRevealing.value) return;
  
  isRevealing.value = true;
  try {
    const result = await gameStore.submitAction('reveal_role', selectedTarget.value.id);
    
    if (result?.revealed_role) {
      revealedRole.value = result.revealed_role;
      revealedPlayerName.value = result.target_player_name || selectedTarget.value.user?.name;
    }
  } catch (error) {
    console.error('Error revealing role:', error);
  } finally {
    isRevealing.value = false;
    selectedTarget.value = null;
  }
}
</script>
