<!-- SeerPhase.vue -->
<template>
  <div class="seer-phase phase-night relative overflow-hidden">
    <div class="absolute inset-0 noise pointer-events-none"></div>
    <div class="absolute inset-0" aria-hidden="true">
      <div class="absolute -top-12 left-10 w-56 h-56 bg-indigo-500/10 blur-[110px]"></div>
      <div class="absolute bottom-10 right-0 w-64 h-64 bg-purple-700/10 blur-[120px]"></div>
      <div class="absolute top-10 right-8 w-14 h-14 rounded-full bg-slate-200/50 shadow-[0_0_40px_rgba(255,255,255,0.15)] opacity-70"></div>
    </div>

    <header class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="paper-card frame-wood bg-[#0c1422]/90 border border-violet-500/25 shadow-[0_20px_60px_rgba(0,0,0,0.55)] flex justify-between items-center">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-violet-500/15 border border-violet-500/35 flex items-center justify-center shadow-[0_10px_30px_rgba(124,58,237,0.25)]">
            <EyeIcon class="w-6 h-6 text-violet-300" />
          </div>
          <div>
            <p class="text-slate-400 text-xs uppercase tracking-[0.25em]">Nuit {{ gameStore.currentGame?.day_number }}</p>
            <p class="text-violet-200 text-lg font-semibold">La Voyante</p>
          </div>
        </div>
        <Timer :seconds="gameStore.timer" variant="circular" size="sm" />
      </div>
    </header>

    <main class="relative z-10 flex-1 overflow-y-auto px-4 md:px-6 pb-4">
      <template v-if="gameStore.canAct">
        <div v-if="revealedRole" class="flex flex-col items-center justify-center py-8">
          <div class="paper-card frame-wood bg-[#0f1624]/90 border border-violet-500/30 text-center w-full max-w-sm relative overflow-hidden shadow-[0_20px_80px_rgba(0,0,0,0.6)]">
            <div class="absolute inset-0 bg-gradient-to-br from-violet-500/15 via-transparent to-indigo-500/10"></div>
            <div class="relative z-10">
              <p class="text-slate-400 text-xs uppercase tracking-[0.22em] mb-4">Identité révélée</p>

              <div
                class="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center shadow-[0_0_35px_rgba(124,58,237,0.25)]"
                :style="{
                  background: `${getRoleColor(revealedRole)}22`,
                  border: `2px solid ${getRoleColor(revealedRole)}55`,
                  boxShadow: `0 0 40px ${getRoleColor(revealedRole)}33`
                }"
              >
                <span class="text-4xl">{{ getRoleIcon(revealedRole) }}</span>
              </div>

              <p class="text-slate-100 text-xl font-semibold mb-2">{{ revealedPlayerName }}</p>

              <div class="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent my-4"></div>

              <p class="text-cinzel text-2xl font-bold" :style="{ color: getRoleColor(revealedRole) }">
                {{ getRoleName(revealedRole) }}
              </p>

              <div class="mt-4">
                <span
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm border"
                  :class="isWerewolfRevealed ? 'bg-red-900/40 text-red-300 border-red-500/30' : 'bg-emerald-900/30 text-emerald-200 border-emerald-500/25'"
                >
                  <component :is="isWerewolfRevealed ? AlertTriangleIcon : CheckCircleIcon" class="w-4 h-4" />
                  {{ isWerewolfRevealed ? 'Menace détectée !' : 'Villageois confirmé' }}
                </span>
              </div>
            </div>
          </div>

          <p class="text-slate-500 text-sm mt-4 animate-pulse">Information enregistrée...</p>
        </div>

        <template v-else>
          <div class="text-center mb-6">
            <p class="text-slate-300 tracking-wide">Choisissez un joueur à sonder</p>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <PlayerCard
              v-for="player in availableTargets"
              :key="player.id"
              :name="player.user?.name || 'Joueur'"
              :status="player.is_alive ? 'alive' : 'dead'"
              :is-selected="selectedTarget?.id === player.id"
              selection-color="violet"
              @click="selectTarget(player)"
            />
          </div>
        </template>
      </template>

      <div v-else class="h-full flex flex-col items-center justify-center">
        <div class="paper-card frame-wood bg-[#0f1624]/85 border border-violet-500/25 text-center shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
          <EyeIcon class="w-12 h-12 text-violet-400/70 mx-auto mb-4" />
          <p class="text-slate-200 text-lg mb-2">Vision mystique</p>
          <p class="text-slate-500 text-sm">En attente de la révélation...</p>
        </div>
      </div>
    </main>

    <footer class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="paper-card frame-wood bg-[#0c1422]/90 border border-violet-500/20">
        <ActionButton
          v-if="selectedTarget && gameStore.canAct && !revealedRole"
          variant="magic"
          size="lg"
          :full-width="true"
          :loading="isRevealing"
          :glow="true"
          @click="submitReveal"
        >
          Révéler {{ selectedTarget.user?.name }}
        </ActionButton>
        <div v-else-if="!revealedRole && gameStore.canAct" class="text-center text-slate-400 py-1">
          Sélectionnez un joueur
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Eye as EyeIcon, AlertTriangle as AlertTriangleIcon, CheckCircle as CheckCircleIcon } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';

const gameStore = useGameStore();
const selectedTarget = ref(null);
const revealedRole = ref(null);
const revealedPlayerName = ref(null);
const isRevealing = ref(false);

const seerPlayer = computed(() => gameStore.currentPlayer);
const availableTargets = computed(() => gameStore.livingPlayers.filter(p => p.id !== seerPlayer.value?.id));
const isWerewolfRevealed = computed(() => revealedRole.value === 'werewolf');

function selectTarget(player) {
  if (player.id !== seerPlayer.value?.id) {
    selectedTarget.value = player;
  }
}

function getRoleName(role) {
  const roleNames = {
    werewolf: 'Loup-Garou',
    seer: 'Voyante',
    witch: 'Sorcière',
    guard: 'Garde',
    hunter: 'Chasseur',
    cupid: 'Cupidon',
    elder: 'Ancien',
    fool: 'Idiot',
    villager: 'Villageois'
  };
  return roleNames[role] || role?.toUpperCase() || 'Inconnu';
}

function getRoleIcon(role) {
  const icons = {
    werewolf: '🐺',
    seer: '🔮',
    witch: '🧪',
    guard: '🛡️',
    hunter: '🏹',
    cupid: '💘',
    elder: '👴',
    fool: '🃏',
    villager: '🏠'
  };
  return icons[role] || '❓';
}

function getRoleColor(role) {
  const roleColors = {
    werewolf: '#EF4444',
    seer: '#7C3AED',
    witch: '#EC4899',
    guard: '#3B82F6',
    hunter: '#F59E0B',
    cupid: '#F43F5E',
    elder: '#6B7280',
    fool: '#8B5CF6',
    villager: '#10B981'
  };
  return roleColors[role] || '#94A3B8';
}

async function submitReveal() {
  if (!selectedTarget.value || isRevealing.value) return;
  
  isRevealing.value = true;
  try {
    const result = await gameStore.submitAction('reveal_role', selectedTarget.value.id);
    
    if (result?.revealed_role) {
      revealedRole.value = result.revealed_role;
      revealedPlayerName.value = result.target_player_name || selectedTarget.value.user?.name;
    }
  } catch (error) {
    console.error('Error revealing role:', error);
  } finally {
    isRevealing.value = false;
    selectedTarget.value = null;
  }
}
</script>

<style scoped>
.seer-phase {
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

.text-cinzel {
  font-family: 'Cinzel', 'Playfair Display', serif;
}
.seer-phase {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.08), transparent 35%),
    radial-gradient(circle at 80% 75%, rgba(99, 102, 241, 0.12), transparent 40%),
    #050b13;
}
</style>
