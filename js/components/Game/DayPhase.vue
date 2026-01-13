<!-- js/components/Game/DayPhase.vue -->
<template>
  <div class="day-phase h-screen w-screen flex flex-col relative overflow-hidden">
    <!-- Day Background -->
    <div class="absolute inset-0 bg-gradient-to-b from-amber-100/5 via-slate-900 to-slate-950">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full filter blur-3xl"></div>
    </div>

    <!-- Sun indicator -->
    <div class="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.4)] z-20"></div>

    <!-- Header -->
    <header class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="glass-card p-4 flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <SunIcon class="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p class="text-slate-500 text-xs uppercase tracking-wider">Jour {{ gameStore.currentGame?.day_number }}</p>
            <p class="text-amber-400 text-lg font-medium">{{ phaseTitle }}</p>
          </div>
        </div>
        <Timer :seconds="gameStore.timer" variant="circular" size="sm" />
      </div>
    </header>

    <!-- Main Content -->
    <main class="relative z-10 flex-1 flex flex-col min-h-0 px-4 md:px-6">
      <!-- Players Status Strip -->
      <div class="flex-shrink-0 mb-4">
        <div class="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <div 
            v-for="player in gameStore.players" 
            :key="player.id"
            class="flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg transition-all"
            :class="player.is_alive ? 'bg-slate-800/50' : 'bg-slate-900/50 opacity-50'"
          >
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium"
              :class="player.is_alive ? 'bg-slate-700 text-white' : 'bg-slate-800 text-slate-500'"
            >
              {{ player.user?.name?.[0]?.toUpperCase() || '?' }}
            </div>
            <span 
              class="text-xs truncate max-w-[60px]"
              :class="player.is_alive ? 'text-slate-300' : 'text-slate-600 line-through'"
            >
              {{ player.user?.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Debate/Vote Area -->
      <div class="flex-1 min-h-0">
        <transition name="fade" mode="out-in">
          <!-- Debate Phase -->
          <div v-if="isDebatePhase" class="h-full">
            <ChatBox channel="global" :is-visible="true" :show-quick-reactions="true" />
          </div>
          
          <!-- Vote Phase -->
          <div v-else class="h-full overflow-y-auto">
            <div v-if="gameStore.canAct" class="pb-4">
              <p class="text-slate-400 text-center mb-4">Qui doit être éliminé ?</p>
              <div class="grid grid-cols-2 gap-3">
                <PlayerCard
                  v-for="player in gameStore.livingPlayers"
                  :key="player.id"
                  :name="player.user?.name || 'Joueur'"
                  :status="player.is_alive ? 'alive' : 'dead'"
                  :is-selected="selectedTarget?.id === player.id"
                  selection-color="red"
                  @click="selectTarget(player)"
                />
              </div>
            </div>
            <div v-else class="h-full flex flex-col items-center justify-center">
              <div class="glass-card p-8 text-center">
                <SkullIcon class="w-12 h-12 text-red-400/50 mx-auto mb-4" />
                <p class="text-red-400 text-lg mb-2">Éliminé</p>
                <p class="text-slate-500 text-sm">Vous ne pouvez plus voter</p>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </main>

    <!-- Footer -->
    <footer class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="glass-card p-4">
        <ActionButton
          v-if="!isDebatePhase && selectedTarget && gameStore.canAct"
          variant="danger"
          size="lg"
          :full-width="true"
          :glow="true"
          @click="submitVote"
        >
          Voter contre {{ selectedTarget.user?.name }}
        </ActionButton>
        <div v-else-if="isDebatePhase" class="text-center text-amber-400/80 text-sm py-1">
          Discutez et trouvez les loups !
        </div>
        <div v-else-if="!gameStore.canAct" class="text-center text-slate-500 py-1">
          En attente du résultat...
        </div>
        <div v-else class="text-center text-slate-500 py-1">
          Sélectionnez un joueur à éliminer
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Sun as SunIcon, Skull as SkullIcon } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';
import ChatBox from '@/components/Chat/ChatBox.vue';

const gameStore = useGameStore();
const selectedTarget = ref(null);

const isDebatePhase = computed(() => gameStore.phase === 'day_debate');
const phaseTitle = computed(() => isDebatePhase.value ? 'Débat Public' : 'Vote du Village');

function selectTarget(player) {
  if (player.id !== gameStore.currentPlayer?.id) selectedTarget.value = player;
}

async function submitVote() {
  if (!selectedTarget.value) return;
  await gameStore.submitAction('day_vote', selectedTarget.value.id);
  selectedTarget.value = null;
}
</script>

<style scoped>
.day-phase {
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

.scrollbar-thin::-webkit-scrollbar {
  height: 4px;
}

.scrollbar-thin::-webkit-scrollbar-track {
  background: transparent;
}

.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
</style>
