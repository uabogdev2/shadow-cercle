<!-- HunterAction.vue -->
<template>
  <div class="hunter-action phase-night relative overflow-hidden">
    <div class="absolute inset-0 noise pointer-events-none"></div>
    <div class="absolute inset-0" aria-hidden="true">
      <div class="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 bg-amber-500/12 blur-[120px]"></div>
      <div class="absolute bottom-6 right-10 w-48 h-48 bg-red-500/10 blur-[110px]"></div>
    </div>

    <header class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="paper-card frame-wood bg-[#0f151f]/90 border border-amber-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.55)] flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center shadow-[0_10px_30px_rgba(245,158,11,0.25)]">
            <TargetIcon class="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <p class="text-red-400 text-xs uppercase tracking-[0.25em]">Urgence</p>
            <p class="text-amber-200 text-lg font-semibold">Représailles du Chasseur</p>
          </div>
        </div>
        <Timer :seconds="gameStore.timer" variant="circular" size="sm" />
      </div>
    </header>

    <main class="relative z-10 flex-1 overflow-y-auto px-4 md:px-6 pb-4">
      <template v-if="canShoot">
        <div class="paper-card frame-wood bg-[#0f1624]/90 border border-red-500/30 text-center mb-6 shadow-[0_18px_60px_rgba(0,0,0,0.6)]">
          <SkullIcon class="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h2 class="text-amber-100 text-xl font-semibold mb-2">Vous avez été éliminé</h2>
          <p class="text-slate-300 text-sm">En tant que chasseur, vous pouvez emporter quelqu'un avec vous.</p>
        </div>

        <div class="text-center mb-4">
          <p class="text-amber-200">Choisissez votre dernière cible</p>
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

        <div class="paper-card frame-wood bg-[#0f151f]/90 border border-amber-500/20 text-center">
          <ActionButton variant="secondary" :full-width="true" @click="skipAction">
            Ne pas tirer
          </ActionButton>
        </div>
      </template>

      <div v-else class="h-full flex flex-col items-center justify-center">
        <div class="paper-card frame-wood bg-[#0f1624]/85 border border-amber-500/20 text-center shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
          <TargetIcon class="w-12 h-12 text-amber-300/80 mx-auto mb-4" />
          <p class="text-amber-100 text-lg mb-2">Action du Chasseur</p>
          <p class="text-slate-500 text-sm">En attente de sa décision...</p>
        </div>
      </div>
    </main>

    <footer class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="paper-card frame-wood bg-[#0f151f]/90 border border-amber-500/25">
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
        <div v-else-if="canShoot" class="text-center text-slate-400 py-1">
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
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 50% 30%, rgba(245, 158, 11, 0.12), transparent 35%),
    radial-gradient(circle at 80% 80%, rgba(239, 68, 68, 0.14), transparent 40%),
    #050b13;
}
</style>
