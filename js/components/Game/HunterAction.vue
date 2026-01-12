<!-- HunterAction.vue -->
<template>
  <div class="h-screen w-screen bg-black flex flex-col p-4 border-4 border-yellow-600">
    <!-- Header -->
    <header class="flex justify-between items-center border-b-2 border-yellow-600 pb-4 mb-4">
      <div class="flex items-center gap-4">
        <Target class="w-8 h-8 text-yellow-500" />
        <div>
          <p class="text-mono text-xs text-yellow-700">EMERGENCY PROTOCOL</p>
          <p class="text-display text-xl text-yellow-500">HUNTER RETALIATION</p>
        </div>
      </div>
      <Timer :seconds="gameStore.timer" variant="digital" size="sm" />
    </header>

    <main class="flex-1 overflow-y-auto">
      <template v-if="canShoot">
        <!-- Death notification -->
        <div class="border-2 border-red-600 bg-red-900/20 p-4 mb-6 text-center">
          <p class="text-mono text-xs text-red-500 uppercase mb-2">⚠️ CRITICAL STATUS</p>
          <p class="text-display text-2xl text-red-600">YOU HAVE BEEN ELIMINATED</p>
          <p class="text-mono text-sm text-red-400 mt-2">Final action available: Take one target with you</p>
        </div>

        <!-- Player Selection -->
        <div class="mb-4">
          <p class="text-mono text-sm text-yellow-400 mb-4 text-center uppercase">Select final target (optional)</p>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-6">
          <PlayerCard
            v-for="player in availableTargets"
            :key="player.id"
            :name="player.user?.name || 'TARGET'"
            :status="player.is_alive ? 'alive' : 'dead'"
            :is-selected="selectedTarget?.id === player.id"
            selection-color="yellow-500"
            @click="selectTarget(player)"
          />
        </div>

        <!-- Skip option -->
        <div class="border border-gray-600 p-4 text-center">
          <p class="text-mono text-xs text-gray-500 mb-2">OR</p>
          <ActionButton
            variant="secondary"
            :full-width="true"
            @click="skipAction"
          >
            STAND DOWN (NO SHOT)
          </ActionButton>
        </div>
      </template>

      <div v-else class="flex flex-col items-center justify-center h-full border-2 border-dashed border-yellow-900 p-8">
        <Target class="w-16 h-16 text-yellow-900 mb-4" />
        <p class="text-display text-2xl text-yellow-900 mb-2">HUNTER ACTION</p>
        <p class="text-mono text-xs text-yellow-800 uppercase">Waiting for hunter's decision...</p>
      </div>
    </main>

    <footer class="pt-4 border-t-2 border-yellow-600 mt-auto">
      <ActionButton
        v-if="selectedTarget && canShoot"
        variant="danger"
        size="lg"
        :full-width="true"
        :loading="isSubmitting"
        @click="submitShoot"
      >
        FIRE AT {{ selectedTarget.user?.name.toUpperCase() }}
      </ActionButton>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Target } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';

const gameStore = useGameStore();
const selectedTarget = ref(null);
const isSubmitting = ref(false);

const hunterPlayer = computed(() => gameStore.currentPlayer);

// Check if this player is the hunter who can shoot
const canShoot = computed(() => {
  const phase = gameStore.phase;
  const isHunterPhase = phase === 'hunter_action' || phase === 'hunter_day_action';
  const isHunter = hunterPlayer.value?.role === 'hunter';
  // Hunter can shoot even if dead (that's the point)
  return isHunterPhase && isHunter;
});

// Available targets: living players (hunter is dead at this point)
const availableTargets = computed(() => {
  return gameStore.livingPlayers.filter(p => p.id !== hunterPlayer.value?.id);
});

function selectTarget(player) {
  if (player.id !== hunterPlayer.value?.id) {
    selectedTarget.value = player;
  }
}

async function submitShoot() {
  if (!selectedTarget.value || isSubmitting.value) return;
  
  isSubmitting.value = true;
  try {
    await gameStore.submitAction('hunter_shoot', selectedTarget.value.id);
    selectedTarget.value = null;
  } catch (error) {
    console.error('Error submitting hunter shot:', error);
  } finally {
    isSubmitting.value = false;
  }
}

async function skipAction() {
  if (isSubmitting.value) return;
  
  isSubmitting.value = true;
  try {
    // Submit with null target to skip
    await gameStore.submitAction('hunter_shoot', null);
  } catch (error) {
    console.error('Error skipping hunter action:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>
