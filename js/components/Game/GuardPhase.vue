<!-- GuardPhase.vue -->
<template>
  <div class="guard-phase h-screen w-screen flex flex-col relative overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 bg-gradient-to-b from-blue-950/50 via-slate-950 to-slate-950">
      <div class="absolute top-20 right-10 w-40 h-40 bg-blue-500/10 rounded-full filter blur-3xl"></div>
    </div>

    <!-- Moon -->
    <div class="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[0_0_40px_rgba(248,250,252,0.3)] opacity-60 z-20"></div>

    <!-- Header -->
    <header class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="glass-card p-4 flex justify-between items-center border-blue-500/30">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
            <ShieldIcon class="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <p class="text-slate-500 text-xs uppercase tracking-wider">Nuit {{ gameStore.currentGame?.day_number }}</p>
            <p class="text-blue-400 text-lg font-medium">Le Garde</p>
          </div>
        </div>
        <Timer :seconds="gameStore.timer" variant="circular" size="sm" />
      </div>
    </header>

    <main class="relative z-10 flex-1 overflow-y-auto px-4 md:px-6 pb-4">
      <template v-if="gameStore.canAct">
        <!-- Last protected warning -->
        <div v-if="lastProtectedPlayer" class="glass-card p-4 mb-6 border-amber-500/30">
          <div class="flex items-center gap-3 text-amber-400">
            <AlertTriangleIcon class="w-5 h-5" />
            <div>
              <p class="font-medium">Restriction active</p>
              <p class="text-sm text-amber-400/70">
                Vous ne pouvez pas protéger <strong>{{ lastProtectedPlayer.user?.name }}</strong> deux nuits de suite.
              </p>
            </div>
          </div>
        </div>

        <div class="text-center mb-6">
          <p class="text-slate-400">Choisissez qui protéger cette nuit</p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <PlayerCard
            v-for="player in availableTargets"
            :key="player.id"
            :name="player.user?.name || 'Joueur'"
            :status="player.is_alive ? 'alive' : 'dead'"
            :is-selected="selectedTarget?.id === player.id"
            selection-color="blue"
            @click="selectTarget(player)"
          />
        </div>
      </template>

      <div v-else class="h-full flex flex-col items-center justify-center">
        <div class="glass-card p-8 text-center">
          <ShieldIcon class="w-12 h-12 text-blue-400/50 mx-auto mb-4" />
          <p class="text-slate-400 text-lg mb-2">Garde en service</p>
          <p class="text-slate-600 text-sm">En attente des ordres...</p>
        </div>
      </div>
    </main>

    <footer class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="glass-card p-4">
        <ActionButton
          v-if="selectedTarget && gameStore.canAct"
          variant="primary"
          size="lg"
          :full-width="true"
          :glow="true"
          @click="submitProtection"
        >
          <span class="flex items-center justify-center gap-2">
            <ShieldIcon class="w-5 h-5" />
            Protéger {{ selectedTarget.user?.name }}
          </span>
        </ActionButton>
        <div v-else-if="gameStore.canAct" class="text-center text-slate-500 py-1">
          Sélectionnez un joueur à protéger
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Shield as ShieldIcon, AlertTriangle as AlertTriangleIcon } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';

const gameStore = useGameStore();
const selectedTarget = ref(null);

const guardPlayer = computed(() => gameStore.currentPlayer);
const lastProtectedId = computed(() => guardPlayer.value?.metadata?.last_protected_id);
const lastProtectedPlayer = computed(() => {
  if (!lastProtectedId.value) return null;
  return gameStore.players.find(p => p.id === lastProtectedId.value);
});

const availableTargets = computed(() => {
  return gameStore.livingPlayers.filter(p => {
    if (p.id === guardPlayer.value?.id) return false;
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

<style scoped>
.guard-phase {
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
</style>
