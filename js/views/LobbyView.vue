<template>
  <div class="lobby-view">
    <!-- Background -->
    <div class="lobby-background">
      <img src="/images/backgrounds/village-gathering.webp" alt="Village Gathering" class="background-image" />
      <div class="background-overlay"></div>
    </div>

    <!-- Main Content -->
    <div class="lobby-content">
      <!-- Header: Game Code -->
      <header class="lobby-header">
        <div class="code-section">
          <p class="code-label">Code de la Partie</p>
          <div class="code-display" @click="handleCopy">
            <h1 class="code-text">{{ gameCode }}</h1>
            <CopyIcon :class="['copy-icon', copied ? 'copied' : '']" />
          </div>
        </div>
        <div class="header-actions">
          <button class="qr-button" @click="showQrCode = true" title="QR Code">
            <QRCodeIcon class="qr-icon" />
          </button>
          <button class="leave-button" @click="handleLeave" title="Quitter">
            <LogOutIcon class="leave-icon" />
          </button>
        </div>
      </header>

      <!-- Players Horizontal Scroll -->
      <section class="players-section">
        <div class="players-scroll">
          <PlayerCard
            v-for="player in gameStore.players"
            :key="player.id"
            :name="player.user?.name || 'Joueur'"
            :status="isPlayerReady(player) ? 'ready' : 'waiting'"
            :is-host="player.is_host"
            size="small"
            @click="handlePlayerCardClick(player)"
          />
          <div
            v-for="i in Math.max(0, playerLimit - gameStore.players.length)"
            :key="`empty-${i}`"
            class="empty-slot"
          >
            <span class="empty-text">...</span>
          </div>
        </div>
      </section>

      <!-- Chat Main Area -->
      <main class="chat-main">
        <ChatBox channel="lobby" :is-visible="true" :show-quick-reactions="false" />
      </main>

      <!-- Footer: Actions -->
      <footer class="lobby-footer">
        <ActionButton
          v-if="gameStore.isHost"
          :variant="canStart ? 'primary' : 'disabled'"
          size="lg"
          :full-width="true"
          :disabled="!canStart"
          @click="startGame"
        >
          {{ startButtonText }}
        </ActionButton>
        <ActionButton
          v-else
          :variant="isMeReady ? 'secondary' : 'primary'"
          size="lg"
          :full-width="true"
          @click="toggleReady"
        >
          {{ isMeReady ? "Attendre..." : "Je suis Prêt" }}
        </ActionButton>
      </footer>
    </div>

    <!-- QR Code Modal -->
    <Transition name="modal">
      <div 
        v-if="showQrCode" 
        class="modal-overlay" 
        @click="showQrCode = false"
      >
        <div class="modal-content" @click.stop>
          <h3 class="modal-title">Scannez pour Rejoindre</h3>
          <div ref="qrCodeContainer" class="qr-code-container"></div>
          <p class="modal-subtitle">Partagez ce code avec vos amis</p>
        </div>
      </div>
    </Transition>

    <!-- Player Actions Modal -->
    <Transition name="modal">
      <div 
        v-if="selectedPlayer" 
        class="modal-overlay" 
        @click="selectedPlayer = null"
      >
        <div class="modal-content player-actions-modal" @click.stop>
          <h3 class="modal-title">Actions pour {{ selectedPlayer?.user?.name || 'Joueur' }}</h3>
          <div class="modal-body">
            <button 
              class="action-option"
              @click="handleTransferHost"
            >
              <CrownIcon class="action-icon" />
              <span>Donner le rôle d'hôte</span>
            </button>
            <button 
              class="action-option danger"
              @click="handleKickPlayer"
            >
              <UserXIcon class="action-icon" />
              <span>Exclure du lobby</span>
            </button>
          </div>
          <div class="modal-actions">
            <ActionButton variant="secondary" @click="selectedPlayer = null">
              Annuler
            </ActionButton>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import { Copy as CopyIcon, QrCode as QRCodeIcon, LogOut as LogOutIcon, Crown as CrownIcon, UserX as UserXIcon } from 'lucide-vue-next';
import QRCode from 'qrcode';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import ChatBox from '@/components/Chat/ChatBox.vue';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const gameStore = useGameStore();
const authStore = useAuthStore();
const qrCodeContainer = ref(null);
const copied = ref(false);
const showQrCode = ref(false);
const previousPlayers = ref([]);
const selectedPlayer = ref(null);

const gameCode = computed(() => gameStore.currentGame?.code || route.params.code || '');
const playerLimit = computed(() => gameStore.currentGame?.config?.player_count || 8);

const allReady = computed(() => {
  const host = gameStore.players.find(p => p.is_host);
  return gameStore.players.every(p => isPlayerReady(p) || p.id === host?.id);
});

const canStart = computed(() => gameStore.isHost && gameStore.players.length >= 4 && allReady.value);
const isMeReady = computed(() => isPlayerReady(gameStore.currentPlayer));

// Détecter si c'est une partie de test
const isTestGame = computed(() => {
  return gameStore.currentGame?.config?.is_test === true;
});

const startButtonText = computed(() => {
  if (gameStore.players.length < 4) return `Joueurs (${gameStore.players.length}/4)`;
  if (!allReady.value) return "En attente...";
  return "Lancer la Partie";
});

function isPlayerReady(player) {
  return player?.metadata?.is_ready === true;
}

async function toggleReady() {
  await gameStore.toggleReady();
}

async function startGame() {
  if (!canStart.value) return;
  const success = await gameStore.startGame();
  if (success) {
    router.push({ name: 'game', params: { id: gameStore.currentGame.id } });
  }
}

function handlePlayerCardClick(player) {
  // Seulement si l'utilisateur est l'hôte et que ce n'est pas lui-même
  if (gameStore.isHost && player.user_id !== authStore.user?.id) {
    selectedPlayer.value = player;
  }
}

async function handleTransferHost() {
  if (!selectedPlayer.value || !gameStore.currentGame) return;
  
  try {
    const response = await axios.post(`/games/${gameStore.currentGame.id}/transfer-host`, {
      user_id: selectedPlayer.value.user_id
    });
    
    if (response.data.success) {
      if (window.showNotification) {
        window.showNotification(`Le rôle d'hôte a été transféré à ${selectedPlayer.value.user?.name}`, 'success');
      }
      selectedPlayer.value = null;
    }
  } catch (error) {
    console.error('Error transferring host:', error);
    if (window.showNotification) {
      window.showNotification(error.response?.data?.message || 'Erreur lors du transfert d\'hôte', 'error');
    }
  }
}

async function handleKickPlayer() {
  if (!selectedPlayer.value || !gameStore.currentGame) return;
  
  if (!confirm(`Êtes-vous sûr de vouloir exclure ${selectedPlayer.value.user?.name} du lobby ?`)) {
    return;
  }
  
  try {
    const response = await axios.post(`/games/${gameStore.currentGame.id}/kick-player`, {
      user_id: selectedPlayer.value.user_id
    });
    
    if (response.data.success) {
      if (window.showNotification) {
        window.showNotification(`${selectedPlayer.value.user?.name} a été exclu du lobby`, 'info');
      }
      selectedPlayer.value = null;
      
      // Si le jeu a été supprimé, rediriger vers home
      if (response.data.game_deleted) {
        router.push({ name: 'home' });
      }
    }
  } catch (error) {
    console.error('Error kicking player:', error);
    if (window.showNotification) {
      window.showNotification(error.response?.data?.message || 'Erreur lors de l\'exclusion', 'error');
    }
  }
}

async function handleLeave() {
  if (!gameStore.currentGame) {
    router.push({ name: 'home' });
    return;
  }
  
  try {
    await gameStore.leaveGame();
    router.push({ name: 'home' });
  } catch (error) {
    console.error('Error leaving game:', error);
    router.push({ name: 'home' });
  }
}

async function handleCopy() {
  if (!gameCode.value) return;
  
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(gameCode.value);
      copied.value = true;
      setTimeout(() => { copied.value = false; }, 2000);
      return;
    }
    
    const textArea = document.createElement('textarea');
    textArea.value = gameCode.value;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      const successful = document.execCommand('copy');
      if (successful) {
        copied.value = true;
        setTimeout(() => { copied.value = false; }, 2000);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    
    document.body.removeChild(textArea);
  } catch (error) {
    console.error('Error copying to clipboard:', error);
  }
}

async function generateQRCode() {
  if (gameStore.currentGame && qrCodeContainer.value) {
    try {
      const qrUrl = `${window.location.origin}/join/${gameStore.currentGame.code}`;
      const canvas = await QRCode.toCanvas(qrUrl, { width: 200, margin: 1 });
      qrCodeContainer.value.innerHTML = '';
      qrCodeContainer.value.appendChild(canvas);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  }
}

watch(showQrCode, (newValue) => {
  if (newValue) {
    setTimeout(generateQRCode, 50);
  }
});

// Watch for game status changes - redirect when game starts
watch(() => gameStore.currentGame?.status, (newStatus, oldStatus) => {
  if (!gameStore.currentGame) return;
  
  // Si le jeu est supprimé, rediriger vers home
  if (!gameStore.currentGame.id) {
    router.push({ name: 'home' });
    return;
  }
  
  // Si le statut passe de 'lobby' à autre chose, rediriger vers la partie
  if (oldStatus === 'lobby' && newStatus && newStatus !== 'lobby') {
    router.push({ name: 'game', params: { id: gameStore.currentGame.id } });
  }
}, { immediate: false });

// Watch for player changes to add system messages
watch(() => gameStore.players, (newPlayers, oldPlayers) => {
  if (!oldPlayers.length || !gameStore.currentGame) return;
  
  const oldPlayerIds = oldPlayers.map(p => p.id);
  const newPlayerIds = newPlayers.map(p => p.id);
  
  // Player joined
  newPlayers.forEach(player => {
    if (!oldPlayerIds.includes(player.id) && player.user_id !== authStore.user?.id) {
      gameStore.addSystemMessage(`🌟 ${player.user?.name || 'Joueur'} a rejoint la partie`, 'lobby');
    }
  });
  
  // Player left
  oldPlayers.forEach(player => {
    if (!newPlayerIds.includes(player.id) && player.user_id !== authStore.user?.id) {
      gameStore.addSystemMessage(`👋 ${player.user?.name || 'Joueur'} a quitté la partie`, 'lobby');
    }
  });
  
  // Player ready status changed
  newPlayers.forEach(newPlayer => {
    const oldPlayer = oldPlayers.find(p => p.id === newPlayer.id);
    if (oldPlayer) {
      const wasReady = isPlayerReady(oldPlayer);
      const isReadyNow = isPlayerReady(newPlayer);
      
      if (!wasReady && isReadyNow && newPlayer.user_id !== authStore.user?.id) {
        gameStore.addSystemMessage(`✅ ${newPlayer.user?.name || 'Joueur'} est prêt`, 'lobby');
      } else if (wasReady && !isReadyNow && newPlayer.user_id !== authStore.user?.id) {
        gameStore.addSystemMessage(`⏸️ ${newPlayer.user?.name || 'Joueur'} n'est plus prêt`, 'lobby');
      }
    }
  });
}, { deep: true });

  onMounted(async () => {
    const code = route.params.code;
    if (!gameStore.currentGame || gameStore.currentGame.code !== code) {
      await gameStore.joinGame(code);
    }
    
    // S'abonner aux channels WebSocket une fois le jeu chargé
    if (gameStore.currentGame) {
      gameStore.joinGameChannel(gameStore.currentGame.id);
      gameStore.joinChatChannel('lobby');
    }

    previousPlayers.value = [...gameStore.players];
    
    // Si c'est une partie de test, démarrer automatiquement après 2 secondes
    if (isTestGame.value && canStart.value) {
      setTimeout(() => {
        if (gameStore.isHost && gameStore.currentGame?.status === 'lobby') {
          startGame();
        }
      }, 2000);
    }
  });

onUnmounted(() => {
  // Cleanup if needed
});
</script>

<style scoped>
.lobby-view {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  position: relative;
  display: flex;
  flex-direction: column;
  background: var(--color-midnight-blue);
  overflow: hidden;
}

.lobby-background {
  position: absolute;
  inset: 0;
  z-index: 0;
}

.background-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.2;
}

.background-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, var(--color-midnight-blue), transparent, var(--color-midnight-blue));
}

.lobby-content {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}

/* Header */
.lobby-header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: var(--color-glass-surface);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--color-glass-border);
  gap: 0.75rem;
}

.code-section {
  flex: 1;
  min-width: 0;
}

.code-label {
  font-family: var(--font-sans);
  font-size: 0.625rem;
  color: rgba(254, 243, 199, 0.6);
  margin-bottom: 0.25rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.code-display {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.code-display:active {
  transform: scale(0.98);
}

.code-text {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-soft-gold);
  letter-spacing: 0.1em;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
  margin: 0;
}

.copy-icon {
  width: 0.875rem;
  height: 0.875rem;
  color: rgba(254, 243, 199, 0.7);
  transition: color 0.2s ease;
  flex-shrink: 0;
}

.copy-icon.copied {
  color: #48BB78;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.qr-button,
.leave-button {
  flex-shrink: 0;
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.qr-button {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  color: var(--color-soft-gold);
}

.qr-button:active {
  transform: scale(0.95);
  background: rgba(245, 158, 11, 0.2);
}

.leave-button {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.leave-button:active {
  transform: scale(0.95);
  background: rgba(239, 68, 68, 0.2);
}

.qr-icon,
.leave-icon {
  width: 1.25rem;
  height: 1.25rem;
}

/* Players Section */
.players-section {
  flex-shrink: 0;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-bottom: 1px solid var(--color-glass-border);
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
}

.players-section::-webkit-scrollbar {
  height: 4px;
}

.players-section::-webkit-scrollbar-track {
  background: transparent;
}

.players-section::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
}

.players-scroll {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-width: min-content;
}

.empty-slot {
  flex-shrink: 0;
  width: 3rem;
  height: 4rem;
  border-radius: 0.75rem;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.2);
}

.empty-text {
  color: rgba(254, 243, 199, 0.2);
  font-size: 1.5rem;
  font-family: var(--font-sans);
}

/* Chat Main */
.chat-main {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}

/* Footer */
.lobby-footer {
  flex-shrink: 0;
  padding: 1rem;
  background: var(--color-glass-surface);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid var(--color-glass-border);
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
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-cream);
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  margin: 0 0 1rem 0;
}

.qr-code-container {
  display: flex;
  justify-content: center;
  background: white;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.modal-subtitle {
  color: rgba(254, 243, 199, 0.6);
  font-size: 0.75rem;
  text-align: center;
  font-family: var(--font-sans);
  margin: 0;
}

.modal-actions {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.75rem;
}

.player-actions-modal .modal-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.action-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 1rem;
  background: rgba(17, 24, 39, 0.5);
  border: 2px solid var(--color-glass-border);
  border-radius: 0.5rem;
  color: var(--color-text-light);
  font-family: var(--font-sans);
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
}

.action-option:hover {
  background: rgba(17, 24, 39, 0.7);
  border-color: var(--color-soft-gold);
  color: var(--color-cream);
}

.action-option.danger {
  border-color: rgba(239, 68, 68, 0.5);
}

.action-option.danger:hover {
  background: rgba(239, 68, 68, 0.1);
  border-color: var(--color-blood-red);
  color: var(--color-blood-red);
}

.action-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

/* Modal Animation */
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

/* Responsive - Mobile First */
@media (min-width: 375px) and (max-width: 414px) {
  .lobby-header {
    padding: 0.875rem 1rem;
  }
  
  .code-text {
    font-size: 1.75rem;
    letter-spacing: 0.12em;
  }
  
  .players-section {
    padding: 0.875rem 1rem;
  }
}

@media (min-width: 640px) {
  .lobby-header {
    padding: 1rem 1.5rem;
  }
  
  .code-text {
    font-size: 2rem;
    letter-spacing: 0.15em;
  }
  
  .code-label {
    font-size: 0.75rem;
  }
  
  .players-section {
    padding: 1rem 1.5rem;
  }
  
  .players-scroll {
    gap: 1rem;
  }
  
  .empty-slot {
    width: 4rem;
    height: 5.33rem;
  }
  
  .lobby-footer {
    padding: 1.25rem 1.5rem;
  }
}

@media (min-width: 768px) and (max-width: 1023px) {
  .lobby-header {
    padding: 1.125rem 1.75rem;
  }
  
  .code-text {
    font-size: 2.25rem;
  }
  
  .players-section {
    padding: 1.125rem 1.75rem;
  }
}

@media (min-width: 1024px) {
  .lobby-header {
    padding: 1.25rem 2rem;
  }
  
  .code-text {
    font-size: 2.5rem;
    letter-spacing: 0.2em;
  }
  
  .players-section {
    padding: 1.25rem 2rem;
  }
  
  .lobby-footer {
    padding: 1.5rem 2rem;
  }
}

/* Très petits écrans */
@media (max-width: 360px) {
  .lobby-header {
    padding: 0.625rem 0.75rem;
  }
  
  .code-text {
    font-size: 1.25rem;
    letter-spacing: 0.08em;
  }
  
  .code-label {
    font-size: 0.5625rem;
  }
  
  .qr-button,
  .leave-button {
    width: 2.25rem;
    height: 2.25rem;
  }
  
  .qr-icon,
  .leave-icon {
    width: 1.125rem;
    height: 1.125rem;
  }
  
  .players-section {
    padding: 0.625rem 0.75rem;
  }
  
  .players-scroll {
    gap: 0.5rem;
  }
  
  .empty-slot {
    width: 2.75rem;
    height: 3.67rem;
  }
  
  .lobby-footer {
    padding: 0.875rem;
  }
  
  .modal-content {
    padding: 1rem;
  }
  
  .modal-title {
    font-size: 1.125rem;
  }
}

@media (max-width: 320px) {
  .lobby-header {
    padding: 0.5rem;
    flex-wrap: wrap;
  }
  
  .code-text {
    font-size: 1rem;
  }
  
  .qr-button,
  .leave-button {
    width: 2rem;
    height: 2rem;
  }
  
  .players-section {
    padding: 0.5rem;
  }
  
  .chat-main {
    min-height: 200px;
  }
}

/* Firefox scrollbar pour players-section */
.players-section {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

/* Prefers-reduced-motion */
@media (prefers-reduced-motion: reduce) {
  .modal-enter-active .modal-content,
  .modal-leave-active .modal-content {
    transition: opacity 0.01ms;
  }
}
</style>
