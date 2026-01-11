<!-- js/views/LobbyView.vue -->
<template>
  <div class="lobby-view h-full flex flex-col bg-black text-white relative">
    <!-- Header: Code & Actions -->
    <header class="flex-shrink-0 border-b border-gray-800 p-3 flex items-center justify-between bg-black z-10">
      <div class="flex flex-col">
        <span class="text-mono text-[10px] text-gray-500 uppercase tracking-widest mb-1">Operation Code</span>
        <div class="flex items-center gap-3 cursor-pointer group" @click="handleCopy">
          <h1 class="text-display text-3xl sm:text-4xl text-white group-hover:text-red-600 transition-colors leading-none">
            {{ gameCode }}
          </h1>
          <CopyIcon class="w-4 h-4 text-gray-600 group-hover:text-white" :class="{ 'text-green-500': copied }" />
        </div>
      </div>

      <div class="flex gap-2">
        <button class="w-10 h-10 flex items-center justify-center border border-gray-800 hover:border-white bg-gray-900 transition-colors" @click="showQrCode = true">
          <QRCodeIcon class="w-5 h-5 text-white" />
        </button>
        <button class="w-10 h-10 flex items-center justify-center border border-red-900/30 text-red-700 hover:bg-red-900 hover:text-white transition-colors" @click="handleLeave">
          <LogOutIcon class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- Players Strip (Horizontal Scroll) -->
    <section class="flex-shrink-0 border-b border-gray-800 bg-gray-900/30 overflow-x-auto overflow-y-hidden whitespace-nowrap py-3 px-2">
      <div class="inline-flex gap-3">
        <div v-for="player in gameStore.players" :key="player.id" class="w-24 flex-shrink-0">
            <PlayerCard
              :name="player.user?.name || 'UNKNOWN'"
              :status="isPlayerReady(player) ? 'ready' : 'waiting'"
              :is-host="player.is_host"
              size="small"
              class="w-full"
              @click="handlePlayerCardClick(player)"
            />
        </div>
        <!-- Empty Slots -->
        <div
          v-for="i in Math.max(0, playerLimit - gameStore.players.length)"
          :key="`empty-${i}`"
          class="w-24 h-32 flex-shrink-0 border border-dashed border-gray-800 flex items-center justify-center opacity-50"
        >
          <span class="text-mono text-gray-600 text-xl">...</span>
        </div>
      </div>
    </section>

    <!-- Main Chat Area -->
    <main class="flex-1 min-h-0 relative">
      <div class="absolute inset-0 pb-0">
        <ChatBox channel="lobby" :is-visible="true" :show-quick-reactions="false" />
      </div>
    </main>

    <!-- Footer Actions -->
    <footer class="flex-shrink-0 border-t border-gray-800 p-4 bg-black z-20">
      <ActionButton
        v-if="gameStore.isHost"
        :variant="canStart ? 'primary' : 'disabled'"
        size="lg"
        :full-width="true"
        :disabled="!canStart"
        @click="startGame"
      >
        {{ startButtonText.toUpperCase() }}
      </ActionButton>
      <ActionButton
        v-else
        :variant="isMeReady ? 'secondary' : 'primary'"
        size="lg"
        :full-width="true"
        @click="toggleReady"
      >
        {{ isMeReady ? "STANDBY..." : "CONFIRM READINESS" }}
      </ActionButton>
    </footer>

    <!-- QR Modal -->
    <div v-if="showQrCode" class="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-6" @click="showQrCode = false">
      <div class="panel-brutal bg-white text-black border-2 border-white max-w-sm w-full" @click.stop>
        <h3 class="text-display text-xl mb-4 text-center">SCAN FOR ACCESS</h3>
        <div ref="qrCodeContainer" class="flex justify-center mb-4 p-4 border-2 border-black"></div>
        <p class="text-mono text-xs text-center uppercase mb-4">Share with other agents</p>
        <button @click="showQrCode = false" class="btn-brutal bg-black text-white w-full text-sm">CLOSE</button>
      </div>
    </div>

    <!-- Player Actions Modal -->
    <div v-if="selectedPlayer" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-6" @click="selectedPlayer = null">
      <div class="panel-brutal max-w-sm w-full border-red-600 shadow-[8px_8px_0_#ff0000]" @click.stop>
        <h3 class="text-display text-xl mb-6 border-b border-red-900 pb-2">
          TARGET: {{ selectedPlayer?.user?.name || 'UNKNOWN' }}
        </h3>
        <div class="flex flex-col gap-3 mb-6">
          <button
            class="flex items-center gap-4 p-4 border border-gray-600 hover:bg-white hover:text-black hover:border-white transition-colors text-left"
            @click="handleTransferHost"
          >
            <CrownIcon class="w-5 h-5 flex-shrink-0" />
            <span class="text-mono text-sm uppercase">Transfer Command</span>
          </button>
          <button
            class="flex items-center gap-4 p-4 border border-red-900 text-red-600 hover:bg-red-600 hover:text-black transition-colors text-left"
            @click="handleKickPlayer"
          >
            <UserXIcon class="w-5 h-5 flex-shrink-0" />
            <span class="text-mono text-sm uppercase">Eject from Lobby</span>
          </button>
        </div>
        <ActionButton variant="secondary" @click="selectedPlayer = null">
          CANCEL
        </ActionButton>
      </div>
    </div>
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
const selectedPlayer = ref(null);

const gameCode = computed(() => gameStore.currentGame?.code || route.params.code || '');
const playerLimit = computed(() => gameStore.currentGame?.config?.player_count || 8);

const allReady = computed(() => {
  const host = gameStore.players.find(p => p.is_host);
  return gameStore.players.every(p => isPlayerReady(p) || p.id === host?.id);
});

const canStart = computed(() => gameStore.isHost && gameStore.players.length >= 4 && allReady.value);
const isMeReady = computed(() => isPlayerReady(gameStore.currentPlayer));
const isTestGame = computed(() => gameStore.currentGame?.config?.is_test === true);

const startButtonText = computed(() => {
  if (gameStore.players.length < 4) return `WAITING AGENTS (${gameStore.players.length}/4)`;
  if (!allReady.value) return "WAITING READINESS...";
  return "INITIATE SEQUENCE";
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
      if (window.showNotification) window.showNotification(`COMMAND TRANSFERRED TO ${selectedPlayer.value.user?.name}`, 'success');
      selectedPlayer.value = null;
    }
  } catch (error) {
    if (window.showNotification) window.showNotification('TRANSFER FAILED', 'error');
  }
}

async function handleKickPlayer() {
  if (!selectedPlayer.value || !gameStore.currentGame) return;
  if (!confirm(`CONFIRM EJECTION OF ${selectedPlayer.value.user?.name}?`)) return;
  
  try {
    const response = await axios.post(`/games/${gameStore.currentGame.id}/kick-player`, {
      user_id: selectedPlayer.value.user_id
    });
    if (response.data.success) {
      if (window.showNotification) window.showNotification(`${selectedPlayer.value.user?.name} EJECTED`, 'info');
      selectedPlayer.value = null;
      if (response.data.game_deleted) router.push({ name: 'home' });
    }
  } catch (error) {
    if (window.showNotification) window.showNotification('EJECTION FAILED', 'error');
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
  } catch (error) {}
}

async function generateQRCode() {
  if (gameStore.currentGame && qrCodeContainer.value) {
    try {
      const qrUrl = `${window.location.origin}/join/${gameStore.currentGame.code}`;
      const canvas = await QRCode.toCanvas(qrUrl, { width: 200, margin: 1 });
      qrCodeContainer.value.innerHTML = '';
      qrCodeContainer.value.appendChild(canvas);
    } catch (error) { console.error(error); }
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
  // System messages logic...
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
