<!-- js/components/Game/DayPhase.vue -->
<template>
  <div class="h-screen w-screen bg-black flex flex-col p-4 overflow-hidden">
    <!-- Header -->
    <header class="flex justify-between items-center border-b border-gray-700 pb-3 mb-3 flex-shrink-0">
      <div class="flex items-center gap-3">
        <Sun class="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500" />
        <div>
          <p class="text-mono text-[10px] sm:text-xs uppercase text-gray-500">DAY SEQUENCE {{ gameStore.currentGame?.day_number }}</p>
          <p class="text-display text-lg sm:text-xl uppercase leading-none text-white">{{ phaseTitle }}</p>
        </div>
      </div>
      <Timer :seconds="gameStore.timer" variant="digital" size="sm" />
    </header>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col min-h-0 relative">
      <!-- Status Strip -->
      <div class="flex overflow-x-auto gap-2 pb-3 mb-2 border-b border-gray-800 flex-shrink-0">
        <div v-for="player in gameStore.players" :key="player.id" class="w-16 sm:w-20 flex-shrink-0">
            <PlayerCard
              :name="player.user.name"
              :status="player.is_alive ? 'alive' : 'dead'"
              size="small"
              class="w-full"
            />
        </div>
      </div>

      <!-- Debate/Vote Area -->
      <div class="flex-1 min-h-0 relative">
        <transition name="fade" mode="out-in">
          <!-- Debate -->
          <div v-if="isDebatePhase" class="h-full flex flex-col">
            <ChatBox channel="global" :is-visible="true" :show-quick-reactions="true" />
          </div>
          <!-- Vote -->
          <div v-else class="h-full overflow-y-auto pb-20">
            <div v-if="gameStore.canAct" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 p-1">
              <PlayerCard
                v-for="player in gameStore.livingPlayers"
                :key="player.id"
                :name="player.user?.name || 'SUSPECT'"
                :status="player.is_alive ? 'alive' : 'dead'"
                :is-selected="selectedTarget?.id === player.id"
                selection-color="red-600"
                @click="selectTarget(player)"
              />
            </div>
            <div v-else class="flex flex-col items-center justify-center h-full border-2 border-red-900/50 bg-red-900/10 p-8 m-4">
              <p class="text-display text-3xl text-red-600 mb-2">TERMINATED</p>
              <p class="text-mono text-xs text-red-400 uppercase text-center">Voting privileges revoked.</p>
            </div>
          </div>
        </transition>
      </div>
    </main>

    <!-- Footer -->
    <footer class="pt-3 mt-auto bg-black z-20 border-t border-gray-800 flex-shrink-0">
      <ActionButton
        v-if="!isDebatePhase && selectedTarget && gameStore.canAct"
        variant="danger"
        size="lg"
        :full-width="true"
        @click="submitVote"
      >
        VOTE AGAINST {{ selectedTarget.user?.name }}
      </ActionButton>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Sun } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';
import ChatBox from '@/components/Chat/ChatBox.vue';

const gameStore = useGameStore();
const selectedTarget = ref(null);

const isDebatePhase = computed(() => gameStore.phase === 'day_debate');
const phaseTitle = computed(() => isDebatePhase.value ? 'PUBLIC DEBATE' : 'JUDGMENT VOTE');

function selectTarget(player) {
  if (player.id !== gameStore.currentPlayer?.id) selectedTarget.value = player;
}

async function submitVote() {
  if (!selectedTarget.value) return;
  await gameStore.submitAction('day_vote', selectedTarget.value.id);
  selectedTarget.value = null;
}
</script>
