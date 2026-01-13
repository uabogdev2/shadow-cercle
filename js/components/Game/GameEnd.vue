<!-- js/components/Game/GameEnd.vue -->
<template>
  <div class="game-end h-screen w-screen flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <!-- Background based on winner -->
    <div class="absolute inset-0" :class="backgroundClass">
      <!-- Victory particles/effects -->
      <div v-if="winner === 'village'" class="absolute inset-0">
        <div class="absolute top-10 left-10 w-4 h-4 bg-amber-400 rounded-full animate-float opacity-60"></div>
        <div class="absolute top-20 right-20 w-3 h-3 bg-amber-300 rounded-full animate-float opacity-40" style="animation-delay: 1s;"></div>
        <div class="absolute bottom-40 left-1/4 w-5 h-5 bg-yellow-400 rounded-full animate-float opacity-50" style="animation-delay: 2s;"></div>
      </div>
      <!-- Defeat scratch marks -->
      <div v-else-if="winner === 'werewolves'" class="absolute inset-0 vignette-blood opacity-60"></div>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 w-full max-w-lg text-center">
      <!-- Victory/Defeat Badge -->
      <div class="mb-8">
        <div 
          class="inline-flex items-center justify-center w-24 h-24 rounded-full mb-6"
          :class="badgeClass"
        >
          <span class="text-5xl">{{ winnerIcon }}</span>
        </div>
        
        <h1 class="text-cinzel text-5xl md:text-6xl font-bold mb-4" :class="titleClass">
          {{ title }}
        </h1>
        
        <div class="h-px w-32 mx-auto mb-4" :class="dividerClass"></div>
        
        <p class="text-xl" :class="subtitleClass">{{ subtitle }}</p>
      </div>

      <!-- Players List -->
      <div class="glass-card p-6 mb-8">
        <h3 class="text-slate-400 text-sm uppercase tracking-wider mb-4">Récapitulatif</h3>
        <div class="max-h-64 overflow-y-auto space-y-2">
          <div 
            v-for="player in gameStore.players" 
            :key="player.id" 
            class="flex items-center justify-between p-3 rounded-lg bg-slate-800/50"
          >
            <div class="flex items-center gap-3">
              <div 
                class="w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium"
                :class="player.is_alive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-500'"
              >
                {{ player.user?.name?.[0]?.toUpperCase() }}
              </div>
              <div class="text-left">
                <p class="text-white font-medium" :class="{ 'line-through opacity-50': !player.is_alive }">
                  {{ player.user?.name }}
                </p>
                <p class="text-xs" :style="{ color: getRoleColor(player.role) }">
                  {{ getRoleName(player.role) }}
                </p>
              </div>
            </div>
            <span class="text-2xl">{{ getRoleIcon(player.role) }}</span>
          </div>
        </div>
      </div>

      <!-- Action -->
      <ActionButton
        :variant="winner === 'village' ? 'gold' : 'secondary'"
        size="lg"
        :glow="winner === 'village'"
        @click="goHome"
      >
        Retour à l'accueil
      </ActionButton>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import ActionButton from '@/components/UI/ActionButton.vue';

const router = useRouter();
const gameStore = useGameStore();

const winner = computed(() => {
  const gameWinner = gameStore.currentGame?.state?.winner;
  if (gameWinner === 'village' || gameWinner === 'villagers') return 'village';
  if (gameWinner === 'werewolf' || gameWinner === 'werewolves') return 'werewolves';
  return 'draw';
});

const backgroundClass = computed(() => {
  if (winner.value === 'village') return 'bg-gradient-to-b from-amber-900/20 via-slate-950 to-slate-950';
  if (winner.value === 'werewolves') return 'bg-gradient-to-b from-red-900/30 via-slate-950 to-slate-950';
  return 'bg-gradient-to-b from-slate-800 via-slate-950 to-slate-950';
});

const badgeClass = computed(() => {
  if (winner.value === 'village') return 'bg-amber-500/20 border-2 border-amber-500/50 shadow-[0_0_30px_rgba(245,158,11,0.3)]';
  if (winner.value === 'werewolves') return 'bg-red-500/20 border-2 border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]';
  return 'bg-slate-700/50 border-2 border-slate-600';
});

const titleClass = computed(() => {
  if (winner.value === 'village') return 'text-amber-400';
  if (winner.value === 'werewolves') return 'text-red-500';
  return 'text-slate-400';
});

const subtitleClass = computed(() => {
  if (winner.value === 'village') return 'text-amber-300/80';
  if (winner.value === 'werewolves') return 'text-red-400/80';
  return 'text-slate-500';
});

const dividerClass = computed(() => {
  if (winner.value === 'village') return 'bg-gradient-to-r from-transparent via-amber-500 to-transparent';
  if (winner.value === 'werewolves') return 'bg-gradient-to-r from-transparent via-red-500 to-transparent';
  return 'bg-gradient-to-r from-transparent via-slate-500 to-transparent';
});

const winnerIcon = computed(() => {
  if (winner.value === 'village') return '🏆';
  if (winner.value === 'werewolves') return '🐺';
  return '⚖️';
});

const title = computed(() => {
  if (winner.value === 'village') return "Victoire !";
  if (winner.value === 'werewolves') return "Défaite...";
  return "Égalité";
});

const subtitle = computed(() => {
  if (winner.value === 'village') return "Le village est sauvé !";
  if (winner.value === 'werewolves') return "Les loups ont triomphé";
  return "Personne n'a gagné";
});

function getRoleName(role) {
  const names = {
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
  return names[role] || role;
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
  const colors = {
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
  return colors[role] || '#94A3B8';
}

const goHome = () => {
  gameStore.resetGame();
  router.push({ name: 'home' });
};
</script>

<style scoped>
.game-end {
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

.vignette-blood {
  background: radial-gradient(ellipse at center, transparent 30%, rgba(127, 29, 29, 0.5) 100%);
}

.animate-float {
  animation: float 4s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
</style>
