<!-- js/views/LobbyView.vue -->
<template>
  <div class="h-screen w-full flex flex-col bg-black text-white overflow-hidden">
    <!-- Header: Code & Actions -->
    <header class="flex-shrink-0 border-b-2 border-white p-4 flex items-center justify-between bg-black">
      <div class="flex flex-col">
        <span class="text-mono text-[10px] text-gray-500 uppercase tracking-widest">Operation Code</span>
        <div class="flex items-center gap-2 cursor-pointer group" @click="handleCopy">
          <h1 class="text-display text-4xl text-white group-hover:text-red-600 transition-colors">
            {{ gameCode }}
          </h1>
          <CopyIcon class="w-4 h-4 text-gray-600 group-hover:text-white" :class="{ 'text-green-500': copied }" />
        </div>
      </div>

      <div class="flex gap-2">
        <button class="btn-brutal w-10 h-10 p-0 flex items-center justify-center border-gray-600 hover:border-white" @click="showQrCode = true">
          <QRCodeIcon class="w-5 h-5" />
        </button>
        <button class="btn-brutal w-10 h-10 p-0 flex items-center justify-center border-red-900 text-red-900 hover:bg-red-900 hover:text-black hover:border-red-900" @click="handleLeave">
          <LogOutIcon class="w-5 h-5" />
        </button>
      </div>
    </header>

    <!-- Players Strip -->
    <section class="flex-shrink-0 border-b-2 border-white bg-gray-900 overflow-x-auto">
      <div class="flex p-4 gap-4 min-w-min">
        <PlayerCard
          v-for="player in gameStore.players"
          :key="player.id"
          :name="player.user?.name || 'UNKNOWN'"
          :status="isPlayerReady(player) ? 'ready' : 'waiting'"
          :is-host="player.is_host"
          size="small"
          class="flex-shrink-0 w-32"
          @click="handlePlayerCardClick(player)"
        />
        <!-- Empty Slots -->
        <div
          v-for="i in Math.max(0, playerLimit - gameStore.players.length)"
          :key="`empty-${i}`"
          class="flex-shrink-0 w-32 h-40 border-2 border-dashed border-gray-800 flex items-center justify-center"
        >
          <span class="text-mono text-gray-800 text-2xl">...</span>
        </div>
      </div>
    </section>

    <!-- Main Chat Area -->
    <main class="flex-1 min-h-0 bg-black relative">
      <div class="absolute inset-0 p-2">
        <ChatBox channel="lobby" :is-visible="true" :show-quick-reactions="false" />
      </div>
    </main>

    <!-- Footer Actions -->
    <footer class="flex-shrink-0 border-t-2 border-white p-4 bg-black">
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
    <div v-if="showQrCode" class="fixed inset-0 bg-black/95 flex items-center justify-center z-50 p-4" @click="showQrCode = false">
      <div class="panel-brutal bg-white text-black border-2 border-white max-w-sm w-full" @click.stop>
        <h3 class="text-display text-xl mb-4 text-center">SCAN FOR ACCESS</h3>
        <div ref="qrCodeContainer" class="flex justify-center mb-4 p-4 border-2 border-black"></div>
        <p class="text-mono text-xs text-center uppercase">Share this code with other agents</p>
      </div>
    </div>

    <!-- Player Actions Modal -->
    <div v-if="selectedPlayer" class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4" @click="selectedPlayer = null">
      <div class="panel-brutal max-w-sm w-full border-red-600 shadow-[8px_8px_0_#ff0000]" @click.stop>
        <h3 class="text-display text-xl mb-6 border-b border-red-900 pb-2">
          TARGET: {{ selectedPlayer?.user?.name || 'UNKNOWN' }}
        </h3>
        <div class="flex flex-col gap-3 mb-6">
          <button
            class="flex items-center gap-4 p-3 border border-gray-600 hover:bg-white hover:text-black hover:border-white transition-colors text-left"
            @click="handleTransferHost"
          >
            <CrownIcon class="w-5 h-5" />
            <span class="text-mono text-sm uppercase">Transfer Command</span>
          </button>
          <button
            class="flex items-center gap-4 p-3 border border-red-900 text-red-600 hover:bg-red-600 hover:text-black transition-colors text-left"
            @click="handleKickPlayer"
          >
            <UserXIcon class="w-5 h-5" />
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
  // System messages logic kept but simplified
  if (!oldPlayers.length || !gameStore.currentGame) return;
  const oldPlayerIds = oldPlayers.map(p => p.id);
  const newPlayerIds = newPlayers.map(p => p.id);
  
  newPlayers.forEach(player => {
    if (!oldPlayerIds.includes(player.id) && player.user_id !== authStore.user?.id) {
      gameStore.addSystemMessage(`AGENT ${player.user?.name || 'UNKNOWN'} CONNECTED`, 'lobby');
    }
  });
  
  oldPlayers.forEach(player => {
    if (!newPlayerIds.includes(player.id) && player.user_id !== authStore.user?.id) {
      gameStore.addSystemMessage(`AGENT ${player.user?.name || 'UNKNOWN'} DISCONNECTED`, 'lobby');
    }
  });

  newPlayers.forEach(newPlayer => {
    const oldPlayer = oldPlayers.find(p => p.id === newPlayer.id);
    if (oldPlayer) {
      const wasReady = isPlayerReady(oldPlayer);
      const isReadyNow = isPlayerReady(newPlayer);
      if (!wasReady && isReadyNow && newPlayer.user_id !== authStore.user?.id) {
        gameStore.addSystemMessage(`AGENT ${newPlayer.user?.name || 'UNKNOWN'} IS READY`, 'lobby');
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
