<template>
  <div class="role-reveal-container flex flex-col items-center justify-center h-screen w-screen bg-black animate-fade-in px-4 py-6">
    <!-- Flash de lumière lors de la révélation -->
    <div 
      v-if="isFlipped && !flashHidden" 
      class="flash-overlay absolute inset-0 z-20 animate-flash"
      :style="{ backgroundColor: roleFlashColor }"
      @animationend="flashHidden = true"
    ></div>

    <div class="scene w-full max-w-sm h-[28rem] max-h-[85vh] animate-scale-in">
      <div :class="['card', { 'is-flipped': isFlipped }]" @click="flipCard">
        <!-- Card Back -->
        <div class="card__face card__face--back">
          <div class="inner flex flex-col items-center justify-center h-full text-center p-4 sm:p-6">
            <h2 class="font-serif text-2xl sm:text-3xl font-bold text-soft-gold text-shadow-lg mb-3 sm:mb-4">Votre Destin</h2>
            <div class="mystical-pattern w-24 h-24 sm:w-32 sm:h-32 mb-4 sm:mb-6 opacity-50"></div>
            <p class="text-cream/70 text-xs sm:text-sm font-sans">Touchez pour révéler</p>
            <p class="text-cream/50 text-[10px] sm:text-xs font-sans mt-2 italic">Tapez sur la carte</p>
          </div>
        </div>

        <!-- Card Front -->
        <div class="card__face card__face--front" :style="cardFrontStyle">
          <div class="inner p-4 sm:p-6 flex flex-col justify-between items-center text-center h-full">
            <div class="w-full">
              <h2 class="font-serif text-2xl sm:text-3xl font-bold mb-2 text-shadow-lg" :style="{ color: roleColor }">
                {{ roleData.name }}
              </h2>
            </div>
            
            <div class="flex-1 flex items-center justify-center my-2 sm:my-4 min-h-0">
              <img 
                :src="roleData.image" 
                :alt="roleData.name" 
                class="role-image w-32 h-32 sm:w-40 sm:h-40 object-contain drop-shadow-lg"
              />
            </div>
            
            <div class="w-full">
              <p class="text-cream/80 text-xs sm:text-sm font-sans mb-4 sm:mb-6 leading-relaxed px-2">
                {{ roleData.description }}
              </p>
              
              <ActionButton
                v-if="!confirmed && gameStore.phase === 'role_reveal'"
                variant="primary"
                size="md"
                :full-width="true"
                :loading="isConfirming"
                @click="confirmRole"
                class="animate-fade-in-up"
              >
                J'accepte mon sort
              </ActionButton>
              
              <div v-else-if="confirmed || gameStore.currentPlayer?.metadata?.role_revealed" class="text-green-400 font-sans text-xs sm:text-sm animate-fade-in flex items-center justify-center gap-2">
                <span class="animate-spin">⏳</span>
                <span>En attente des autres joueurs...</span>
              </div>
              
              <div v-else class="text-cream/50 font-sans text-xs sm:text-sm animate-fade-in">
                Chargement...
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import ActionButton from '@/components/UI/ActionButton.vue';
import axios from 'axios';

const gameStore = useGameStore();
const isFlipped = ref(false);
const confirmed = ref(false);
const flashHidden = ref(false);
const isConfirming = ref(false);
const result = ref(null);

const roleData = computed(() => {
  const role = gameStore.currentPlayer?.role || 'villager';

  const roles = {
    werewolf: { 
      name: 'Loup-Garou', 
      description: "Chaque nuit, votez avec les autres loups pour dévorer un villageois.", 
      image: '/images/roles/loup.webp',
      color: 'var(--color-blood-red)',
      flashColor: 'rgba(239, 68, 68, 0.8)'
    },
    seer: { 
      name: 'Voyante', 
      description: "Chaque nuit, découvrez le rôle d'un joueur.", 
      image: '/images/roles/voyante.webp',
      color: 'var(--color-electric-violet)',
      flashColor: 'rgba(124, 58, 237, 0.8)'
    },
    witch: { 
      name: 'Sorcière', 
      description: "Vous avez 2 potions : une pour sauver, une pour tuer.", 
      image: '/images/roles/sorcière.webp',
      color: 'var(--color-neon-cyan)',
      flashColor: 'rgba(34, 211, 238, 0.8)'
    },
    guard: { 
      name: 'Garde', 
      description: "Chaque nuit, protégez un joueur des loups.", 
      image: '/images/roles/garde.webp',
      color: 'var(--color-soft-gold)',
      flashColor: 'rgba(245, 158, 11, 0.8)'
    },
    hunter: { 
      name: 'Chasseur', 
      description: "Quand vous mourez, vous pouvez tuer un joueur.", 
      image: '/images/roles/chasseur.webp',
      color: 'var(--color-soft-gold)',
      flashColor: 'rgba(245, 158, 11, 0.8)'
    },
    cupid: { 
      name: 'Cupidon', 
      description: "La première nuit, liez deux joueurs en amoureux.", 
      image: '/images/roles/cupidon.webp',
      color: '#EC4899',
      flashColor: 'rgba(236, 72, 153, 0.8)'
    },
    elder: { 
      name: 'Ancien', 
      description: "Vous résistez à 2 attaques des loups avant de mourir.", 
      image: '/images/roles/Ancien.webp',
      color: '#6B7280',
      flashColor: 'rgba(107, 114, 128, 0.8)'
    },
    fool: { 
      name: 'Fou', 
      description: "Vous pensez être la Voyante. Vous gagnez si vous êtes éliminé par vote.", 
      image: '/images/roles/fou.webp',
      color: '#A78BFA',
      flashColor: 'rgba(167, 139, 250, 0.8)'
    },
    villager: { 
      name: 'Villageois', 
      description: "Pas de pouvoir spécial, mais votre vote compte !", 
      image: '/images/roles/villageois.webp',
      color: 'var(--color-soft-gold)',
      flashColor: 'rgba(245, 158, 11, 0.8)'
    },
  };

  return roles[role] || roles['villager'];
});

const roleColor = computed(() => roleData.value.color);
const roleFlashColor = computed(() => roleData.value.flashColor);

const cardFrontStyle = computed(() => ({
  background: `radial-gradient(circle at center, ${roleColor.value}20, var(--color-midnight-blue) 80%)`,
  borderColor: roleColor.value,
  boxShadow: `0 0 30px ${roleColor.value}40, inset 0 0 20px ${roleColor.value}10`
}));

const flipCard = () => {
  if (!isFlipped.value) {
    isFlipped.value = true;
    flashHidden.value = false;
  }
};

async function confirmRole() {
  // Vérifier si déjà confirmé (localement ou dans les métadonnées)
  if (confirmed.value || isConfirming.value) {
    console.log('🎭 [RoleReveal] Already confirmed or confirming, ignoring click');
    return;
  }
  
  // Vérifier aussi dans les métadonnées du joueur
  if (gameStore.currentPlayer?.metadata?.role_revealed) {
    console.log('🎭 [RoleReveal] Player already confirmed in metadata, setting confirmed to true');
    confirmed.value = true;
    return;
  }
  
  try {
    isConfirming.value = true;
    confirmed.value = true; // Marquer comme confirmé immédiatement pour éviter les doubles clics
    
    console.log('🎭 [RoleReveal] Confirming role...');
    result.value = await gameStore.confirmRoleReveal();
    console.log('🎭 [RoleReveal] Role confirmed:', result.value);
    
    // S'assurer que confirmed reste à true même après la réponse
    confirmed.value = true;
    
    if (result.value?.all_confirmed) {
      console.log('🎭 [RoleReveal] All players confirmed, waiting for phase change...');
      
      // CORRECTION: Ne pas forcer de rafraîchissement qui pourrait écraser la phase
      // Attendre simplement l'événement PhaseChanged via WebSocket
      // Le backend va émettre PhaseChanged quand tous les joueurs ont confirmé
      console.log('🎭 [RoleReveal] All players confirmed, waiting for PhaseChanged event from WebSocket...');
    }
  } catch (error) {
    console.error('❌ [RoleReveal] Error confirming role:', error);
    // Ne réinitialiser confirmed que si l'erreur n'est pas "déjà confirmé"
    if (!error.response?.data?.already_confirmed) {
      confirmed.value = false;
    }
    if (window.showNotification) {
      window.showNotification('Erreur lors de la confirmation du rôle', 'error');
    }
  } finally {
    isConfirming.value = false;
  }
}

// Vérifier si le joueur a déjà confirmé son rôle (une seule fois au montage)
const hasCheckedInitialConfirmation = ref(false);
watch(() => gameStore.currentPlayer, (player) => {
  if (!hasCheckedInitialConfirmation.value && player?.metadata?.role_revealed) {
    confirmed.value = true;
    hasCheckedInitialConfirmation.value = true;
    console.log('🎭 [RoleReveal] Player already confirmed (initial check)');
  }
}, { immediate: true });

// Écouter les changements de phase - arrêter le polling si la phase change
// IMPORTANT: Une fois qu'on a quitté role_reveal, on ne revient plus en arrière
let hasLeftRoleReveal = false;
watch(() => gameStore.phase, (newPhase, oldPhase) => {
  console.log('🔄 [RoleReveal] Phase changed:', oldPhase, '->', newPhase);
  
  if (newPhase !== 'role_reveal') {
    // La phase a changé, on va être redirigé vers le prochain composant
    console.log('🔄 [RoleReveal] Leaving role_reveal phase, transitioning to:', newPhase);
    hasLeftRoleReveal = true;
    
    // S'assurer que confirmed reste à true
    confirmed.value = true;
    
    // Arrêter le polling si actif
    if (phaseCheckInterval) {
      clearInterval(phaseCheckInterval);
      phaseCheckInterval = null;
      console.log('🔄 [RoleReveal] Stopped phase polling');
    }
  } else if (hasLeftRoleReveal) {
    // Si on revient à role_reveal après l'avoir quitté, c'est une erreur
    // Cela ne devrait jamais arriver, mais si c'est le cas, on ignore
    console.warn('⚠️ [RoleReveal] Phase reverted to role_reveal after leaving! Ignoring this event.');
    // Ne pas réinitialiser confirmed ou autre chose, juste ignorer
    return;
  }
}, { immediate: true });

// Fallback: Vérifier périodiquement si la phase a changé (au cas où WebSocket ne fonctionne pas)
let phaseCheckInterval = null;
watch(() => [confirmed.value, result.value], ([isConfirmed, confirmResult]) => {
  if (isConfirmed && confirmResult?.all_confirmed) {
    // Si tous ont confirmé, vérifier périodiquement la phase
    if (!phaseCheckInterval) {
      phaseCheckInterval = setInterval(() => {
        if (gameStore.phase !== 'role_reveal') {
          console.log('🔄 [RoleReveal] Phase changed detected via polling:', gameStore.phase);
          if (phaseCheckInterval) {
            clearInterval(phaseCheckInterval);
            phaseCheckInterval = null;
          }
        }
      }, 500);
    }
  } else if (phaseCheckInterval) {
    clearInterval(phaseCheckInterval);
    phaseCheckInterval = null;
  }
});

onUnmounted(() => {
  if (phaseCheckInterval) {
    clearInterval(phaseCheckInterval);
  }
});

onMounted(() => {
  // Si on a déjà quitté role_reveal, ne pas initialiser le composant
  if (hasLeftRoleReveal) {
    console.warn('⚠️ [RoleReveal] Component mounted but hasLeftRoleReveal is true, skipping initialization');
    return;
  }
  
  // Preload role image
  const img = new Image();
  img.src = roleData.value.image;
  
  // Vérifier si le joueur a déjà confirmé (une seule fois)
  if (gameStore.currentPlayer?.metadata?.role_revealed && !hasCheckedInitialConfirmation.value) {
    confirmed.value = true;
    hasCheckedInitialConfirmation.value = true;
    console.log('🎭 [RoleReveal] Player already confirmed (onMounted)');
  }
});
</script>

<style scoped>
.role-reveal-container {
  background: #000;
  min-height: 100vh;
  min-height: 100dvh;
}

.scene {
  perspective: 1200px;
  transform-style: preserve-3d;
  width: 100%;
  max-width: 20rem;
  height: 28rem;
}

@media (max-width: 640px) {
  .scene {
    max-width: 18rem;
    height: 24rem;
    max-height: 85vh;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .scene {
    max-width: 19rem;
    height: 26rem;
  }
}

.card {
  width: 100%;
  height: 100%;
  position: relative;
  transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
  transform-style: preserve-3d;
  cursor: pointer;
}

.card.is-flipped {
  transform: rotateY(180deg);
  cursor: default;
}

.card__face {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: var(--radius-xl);
  overflow: hidden;
  border: 3px solid;
}

.card__face--front {
  transform: rotateY(180deg);
  background: radial-gradient(circle at center, var(--color-deep-indigo) 0%, var(--color-midnight-blue) 100%);
}

.card__face--front .inner {
  max-height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
}

.card__face--back {
  background: radial-gradient(circle at 30% 30%, var(--color-electric-violet)20, var(--color-midnight-blue) 100%);
  border-color: var(--color-soft-gold);
  box-shadow: 0 0 30px rgba(245, 158, 11, 0.3);
}

.card__face--back .inner {
  border: 3px dashed var(--color-glass-border);
  border-radius: var(--radius-lg);
  margin: 1rem;
}

@media (min-width: 640px) {
  .card__face--back .inner {
    margin: 1.5rem;
  }
}

.mystical-pattern {
  background: 
    radial-gradient(circle at 50% 50%, var(--color-soft-gold) 2px, transparent 2px),
    radial-gradient(circle at 30% 30%, var(--color-electric-violet) 1px, transparent 1px);
  background-size: 40px 40px, 20px 20px;
  border-radius: 50%;
  border: 2px solid var(--color-soft-gold);
  opacity: 0.5;
}

.role-image {
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
  animation: float 4s ease-in-out infinite;
  max-width: 100%;
  height: auto;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
}

.flash-overlay {
  animation: flash 0.5s ease-out forwards;
}

@keyframes flash {
  0% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

/* Scrollbar personnalisée pour inner */
.card__face--front .inner {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.card__face--front .inner::-webkit-scrollbar {
  width: 4px;
}

.card__face--front .inner::-webkit-scrollbar-track {
  background: transparent;
}

.card__face--front .inner::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
}

.card__face--front .inner::-webkit-scrollbar-thumb:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Responsive améliorations */
@media (max-width: 768px) {
  .role-reveal-container {
    padding: 1rem;
  }
  
  .scene {
    max-width: 18rem;
    height: 24rem;
  }
  
  .card__face--back .inner h2 {
    font-size: 1.5rem;
  }
  
  .card__face--front .inner h2 {
    font-size: 1.5rem;
  }
}

@media (max-width: 640px) {
  .role-reveal-container {
    padding: 0.875rem;
  }
  
  .scene {
    max-width: 17rem;
    height: 23rem;
  }
  
  .card__face--back .inner h2 {
    font-size: 1.375rem;
  }
  
  .card__face--front .inner h2 {
    font-size: 1.375rem;
  }
}

@media (min-width: 375px) and (max-width: 414px) {
  .role-reveal-container {
    padding: 0.875rem;
  }
  
  .scene {
    max-width: 17.5rem;
    height: 23.5rem;
  }
}

@media (max-width: 360px) {
  .role-reveal-container {
    padding: 0.75rem;
  }
  
  .scene {
    max-width: 16rem;
    height: 22rem;
  }
  
  .card__face--back .inner h2 {
    font-size: 1.25rem;
  }
  
  .card__face--front .inner h2 {
    font-size: 1.25rem;
  }
  
  .role-image {
    width: 6rem;
    height: 6rem;
  }
  
  .card__face--front .inner p {
    font-size: 0.625rem;
  }
}

@media (min-width: 1024px) {
  .scene {
    max-width: 22rem;
    height: 30rem;
  }
}

/* Amélioration de l'accessibilité */
@media (prefers-reduced-motion: reduce) {
  .card {
    transition: transform 0.3s ease;
  }
  
  .role-image {
    animation: none;
  }
  
  .flash-overlay {
    animation: none;
  }
}
</style>
