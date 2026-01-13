<template>
  <div class="home-view min-h-screen w-full flex flex-col items-center justify-center p-4 relative overflow-hidden">
    <!-- Animated Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <!-- Aurora effect -->
      <div class="absolute inset-0 opacity-30">
        <div class="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/20 rounded-full filter blur-3xl animate-float"></div>
        <div class="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-600/20 rounded-full filter blur-3xl animate-float" style="animation-delay: 2s;"></div>
        <div class="absolute top-1/2 left-1/2 w-64 h-64 bg-indigo-600/20 rounded-full filter blur-3xl animate-float" style="animation-delay: 4s;"></div>
      </div>
      <!-- Particle dust effect -->
      <div class="absolute inset-0" style="background-image: radial-gradient(rgba(255,255,255,0.1) 1px, transparent 1px); background-size: 50px 50px;"></div>
    </div>

    <!-- Moon in corner -->
    <div class="absolute top-8 right-8 w-16 h-16 rounded-full bg-gradient-to-br from-slate-200 to-slate-400 shadow-[0_0_40px_rgba(248,250,252,0.3)] opacity-60"></div>

    <!-- Header / Logo -->
    <div class="relative z-10 text-center mb-12 w-full max-w-md">
      <h1 class="text-cinzel text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300 animate-glow-pulse mb-3">
        Loup-Garou
      </h1>
      <div class="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mb-3"></div>
      <p class="text-slate-400 text-sm tracking-widest uppercase">Le Village des Ombres</p>
    </div>

    <!-- Main Glass Panel -->
    <div class="relative z-10 glass-card w-full max-w-md p-6 md:p-8">

      <!-- Not Logged In -->
      <div v-if="!authStore.user" class="flex flex-col gap-6">
        <div class="text-center pb-4 border-b border-white/10">
          <div class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/10 border border-violet-500/30 mb-4">
            <div class="w-2 h-2 rounded-full bg-violet-500 animate-pulse"></div>
            <span class="text-violet-400 text-sm">Connexion requise</span>
          </div>
          <p class="text-slate-400 text-sm">Entrez dans le village pour commencer</p>
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
      <div v-else class="flex flex-col gap-6">
        <!-- User Info -->
        <div class="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-white/5">
          <div class="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white font-display text-xl shadow-lg shadow-violet-500/20">
            {{ authStore.user.name?.charAt(0)?.toUpperCase() || '?' }}
          </div>
          <div class="flex-1">
            <p class="text-white font-medium text-lg">{{ authStore.user.name || 'Inconnu' }}</p>
            <div class="flex items-center gap-2 text-emerald-400 text-sm">
              <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
              <span>Connecté</span>
            </div>
          </div>
          <button 
            @click="handleLogout" 
            class="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
          >
            <LogOutIcon class="w-5 h-5" />
          </button>
        </div>

        <!-- Actions -->
        <div class="flex flex-col gap-4">
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

          <div class="relative my-2">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-slate-700"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-4 bg-transparent text-slate-500">ou</span>
            </div>
          </div>

          <div class="flex gap-2">
            <input
              v-model="joinCode"
              type="text"
              placeholder="CODE"
              maxlength="5"
              class="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-center text-xl font-mono uppercase text-white placeholder-slate-600 focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 focus:outline-none transition-all"
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
          <div class="mt-4 text-center">
            <button 
              @click="startTestGame" 
              class="text-slate-600 text-xs hover:text-violet-400 transition-colors flex items-center justify-center gap-2 mx-auto"
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
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        @click.self="showCreateGame = false"
      >
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/80 backdrop-blur-sm"></div>
        
        <!-- Modal -->
        <div class="relative glass-card w-full max-w-sm p-6 shadow-2xl shadow-violet-500/10">
          <button 
            @click="showCreateGame = false" 
            class="absolute top-4 right-4 p-1 text-slate-400 hover:text-white transition-colors"
          >
            <XIcon class="w-5 h-5" />
          </button>

          <h3 class="text-cinzel text-2xl text-amber-400 mb-6 text-center">Configuration</h3>

          <div class="mb-8">
            <label class="block text-slate-400 text-sm mb-3">Nombre de joueurs</label>
            <div class="grid grid-cols-3 gap-2">
              <button 
                v-for="count in [8, 10, 12]"
                :key="count"
                @click="playerCount = count"
                class="player-count-btn py-4 rounded-xl font-display text-xl transition-all duration-200"
                :class="playerCount === count 
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-900 shadow-lg shadow-amber-500/25' 
                  : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:border-amber-500/50 hover:text-amber-400'"
              >
                {{ count }}
              </button>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
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
  min-height: 100vh;
  min-height: 100dvh;
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
</style>
