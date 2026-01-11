<template>
  <div class="flex flex-col items-center justify-center min-h-screen p-4 w-full max-w-md mx-auto">
    <!-- Header -->
    <div class="text-center mb-12 w-full">
      <h1 class="text-display text-5xl text-white mb-2 tracking-tighter">WEREWOLF</h1>
      <div class="h-1 bg-red-600 w-full mb-2"></div>
      <div class="flex justify-between text-mono text-xs text-gray-500">
        <span>ONLINE_PROTOCOL_V2</span>
        <span class="animate-pulse text-green-500">SYSTEM_READY</span>
      </div>
    </div>

    <!-- Main Panel -->
    <div class="panel-brutal w-full">

      <!-- Not Logged In -->
      <div v-if="!authStore.user" class="flex flex-col gap-6 p-2">
        <div class="text-center border-b border-gray-800 pb-4">
            <span class="text-mono text-sm uppercase text-red-600 animate-pulse">Authentication Required</span>
        </div>
        <ActionButton
          variant="primary"
          :icon="UserCircleIcon"
          :loading="authStore.isLoading"
          @click="handleLogin"
        >
          CONNECT IDENTITY
        </ActionButton>
      </div>

      <!-- Logged In -->
      <div v-else class="flex flex-col gap-6">
        <!-- User Info -->
        <div class="flex items-center justify-between border-b-2 border-white pb-4 bg-gray-900 p-2">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 border-2 border-white bg-black text-white flex items-center justify-center font-display text-2xl">
              {{ authStore.user.name?.charAt(0)?.toUpperCase() || '?' }}
            </div>
            <div class="flex flex-col">
              <span class="text-display text-lg leading-none uppercase">{{ authStore.user.name || 'UNKNOWN' }}</span>
              <span class="text-mono text-xs text-green-500">ACCESS GRANTED</span>
            </div>
          </div>
          <button @click="handleLogout" class="hover:text-red-600 transition-colors border border-transparent hover:border-red-600 p-1">
            <LogOutIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-4">
          <ActionButton
            variant="primary"
            :icon="PlusIcon"
            :loading="isCreating"
            @click="showCreateGame = true"
          >
            INITIATE GAME
          </ActionButton>

          <div class="flex gap-0 pt-4 border-t border-gray-800">
            <input
              v-model="joinCode"
              type="text"
              placeholder="CODE"
              maxlength="5"
              class="flex-1 bg-black border-2 border-r-0 border-white p-3 text-center font-mono text-xl uppercase placeholder-gray-700 focus:outline-none focus:bg-gray-900 transition-colors"
              @keyup.enter="joinGame"
            />
            <button
              class="btn-brutal w-auto px-6 border-l-2"
              :disabled="!joinCode || joinCode.length < 4 || isJoining"
              @click="joinGame"
            >
              JOIN
            </button>
          </div>

          <div class="mt-4 text-center">
             <button @click="startTestGame" class="text-mono text-[10px] text-gray-700 hover:text-red-600 uppercase tracking-widest border border-transparent hover:border-red-600 px-2 py-1">
                > Execute Simulation Sequence
             </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Create Game -->
    <div v-if="showCreateGame" class="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50">
      <div class="panel-brutal w-full max-w-sm border-2 border-white shadow-[8px_8px_0_#ff0000]">
        <h3 class="text-display text-2xl mb-6 text-center border-b-2 border-red-600 pb-2">CONFIGURATION</h3>

        <div class="mb-8">
          <label class="block text-mono text-xs mb-3 text-gray-400">PLAYER COUNT</label>
          <div class="grid grid-cols-3 gap-0 border-2 border-white">
            <button 
                v-for="count in [8, 10, 12]"
                :key="count"
                @click="playerCount = count"
                class="p-3 text-mono font-bold text-lg transition-all border-r-2 border-white last:border-r-0 hover:bg-red-900/50"
                :class="playerCount === count ? 'bg-red-600 text-black' : 'bg-black text-white'"
            >
                {{ count }}
            </button>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <button @click="showCreateGame = false" class="btn-brutal text-sm border-gray-600 text-gray-500 hover:border-white hover:text-white">
            ABORT
          </button>
          <ActionButton variant="primary" :loading="isCreating" @click="createGame">
            CONFIRM
          </ActionButton>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useGameStore } from '@/stores/gameStore';
import { UserCircle as UserCircleIcon, LogOut as LogOutIcon, Plus as PlusIcon } from 'lucide-vue-next';
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
  if (success && window.showNotification) window.showNotification('IDENTITY VERIFIED', 'success');
  else if (window.showNotification) window.showNotification('ACCESS DENIED', 'error');
}

function handleLogout() {
  authStore.logout();
  gameStore.resetGame();
  if (window.showNotification) window.showNotification('SESSION TERMINATED', 'info');
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
      window.showNotification(result?.message || 'CONNECTION FAILED', 'error');
    }
  } finally {
    isJoining.value = false;
  }
}

async function startTestGame() {
  try {
    const response = await axios.post('/games/test', { player_count: 8 });
    if (response.data.success) {
      if (window.showNotification) window.showNotification('SIMULATION STARTED', 'success');
      router.push({ name: 'lobby', params: { code: response.data.game.code } });
    }
  } catch (error) {
      if(window.showNotification) window.showNotification('SIMULATION ERROR', 'error');
  }
}
</script>
