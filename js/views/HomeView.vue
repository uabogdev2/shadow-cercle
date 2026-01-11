<template>
  <div class="home-container">
    <!-- Background -->
    <div class="home-background">
      <div class="background-overlay"></div>
    </div>

    <!-- Main Content -->
    <div class="home-content">
      <!-- Logo Section -->
      <div class="logo-section">
        <h1 class="logo-title">LOUP-GAROU</h1>
        <p class="logo-subtitle">Édition en Ligne</p>
      </div>

      <!-- Main Panel -->
      <div class="main-panel">
        <!-- Not Logged In -->
        <div v-if="!authStore.user" class="panel-content">
          <h2 class="panel-title">Entrer dans le Village</h2>
          <ActionButton
            variant="primary"
            size="md"
            :fullWidth="true"
            :icon="UserCircleIcon"
            :loading="authStore.isLoading"
            @click="handleLogin"
          >
            Entrer dans le Village
          </ActionButton>
        </div>

        <!-- Logged In -->
        <div v-else class="panel-content">
          <!-- User Header -->
          <div class="user-header">
            <div class="user-info">
              <div class="user-avatar">
                {{ authStore.user.name?.charAt(0)?.toUpperCase() || 'U' }}
              </div>
              <div class="user-details">
                <p class="user-name">{{ authStore.user.name || 'Utilisateur' }}</p>
                <p class="user-status">Prêt à chasser</p>
              </div>
            </div>
            <button 
              @click="handleLogout" 
              class="logout-button"
              aria-label="Déconnexion"
            >
              <LogOutIcon class="icon" />
            </button>
          </div>

          <!-- Actions -->
          <div class="actions-section">
            <ActionButton
              variant="primary"
              size="md"
              :fullWidth="true"
              :icon="PlusIcon"
              :loading="isCreating"
              @click="showCreateGame = true"
            >
              Créer une Partie
            </ActionButton>

            <div class="join-section">
              <input
                v-model="joinCode"
                type="text"
                placeholder="CODE"
                maxlength="5"
                class="code-input"
                @keyup.enter="joinGame"
              />
              <ActionButton
                variant="secondary"
                size="md"
                :fullWidth="true"
                :icon="DoorOpenIcon"
                :disabled="!joinCode || joinCode.length < 4 || isJoining"
                :loading="isJoining"
                @click="joinGame"
              >
                Rejoindre
              </ActionButton>
            </div>
            
            <!-- Test Button -->
            <button 
              @click="startTestGame" 
              class="test-button"
            >
              Observer les esprits (Mode Test)
            </button>
          </div>
        </div>
      </div>

      <!-- Create Game Modal -->
      <Transition name="modal">
        <div 
          v-if="showCreateGame" 
          class="modal-overlay" 
          @click="showCreateGame = false"
        >
          <div class="modal-content" @click.stop>
            <h3 class="modal-title">Nouvelle Partie</h3>
            <div class="modal-body">
              <label class="modal-label">Nombre de joueurs :</label>
              <select
                v-model="playerCount"
                class="modal-select"
              >
                <option :value="8">8 joueurs</option>
                <option :value="10">10 joueurs</option>
                <option :value="12">12 joueurs</option>
              </select>
            </div>
            <div class="modal-actions">
              <ActionButton variant="secondary" @click="showCreateGame = false">
                Annuler
              </ActionButton>
              <ActionButton variant="primary" :loading="isCreating" @click="createGame">
                Créer
              </ActionButton>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import { UserCircle as UserCircleIcon, LogOut as LogOutIcon, Plus as PlusIcon, DoorOpen as DoorOpenIcon } from 'lucide-vue-next';
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
  if (success && window.showNotification) {
    window.showNotification('Connexion réussie !', 'success');
  } else if (window.showNotification) {
    window.showNotification('Erreur lors de la connexion', 'error');
  }
}

function handleLogout() {
  authStore.logout();
  gameStore.resetGame();
  if (window.showNotification) {
    window.showNotification('Déconnexion réussie', 'info');
  }
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
      window.showNotification(result?.message || 'Impossible de rejoindre la partie', 'error');
    }
  } finally {
    isJoining.value = false;
  }
}

async function startTestGame() {
  try {
    const response = await axios.post('/games/test', { player_count: 8 });
    
    if (response.data.success) {
      const game = response.data.game;
      
      if (window.showNotification) {
        window.showNotification('Partie de test créée ! Redirection vers le lobby...', 'success');
      }
      
      // Rediriger vers le lobby avec le code
      router.push({ name: 'lobby', params: { code: game.code } });
    }
  } catch (error) {
    console.error('Error creating test game:', error);
    if (error.response?.status === 401 && window.showNotification) {
      window.showNotification('Veuillez vous connecter pour utiliser le mode test', 'error');
      handleLogin();
    } else if (window.showNotification) {
      window.showNotification(error.response?.data?.message || 'Erreur lors de la création de la partie de test', 'error');
    }
  }
}
</script>

<style scoped>
.home-container {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow: hidden;
}

.home-background {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, var(--color-midnight-blue) 0%, var(--color-deep-indigo) 100%);
  z-index: 0;
}

.background-overlay {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at top, rgba(245, 158, 11, 0.1) 0%, transparent 60%);
}

.home-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 28rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
}

/* Logo Section */
.logo-section {
  text-align: center;
  animation: fadeInDown 0.6s ease-out;
}

.logo-title {
  font-family: var(--font-serif);
  font-size: 3rem;
  font-weight: 700;
  color: var(--color-soft-gold);
  text-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.05em;
  margin: 0;
}

.logo-subtitle {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: rgba(254, 243, 199, 0.7);
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-top: 0.5rem;
}

/* Main Panel */
.main-panel {
  width: 100%;
  background: var(--color-glass-surface);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-glass-border);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  animation: fadeInUp 0.6s ease-out 0.2s both;
}

.panel-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-title {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-cream);
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  margin: 0;
}

/* User Header */
.user-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(124, 58, 237, 0.5);
  border: 2px solid rgba(124, 58, 237, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-family: var(--font-serif);
  font-size: 1.125rem;
  font-weight: 700;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.user-name {
  font-family: var(--font-sans);
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-text-light);
  margin: 0;
}

.user-status {
  font-family: var(--font-sans);
  font-size: 0.875rem;
  color: rgba(229, 231, 235, 0.6);
  margin: 0;
}

.logout-button {
  background: transparent;
  border: none;
  color: rgba(229, 231, 235, 0.6);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-button:hover {
  color: var(--color-text-light);
  background: rgba(255, 255, 255, 0.1);
}

.logout-button .icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Actions Section */
.actions-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--color-glass-border);
}

.join-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.code-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(17, 24, 39, 0.5);
  border: 2px solid var(--color-glass-border);
  border-radius: 0.5rem;
  color: white;
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 700;
  text-align: center;
  letter-spacing: 0.5em;
  text-transform: uppercase;
  transition: all 0.2s ease;
}

.code-input::placeholder {
  color: rgba(255, 255, 255, 0.4);
}

.code-input:focus {
  outline: none;
  border-color: var(--color-soft-gold);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.3);
}

.test-button {
  background: transparent;
  border: none;
  color: rgba(254, 243, 199, 0.5);
  font-family: var(--font-sans);
  font-size: 0.75rem;
  text-align: center;
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
  transition: color 0.2s ease;
  border-top: 1px solid var(--color-glass-border);
  padding-top: 1rem;
}

.test-button:hover {
  color: var(--color-cream);
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
}

.modal-content {
  width: 100%;
  max-width: 24rem;
  background: var(--color-glass-surface);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--color-glass-border);
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

.modal-title {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-cream);
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  margin: 0 0 1.5rem 0;
}

.modal-body {
  margin-bottom: 1.5rem;
}

.modal-label {
  display: block;
  font-family: var(--font-serif);
  font-size: 0.875rem;
  color: rgba(229, 231, 235, 0.8);
  margin-bottom: 0.5rem;
}

.modal-select {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(17, 24, 39, 0.7);
  border: 2px solid var(--color-glass-border);
  border-radius: 0.5rem;
  color: white;
  font-family: var(--font-sans);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-select:focus {
  outline: none;
  border-color: var(--color-soft-gold);
  box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.3);
}

.modal-select option {
  background: var(--color-deep-indigo);
  color: white;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

/* Animations */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
  opacity: 0;
}

/* Responsive */
@media (max-width: 640px) {
  .logo-title {
    font-size: 2rem;
  }

  .main-panel {
    padding: 1.25rem;
  }

  .panel-title {
    font-size: 1.25rem;
  }

  .user-avatar {
    width: 2.25rem;
    height: 2.25rem;
    font-size: 1rem;
  }

  .code-input {
    font-size: 1.25rem;
    letter-spacing: 0.3em;
  }
}

@media (min-width: 375px) and (max-width: 414px) {
  .logo-title {
    font-size: 2.25rem;
  }
  
  .main-panel {
    padding: 1.125rem;
  }
  
  .code-input {
    font-size: 1.375rem;
    letter-spacing: 0.35em;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .home-content {
    max-width: 30rem;
  }
  
  .logo-title {
    font-size: 2.75rem;
  }
  
  .main-panel {
    padding: 1.75rem;
  }
}

@media (min-width: 1024px) {
  .home-content {
    max-width: 32rem;
  }

  .logo-title {
    font-size: 3.5rem;
  }
}

@media (max-width: 360px) {
  .home-container {
    padding: 0.75rem;
  }
  
  .logo-title {
    font-size: 1.75rem;
  }
  
  .logo-subtitle {
    font-size: 0.75rem;
  }
  
  .main-panel {
    padding: 1rem;
  }
  
  .panel-title {
    font-size: 1.125rem;
  }
  
  .user-avatar {
    width: 2rem;
    height: 2rem;
    font-size: 0.875rem;
  }
  
  .user-name {
    font-size: 0.875rem;
  }
  
  .user-status {
    font-size: 0.75rem;
  }
  
  .code-input {
    font-size: 1.125rem;
    letter-spacing: 0.25em;
    padding: 0.5rem 0.75rem;
  }
  
  .modal-content {
    padding: 1rem;
  }
  
  .modal-title {
    font-size: 1.25rem;
  }
  
  .test-button {
    font-size: 0.625rem;
    padding: 0.375rem;
  }
}

/* Prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .logo-section {
    animation: none;
  }
  
  .main-panel {
    animation: none;
  }
  
  .modal-enter-active .modal-content,
  .modal-leave-active .modal-content {
    transition: opacity 0.01ms;
  }
}
</style>
