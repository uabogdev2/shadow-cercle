<template>
  <div class="home-view">
    <!-- Animated Background -->
    <div class="home-background">
      <!-- Aurora effect -->
      <div class="aurora-layer">
        <div class="aurora-orb aurora-orb-1 animate-float"></div>
        <div class="aurora-orb aurora-orb-2 animate-float" style="animation-delay: 2s;"></div>
        <div class="aurora-orb aurora-orb-3 animate-float" style="animation-delay: 4s;"></div>
      </div>
      <!-- Particle dust effect -->
      <div class="particle-dust"></div>
    </div>

    <!-- Moon in corner -->
    <div class="moon-indicator"></div>

    <!-- Header / Logo -->
    <div class="header-logo">
      <h1 class="main-title">Loup-Garou</h1>
      <div class="title-divider"></div>
      <p class="subtitle">Le Village des Ombres</p>
    </div>

    <!-- Main Glass Panel -->
    <div class="glass-card-container">

      <!-- Not Logged In -->
      <div v-if="!authStore.user" class="not-logged-in-container">
        <div class="text-center-section">
          <div class="connection-badge">
            <div class="badge-dot"></div>
            <span class="badge-text">Connexion requise</span>
          </div>
          <p class="instruction-text">Entrez dans le village pour commencer</p>
        </div>
        
        <ActionButton
          variant="primary"
          :icon="UserCircleIcon"
          :loading="authStore.isLoading"
          :glow="true"
          @click="handleLogin"
          :full-width="true"
        >
          Entrer dans le Village
        </ActionButton>
      </div>

      <!-- Logged In -->
      <div v-else class="logged-in-container">
        <!-- User Info -->
        <div class="user-info-container">
          <div class="user-avatar">
            {{ authStore.user.name?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div class="user-details">
            <p class="user-name">{{ authStore.user.name || 'Inconnu' }}</p>
            <div class="user-status">
              <div class="status-dot"></div>
              <span>Connecté</span>
            </div>
          </div>
          <button 
            @click="handleLogout" 
            class="logout-button"
          >
            <LogOutIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Actions -->
        <div class="actions-container">
          <ActionButton
            variant="primary"
            :icon="PlusIcon"
            :loading="isCreating"
            :glow="true"
            @click="showCreateGame = true"
            :full-width="true"
          >
            Créer une Partie
          </ActionButton>

          <div class="divider-container">
            <div class="divider-line"></div>
            <span class="divider-text">ou</span>
          </div>

          <div class="join-game-container">
            <input
              v-model="joinCode"
              type="text"
              placeholder="CODE"
              maxlength="5"
              class="join-code-input"
              @keyup.enter="joinGame"
            />
            <ActionButton
              variant="magic"
              :disabled="!joinCode || joinCode.length < 4 || isJoining"
              @click="joinGame"
            >
              Rejoindre
            </ActionButton>
          </div>

          <!-- Test Mode (subtle) -->
          <div class="test-mode-container">
            <button 
              @click="startTestGame" 
              class="test-mode-button"
            >
              <SparklesIcon class="w-3 h-3" />
              <span>Mode Test</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Game Modal -->
    <Teleport to="body">
      <div 
        v-if="showCreateGame" 
        class="modal-overlay"
        @click.self="showCreateGame = false"
      >
        <!-- Backdrop -->
        <div class="modal-backdrop"></div>
        
        <!-- Modal -->
        <div class="modal-content">
          <button 
            @click="showCreateGame = false" 
            class="modal-close-button"
          >
            <XIcon class="w-5 h-5" />
          </button>

          <h3 class="modal-title">Configuration</h3>

          <div class="modal-section">
            <label class="modal-label">Nombre de joueurs</label>
            <div class="player-count-grid">
              <button 
                v-for="count in [8, 10, 12]"
                :key="count"
                @click="playerCount = count"
                class="player-count-btn"
                :class="{ 'player-count-btn-active': playerCount === count }"
              >
                {{ count }}
              </button>
            </div>
          </div>

          <div class="modal-actions">
            <ActionButton variant="secondary" @click="showCreateGame = false">
              Annuler
            </ActionButton>
            <ActionButton variant="primary" :loading="isCreating" @click="createGame" :glow="true">
              Créer
            </ActionButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import { UserCircle as UserCircleIcon, LogOut as LogOutIcon, Plus as PlusIcon, Sparkles as SparklesIcon, X as XIcon } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import axios from 'axios';

const router = useRouter();
const authStore = useAuthStore();
const gameStore = useGameStore();

const showCreateGame = ref(false);
const playerCount = ref(8);
const joinCode = ref('');
const isCreating = ref(false);
const isJoining = ref(false);

async function handleLogin() {
  const success = await authStore.loginWithGoogle();
  if (success && window.showNotification) window.showNotification('Bienvenue dans le Village !', 'success');
  else if (window.showNotification) window.showNotification('Connexion échouée', 'error');
}

function handleLogout() {
  authStore.logout();
  gameStore.resetGame();
  if (window.showNotification) window.showNotification('À bientôt...', 'info');
}

async function createGame() {
  isCreating.value = true;
  try {
    const code = await gameStore.createGame(playerCount.value);
    if (code) {
      showCreateGame.value = false;
      router.push({ name: 'lobby', params: { code } });
    }
  } finally {
    isCreating.value = false;
  }
}

async function joinGame() {
  if (!joinCode.value || joinCode.value.length !== 5) return;
  isJoining.value = true;
  try {
    const result = await gameStore.joinGame(joinCode.value.toUpperCase());
    if (result?.success) {
      router.push({ name: 'lobby', params: { code: joinCode.value.toUpperCase() } });
    } else if (window.showNotification) {
      window.showNotification(result?.message || 'Impossible de rejoindre', 'error');
    }
  } finally {
    isJoining.value = false;
  }
}

async function startTestGame() {
  try {
    const response = await axios.post('/games/test', { player_count: 8 });
    if (response.data.success) {
      if (window.showNotification) window.showNotification('Partie test créée', 'success');
      router.push({ name: 'lobby', params: { code: response.data.game.code } });
    }
  } catch (error) {
    if(window.showNotification) window.showNotification('Erreur', 'error');
  }
}
</script>

<style scoped>
.home-view {
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Forcer l'affichage horizontal de tous les éléments texte */
.home-view * {
  white-space: normal !important;
  word-wrap: break-word !important;
  display: block;
}

.home-view .flex,
.home-view [class*="flex"] {
  display: flex !important;
}

.home-view .inline-flex,
.home-view [class*="inline-flex"] {
  display: inline-flex !important;
}

.home-view .flex-col,
.home-view [class*="flex-col"] {
  flex-direction: column !important;
}

.home-view .flex-row,
.home-view [class*="flex-row"] {
  flex-direction: row !important;
}

.home-view .items-center,
.home-view [class*="items-center"] {
  align-items: center !important;
}

.home-view .justify-center,
.home-view [class*="justify-center"] {
  justify-content: center !important;
}

.home-view .gap-2,
.home-view .gap-3,
.home-view .gap-4,
.home-view .gap-6,
.home-view [class*="gap-"] {
  display: flex !important;
  gap: 0.5rem;
}

.home-view .gap-3 {
  gap: 0.75rem;
}

.home-view .gap-4 {
  gap: 1rem;
}

.home-view .gap-6 {
  gap: 1.5rem;
}

/* Forcer le texte à s'afficher horizontalement */
.home-view p,
.home-view span,
.home-view h1,
.home-view h2,
.home-view h3,
.home-view h4,
.home-view h5,
.home-view h6,
.home-view label,
.home-view button,
.home-view input {
  display: inline-block !important;
  white-space: normal !important;
  word-wrap: break-word !important;
  line-height: normal !important;
}

.text-cinzel {
  font-family: 'Cinzel', 'Playfair Display', serif;
  letter-spacing: 0.05em;
}

.glass-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
  padding: 1.5rem;
}

/* Containers avec flex explicite */
.not-logged-in-container,
.logged-in-container,
.actions-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.connection-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  background: rgba(124, 58, 237, 0.1);
  border: 1px solid rgba(124, 58, 237, 0.3);
  margin-bottom: 1rem;
}

.connection-badge > * {
  display: inline-block;
}

.user-info-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.75rem;
  background: rgba(30, 41, 59, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.user-info-container > * {
  display: block;
}

.join-game-container {
  display: flex;
  gap: 0.5rem;
}

.join-code-input {
  flex: 1;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(51, 65, 85, 0.5);
  border-radius: 0.75rem;
  padding: 0.75rem 1rem;
  text-align: center;
  font-size: 1.25rem;
  font-family: monospace;
  text-transform: uppercase;
  color: white;
}

.join-code-input::placeholder {
  color: rgb(71, 85, 105);
}

.join-code-input:focus {
  border-color: rgba(124, 58, 237, 0.5);
  outline: none;
  box-shadow: 0 0 0 2px rgba(124, 58, 237, 0.2);
}

.divider-container {
  position: relative;
  margin: 0.5rem 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.divider-line {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgb(51, 65, 85);
}

.divider-text {
  position: relative;
  padding: 0 1rem;
  background: transparent;
  color: rgb(100, 116, 139);
  font-size: 0.875rem;
}

.text-center-section {
  text-align: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.badge-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: rgb(124, 58, 237);
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.badge-text {
  color: rgb(167, 139, 250);
  font-size: 0.875rem;
}

.instruction-text {
  color: rgb(148, 163, 184);
  font-size: 0.875rem;
}

.user-avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  background: linear-gradient(to bottom right, rgb(124, 58, 237), rgb(79, 70, 229));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  box-shadow: 0 10px 15px -3px rgba(124, 58, 237, 0.2);
}

.user-details {
  flex: 1;
}

.user-name {
  color: white;
  font-weight: 500;
  font-size: 1.125rem;
  margin: 0;
}

.user-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgb(52, 211, 153);
  font-size: 0.875rem;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 9999px;
  background: rgb(16, 185, 129);
}

.logout-button {
  padding: 0.5rem;
  border-radius: 0.5rem;
  background: transparent;
  border: none;
  color: rgb(148, 163, 184);
  cursor: pointer;
  transition: all 0.2s;
}

.logout-button:hover {
  background: rgba(239, 68, 68, 0.1);
  color: rgb(248, 113, 113);
}

.test-mode-container {
  margin-top: 1rem;
  text-align: center;
}

.test-mode-button {
  color: rgb(71, 85, 105);
  font-size: 0.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: color 0.2s;
}

.test-mode-button:hover {
  color: rgb(167, 139, 250);
}

.header-logo {
  position: relative;
  z-index: 10;
  text-align: center;
  margin-bottom: 3rem;
  width: 100%;
  max-width: 28rem;
}

.main-title {
  font-family: 'Cinzel', 'Playfair Display', serif;
  font-size: 3rem;
  background: linear-gradient(to right, rgb(252, 211, 77), rgb(250, 204, 21), rgb(252, 211, 77));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.75rem;
  animation: glow-text 3s ease-in-out infinite;
}

.title-divider {
  height: 1px;
  width: 12rem;
  margin: 0 auto 0.75rem;
  background: linear-gradient(to right, transparent, rgba(245, 158, 11, 0.5), transparent);
}

.subtitle {
  color: rgb(148, 163, 184);
  font-size: 0.875rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-glow-pulse {
  animation: glow-text 3s ease-in-out infinite;
}

@keyframes glow-text {
  0%, 100% {
    filter: drop-shadow(0 0 20px rgba(245, 158, 11, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 30px rgba(245, 158, 11, 0.6));
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

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
}

.modal-content {
  position: relative;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(124, 58, 237, 0.1);
  width: 100%;
  max-width: 24rem;
  padding: 1.5rem;
}

.modal-close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem;
  background: transparent;
  border: none;
  color: rgb(148, 163, 184);
  cursor: pointer;
  transition: color 0.2s;
}

.modal-close-button:hover {
  color: white;
}

.modal-title {
  font-family: 'Cinzel', 'Playfair Display', serif;
  font-size: 1.5rem;
  color: rgb(251, 191, 36);
  margin-bottom: 1.5rem;
  text-align: center;
}

.modal-section {
  margin-bottom: 2rem;
}

.modal-label {
  display: block;
  color: rgb(148, 163, 184);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.player-count-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.player-count-btn {
  padding: 1rem 0;
  border-radius: 0.75rem;
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  transition: all 0.2s;
  border: 1px solid rgba(51, 65, 85, 0.5);
  background: rgba(30, 41, 59, 0.5);
  color: rgb(148, 163, 184);
  cursor: pointer;
}

.player-count-btn:hover {
  border-color: rgba(251, 191, 36, 0.5);
  color: rgb(251, 191, 36);
}

.player-count-btn-active {
  background: linear-gradient(to right, rgb(245, 158, 11), rgb(234, 179, 8));
  color: rgb(15, 23, 42);
  box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.25);
  border-color: transparent;
}

.modal-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.glass-card-container {
  position: relative;
  z-index: 10;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
  padding: 1.5rem;
}

/* Background elements */
.home-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom right, rgb(2, 6, 23), rgb(49, 46, 129), rgb(2, 6, 23));
}

.aurora-layer {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.3;
}

.aurora-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(60px);
}

.aurora-orb-1 {
  top: 0;
  left: 25%;
  width: 24rem;
  height: 24rem;
  background: rgba(124, 58, 237, 0.2);
}

.aurora-orb-2 {
  bottom: 25%;
  right: 25%;
  width: 20rem;
  height: 20rem;
  background: rgba(6, 182, 212, 0.2);
}

.aurora-orb-3 {
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 16rem;
  height: 16rem;
  background: rgba(79, 70, 229, 0.2);
}

.particle-dust {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
}

.moon-indicator {
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  background: linear-gradient(to bottom right, rgb(226, 232, 240), rgb(148, 163, 184));
  box-shadow: 0 0 40px rgba(248, 250, 252, 0.3);
  opacity: 0.6;
}

@media (min-width: 768px) {
  .glass-card-container {
    padding: 2rem;
  }
  
  .main-title {
    font-size: 3.75rem;
  }
}
</style>
