<!-- js/views/LobbyView.vue -->
<template>
  <div class="lobby-view">
    <!-- Background -->
    <div class="absolute inset-0 bg-gradient-to-b from-slate-950 via-indigo-950/80 to-slate-950">
      <!-- Ambient orbs -->
      <div class="absolute top-20 left-10 w-32 h-32 bg-amber-500/10 rounded-full filter blur-3xl"></div>
      <div class="absolute bottom-40 right-20 w-48 h-48 bg-violet-500/10 rounded-full filter blur-3xl"></div>
    </div>

    <!-- Header: Code & Actions -->
    <header class="relative z-10 flex-shrink-0 p-4 md:p-6">
      <div class="glass-card p-4 flex items-center justify-between">
        <div class="flex flex-col">
          <span class="text-slate-500 text-xs uppercase tracking-wider mb-1">Code de la partie</span>
          <div class="flex items-center gap-3 cursor-pointer group" @click="handleCopy">
            <h1 class="text-cinzel text-3xl md:text-4xl text-amber-400 tracking-wider group-hover:text-amber-300 transition-colors">
              {{ gameCode }}
            </h1>
            <div class="p-2 rounded-lg bg-slate-800/50 group-hover:bg-amber-500/20 transition-colors">
              <CopyIcon class="w-4 h-4" :class="copied ? 'text-emerald-400' : 'text-slate-400 group-hover:text-amber-400'" />
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <button 
            class="p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-violet-500/50 text-slate-400 hover:text-violet-400 transition-all"
            @click="showQrCode = true"
          >
            <QRCodeIcon class="w-5 h-5" />
          </button>
          <button 
            class="p-3 rounded-xl bg-slate-800/50 border border-red-900/50 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
            @click="handleLeave"
          >
            <LogOutIcon class="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>

    <!-- Players Grid -->
    <section class="relative z-10 flex-shrink-0 px-4 md:px-6 mb-4">
      <div class="glass-card p-4">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-slate-300 text-sm font-medium uppercase tracking-wider flex items-center gap-2">
            <UsersIcon class="w-4 h-4 text-amber-400" />
            Joueurs ({{ gameStore.players.length }}/{{ playerLimit }})
          </h2>
          <div class="text-slate-500 text-xs">
            {{ readyCount }}/{{ gameStore.players.length }} prêts
          </div>
        </div>
        
        <div class="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          <PlayerCard
            v-for="player in gameStore.players"
            :key="player.id"
            :name="player.user?.name || 'Inconnu'"
            :status="isPlayerReady(player) ? 'ready' : 'waiting'"
            :is-host="player.is_host"
            size="small"
            class="flex-shrink-0"
            @click="handlePlayerCardClick(player)"
          />
          <!-- Empty Slots -->
          <div
            v-for="i in Math.max(0, playerLimit - gameStore.players.length)"
            :key="`empty-${i}`"
            class="flex-shrink-0 w-24 h-32 rounded-xl border-2 border-dashed border-slate-700/50 flex flex-col items-center justify-center gap-2"
          >
            <UserPlusIcon class="w-6 h-6 text-slate-700" />
            <span class="text-slate-700 text-xs">En attente</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Main Chat Area -->
    <main class="relative z-10 flex-1 min-h-0 px-4 md:px-6 pb-4">
      <div class="h-full">
        <ChatBox channel="lobby" :is-visible="true" :show-quick-reactions="false" />
      </div>
    </main>

    <!-- Footer Actions -->
    <footer class="relative z-10 flex-shrink-0 px-4 md:px-6 pb-6">
      <div class="glass-card p-4">
        <ActionButton
          v-if="gameStore.isHost"
          :variant="canStart ? 'primary' : 'disabled'"
          size="lg"
          :full-width="true"
          :disabled="!canStart"
          :glow="canStart"
          @click="startGame"
        >
          <span class="flex items-center justify-center gap-2">
            <PlayIcon class="w-5 h-5" />
            {{ startButtonText }}
          </span>
        </ActionButton>
        <ActionButton
          v-else
          :variant="isMeReady ? 'emerald' : 'primary'"
          size="lg"
          :full-width="true"
          :glow="!isMeReady"
          @click="toggleReady"
        >
          <span class="flex items-center justify-center gap-2">
            <CheckIcon v-if="isMeReady" class="w-5 h-5" />
            <ClockIcon v-else class="w-5 h-5" />
            {{ isMeReady ? "Prêt !" : "Je suis prêt" }}
          </span>
        </ActionButton>
      </div>
    </footer>

    <!-- QR Code Modal -->
    <Teleport to="body">
      <div v-if="showQrCode" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="showQrCode = false">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        <div class="relative glass-card p-6 max-w-sm w-full text-center">
          <button @click="showQrCode = false" class="absolute top-4 right-4 text-slate-400 hover:text-white">
            <XIcon class="w-5 h-5" />
          </button>
          <h3 class="text-cinzel text-xl text-amber-400 mb-4">Inviter des joueurs</h3>
          <div ref="qrCodeContainer" class="flex justify-center mb-4 p-4 bg-white rounded-xl"></div>
          <p class="text-slate-400 text-sm">Scannez ce code pour rejoindre</p>
        </div>
      </div>
    </Teleport>

    <!-- Player Actions Modal -->
    <Teleport to="body">
      <div v-if="selectedPlayer" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="selectedPlayer = null">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        <div class="relative glass-card p-6 max-w-sm w-full">
          <button @click="selectedPlayer = null" class="absolute top-4 right-4 text-slate-400 hover:text-white">
            <XIcon class="w-5 h-5" />
          </button>
          
          <h3 class="text-lg font-medium text-white mb-6">
            {{ selectedPlayer?.user?.name || 'Joueur' }}
          </h3>
          
          <div class="flex flex-col gap-3 mb-6">
            <button
              class="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all text-left"
              @click="handleTransferHost"
            >
              <CrownIcon class="w-5 h-5 text-amber-400" />
              <span class="text-slate-300">Transférer l'hôte</span>
            </button>
            <button
              class="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-red-900/50 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition-all text-left"
              @click="handleKickPlayer"
            >
              <UserXIcon class="w-5 h-5" />
              <span>Exclure</span>
            </button>
          </div>
          
          <ActionButton variant="secondary" @click="selectedPlayer = null" :full-width="true">
            Annuler
          </ActionButton>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { useAuthStore } from '@/stores/authStore';
import { 
  Copy as CopyIcon, 
  QrCode as QRCodeIcon, 
  LogOut as LogOutIcon, 
  Crown as CrownIcon, 
  UserX as UserXIcon, 
  Users as UsersIcon,
  UserPlus as UserPlusIcon,
  Play as PlayIcon,
  Check as CheckIcon,
  Clock as ClockIcon,
  X as XIcon
} from 'lucide-vue-next';
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

const readyCount = computed(() => {
  return gameStore.players.filter(p => isPlayerReady(p) || p.is_host).length;
});

const allReady = computed(() => {
  const host = gameStore.players.find(p => p.is_host);
  return gameStore.players.every(p => isPlayerReady(p) || p.id === host?.id);
});

const canStart = computed(() => gameStore.isHost && gameStore.players.length >= 4 && allReady.value);
const isMeReady = computed(() => isPlayerReady(gameStore.currentPlayer));
const isTestGame = computed(() => gameStore.currentGame?.config?.is_test === true);

const startButtonText = computed(() => {
  if (gameStore.players.length < 4) return `En attente (${gameStore.players.length}/4)`;
  if (!allReady.value) return "En attente des joueurs...";
  return "Lancer la partie";
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
      if (window.showNotification) window.showNotification(`Hôte transféré à ${selectedPlayer.value.user?.name}`, 'success');
      selectedPlayer.value = null;
    }
  } catch (error) {
    if (window.showNotification) window.showNotification('Erreur lors du transfert', 'error');
  }
}

async function handleKickPlayer() {
  if (!selectedPlayer.value || !gameStore.currentGame) return;
  if (!confirm(`Exclure ${selectedPlayer.value.user?.name} ?`)) return;
  
  try {
    const response = await axios.post(`/games/${gameStore.currentGame.id}/kick-player`, {
      user_id: selectedPlayer.value.user_id
    });
    if (response.data.success) {
      if (window.showNotification) window.showNotification(`${selectedPlayer.value.user?.name} exclu`, 'info');
      selectedPlayer.value = null;
      if (response.data.game_deleted) router.push({ name: 'home' });
    }
  } catch (error) {
    if (window.showNotification) window.showNotification('Erreur', 'error');
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
    router.push({ name: 'home' });
  }
}

async function handleCopy() {
  if (!gameCode.value) return;
  try {
    await navigator.clipboard.writeText(gameCode.value);
    copied.value = true;
    setTimeout(() => { copied.value = false; }, 2000);
    if (window.showNotification) window.showNotification('Code copié !', 'success');
  } catch (error) {
    // fallback
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
      console.error(error);
    }
  }
}

watch(showQrCode, (newValue) => {
  if (newValue) setTimeout(generateQRCode, 50);
});

watch(() => gameStore.currentGame?.status, (newStatus, oldStatus) => {
  if (!gameStore.currentGame) return;
  if (!gameStore.currentGame.id) { router.push({ name: 'home' }); return; }
  if (oldStatus === 'lobby' && newStatus && newStatus !== 'lobby') {
    router.push({ name: 'game', params: { id: gameStore.currentGame.id } });
  }
});

watch(() => gameStore.players, (newPlayers, oldPlayers) => {
  if (!oldPlayers.length || !gameStore.currentGame) return;
  const oldPlayerIds = oldPlayers.map(p => p.id);
  const newPlayerIds = newPlayers.map(p => p.id);
  
  newPlayers.forEach(player => {
    if (!oldPlayerIds.includes(player.id) && player.user_id !== authStore.user?.id) {
      gameStore.addSystemMessage(`${player.user?.name || 'Quelqu\'un'} a rejoint`, 'lobby');
    }
  });
  
  oldPlayers.forEach(player => {
    if (!newPlayerIds.includes(player.id) && player.user_id !== authStore.user?.id) {
      gameStore.addSystemMessage(`${player.user?.name || 'Quelqu\'un'} est parti`, 'lobby');
    }
  });

  newPlayers.forEach(newPlayer => {
    const oldPlayer = oldPlayers.find(p => p.id === newPlayer.id);
    if (oldPlayer) {
      const wasReady = isPlayerReady(oldPlayer);
      const isReadyNow = isPlayerReady(newPlayer);
      if (!wasReady && isReadyNow && newPlayer.user_id !== authStore.user?.id) {
        gameStore.addSystemMessage(`${newPlayer.user?.name || 'Quelqu\'un'} est prêt`, 'lobby');
      }
    }
  });
}, { deep: true });

onMounted(async () => {
  const code = route.params.code;
  if (!gameStore.currentGame || gameStore.currentGame.code !== code) {
    await gameStore.joinGame(code);
  }
  if (gameStore.currentGame) {
    gameStore.joinGameChannel(gameStore.currentGame.id);
    gameStore.joinChatChannel('lobby');
  }
  if (isTestGame.value && canStart.value) {
    setTimeout(() => {
      if (gameStore.isHost && gameStore.currentGame?.status === 'lobby') startGame();
    }, 2000);
  }
});
</script>

<style scoped>
.lobby-view {
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  background: var(--color-bg-ink);
  color: var(--color-text-primary);
}

/* Background */
.lobby-view > div:first-child {
  position: absolute;
  inset: 0;
  background: var(--color-bg-ink);
}

.lobby-view > div:first-child::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--color-noise);
  opacity: 0.18;
  pointer-events: none;
}

.lobby-view > div:first-child > div:first-child,
.lobby-view > div:first-child > div:last-child {
  position: absolute;
  filter: blur(70px);
  border-radius: 9999px;
  opacity: 0.75;
}

.lobby-view > div:first-child > div:first-child {
  top: 5rem;
  left: 2.5rem;
  width: 9rem;
  height: 9rem;
  background: radial-gradient(circle, rgba(217, 119, 6, 0.35), transparent 60%);
}

.lobby-view > div:first-child > div:last-child {
  bottom: 10rem;
  right: 5rem;
  width: 12rem;
  height: 12rem;
  background: radial-gradient(circle, rgba(153, 27, 27, 0.3), transparent 60%);
}

/* Header */
.lobby-view header {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  padding: 1rem;
}

@media (min-width: 768px) {
  .lobby-view header { padding: 1.5rem; }
}

.lobby-view header > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border: 2px solid rgba(62, 47, 32, 0.45);
  border-radius: var(--radius-xl);
  background: linear-gradient(145deg, rgba(245, 245, 220, 0.14), rgba(245, 245, 220, 0.06));
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
}

.lobby-view header > div::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--color-noise);
  opacity: 0.25;
  mix-blend-mode: soft-light;
  pointer-events: none;
}

.lobby-view header > div > div:first-child {
  display: flex;
  flex-direction: column;
  gap: 0.1rem;
}

.lobby-view header > div > div:first-child > span {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.lobby-view header > div > div:first-child > div {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.lobby-view header > div > div:first-child > div > h1 {
  font-family: var(--font-cinzel);
  font-size: 2rem;
  color: var(--color-accent-paper);
  letter-spacing: 0.08em;
  text-shadow: var(--glow-gold);
  transition: color var(--transition-fast);
}

@media (min-width: 768px) {
  .lobby-view header > div > div:first-child > div > h1 { font-size: 2.4rem; }
}

.lobby-view header > div > div:first-child > div:hover > h1 {
  color: #fcd34d;
}

.lobby-view header > div > div:first-child > div > div {
  padding: 0.5rem;
  border-radius: 0.75rem;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(62, 47, 32, 0.35);
  transition: all var(--transition-fast);
}

.lobby-view header > div > div:first-child > div:hover > div {
  background: rgba(217, 119, 6, 0.18);
  border-color: rgba(217, 119, 6, 0.5);
}

.lobby-view header > div > div:last-child {
  display: flex;
  gap: 0.5rem;
  position: relative;
  z-index: 1;
}

.lobby-view header button {
  padding: 0.75rem;
  border-radius: 0.85rem;
  background: rgba(18, 18, 18, 0.85);
  border: 1px solid rgba(62, 47, 32, 0.4);
  color: var(--color-text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
}

.lobby-view header button:hover {
  border-color: rgba(217, 119, 6, 0.5);
  color: var(--color-accent-paper);
  background: rgba(217, 119, 6, 0.12);
}

.lobby-view header button:last-child {
  border-color: rgba(153, 27, 27, 0.55);
  color: #fca5a5;
}

.lobby-view header button:last-child:hover {
  background: rgba(153, 27, 27, 0.14);
  border-color: rgba(153, 27, 27, 0.65);
}

/* Section */
.lobby-view section {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  padding: 0 1rem;
  margin-bottom: 1rem;
}

@media (min-width: 768px) {
  .lobby-view section { padding: 0 1.5rem; }
}

.lobby-view section > div > div:first-child {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.lobby-view section > div > div:first-child > h2 {
  color: var(--color-accent-paper);
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.lobby-view section > div > div:first-child > div {
  color: var(--color-text-secondary);
  font-size: 0.8rem;
}

.lobby-view section > div > div:last-child {
  display: flex;
  gap: 0.75rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.lobby-view section > div > div:last-child > div {
  flex-shrink: 0;
  width: 6rem;
  height: 8rem;
  border-radius: 0.9rem;
  border: 2px dashed rgba(62, 47, 32, 0.55);
  background: rgba(26, 26, 26, 0.9);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.lobby-view section > div > div:last-child > div > span {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.75rem;
  text-align: center;
}

/* Main */
.lobby-view main {
  position: relative;
  z-index: 10;
  flex: 1;
  min-height: 0;
  padding: 0 1rem 1rem;
}

@media (min-width: 768px) {
  .lobby-view main { padding: 0 1.5rem 1rem; }
}

.lobby-view main > div { height: 100%; }

/* Footer */
.lobby-view footer {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  padding: 0 1rem 1.5rem;
}

@media (min-width: 768px) {
  .lobby-view footer { padding: 0 1.5rem 1.5rem; }
}

.lobby-view footer > div { padding: 1rem; }

.lobby-view footer button > span {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

/* Modal */
.lobby-view [class*="fixed"] {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.lobby-view [class*="fixed"] > div:first-child {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(6px);
}

.lobby-view [class*="fixed"] > div:last-child {
  position: relative;
  padding: 1.5rem;
  max-width: 24rem;
  width: 100%;
  text-align: center;
  border: 2px solid rgba(62, 47, 32, 0.45);
  border-radius: var(--radius-xl);
  background: linear-gradient(145deg, rgba(245, 245, 220, 0.14), rgba(245, 245, 220, 0.07));
  box-shadow: 0 22px 48px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(0, 0, 0, 0.25);
  overflow: hidden;
}

.lobby-view [class*="fixed"] > div:last-child::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--color-noise);
  opacity: 0.28;
  pointer-events: none;
  mix-blend-mode: soft-light;
}

.lobby-view [class*="fixed"] > div:last-child > button {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: var(--color-text-secondary);
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(62, 47, 32, 0.45);
  border-radius: 0.65rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.lobby-view [class*="fixed"] > div:last-child > button:hover {
  color: var(--color-accent-paper);
  background: rgba(217, 119, 6, 0.14);
  border-color: rgba(217, 119, 6, 0.5);
}

.lobby-view [class*="fixed"] > div:last-child > h3 {
  font-family: var(--font-cinzel);
  font-size: 1.35rem;
  color: var(--color-accent-paper);
  margin-bottom: 1rem;
  letter-spacing: 0.06em;
}

.lobby-view [class*="fixed"] > div:last-child > div {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.92);
  border-radius: 0.9rem;
}

.lobby-view [class*="fixed"] > div:last-child > p {
  color: var(--color-text-secondary);
  font-size: 0.9rem;
}

/* Player actions modal */
.lobby-view [class*="fixed"] > div:last-child > h3:not(:first-child) {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-accent-paper);
  margin-bottom: 1.5rem;
}

.lobby-view [class*="fixed"] > div:last-child > div:has(button) {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  background: transparent;
  padding: 0;
}

.lobby-view [class*="fixed"] > div:last-child > div:has(button) > button {
  position: static;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 0.85rem;
  background: rgba(26, 26, 26, 0.92);
  border: 1px solid rgba(62, 47, 32, 0.45);
  color: var(--color-text-primary);
  text-align: left;
  transition: all var(--transition-fast);
}

.lobby-view [class*="fixed"] > div:last-child > div:has(button) > button:hover {
  border-color: rgba(217, 119, 6, 0.6);
  background: rgba(217, 119, 6, 0.12);
}

.lobby-view [class*="fixed"] > div:last-child > div:has(button) > button:last-child {
  border-color: rgba(153, 27, 27, 0.55);
  color: #fca5a5;
}

.lobby-view [class*="fixed"] > div:last-child > div:has(button) > button:last-child:hover {
  background: rgba(153, 27, 27, 0.14);
  border-color: rgba(153, 27, 27, 0.65);
}

.text-cinzel {
  font-family: var(--font-cinzel);
}

.scrollbar-thin::-webkit-scrollbar { height: 4px; }
.scrollbar-thin::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
}
</style>
