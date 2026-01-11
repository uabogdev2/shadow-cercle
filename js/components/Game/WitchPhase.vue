<!-- WitchPhase.vue -->
<template>
  <div class="h-screen w-screen bg-black flex flex-col p-4 border-2 border-purple-900">
    <header class="flex justify-between items-center border-b border-purple-900 pb-4 mb-4">
      <div>
        <p class="text-mono text-xs text-purple-700">NIGHT SEQUENCE</p>
        <p class="text-display text-xl text-purple-500">WITCH PROTOCOL</p>
      </div>
      <Timer :seconds="gameStore.timer" variant="digital" size="sm" />
    </header>

    <main class="flex-1 overflow-y-auto">
      <template v-if="gameStore.canAct">
        <div class="border border-purple-900 p-4 mb-6 text-center">
          <p class="text-mono text-xs text-purple-400 mb-2">TARGET STATUS:</p>
          <div v-if="wolvesTarget">
            <p class="text-display text-2xl text-red-600">{{ wolvesTarget.user?.name.toUpperCase() }}</p>
            <p class="text-mono text-xs text-red-800">CRITICAL CONDITION</p>
          </div>
          <div v-else>
            <p class="text-mono text-sm text-green-600">STABLE</p>
          </div>
        </div>

        <div v-if="hasHealPotion" class="mb-6">
          <h3 class="text-mono text-sm text-green-500 mb-2 border-b border-green-900 pb-1">LIFE SERUM [1]</h3>
          <ActionButton v-if="wolvesTarget" variant="primary" :full-width="true" @click="useHealPotion" class="border-green-600 text-green-500 hover:bg-green-900">
            ADMINISTER TO {{ wolvesTarget.user?.name.toUpperCase() }}
          </ActionButton>
          <p v-else class="text-mono text-xs text-gray-600">NO TARGET AVAILABLE</p>
        </div>

        <div v-if="hasKillPotion" class="mb-6">
          <h3 class="text-mono text-sm text-red-500 mb-2 border-b border-red-900 pb-1">DEATH TOXIN [1]</h3>
          <div class="grid grid-cols-2 gap-2 mb-2">
            <PlayerCard
              v-for="player in availableKillTargets"
              :key="player.id"
              :name="player.user?.name || 'TARGET'"
              :status="player.is_alive ? 'alive' : 'dead'"
              :is-selected="selectedKillTarget?.id === player.id"
              selection-color="purple-600"
              size="small"
              @click="selectKillTarget(player)"
            />
          </div>
          <ActionButton v-if="selectedKillTarget" variant="danger" :full-width="true" @click="useKillPotion">
            TERMINATE {{ selectedKillTarget.user?.name.toUpperCase() }}
          </ActionButton>
        </div>

        <div class="mt-8 border-t border-purple-900 pt-4">
          <ActionButton variant="secondary" :full-width="true" @click="skipAction">
            STAND DOWN
          </ActionButton>
        </div>
      </template>
      <div v-else class="border border-purple-900 p-8 mt-10 text-center">
        <p class="text-mono text-purple-900">WAITING FOR WITCH...</p>
      </div>
    </main>
  </div>
</template>
<script setup>
import { ref, computed, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';

const gameStore = useGameStore();
const selectedKillTarget = ref(null);

const wolvesTarget = computed(() => {
  const targetId = gameStore.currentGame?.state?.wolves_target_id;
  if (targetId) return gameStore.players.find(p => p.id === targetId);
  return null;
});

const witchPlayer = computed(() => gameStore.currentPlayer);
const hasHealPotion = computed(() => witchPlayer.value?.metadata?.heal_potion !== false);
const hasKillPotion = computed(() => witchPlayer.value?.metadata?.kill_potion !== false);
const availableKillTargets = computed(() => gameStore.livingPlayers.filter(p => p.id !== witchPlayer.value?.id));

function selectKillTarget(player) { if (player.id !== witchPlayer.value?.id) selectedKillTarget.value = player; }

async function useHealPotion() {
  if (!wolvesTarget.value) return;
  await gameStore.submitAction('witch_potion', wolvesTarget.value.id, { potion_type: 'heal' });
}

async function useKillPotion() {
  if (!selectedKillTarget.value) return;
  await gameStore.submitAction('witch_potion', selectedKillTarget.value.id, { potion_type: 'kill' });
  selectedKillTarget.value = null;
}

async function skipAction() {
  await gameStore.submitAction('witch_potion', null, { potion_type: 'skip' });
}
</script>
