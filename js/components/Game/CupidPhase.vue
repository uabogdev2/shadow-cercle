<!-- CupidPhase.vue -->
<template>
  <div class="h-screen w-screen bg-black flex flex-col p-4 border-2 border-pink-900">
    <header class="flex justify-between items-center border-b border-pink-900 pb-4 mb-4">
      <div>
        <p class="text-mono text-xs text-pink-700">NIGHT SEQUENCE</p>
        <p class="text-display text-xl text-pink-500">CUPID PROTOCOL</p>
      </div>
      <Timer :seconds="gameStore.timer" variant="digital" size="sm" />
    </header>

    <main class="flex-1 flex flex-col items-center overflow-y-auto">
      <template v-if="gameStore.canAct">
        <div class="mb-4 text-center">
          <p class="text-mono text-sm text-pink-300">LINK 2 TARGETS</p>
        </div>

        <div class="grid grid-cols-2 gap-4 w-full max-w-lg">
          <PlayerCard
            v-for="player in availableTargets"
            :key="player.id"
            :name="player.user?.name || 'TARGET'"
            :status="player.is_alive ? 'alive' : 'dead'"
            :is-selected="isSelected(player)"
            selection-color="pink-600"
            @click="toggleSelection(player)"
          />
        </div>
      </template>
      <div v-else class="border border-pink-900 p-8 mt-10">
        <p class="text-mono text-pink-900 text-center">WAITING FOR CUPID...</p>
      </div>
    </main>

    <footer class="pt-4 border-t border-pink-900 mt-auto">
      <ActionButton
        v-if="selectedPlayers.length === 2 && gameStore.canAct"
        variant="magic"
        size="lg"
        :full-width="true"
        @click="submitAction"
      >
        INITIATE LINK
      </ActionButton>
    </footer>
  </div>
</template>
<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';

const gameStore = useGameStore();
const selectedPlayers = ref([]);

const availableTargets = computed(() => gameStore.livingPlayers.filter(p => p.id !== gameStore.currentPlayer?.id));

function isSelected(player) { return selectedPlayers.value.some(p => p.id === player.id); }

function toggleSelection(player) {
  const index = selectedPlayers.value.findIndex(p => p.id === player.id);
  if (index >= 0) selectedPlayers.value.splice(index, 1);
  else {
    if (selectedPlayers.value.length < 2) selectedPlayers.value.push(player);
    else selectedPlayers.value[0] = player;
  }
}

async function submitAction() {
  if (selectedPlayers.value.length !== 2) return;
  await gameStore.submitAction('cupid_match', null, {
    player1_id: selectedPlayers.value[0].id,
    player2_id: selectedPlayers.value[1].id
  });
  selectedPlayers.value = [];
}
</script>
