<!-- CupidPhase.vue -->
<template>
  <div class="cupid-phase h-screen w-screen flex flex-col relative overflow-hidden">
    <!-- Romantic Background -->
    <div class="absolute inset-0 bg-gradient-to-b from-rose-950/50 via-slate-950 to-slate-950">
      <div class="absolute top-20 left-10 w-32 h-32 bg-rose-500/15 rounded-full filter blur-3xl"></div>
      <div class="absolute bottom-40 right-20 w-48 h-48 bg-pink-500/10 rounded-full filter blur-3xl"></div>
    </div>

    <!-- Moon -->
    <div class="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[0_0_40px_rgba(248,250,252,0.3)] opacity-60 z-20"></div>

    <!-- Header -->
    <header class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="glass-card p-4 flex justify-between items-center border-rose-500/30">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center">
            <HeartIcon class="w-6 h-6 text-rose-400" />
          </div>
          <div>
            <p class="text-slate-500 text-xs uppercase tracking-wider">Première Nuit</p>
            <p class="text-rose-400 text-lg font-medium">Cupidon</p>
          </div>
        </div>
        <Timer :seconds="gameStore.timer" variant="circular" size="sm" />
      </div>
    </header>

    <main class="relative z-10 flex-1 overflow-y-auto px-4 md:px-6 pb-4">
      <template v-if="gameStore.canAct">
        <div class="text-center mb-6">
          <p class="text-rose-300 text-lg mb-2">Unissez deux âmes</p>
          <p class="text-slate-400 text-sm">
            Sélectionnez 2 joueurs 
            <span class="text-rose-400">({{ selectedPlayers.length }}/2)</span>
          </p>
        </div>

        <!-- Selected lovers display -->
        <div v-if="selectedPlayers.length > 0" class="glass-card p-4 mb-6 border-rose-500/30">
          <p class="text-slate-500 text-xs uppercase tracking-wider mb-3 text-center">Couple sélectionné</p>
          <div class="flex items-center justify-center gap-4">
            <div v-for="(player, index) in selectedPlayers" :key="player.id" class="text-center">
              <div class="w-14 h-14 rounded-full bg-rose-500/20 border-2 border-rose-500 mx-auto mb-2 flex items-center justify-center">
                <span class="text-white font-medium">{{ player.user?.name?.[0]?.toUpperCase() }}</span>
              </div>
              <p class="text-white text-sm">{{ player.user?.name }}</p>
            </div>
            <div v-if="selectedPlayers.length === 2" class="text-rose-400 text-2xl animate-pulse">💕</div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <PlayerCard
            v-for="player in availableTargets"
            :key="player.id"
            :name="player.user?.name || 'Joueur'"
            :status="player.is_alive ? 'alive' : 'dead'"
            :is-selected="isSelected(player)"
            selection-color="rose"
            @click="toggleSelection(player)"
          />
        </div>
      </template>

      <div v-else class="h-full flex flex-col items-center justify-center">
        <div class="glass-card p-8 text-center">
          <HeartIcon class="w-12 h-12 text-rose-400/50 mx-auto mb-4" />
          <p class="text-slate-400 text-lg mb-2">L'amour frappe</p>
          <p class="text-slate-600 text-sm">En attente de Cupidon...</p>
        </div>
      </div>
    </main>

    <footer class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="glass-card p-4">
        <ActionButton
          v-if="selectedPlayers.length === 2 && gameStore.canAct"
          variant="magic"
          size="lg"
          :full-width="true"
          :glow="true"
          @click="submitAction"
        >
          <span class="flex items-center justify-center gap-2">
            <HeartIcon class="w-5 h-5" />
            Unir les amoureux
          </span>
        </ActionButton>
        <div v-else-if="gameStore.canAct" class="text-center text-slate-500 py-1">
          Sélectionnez 2 joueurs à lier
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Heart as HeartIcon } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';

const gameStore = useGameStore();
const selectedPlayers = ref([]);

const availableTargets = computed(() => gameStore.livingPlayers);

function isSelected(player) { 
  return selectedPlayers.value.some(p => p.id === player.id); 
}

function toggleSelection(player) {
  const index = selectedPlayers.value.findIndex(p => p.id === player.id);
  if (index >= 0) {
    selectedPlayers.value.splice(index, 1);
  } else {
    if (selectedPlayers.value.length < 2) {
      selectedPlayers.value.push(player);
    } else {
      // Replace first selection
      selectedPlayers.value.shift();
      selectedPlayers.value.push(player);
    }
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

<style scoped>
.cupid-phase {
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

.glass-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
</style>
