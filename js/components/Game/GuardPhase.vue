<!-- GuardPhase.vue -->
<template>
  <div class="h-screen w-screen bg-black flex flex-col p-4 border-2 border-blue-900">
    <!-- Header -->
    <header class="flex justify-between items-center border-b border-blue-900 pb-4 mb-4">
      <div class="flex items-center gap-4">
        <Shield class="w-8 h-8 text-blue-500" />
        <div>
          <p class="text-mono text-xs text-blue-700">NIGHT SEQUENCE {{ gameStore.currentGame?.day_number }}</p>
          <p class="text-display text-xl text-blue-500">GUARD PROTOCOL</p>
        </div>
      </div>
      <Timer :seconds="gameStore.timer" variant="digital" size="sm" />
    </header>

    <main class="flex-1 overflow-y-auto">
      <template v-if="gameStore.canAct">
        <!-- Last protected warning -->
        <div v-if="lastProtectedPlayer" class="border border-yellow-600 bg-yellow-900/20 p-3 mb-4">
          <p class="text-mono text-xs text-yellow-600 uppercase mb-1">⚠️ RESTRICTION ACTIVE</p>
          <p class="text-mono text-sm text-yellow-400">
            Cannot protect <strong>{{ lastProtectedPlayer.user?.name }}</strong> again this cycle.
          </p>
        </div>

        <!-- Player Selection -->
        <div class="mb-4">
          <p class="text-mono text-sm text-blue-400 mb-4 text-center uppercase">Select target to protect from wolves</p>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <PlayerCard
            v-for="player in availableTargets"
            :key="player.id"
            :name="player.user?.name || 'TARGET'"
            :status="player.is_alive ? 'alive' : 'dead'"
            :is-selected="selectedTarget?.id === player.id"
            selection-color="blue-500"
            @click="selectTarget(player)"
          />
        </div>
      </template>

      <div v-else class="flex flex-col items-center justify-center h-full border-2 border-dashed border-blue-900 p-8">
        <Shield class="w-16 h-16 text-blue-900 mb-4" />
        <p class="text-display text-2xl text-blue-900 mb-2">GUARD ON DUTY</p>
        <p class="text-mono text-xs text-blue-800 uppercase">Waiting for protection orders...</p>
      </div>
    </main>

    <footer class="pt-4 border-t border-blue-900 mt-auto">
      <ActionButton
        v-if="selectedTarget && gameStore.canAct"
        variant="primary"
        size="lg"
        :full-width="true"
        @click="submitProtection"
        class="border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-black"
      >
        SECURE {{ selectedTarget.user?.name.toUpperCase() }}
      </ActionButton>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Shield } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';

const gameStore = useGameStore();
const selectedTarget = ref(null);

const guardPlayer = computed(() => gameStore.currentPlayer);

// Get last protected player ID from metadata
const lastProtectedId = computed(() => guardPlayer.value?.metadata?.last_protected_id);

const lastProtectedPlayer = computed(() => {
  if (!lastProtectedId.value) return null;
  return gameStore.players.find(p => p.id === lastProtectedId.value);
});

// Available targets: living players except self and last protected
const availableTargets = computed(() => {
  return gameStore.livingPlayers.filter(p => {
    // Cannot protect self
    if (p.id === guardPlayer.value?.id) return false;
    // Cannot protect same player twice in a row
    if (p.id === lastProtectedId.value) return false;
    return true;
  });
});

function selectTarget(player) {
  if (player.id !== guardPlayer.value?.id && player.id !== lastProtectedId.value) {
    selectedTarget.value = player;
  }
}

async function submitProtection() {
  if (!selectedTarget.value) return;
  await gameStore.submitAction('protect', selectedTarget.value.id);
  selectedTarget.value = null;
}
</script>
