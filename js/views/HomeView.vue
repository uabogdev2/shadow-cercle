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
      <div class="noise-overlay"></div>
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
  background: var(--color-bg-ink);
  color: var(--color-text-primary);
}

.home-background {
  position: absolute;
  inset: 0;
  background: var(--color-bg-ink);
}

.home-background::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-noise);
  opacity: 0.12;
  pointer-events: none;
}

.aurora-layer {
  position: absolute;
  inset: 0;
  opacity: 0.4;
}

.aurora-orb {
  position: absolute;
  border-radius: 9999px;
  filter: blur(70px);
}

.aurora-orb-1 {
  top: -5%;
  left: 15%;
  width: 28rem;
  height: 28rem;
  background: radial-gradient(circle, rgba(217, 119, 6, 0.4), transparent 60%);
}

.aurora-orb-2 {
  bottom: 10%;
  right: 10%;
  width: 24rem;
  height: 24rem;
  background: radial-gradient(circle, rgba(153, 27, 27, 0.35), transparent 60%);
}

.aurora-orb-3 {
  top: 40%;
  left: 50%;
  width: 18rem;
  height: 18rem;
  transform: translate(-50%, -50%);
  background: radial-gradient(circle, rgba(180, 83, 9, 0.3), transparent 60%);
}

.particle-dust {
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px);
  background-size: 42px 42px;
  opacity: 0.5;
}

.noise-overlay {
  position: absolute;
  inset: 0;
  background-image: var(--color-noise);
  opacity: 0.18;
  pointer-events: none;
}

.moon-indicator {
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 4rem;
  height: 4rem;
  border-radius: 9999px;
  background: radial-gradient(circle at 30% 30%, #fcd34d, #b45309);
  box-shadow: 0 0 40px rgba(217, 119, 6, 0.45);
  opacity: 0.75;
  mix-blend-mode: screen;
}

.header-logo {
  position: relative;
  z-index: 10;
  text-align: center;
  margin-bottom: 2.5rem;
  width: 100%;
  max-width: 28rem;
}

.main-title {
  font-family: var(--font-cinzel);
  font-size: 3rem;
  letter-spacing: 0.08em;
  background: linear-gradient(90deg, #fcd34d, #d97706, #fcd34d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.65rem;
  text-shadow: var(--glow-gold);
}

.title-divider {
  height: 1px;
  width: 12rem;
  margin: 0 auto 0.75rem;
  background: linear-gradient(to right, transparent, rgba(217, 119, 6, 0.6), transparent);
}

.subtitle {
  color: var(--color-text-secondary);
  font-size: 0.85rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.glass-card-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 28rem;
  margin: 0 auto;
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  background: linear-gradient(145deg, rgba(245, 245, 220, 0.12), rgba(245, 245, 220, 0.06));
  border: 2px solid rgba(62, 47, 32, 0.4);
  box-shadow: 0 22px 48px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.glass-card-container::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--color-noise);
  opacity: 0.32;
  mix-blend-mode: soft-light;
  pointer-events: none;
}

.not-logged-in-container,
.logged-in-container,
.actions-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: relative;
  z-index: 1;
}

.text-center-section {
  text-align: center;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(62, 47, 32, 0.4);
}

.connection-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  background: rgba(217, 119, 6, 0.12);
  border: 1px solid rgba(217, 119, 6, 0.35);
  color: #fbbf24;
  letter-spacing: 0.06em;
}

.badge-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: var(--color-accent-burnt);
  box-shadow: 0 0 0 6px rgba(217, 119, 6, 0.14);
}

.badge-text {
  font-size: 0.85rem;
}

.instruction-text {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

.user-info-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.9rem;
  background: rgba(18, 18, 18, 0.7);
  border: 1px solid rgba(62, 47, 32, 0.4);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.3);
}

.user-avatar {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 9999px;
  background: radial-gradient(circle at 30% 30%, #f59e0b, #b45309);
  color: var(--color-text-primary);
  font-family: var(--font-display);
  font-size: 1.25rem;
  box-shadow: 0 10px 18px rgba(0, 0, 0, 0.45), 0 0 0 4px rgba(217, 119, 6, 0.15);
}

.user-name {
  color: var(--color-accent-paper);
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0;
  letter-spacing: 0.02em;
}

.user-status {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #86efac;
  font-size: 0.85rem;
}

.status-dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 999px;
  background: #22c55e;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.14);
}

.logout-button {
  padding: 0.6rem;
  border-radius: 0.65rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(62, 47, 32, 0.35);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.logout-button:hover {
  background: rgba(153, 27, 27, 0.12);
  color: #fca5a5;
  border-color: rgba(153, 27, 27, 0.4);
}

.join-game-container {
  display: flex;
  gap: 0.6rem;
}

.join-code-input {
  flex: 1;
  background: rgba(26, 26, 26, 0.9);
  border: 1px solid rgba(62, 47, 32, 0.45);
  border-radius: 0.9rem;
  padding: 0.8rem 1rem;
  text-align: center;
  font-size: 1.2rem;
  font-family: var(--font-mono);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-accent-paper);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.join-code-input::placeholder {
  color: rgba(255, 255, 255, 0.35);
}

.join-code-input:focus {
  outline: none;
  border-color: rgba(217, 119, 6, 0.55);
  box-shadow: 0 0 0 3px rgba(217, 119, 6, 0.18);
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
  inset: 50% 0 auto;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(62, 47, 32, 0.5), transparent);
}

.divider-text {
  position: relative;
  padding: 0 1rem;
  background: rgba(18, 18, 18, 0.75);
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  letter-spacing: 0.08em;
}

.test-mode-container {
  margin-top: 0.5rem;
  text-align: center;
}

.test-mode-button {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.8rem;
  background: transparent;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  transition: color var(--transition-fast);
}

.test-mode-button:hover {
  color: var(--color-accent-paper);
}

.modal-overlay {
  position: fixed;
  inset: 0;
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
  backdrop-filter: blur(6px);
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 24rem;
  padding: 1.5rem;
  border-radius: var(--radius-xl);
  background: linear-gradient(145deg, rgba(245, 245, 220, 0.14), rgba(245, 245, 220, 0.07));
  border: 2px solid rgba(62, 47, 32, 0.45);
  box-shadow: 0 25px 55px rgba(0, 0, 0, 0.5), inset 0 0 0 1px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.modal-content::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--color-noise);
  opacity: 0.3;
  mix-blend-mode: soft-light;
  pointer-events: none;
}

.modal-close-button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.35rem;
  border-radius: 0.65rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(62, 47, 32, 0.4);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.modal-close-button:hover {
  color: var(--color-accent-paper);
  background: rgba(217, 119, 6, 0.14);
  border-color: rgba(217, 119, 6, 0.45);
}

.modal-title {
  font-family: var(--font-cinzel);
  font-size: 1.45rem;
  color: var(--color-accent-paper);
  letter-spacing: 0.06em;
  margin-bottom: 1.4rem;
  text-align: center;
}

.modal-section {
  margin-bottom: 1.75rem;
}

.modal-label {
  display: block;
  color: var(--color-text-secondary);
  font-size: 0.9rem;
  letter-spacing: 0.04em;
  margin-bottom: 0.75rem;
}

.player-count-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.6rem;
}

.player-count-btn {
  padding: 1rem 0;
  border-radius: 0.85rem;
  font-family: var(--font-display);
  font-size: 1.15rem;
  border: 1px solid rgba(62, 47, 32, 0.45);
  background: rgba(26, 26, 26, 0.9);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.player-count-btn:hover {
  border-color: rgba(217, 119, 6, 0.6);
  color: var(--color-accent-paper);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.25);
}

.player-count-btn-active {
  background: radial-gradient(circle at 30% 30%, rgba(217, 119, 6, 0.35), rgba(153, 27, 27, 0.35));
  color: var(--color-accent-paper);
  border-color: rgba(217, 119, 6, 0.7);
  box-shadow: 0 14px 24px rgba(0, 0, 0, 0.35), 0 0 0 2px rgba(217, 119, 6, 0.2);
}

.modal-actions {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 768px) {
  .glass-card-container {
    padding: 2rem;
  }

  .main-title {
    font-size: 3.6rem;
  }
}
</style>
