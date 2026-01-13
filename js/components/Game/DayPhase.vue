<!-- js/components/Game/DayPhase.vue -->
<template>
  <div class="day-phase">
    <!-- Day Background -->
    <div class="absolute inset-0 bg-gradient-to-b from-amber-100/5 via-slate-900 to-slate-950">
      <div class="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full filter blur-3xl"></div>
    </div>

    <!-- Sun indicator -->
    <div class="absolute top-6 right-6 w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.4)] z-20"></div>

    <!-- Header -->
    <header class="day-phase-header">
      <div class="glass-card day-phase-header-content">
        <div class="day-phase-header-left">
          <div class="day-phase-icon">
            <SunIcon class="day-phase-icon-svg" />
          </div>
          <div class="day-phase-header-text">
            <p class="day-phase-subtitle">Jour {{ gameStore.currentGame?.day_number }}</p>
            <p class="day-phase-title">{{ phaseTitle }}</p>
          </div>
        </div>
        <Timer :seconds="gameStore.timer" variant="circular" size="sm" />
      </div>
    </header>

    <!-- Main Content -->
    <main class="day-phase-main">
      <!-- Players Status Strip -->
      <div class="day-phase-players-strip">
        <div class="day-phase-players-scroll">
          <div 
            v-for="player in gameStore.players" 
            :key="player.id"
            class="day-phase-player-badge"
            :class="{ 'day-phase-player-badge-dead': !player.is_alive }"
          >
            <div 
              class="day-phase-player-avatar"
              :class="{ 'day-phase-player-avatar-dead': !player.is_alive }"
            >
              {{ player.user?.name?.[0]?.toUpperCase() || '?' }}
            </div>
            <span 
              class="day-phase-player-name"
              :class="{ 'day-phase-player-name-dead': !player.is_alive }"
            >
              {{ player.user?.name }}
            </span>
          </div>
        </div>
      </div>

      <!-- Debate/Vote Area -->
      <div class="day-phase-content">
        <transition name="fade" mode="out-in">
          <!-- Debate Phase -->
          <div v-if="isDebatePhase" class="day-phase-debate">
            <ChatBox channel="global" :is-visible="true" :show-quick-reactions="true" />
          </div>
          
          <!-- Vote Phase -->
          <div v-else class="day-phase-vote">
            <div v-if="gameStore.canAct" class="day-phase-vote-area">
              <p class="day-phase-vote-instruction">Qui doit être éliminé ?</p>
              <div class="day-phase-vote-grid">
                <PlayerCard
                  v-for="player in gameStore.livingPlayers"
                  :key="player.id"
                  :name="player.user?.name || 'Joueur'"
                  :status="player.is_alive ? 'alive' : 'dead'"
                  :is-selected="selectedTarget?.id === player.id"
                  selection-color="red"
                  @click="selectTarget(player)"
                />
              </div>
            </div>
            <div v-else class="day-phase-eliminated">
              <div class="glass-card day-phase-eliminated-card">
                <SkullIcon class="day-phase-eliminated-icon" />
                <p class="day-phase-eliminated-title">Éliminé</p>
                <p class="day-phase-eliminated-text">Vous ne pouvez plus voter</p>
              </div>
            </div>
          </div>
        </transition>
      </div>
    </main>

    <!-- Footer -->
    <footer class="day-phase-footer">
      <div class="glass-card day-phase-footer-content">
        <ActionButton
          v-if="!isDebatePhase && selectedTarget && gameStore.canAct"
          variant="danger"
          size="lg"
          :full-width="true"
          :glow="true"
          @click="submitVote"
        >
          Voter contre {{ selectedTarget.user?.name }}
        </ActionButton>
        <div v-else-if="isDebatePhase" class="day-phase-footer-message day-phase-footer-message-debate">
          Discutez et trouvez les loups !
        </div>
        <div v-else-if="!gameStore.canAct" class="day-phase-footer-message">
          En attente du résultat...
        </div>
        <div v-else class="day-phase-footer-message">
          Sélectionnez un joueur à éliminer
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Sun as SunIcon, Skull as SkullIcon } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';
import ChatBox from '@/components/Chat/ChatBox.vue';

const gameStore = useGameStore();
const selectedTarget = ref(null);

const isDebatePhase = computed(() => gameStore.phase === 'day_debate');
const phaseTitle = computed(() => isDebatePhase.value ? 'Débat Public' : 'Vote du Village');

function selectTarget(player) {
  if (player.id !== gameStore.currentPlayer?.id) selectedTarget.value = player;
}

async function submitVote() {
  if (!selectedTarget.value) return;
  await gameStore.submitAction('day_vote', selectedTarget.value.id);
  selectedTarget.value = null;
}
</script>

<style scoped>
.day-phase {
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* Header */
.day-phase-header {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  padding: 1rem;
}

@media (min-width: 768px) {
  .day-phase-header {
    padding: 1.5rem;
  }
}

.day-phase-header-content {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.day-phase-header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.day-phase-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  background: rgba(245, 158, 11, 0.2);
  border: 1px solid rgba(245, 158, 11, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-phase-icon-svg {
  width: 1.5rem;
  height: 1.5rem;
  color: rgb(251, 191, 36);
}

.day-phase-header-text {
  display: flex;
  flex-direction: column;
}

.day-phase-subtitle {
  color: rgb(100, 116, 139);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0;
}

.day-phase-title {
  color: rgb(251, 191, 36);
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0;
}

/* Main */
.day-phase-main {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding-left: 1rem;
  padding-right: 1rem;
}

@media (min-width: 768px) {
  .day-phase-main {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }
}

.day-phase-players-strip {
  flex-shrink: 0;
  margin-bottom: 1rem;
}

.day-phase-players-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.day-phase-player-badge {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: rgba(30, 41, 59, 0.5);
  transition: all 0.2s;
}

.day-phase-player-badge-dead {
  background: rgba(15, 23, 42, 0.5);
  opacity: 0.5;
}

.day-phase-player-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  background: rgb(51, 65, 85);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 500;
}

.day-phase-player-avatar-dead {
  background: rgb(30, 41, 59);
  color: rgb(100, 116, 139);
}

.day-phase-player-name {
  font-size: 0.75rem;
  color: rgb(203, 213, 225);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 60px;
}

.day-phase-player-name-dead {
  color: rgb(71, 85, 105);
  text-decoration: line-through;
}

.day-phase-content {
  flex: 1;
  min-height: 0;
}

.day-phase-debate {
  height: 100%;
}

.day-phase-vote {
  height: 100%;
  overflow-y: auto;
}

.day-phase-vote-area {
  padding-bottom: 1rem;
}

.day-phase-vote-instruction {
  color: rgb(148, 163, 184);
  text-align: center;
  margin-bottom: 1rem;
}

.day-phase-vote-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.day-phase-eliminated {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.day-phase-eliminated-card {
  padding: 2rem;
  text-align: center;
}

.day-phase-eliminated-icon {
  width: 3rem;
  height: 3rem;
  color: rgba(248, 113, 113, 0.5);
  margin: 0 auto 1rem;
  display: block;
}

.day-phase-eliminated-title {
  color: rgb(248, 113, 113);
  font-size: 1.125rem;
  margin-bottom: 0.5rem;
}

.day-phase-eliminated-text {
  color: rgb(100, 116, 139);
  font-size: 0.875rem;
}

/* Footer */
.day-phase-footer {
  position: relative;
  z-index: 10;
  flex-shrink: 0;
  padding: 1rem;
}

@media (min-width: 768px) {
  .day-phase-footer {
    padding: 1.5rem;
  }
}

.day-phase-footer-content {
  padding: 1rem;
}

.day-phase-footer-message {
  text-align: center;
  color: rgb(100, 116, 139);
  font-size: 0.875rem;
  padding: 0.25rem 0;
}

.day-phase-footer-message-debate {
  color: rgba(251, 191, 36, 0.8);
}

.glass-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.8) 0%, rgba(30, 41, 59, 0.6) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
}

.day-phase-players-scroll::-webkit-scrollbar {
  height: 4px;
}

.day-phase-players-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.day-phase-players-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
}
</style>
