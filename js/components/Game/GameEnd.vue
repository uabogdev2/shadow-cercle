<!-- js/components/Game/GameEnd.vue -->
<template>
  <div class="game-end phase-surface phase-night relative overflow-hidden">
    <!-- Background based on winner -->
    <div class="game-end-background" :class="backgroundClass">
      <div class="absolute inset-0 noise-overlay"></div>
      <div class="absolute top-[-4rem] left-12 w-72 h-72 rounded-full blur-[140px] bg-amber-500/12"></div>
      <div class="absolute bottom-[-5rem] right-10 w-80 h-80 rounded-full blur-[150px] bg-red-500/10"></div>
      <div class="absolute inset-0 vignette-layer" :class="vignetteClass"></div>
      <!-- Animated particles -->
      <div class="game-end-particles">
        <div v-for="i in 12" :key="i" 
          class="particle"
          :class="particleClass"
          :style="{ 
            left: `${Math.random() * 100}%`, 
            animationDelay: `${i * 0.3}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }"
        ></div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="game-end-content">
      <!-- Victory/Defeat Badge -->
      <div class="game-end-badge-container paper-card frame-wood bg-[#0f151f]/90 border border-amber-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.55)]">
        <div class="game-end-badge" :class="badgeClass">
          <span class="game-end-badge-icon">{{ winnerIcon }}</span>
        </div>
        
        <h1 class="game-end-title" :class="titleClass">
          {{ title }}
        </h1>
        
        <div class="game-end-divider" :class="dividerClass"></div>
        
        <p class="game-end-subtitle" :class="subtitleClass">{{ subtitle }}</p>
      </div>

      <!-- Winners Highlight (for special victories) -->
      <div v-if="specialWinners.length > 0" class="game-end-winners paper-card frame-wood bg-[#0f1624]/90 border border-amber-500/20 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
        <h3 class="game-end-winners-title">🎉 Vainqueurs</h3>
        <div class="game-end-winners-list">
          <div 
            v-for="player in specialWinners" 
            :key="player.id" 
            class="game-end-winner-card"
            :style="{ borderColor: getRoleColor(player.role) }"
          >
            <div class="game-end-winner-avatar" :style="{ background: `${getRoleColor(player.role)}25` }">
              <span>{{ getRoleIcon(player.role) }}</span>
            </div>
            <div class="game-end-winner-info">
              <p class="game-end-winner-name">{{ player.user?.name }}</p>
              <p class="game-end-winner-role" :style="{ color: getRoleColor(player.role) }">
                {{ getRoleName(player.role) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Players List -->
      <div class="game-end-players paper-card frame-wood bg-[#0f151f]/92 border border-amber-500/18 shadow-[0_18px_60px_rgba(0,0,0,0.55)]">
        <h3 class="game-end-players-title">Récapitulatif</h3>
        <div class="game-end-players-list">
          <div 
            v-for="player in gameStore.players" 
            :key="player.id" 
            class="game-end-player"
            :class="{ 'game-end-player-winner': isWinner(player) }"
          >
            <div class="game-end-player-left">
              <div 
                class="game-end-player-avatar"
                :class="player.is_alive ? 'game-end-player-avatar-alive' : 'game-end-player-avatar-dead'"
              >
                {{ player.user?.name?.[0]?.toUpperCase() }}
              </div>
              <div class="game-end-player-info">
                <p class="game-end-player-name" :class="{ 'game-end-player-name-dead': !player.is_alive }">
                  {{ player.user?.name }}
                  <span v-if="isWinner(player)" class="game-end-player-crown">👑</span>
                </p>
                <p class="game-end-player-role" :style="{ color: getRoleColor(player.role) }">
                  {{ getRoleName(player.role) }}
                </p>
              </div>
            </div>
            <span class="game-end-player-icon">{{ getRoleIcon(player.role) }}</span>
          </div>
        </div>
      </div>

      <!-- Action -->
      <ActionButton
        :variant="buttonVariant"
        size="lg"
        :glow="winner !== 'werewolves'"
        :full-width="true"
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

// Determine winner type from game state
const winner = computed(() => {
  const gameWinner = gameStore.currentGame?.state?.winner;
  
  // Handle all victory types
  if (gameWinner === 'fool') return 'fool';
  if (gameWinner === 'lovers') return 'lovers';
  if (gameWinner === 'village' || gameWinner === 'villagers') return 'village';
  if (gameWinner === 'werewolf' || gameWinner === 'werewolves') return 'werewolves';
  if (gameWinner === 'draw' || gameWinner === 'none') return 'draw';
  
  return 'draw';
});

// Get special winners (fool, lovers)
const specialWinners = computed(() => {
  if (winner.value === 'fool') {
    return gameStore.players.filter(p => p.role === 'fool');
  }
  if (winner.value === 'lovers') {
    // Get lovers from game state or find players with lover status
    const loversIds = gameStore.currentGame?.state?.lovers || [];
    if (loversIds.length > 0) {
      return gameStore.players.filter(p => loversIds.includes(p.id));
    }
    // Fallback: find by metadata
    return gameStore.players.filter(p => p.metadata?.is_lover);
  }
  return [];
});

// Check if player is a winner
function isWinner(player) {
  if (winner.value === 'fool') return player.role === 'fool';
  if (winner.value === 'lovers') {
    const loversIds = gameStore.currentGame?.state?.lovers || [];
    return loversIds.includes(player.id) || player.metadata?.is_lover;
  }
  if (winner.value === 'village') return player.role !== 'werewolf';
  if (winner.value === 'werewolves') return player.role === 'werewolf';
  return false;
}

// Visual classes based on winner
const backgroundClass = computed(() => {
  const classes = {
    village: 'game-end-bg-village',
    werewolves: 'game-end-bg-werewolves',
    fool: 'game-end-bg-fool',
    lovers: 'game-end-bg-lovers',
    draw: 'game-end-bg-draw'
  };
  return classes[winner.value] || classes.draw;
});

const vignetteClass = computed(() => {
  if (winner.value === 'werewolves') return 'vignette-blood';
  if (winner.value === 'lovers') return 'vignette-love';
  return '';
});

const particleClass = computed(() => {
  const classes = {
    village: 'particle-gold',
    werewolves: 'particle-red',
    fool: 'particle-purple',
    lovers: 'particle-pink',
    draw: 'particle-gray'
  };
  return classes[winner.value] || classes.draw;
});

const badgeClass = computed(() => {
  const classes = {
    village: 'badge-village',
    werewolves: 'badge-werewolves',
    fool: 'badge-fool',
    lovers: 'badge-lovers',
    draw: 'badge-draw'
  };
  return classes[winner.value] || classes.draw;
});

const titleClass = computed(() => {
  const classes = {
    village: 'text-amber-400',
    werewolves: 'text-red-500',
    fool: 'text-violet-400',
    lovers: 'text-pink-400',
    draw: 'text-slate-400'
  };
  return classes[winner.value] || classes.draw;
});

const subtitleClass = computed(() => {
  const classes = {
    village: 'text-amber-300/80',
    werewolves: 'text-red-400/80',
    fool: 'text-violet-300/80',
    lovers: 'text-pink-300/80',
    draw: 'text-slate-500'
  };
  return classes[winner.value] || classes.draw;
});

const dividerClass = computed(() => {
  const classes = {
    village: 'divider-gold',
    werewolves: 'divider-red',
    fool: 'divider-violet',
    lovers: 'divider-pink',
    draw: 'divider-gray'
  };
  return classes[winner.value] || classes.draw;
});

const winnerIcon = computed(() => {
  const icons = {
    village: '🏆',
    werewolves: '🐺',
    fool: '🃏',
    lovers: '💕',
    draw: '⚖️'
  };
  return icons[winner.value] || icons.draw;
});

const title = computed(() => {
  const titles = {
    village: 'Victoire !',
    werewolves: 'Défaite...',
    fool: 'Le Fou Triomphe !',
    lovers: 'L\'Amour Triomphe !',
    draw: 'Égalité'
  };
  return titles[winner.value] || titles.draw;
});

const subtitle = computed(() => {
  const subtitles = {
    village: 'Le village est sauvé !',
    werewolves: 'Les loups ont triomphé',
    fool: 'L\'Idiot du Village a réussi son pari !',
    lovers: 'Les amoureux survivent ensemble',
    draw: 'Personne n\'a gagné'
  };
  return subtitles[winner.value] || subtitles.draw;
});

const buttonVariant = computed(() => {
  const variants = {
    village: 'gold',
    werewolves: 'secondary',
    fool: 'magic',
    lovers: 'danger',
    draw: 'secondary'
  };
  return variants[winner.value] || 'secondary';
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
    fool: 'Idiot du Village',
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
/* ============================================
   GAME END SCREEN - MOBILE FIRST
   ============================================ */

.game-end {
  min-height: 100vh;
  min-height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  color: #f5f5dc;
}

/* Background Variations */
.game-end-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.game-end-bg-village {
  background: radial-gradient(circle at 20% 20%, rgba(245, 158, 11, 0.16), transparent 42%),
    radial-gradient(circle at 80% 70%, rgba(34, 197, 94, 0.12), transparent 45%),
    #050b13;
}

.game-end-bg-werewolves {
  background: radial-gradient(circle at 20% 20%, rgba(239, 68, 68, 0.18), transparent 40%),
    radial-gradient(circle at 78% 72%, rgba(127, 29, 29, 0.18), transparent 46%),
    #050b13;
}

.game-end-bg-fool {
  background: radial-gradient(circle at 20% 20%, rgba(139, 92, 246, 0.18), transparent 40%),
    radial-gradient(circle at 80% 70%, rgba(45, 212, 191, 0.14), transparent 46%),
    #050b13;
}

.game-end-bg-lovers {
  background: radial-gradient(circle at 20% 20%, rgba(236, 72, 153, 0.18), transparent 40%),
    radial-gradient(circle at 78% 72%, rgba(248, 113, 113, 0.16), transparent 46%),
    #050b13;
}

.game-end-bg-draw {
  background: radial-gradient(circle at 20% 20%, rgba(148, 163, 184, 0.14), transparent 42%),
    radial-gradient(circle at 80% 70%, rgba(100, 116, 139, 0.14), transparent 46%),
    #050b13;
}

/* Particles */
.game-end-particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  animation: particle-float 4s ease-in-out infinite;
  opacity: 0.6;
}

.particle-gold { background: #F59E0B; box-shadow: 0 0 10px #F59E0B; }
.particle-red { background: #EF4444; box-shadow: 0 0 10px #EF4444; }
.particle-purple { background: #8B5CF6; box-shadow: 0 0 10px #8B5CF6; }
.particle-pink { background: #EC4899; box-shadow: 0 0 10px #EC4899; }
.particle-gray { background: #64748B; box-shadow: 0 0 10px #64748B; }

@keyframes particle-float {
  0%, 100% { transform: translateY(100vh) scale(0); opacity: 0; }
  10% { opacity: 0.8; }
  50% { transform: translateY(50vh) scale(1); opacity: 0.6; }
  90% { opacity: 0.4; }
}

/* Vignette */
.vignette-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(ellipse at center, transparent 28%, rgba(0, 0, 0, 0.55) 100%);
}

.vignette-blood {
  background: radial-gradient(ellipse at center, transparent 30%, rgba(127, 29, 29, 0.4) 100%);
}

.vignette-love {
  background: radial-gradient(ellipse at center, transparent 30%, rgba(190, 24, 93, 0.32) 100%);
}

/* Content */
.game-end-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 30rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Badge */

.game-end-badge-container {
  text-align: center;
  padding: 1.25rem 1rem 1.5rem;
}

.game-end-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 6rem;
  height: 6rem;
  border-radius: 50%;
  margin-bottom: 1.5rem;
  animation: badge-pulse 2s ease-in-out infinite;
}

.badge-village {
  background: rgba(245, 158, 11, 0.2);
  border: 2px solid rgba(245, 158, 11, 0.5);
  box-shadow: 0 0 40px rgba(245, 158, 11, 0.4);
}

.badge-werewolves {
  background: rgba(239, 68, 68, 0.2);
  border: 2px solid rgba(239, 68, 68, 0.5);
  box-shadow: 0 0 40px rgba(239, 68, 68, 0.4);
}

.badge-fool {
  background: rgba(139, 92, 246, 0.2);
  border: 2px solid rgba(139, 92, 246, 0.5);
  box-shadow: 0 0 40px rgba(139, 92, 246, 0.4);
}

.badge-lovers {
  background: rgba(236, 72, 153, 0.2);
  border: 2px solid rgba(236, 72, 153, 0.5);
  box-shadow: 0 0 40px rgba(236, 72, 153, 0.4);
}

.badge-draw {
  background: rgba(71, 85, 105, 0.3);
  border: 2px solid rgba(100, 116, 139, 0.5);
}

@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.game-end-badge-icon {
  font-size: 3rem;
}

/* Title */
.game-end-title {
  font-family: 'Cinzel', 'Playfair Display', serif;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  letter-spacing: 0.05em;
}

@media (min-width: 640px) {
  .game-end-title {
    font-size: 3.5rem;
  }
}

/* Divider */
.game-end-divider {
  height: 2px;
  width: 8rem;
  margin: 0 auto 1rem;
  border-radius: 1px;
}

.divider-gold { background: linear-gradient(90deg, transparent, #F59E0B, transparent); }
.divider-red { background: linear-gradient(90deg, transparent, #EF4444, transparent); }
.divider-violet { background: linear-gradient(90deg, transparent, #8B5CF6, transparent); }
.divider-pink { background: linear-gradient(90deg, transparent, #EC4899, transparent); }
.divider-gray { background: linear-gradient(90deg, transparent, #64748B, transparent); }

.game-end-subtitle {
  font-size: 1.125rem;
  margin: 0;
}

/* Winners Section */
.game-end-winners {
  padding: 1rem;
}

.game-end-winners-title {
  color: #F8FAFC;
  font-size: 1rem;
  font-weight: 600;
  text-align: center;
  margin: 0 0 1rem 0;
}

.game-end-winners-list {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.game-end-winner-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 0.75rem;
  border: 2px solid;
}

.game-end-winner-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.game-end-winner-info {
  text-align: left;
}

.game-end-winner-name {
  color: #F8FAFC;
  font-weight: 600;
  margin: 0;
  font-size: 0.875rem;
}

.game-end-winner-role {
  font-size: 0.75rem;
  margin: 0;
}

/* Players List */
.game-end-players {
  padding: 1rem;
}

.game-end-players-title {
  color: #64748B;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  text-align: center;
  margin: 0 0 1rem 0;
}

.game-end-players-list {
  max-height: 16rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.game-end-player {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 0.85rem;
  background: linear-gradient(145deg, #f3e0b8 0%, #e2c892 100%);
  border-radius: 0.9rem;
  transition: all 0.2s;
  border: 1px solid rgba(181, 138, 76, 0.45);
  box-shadow: 0 10px 28px rgba(88, 63, 26, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.38);
}

.game-end-player-winner {
  background: linear-gradient(145deg, #f8e8c8 0%, #f3d9a8 100%);
  border-color: rgba(245, 158, 11, 0.55);
  box-shadow: 0 12px 30px rgba(245, 158, 11, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.5);
}

.game-end-player-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.game-end-player-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: 600;
}

.game-end-player-avatar-alive {
  background: rgba(16, 185, 129, 0.18);
  color: #1ed89a;
  border: 1px solid rgba(16, 185, 129, 0.45);
}

.game-end-player-avatar-dead {
  background: rgba(71, 85, 105, 0.24);
  color: #94a3b8;
  border: 1px solid rgba(100, 116, 139, 0.4);
}

.game-end-player-info {
  text-align: left;
}

.game-end-player-name {
  color: #2a2112;
  font-weight: 600;
  margin: 0;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.game-end-player-name-dead {
  text-decoration: line-through;
  opacity: 0.5;
}

.game-end-player-crown {
  font-size: 0.75rem;
}

.game-end-player-role {
  font-size: 0.78rem;
  margin: 0;
}


.game-end-player-icon {
  font-size: 1.4rem;
}


</style>
