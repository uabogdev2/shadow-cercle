<template>
  <div 
    class="game-end-container relative h-screen w-screen overflow-hidden flex flex-col items-center justify-center p-4 text-center animate-fade-in"
    :class="winnerClass"
  >
    <!-- Particles & Effects -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <!-- Confettis dorés (Victoire Village) -->
      <template v-if="winner === 'village'">
        <div 
          v-for="i in 50" 
          :key="`confetti-${i}`" 
          class="confetti"
          :style="getConfettiStyle(i)"
        ></div>
      </template>
      
      <!-- Griffures animées (Victoire Loups) -->
      <template v-if="winner === 'werewolves'">
        <svg 
          v-for="(scratch, index) in scratches" 
          :key="`scratch-${index}`"
          class="scratch absolute"
          :style="scratch.style"
          width="300"
          height="200"
          viewBox="0 0 300 200"
        >
          <path
            :d="scratch.path"
            stroke="var(--color-blood-red)"
            stroke-width="3"
            fill="none"
            stroke-linecap="round"
            class="scratch-path"
          />
        </svg>
      </template>
    </div>

    <!-- Main Content -->
    <div class="relative z-10 animate-scale-in">
      <h1 class="font-serif text-5xl font-bold title-shadow mb-4">
        {{ title }}
      </h1>
      <p class="text-xl subtitle-shadow">
        {{ subtitle }}
      </p>

      <!-- Results Panel -->
      <div class="results-panel glass-surface border-glass-border rounded-2xl shadow-lg backdrop-blur-lg p-6 mt-8 max-w-md mx-auto animate-fade-in-up">
        <h3 class="font-serif text-2xl text-cream mb-4 text-shadow-sm">
          Résumé de la Partie
        </h3>
        <div class="results-scroll h-48 overflow-y-auto custom-scrollbar pr-2">
          <ul class="space-y-2">
            <li 
              v-for="player in gameStore.players" 
              :key="player.id" 
              class="flex justify-between items-center py-2 border-b border-glass-border animate-fade-in-up"
              :style="{ animationDelay: `${gameStore.players.indexOf(player) * 0.05}s` }"
            >
              <span class="font-semibold text-text-light font-sans">{{ player.user?.name || 'Joueur' }}</span>
              <span class="text-cream/80 font-sans">{{ getRoleName(player.role) }}</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-8 flex gap-4 justify-center animate-fade-in-up" style="animation-delay: 0.3s">
        <ActionButton variant="secondary" @click="goHome">
          Quitter
        </ActionButton>
        <ActionButton variant="primary" @click="handlePlayAgain">
          Rejouer
        </ActionButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import ActionButton from '@/components/UI/ActionButton.vue';

const router = useRouter();
const gameStore = useGameStore();

const winner = computed(() => {
  const gameWinner = gameStore.currentGame?.state?.winner || 'draw';
  if (gameWinner === 'village' || gameWinner === 'villagers') return 'village';
  if (gameWinner === 'werewolf' || gameWinner === 'werewolves') return 'werewolves';
  return gameWinner;
});

const winnerClass = computed(() => `winner--${winner.value}`);

const title = computed(() => {
  if (winner.value === 'village') return "LE MAL EST PURIFIÉ";
  if (winner.value === 'werewolves') return "LE VILLAGE EST DÉCIMÉ";
  return "ÉGALITÉ";
});

const subtitle = computed(() => {
  if (winner.value === 'village') return "Les villageois ont triomphé !";
  if (winner.value === 'werewolves') return "Les loups-garous règnent en maîtres.";
  return "Personne n'a gagné.";
});

const getRoleName = (role) => {
  const names = {
    werewolf: 'Loup-Garou',
    seer: 'Voyante',
    witch: 'Sorcière',
    guard: 'Garde',
    cupid: 'Cupidon',
    hunter: 'Chasseur',
    elder: 'Ancien',
    fool: 'Fou',
    villager: 'Villageois'
  };
  return names[role] || role;
};

// Confettis styles
function getConfettiStyle(index) {
  const colors = ['var(--color-soft-gold)', 'var(--color-cream)', '#FFFFFF'];
  const left = Math.random() * 100;
  const delay = Math.random() * 2;
  const duration = 3 + Math.random() * 2;
  const color = colors[Math.floor(Math.random() * colors.length)];
  const rotation = Math.random() * 720;
  
  return {
    left: `${left}%`,
    backgroundColor: color,
    animationDelay: `${delay}s`,
    animationDuration: `${duration}s`,
    '--confetti-x': `${(Math.random() - 0.5) * 200}px`,
    '--confetti-rotation': `${rotation}deg`,
  };
}

// Griffures styles
const scratches = ref([
  {
    path: 'M 50 150 Q 100 50 150 100 T 250 80',
    style: { top: '20%', left: '10%', transform: 'rotate(-15deg)' }
  },
  {
    path: 'M 100 180 Q 180 60 220 120 T 280 100',
    style: { top: '60%', left: '15%', transform: 'rotate(20deg)' }
  },
  {
    path: 'M 30 100 Q 120 30 180 90 T 260 70',
    style: { top: '40%', right: '10%', transform: 'rotate(-25deg)' }
  }
]);

const handlePlayAgain = () => {
  // TODO: Implement replay logic
  goHome();
};

const goHome = () => {
  gameStore.resetGame();
  router.push({ name: 'home' });
};

onMounted(() => {
  // Trigger animations
});
</script>

<style scoped>
.game-end-container {
  transition: background-color 1s ease;
}

.winner--village {
  background: linear-gradient(180deg, var(--color-deep-indigo) 0%, #1e1b4b 100%);
  position: relative;
}

.winner--village::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top, rgba(245, 158, 11, 0.2) 0%, transparent 70%);
  pointer-events: none;
}

.winner--werewolves {
  background: linear-gradient(180deg, #450A0A 0%, #000 100%);
  position: relative;
}

.winner--werewolves::before {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, rgba(0, 0, 0, 0.6) 0%, transparent 70%);
  pointer-events: none;
}

.title-shadow {
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

.winner--village .title-shadow {
  color: var(--color-soft-gold);
}

.winner--werewolves .title-shadow {
  color: var(--color-blood-red);
}

.subtitle-shadow {
  text-shadow: 0 1px 5px rgba(0, 0, 0, 0.5);
}

.winner--village .subtitle-shadow {
  color: var(--color-cream);
}

.winner--werewolves .subtitle-shadow {
  color: #FECACA;
}

/* Confettis */
.confetti {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--color-soft-gold);
  top: -10px;
  border-radius: 2px;
  animation: confettiFall 3s linear forwards;
  opacity: 0;
}

@keyframes confettiFall {
  0% {
    opacity: 1;
    transform: translate3d(0, 0, 0) rotate3d(0, 0, 1, 0deg);
  }
  100% {
    opacity: 0;
    transform: translate3d(var(--confetti-x), 100vh, 0) rotate3d(0, 0, 1, var(--confetti-rotation));
  }
}

/* Griffures */
.scratch {
  opacity: 0;
  animation: scratchDraw 2s ease-out forwards;
}

.scratch:nth-child(1) {
  animation-delay: 0.3s;
}

.scratch:nth-child(2) {
  animation-delay: 0.8s;
}

.scratch:nth-child(3) {
  animation-delay: 1.3s;
}

.scratch-path {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: scratchDrawPath 2s ease-out forwards;
}

.scratch:nth-child(1) .scratch-path {
  animation-delay: 0.3s;
}

.scratch:nth-child(2) .scratch-path {
  animation-delay: 0.8s;
}

.scratch:nth-child(3) .scratch-path {
  animation-delay: 1.3s;
}

@keyframes scratchDraw {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}

@keyframes scratchDrawPath {
  0% {
    stroke-dashoffset: 1000;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

/* Scrollbar personnalisée */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Responsive */
@media (max-width: 768px) {
  .game-end-container {
    padding: 1rem;
  }
  
  .game-end-container :deep(h1) {
    font-size: 2rem;
  }
  
  .game-end-container :deep(.text-xl) {
    font-size: 1.125rem;
  }
  
  .results-panel {
    padding: 1rem;
    max-width: 100%;
  }
  
  .results-panel :deep(h3) {
    font-size: 1.5rem;
  }
  
  .results-scroll {
    height: 14rem;
  }
  
  .confetti {
    width: 5px;
    height: 5px;
  }
  
  .game-end-container :deep(.flex.gap-4) {
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .game-end-container :deep(.flex.gap-4 button) {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .game-end-container {
    padding: 0.875rem;
  }
  
  .game-end-container :deep(h1) {
    font-size: 1.75rem;
  }
  
  .game-end-container :deep(.text-xl) {
    font-size: 1rem;
  }
  
  .results-panel {
    padding: 0.875rem;
  }
  
  .results-panel :deep(h3) {
    font-size: 1.25rem;
  }
  
  .results-scroll {
    height: 12rem;
  }
  
  .confetti {
    width: 4px;
    height: 4px;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .game-end-container :deep(h1) {
    font-size: 2.5rem;
  }
  
  .results-panel {
    padding: 1.5rem;
  }
  
  .confetti {
    width: 6px;
    height: 6px;
  }
}

@media (min-width: 1024px) {
  .game-end-container :deep(h1) {
    font-size: 4rem;
  }
}

@media (max-width: 360px) {
  .game-end-container {
    padding: 0.75rem;
  }
  
  .game-end-container :deep(h1) {
    font-size: 1.5rem;
  }
  
  .game-end-container :deep(.text-xl) {
    font-size: 0.875rem;
  }
  
  .results-panel {
    padding: 0.75rem;
    margin-top: 1rem;
  }
  
  .results-panel :deep(h3) {
    font-size: 1rem;
    margin-bottom: 0.75rem;
  }
  
  .results-scroll {
    height: 10rem;
  }
  
  .confetti {
    width: 4px;
    height: 4px;
  }
  
  .scratch {
    width: 200px;
    height: 150px;
  }
  
  .game-end-container :deep(.flex.gap-4) {
    flex-direction: column;
    gap: 0.5rem;
  }
}

/* Prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .confetti {
    animation: none;
    opacity: 0;
  }
  
  .scratch {
    animation: none;
  }
  
  .scratch-path {
    animation: none;
    stroke-dashoffset: 0;
  }
  
  .animate-scale-in,
  .animate-fade-in-up {
    animation: none;
  }
}
</style>
