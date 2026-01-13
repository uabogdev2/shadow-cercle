<!-- js/components/Game/RoleReveal.vue -->
<template>
  <div class="role-reveal-view h-screen w-full flex flex-col items-center justify-center p-6 relative overflow-hidden">
    <!-- Background -->
    <div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950 to-slate-950">
      <!-- Mystical particles -->
      <div class="absolute inset-0 opacity-30">
        <div class="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-600/30 rounded-full filter blur-3xl animate-float"></div>
        <div class="absolute bottom-1/4 right-1/4 w-48 h-48 bg-indigo-600/30 rounded-full filter blur-3xl animate-float" style="animation-delay: 2s;"></div>
      </div>
    </div>

    <!-- Title -->
    <div class="relative z-10 text-center mb-8">
      <h2 class="text-cinzel text-xl text-violet-400 uppercase tracking-widest mb-2">La Nuit Tombe</h2>
      <p class="text-slate-500 text-sm">Découvrez votre destinée</p>
    </div>

    <!-- Tarot Card -->
    <div class="relative z-10 w-full max-w-xs perspective-1000">
      <div
        class="tarot-card relative w-full aspect-[2/3] cursor-pointer transition-transform duration-700 transform-style-3d"
        :class="{ 'rotate-y-180': isFlipped }"
        @click="flipCard"
      >
        <!-- Card Back (Mystical Pattern) -->
        <div class="card-face card-back absolute inset-0 backface-hidden rounded-2xl overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-900"></div>
          <div 
            class="absolute inset-0 pattern-overlay" 
            :style="{ backgroundImage: `url('data:image/svg+xml;charset=utf-8,${patternSvg}')`, backgroundSize: '60px 60px' }"
          ></div>
          <div class="absolute inset-0 flex flex-col items-center justify-center p-6">
            <div class="w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/30 to-indigo-500/30 border-2 border-violet-400/30 flex items-center justify-center mb-4 animate-pulse">
              <MoonIcon class="w-12 h-12 text-violet-300" />
            </div>
            <p class="text-cinzel text-lg text-violet-300 uppercase tracking-widest">Secret</p>
            <p class="text-slate-400 text-xs mt-2 animate-pulse">Touchez pour révéler</p>
          </div>
          <!-- Card border -->
          <div class="absolute inset-2 border-2 border-violet-400/20 rounded-xl pointer-events-none"></div>
        </div>

        <!-- Card Front (Role Reveal) -->
        <div class="card-face card-front absolute inset-0 backface-hidden rotate-y-180 rounded-2xl overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
          <div class="relative h-full flex flex-col p-6">
            <!-- Role Header -->
            <div class="text-center mb-4 pb-4 border-b border-white/10">
              <h3 
                class="text-cinzel text-3xl font-bold mb-1"
                :style="{ color: roleColor }"
              >
                {{ roleData.name }}
              </h3>
              <p class="text-slate-400 text-sm uppercase tracking-wider">{{ roleData.team }}</p>
            </div>

            <!-- Role Icon/Image -->
            <div class="flex-1 flex items-center justify-center">
              <div 
                class="w-32 h-32 rounded-full flex items-center justify-center overflow-hidden relative"
                :style="{ 
                  background: `linear-gradient(135deg, ${roleColor}20 0%, ${roleColor}10 100%)`,
                  border: `2px solid ${roleColor}40`,
                  boxShadow: `0 0 40px ${roleColor}30`
                }"
              >
                <!-- Image du rôle -->
                <img 
                  v-if="!imageError"
                  :src="roleImagePath" 
                  :alt="roleData.name"
                  class="w-full h-full object-cover"
                  @error="imageError = true"
                />
                <!-- Fallback emoji si l'image ne charge pas -->
                <span 
                  v-else
                  class="text-6xl"
                >{{ roleIcon }}</span>
              </div>
            </div>

            <!-- Role Description -->
            <div class="mt-4 p-4 rounded-xl bg-slate-800/50 border border-white/5">
              <p class="text-slate-300 text-sm leading-relaxed text-center">
                {{ roleData.description }}
              </p>
            </div>
          </div>
          <!-- Card border -->
          <div class="absolute inset-2 border-2 rounded-xl pointer-events-none" :style="{ borderColor: `${roleColor}30` }"></div>
        </div>
      </div>
    </div>

    <!-- Confirm Button -->
    <div class="relative z-10 w-full max-w-xs mt-8">
      <ActionButton
        v-if="isFlipped && !confirmed && gameStore.phase === 'role_reveal'"
        variant="magic"
        :full-width="true"
        :loading="isConfirming"
        :glow="true"
        @click="confirmRole"
      >
        J'accepte mon sort
      </ActionButton>
      
      <div v-else-if="confirmed" class="text-center">
        <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30">
          <div class="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
          <span class="text-violet-400 text-sm">En attente des autres joueurs...</span>
        </div>
      </div>
    </div>

    <!-- Glow effect on reveal -->
    <div 
      v-if="isFlipped" 
      class="absolute inset-0 pointer-events-none transition-opacity duration-1000"
      :style="{ background: `radial-gradient(circle at center, ${roleColor}10 0%, transparent 60%)` }"
    ></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Moon as MoonIcon } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';

const gameStore = useGameStore();
const isFlipped = ref(false);
const confirmed = ref(false);
const isConfirming = ref(false);
const result = ref(null);
const imageError = ref(false);

// SVG pattern encodé pour le background de la carte
const patternSvg = computed(() => {
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/><circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/><circle cx="50" cy="50" r="20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></svg>';
  return encodeURIComponent(svg);
});

const roleData = computed(() => {
  const role = gameStore.currentPlayer?.role || 'villager';
  const roles = {
    werewolf: { 
      name: 'Loup-Garou', 
      description: 'Chaque nuit, éliminez un villageois avec votre meute. Restez discret le jour.', 
      color: '#EF4444',
      team: 'Équipe des Loups'
    },
    seer: { 
      name: 'Voyante', 
      description: 'Chaque nuit, découvrez la véritable identité d\'un joueur.', 
      color: '#7C3AED',
      team: 'Équipe du Village'
    },
    witch: { 
      name: 'Sorcière', 
      description: 'Vous possédez deux potions: une pour sauver, une pour tuer. Utilisez-les avec sagesse.', 
      color: '#EC4899',
      team: 'Équipe du Village'
    },
    guard: { 
      name: 'Garde', 
      description: 'Chaque nuit, protégez un joueur de l\'attaque des loups.', 
      color: '#3B82F6',
      team: 'Équipe du Village'
    },
    hunter: { 
      name: 'Chasseur', 
      description: 'Si vous mourrez, emportez un joueur avec vous dans la tombe.', 
      color: '#F59E0B',
      team: 'Équipe du Village'
    },
    cupid: { 
      name: 'Cupidon', 
      description: 'La première nuit, liez deux joueurs par l\'amour éternel.', 
      color: '#F43F5E',
      team: 'Équipe du Village'
    },
    elder: { 
      name: 'Ancien', 
      description: 'Vous résistez à deux attaques des loups avant de succomber.', 
      color: '#6B7280',
      team: 'Équipe du Village'
    },
    fool: { 
      name: 'Idiot du Village', 
      description: 'Votre but: vous faire éliminer par le vote du village ! Si vous êtes exécuté, vous gagnez seul !', 
      color: '#8B5CF6',
      team: 'Solitaire'
    },
    villager: { 
      name: 'Villageois', 
      description: 'Aucun pouvoir spécial, mais votre vote compte ! Démasquez les loups.', 
      color: '#10B981',
      team: 'Équipe du Village'
    },
  };
  return roles[role] || roles['villager'];
});

const roleIcon = computed(() => {
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
  return icons[gameStore.currentPlayer?.role] || '❓';
});

// Mapping des rôles vers les noms de fichiers d'images
const roleImagePath = computed(() => {
  const roleImageMap = {
    werewolf: 'loup.webp',
    seer: 'voyante.webp',
    witch: 'sorcière.webp',
    guard: 'garde.webp',
    hunter: 'chasseur.webp',
    cupid: 'cupidon.webp',
    elder: 'Ancien.webp',
    fool: 'fou.webp',
    villager: 'villageois.webp'
  };
  
  const role = gameStore.currentPlayer?.role || 'villager';
  const imageName = roleImageMap[role] || 'villageois.webp';
  return `/storage/images/roles/${imageName}`;
});

const roleColor = computed(() => roleData.value.color);

const flipCard = () => {
  if (!isFlipped.value) {
    isFlipped.value = true;
    // Réinitialiser l'erreur d'image lors du retournement
    imageError.value = false;
  }
};

async function confirmRole(event) {
  // CORRECTION: event peut être undefined si ActionButton n'émet pas l'événement
  if (event && typeof event.stopPropagation === 'function') {
    event.stopPropagation();
  }
  
  if (confirmed.value || isConfirming.value) return;
  if (gameStore.currentPlayer?.metadata?.role_revealed) {
    confirmed.value = true;
    return;
  }
  
  try {
    isConfirming.value = true;
    confirmed.value = true;
    result.value = await gameStore.confirmRoleReveal();
    confirmed.value = true;
  } catch (error) {
    if (!error.response?.data?.already_confirmed) confirmed.value = false;
  } finally {
    isConfirming.value = false;
  }
}

const hasCheckedInitialConfirmation = ref(false);
watch(() => gameStore.currentPlayer, (player) => {
  if (!hasCheckedInitialConfirmation.value && player?.metadata?.role_revealed) {
    confirmed.value = true;
    hasCheckedInitialConfirmation.value = true;
  }
}, { immediate: true });

let hasLeftRoleReveal = false;
watch(() => gameStore.phase, (newPhase) => {
  if (newPhase !== 'role_reveal') {
    hasLeftRoleReveal = true;
    confirmed.value = true;
  }
}, { immediate: true });

onMounted(() => {
  if (hasLeftRoleReveal) return;
  if (gameStore.currentPlayer?.metadata?.role_revealed && !hasCheckedInitialConfirmation.value) {
    confirmed.value = true;
    hasCheckedInitialConfirmation.value = true;
  }
});
</script>

<style scoped>
.role-reveal-view {
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.text-cinzel {
  font-family: 'Cinzel', 'Playfair Display', serif;
  letter-spacing: 0.05em;
}

.perspective-1000 {
  perspective: 1000px;
}

.transform-style-3d {
  transform-style: preserve-3d;
}

.backface-hidden {
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.rotate-y-180 {
  transform: rotateY(180deg);
}

.card-face {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.card-back {
  animation: card-glow 3s ease-in-out infinite;
}

@keyframes card-glow {
  0%, 100% {
    box-shadow: 0 0 30px rgba(124, 58, 237, 0.3);
  }
  50% {
    box-shadow: 0 0 50px rgba(124, 58, 237, 0.5);
  }
}

.animate-float {
  animation: float 8s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-20px) translateX(10px);
  }
}

.tarot-card {
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
