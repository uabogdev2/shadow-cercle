<!-- HunterAction.vue -->
<template>
  <div class="hunter-action h-screen w-screen flex flex-col relative overflow-hidden">
    <!-- Dramatic Background -->
    <div class="absolute inset-0 bg-gradient-to-b from-amber-950/40 via-slate-950 to-slate-950">
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/10 rounded-full filter blur-3xl"></div>
    </div>

    <!-- Vignette -->
    <div class="absolute inset-0 vignette-dark pointer-events-none"></div>

    <!-- Header -->
    <header class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="glass-card p-4 flex justify-between items-center border-amber-500/30">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <TargetIcon class="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p class="text-red-500 text-xs uppercase tracking-wider">Urgence</p>
            <p class="text-amber-400 text-lg font-medium">Représailles du Chasseur</p>
          </div>
        </div>
        <Timer :seconds="gameStore.timer" variant="circular" size="sm" />
      </div>
    </header>

    <main class="relative z-10 flex-1 overflow-y-auto px-4 md:px-6 pb-4">
      <template v-if="canShoot">
        <!-- Death notification -->
        <div class="glass-card p-6 mb-6 border-red-500/30 text-center">
          <SkullIcon class="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 class="text-red-400 text-xl font-medium mb-2">Vous avez été éliminé</h2>
          <p class="text-slate-400 text-sm">
            En tant que chasseur, vous pouvez emporter quelqu'un avec vous.
          </p>
        </div>

        <div class="text-center mb-4">
          <p class="text-amber-300">Choisissez votre dernière cible</p>
          <p class="text-slate-500 text-sm">(optionnel)</p>
        </div>

        <div class="grid grid-cols-2 gap-3 mb-6">
          <PlayerCard
            v-for="player in availableTargets"
            :key="player.id"
            :name="player.user?.name || 'Joueur'"
            :status="player.is_alive ? 'alive' : 'dead'"
            :is-selected="selectedTarget?.id === player.id"
            selection-color="gold"
            @click="selectTarget(player)"
          />
        </div>

        <!-- Skip option -->
        <div class="glass-card p-4 text-center">
          <ActionButton
            variant="secondary"
            :full-width="true"
            @click="skipAction"
          >
            Ne pas tirer
          </ActionButton>
        </div>
      </template>

      <div v-else class="h-full flex flex-col items-center justify-center">
        <div class="glass-card p-8 text-center">
          <TargetIcon class="w-12 h-12 text-amber-400/50 mx-auto mb-4" />
          <p class="text-slate-400 text-lg mb-2">Action du Chasseur</p>
          <p class="text-slate-600 text-sm">En attente de sa décision...</p>
        </div>
      </div>
    </main>

    <footer class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="glass-card p-4">
        <ActionButton
          v-if="selectedTarget && canShoot"
          variant="danger"
          size="lg"
          :full-width="true"
          :loading="isSubmitting"
          :glow="true"
          @click="submitShoot"
        >
          <span class="flex items-center justify-center gap-2">
            <TargetIcon class="w-5 h-5" />
            Tirer sur {{ selectedTarget.user?.name }}
          </span>
        </ActionButton>
        <div v-else-if="canShoot" class="text-center text-slate-500 py-1">
          Sélectionnez une cible ou passez
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Target as TargetIcon, Skull as SkullIcon } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';

const gameStore = useGameStore();
const selectedTarget = ref(null);
const isSubmitting = ref(false);

const hunterPlayer = computed(() => gameStore.currentPlayer);

const canShoot = computed(() => {
  const phase = gameStore.phase;
  const isHunterPhase = phase === 'hunter_action' || phase === 'hunter_day_action';
  const isHunter = hunterPlayer.value?.role === 'hunter';
  return isHunterPhase && isHunter;
});

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
    await gameStore.submitAction('hunter_shoot', null);
  } catch (error) {
    console.error('Error skipping hunter action:', error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.hunter-action {
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

.vignette-dark {
  background: radial-gradient(ellipse at center, transparent 20%, rgba(0, 0, 0, 0.5) 100%);
}
</style>
