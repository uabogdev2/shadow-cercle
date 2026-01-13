<!-- SeerPhase.vue -->
<template>
  <div class="seer-phase h-screen w-screen flex flex-col relative overflow-hidden">
    <!-- Mystical Background -->
    <div class="absolute inset-0 bg-gradient-to-b from-violet-950/50 via-slate-950 to-slate-950">
      <div class="absolute top-1/4 left-1/4 w-48 h-48 bg-violet-500/15 rounded-full filter blur-3xl"></div>
      <div class="absolute bottom-1/4 right-1/4 w-32 h-32 bg-indigo-500/15 rounded-full filter blur-3xl"></div>
    </div>

    <!-- Moon -->
    <div class="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[0_0_40px_rgba(248,250,252,0.3)] opacity-60 z-20"></div>

    <!-- Header -->
    <header class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="glass-card p-4 flex justify-between items-center border-violet-500/30">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-violet-500/20 border border-violet-500/40 flex items-center justify-center">
            <EyeIcon class="w-6 h-6 text-violet-400" />
          </div>
          <div>
            <p class="text-slate-500 text-xs uppercase tracking-wider">Nuit {{ gameStore.currentGame?.day_number }}</p>
            <p class="text-violet-400 text-lg font-medium">La Voyante</p>
          </div>
        </div>
        <Timer :seconds="gameStore.timer" variant="circular" size="sm" />
      </div>
    </header>

    <main class="relative z-10 flex-1 overflow-y-auto px-4 md:px-6 pb-4">
      <template v-if="gameStore.canAct">
        <!-- Role Revelation Result -->
        <div v-if="revealedRole" class="flex flex-col items-center justify-center py-8">
          <div class="glass-card p-8 text-center w-full max-w-sm border-violet-500/30 relative overflow-hidden">
            <!-- Glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent"></div>
            
            <div class="relative z-10">
              <p class="text-slate-500 text-xs uppercase tracking-wider mb-4">Identité révélée</p>
              
              <div class="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center"
                :style="{ 
                  background: `${getRoleColor(revealedRole)}20`,
                  border: `2px solid ${getRoleColor(revealedRole)}40`,
                  boxShadow: `0 0 30px ${getRoleColor(revealedRole)}30`
                }"
              >
                <span class="text-4xl">{{ getRoleIcon(revealedRole) }}</span>
              </div>
              
              <p class="text-white text-xl font-medium mb-2">{{ revealedPlayerName }}</p>
              
              <div class="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent my-4"></div>
              
              <p 
                class="text-cinzel text-2xl font-bold"
                :style="{ color: getRoleColor(revealedRole) }"
              >
                {{ getRoleName(revealedRole) }}
              </p>
              
              <div class="mt-4">
                <span 
                  class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm"
                  :class="isWerewolfRevealed ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'"
                >
                  <component :is="isWerewolfRevealed ? AlertTriangleIcon : CheckCircleIcon" class="w-4 h-4" />
                  {{ isWerewolfRevealed ? 'Menace détectée !' : 'Villageois confirmé' }}
                </span>
              </div>
            </div>
          </div>
          
          <p class="text-slate-500 text-sm mt-4 animate-pulse">Information enregistrée...</p>
        </div>

        <!-- Player Selection (if not yet revealed) -->
        <template v-else>
          <div class="text-center mb-6">
            <p class="text-slate-400">Choisissez un joueur à sonder</p>
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
        <div class="glass-card p-8 text-center">
          <EyeIcon class="w-12 h-12 text-violet-400/50 mx-auto mb-4" />
          <p class="text-slate-400 text-lg mb-2">Vision Mystique</p>
          <p class="text-slate-600 text-sm">En attente de la révélation...</p>
        </div>
      </div>
    </main>

    <footer class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="glass-card p-4">
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
        <div v-else-if="!revealedRole && gameStore.canAct" class="text-center text-slate-500 py-1">
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
  min-height: 100vh;
  min-height: 100dvh;
}

.text-cinzel {
  font-family: 'Cinzel', 'Playfair Display', serif;
}

.glass-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}
</style>
