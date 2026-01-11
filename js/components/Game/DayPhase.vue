<template>
  <div class="day-phase-container">
    <!-- Background -->
    <div class="background-layer">
      <img src="/images/backgrounds/village-day.webp" alt="Village during the day" class="background-image" />
      <div class="background-gradient"></div>
    </div>

    <!-- Header -->
    <header class="phase-header">
      <div class="header-left">
        <Sun class="header-icon" />
        <div>
          <p class="day-title">Jour {{ gameStore.currentGame?.day_number }}</p>
          <p class="phase-subtitle">{{ phaseTitle }}</p>
        </div>
      </div>
      <Timer :seconds="gameStore.timer" variant="circular" size="sm" />
    </header>

    <!-- Main Content -->
    <main class="phase-main">
      <!-- Player Status Bar -->
      <div class="status-bar">
        <div class="status-scroll">
          <PlayerCard
            v-for="player in gameStore.players"
            :key="player.id"
            :name="player.user.name"
            :status="player.is_alive ? 'alive' : 'dead'"
            class="status-card"
          />
        </div>
      </div>

      <!-- Debate / Vote Content -->
      <div class="content-area">
        <transition name="fade" mode="out-in">
          <!-- Debate Phase -->
          <div v-if="isDebatePhase" class="debate-container">
            <ChatBox channel="global" :is-visible="true" :show-quick-reactions="true" />
          </div>
          <!-- Vote Phase -->
          <div v-else class="vote-container">
            <!-- Si le joueur peut voter, afficher la grille de vote -->
            <div v-if="gameStore.canAct" class="vote-grid">
              <PlayerCard
                v-for="player in gameStore.livingPlayers"
                :key="player.id"
                :name="player.user?.name || 'Joueur'"
                :status="player.is_alive ? 'alive' : 'dead'"
                :is-selected="selectedTarget?.id === player.id"
                selection-color="blood-red"
                @click="selectTarget(player)"
              />
            </div>
            <!-- Si le joueur ne peut pas voter (mort), afficher un message -->
            <div v-else class="no-vote-message glass-surface rounded-xl p-6 text-center max-w-md w-full">
              <p class="text-cream/90 font-sans text-lg mb-2">💀 Vous êtes mort</p>
              <p class="text-cream/70 font-sans text-sm">
                Vous ne pouvez plus voter. Attendez la fin du vote...
              </p>
            </div>
          </div>
        </transition>
      </div>
    </main>

    <!-- Footer -->
    <footer class="phase-footer">
      <ActionButton
        v-if="!isDebatePhase && selectedTarget && gameStore.canAct"
        variant="danger"
        size="lg"
        :full-width="true"
        @click="submitVote"
      >
        Voter contre {{ selectedTarget.user?.name }}
      </ActionButton>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { Sun } from 'lucide-vue-next';
import ActionButton from '@/components/UI/ActionButton.vue';
import PlayerCard from '@/components/Player/PlayerCard.vue';
import Timer from '@/components/UI/Timer.vue';
import ChatBox from '@/components/Chat/ChatBox.vue';

const gameStore = useGameStore();
const selectedTarget = ref(null);

const isDebatePhase = computed(() => gameStore.phase === 'day_debate');

const phaseTitle = computed(() => {
  return isDebatePhase.value ? 'Débat du Village' : 'Le Vote';
});

function selectTarget(player) {
  if (player.id !== gameStore.currentPlayer?.id) {
    selectedTarget.value = player;
  }
}

async function submitVote() {
  if (!selectedTarget.value) return;
  await gameStore.submitAction('day_vote', selectedTarget.value.id);
  selectedTarget.value = null;
}
</script>

<style scoped>
.day-phase-container {
  width: 100%;
  height: 100vh;
  height: 100dvh;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: linear-gradient(180deg, var(--color-cream) 0%, var(--color-soft-gold) 50%, var(--color-cream) 100%);
  overflow: hidden;
}

.background-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: var(--color-cream);
}

.background-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0.2;
}

.background-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(245, 158, 11, 0.3), transparent, var(--color-cream));
}

.phase-header {
  position: relative;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  color: var(--color-text-dark);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-icon {
  width: 2rem;
  height: 2rem;
  color: var(--color-soft-gold);
}

.day-title {
  font-family: var(--font-serif);
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
}

.phase-subtitle {
  font-size: 0.875rem;
  color: var(--color-soft-gold);
  margin: 0;
}

.phase-main {
  position: relative;
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.status-bar {
  padding: 0.5rem 0;
}

.status-scroll {
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.status-scroll::-webkit-scrollbar {
  height: 6px;
}

.status-scroll::-webkit-scrollbar-track {
  background: transparent;
}

.status-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 20px;
}

.status-scroll::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.2);
}

.status-card {
  width: 5rem;
  flex-shrink: 0;
}

.content-area {
  flex: 1;
  min-height: 0;
}

.debate-container {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.vote-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 1rem 0;
  -webkit-overflow-scrolling: touch;
}

.vote-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  width: 100%;
  max-width: 32rem;
  padding: 0 1rem;
  flex-shrink: 0;
}

/* Scrollbar personnalisée pour vote-container */
.vote-container::-webkit-scrollbar {
  width: 6px;
}

.vote-container::-webkit-scrollbar-track {
  background: transparent;
}

.vote-container::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 20px;
}

.vote-container::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}

/* Firefox scrollbar pour vote-container */
.vote-container {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
}

.phase-footer {
  position: relative;
  z-index: 20;
  padding: 1rem 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Responsive */
@media (min-width: 768px) and (max-width: 1023px) {
  .day-phase-container {
    padding: 1.25rem;
  }
  
  .vote-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 1rem;
  }
  
  .status-card {
    width: 5.5rem;
  }
}

@media (min-width: 640px) and (max-width: 767px) {
  .vote-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0.875rem;
  }
  
  .day-phase-container {
    padding: 1rem;
  }
}

@media (min-width: 1024px) {
  .vote-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 1rem;
  }
  
  .day-phase-container {
    padding: 1.5rem;
  }
}

@media (max-width: 640px) {
  .phase-header {
    padding: 0.5rem 0;
  }
  
  .header-icon {
    width: 1.5rem;
    height: 1.5rem;
  }
  
  .day-title {
    font-size: 1rem;
  }
  
  .phase-subtitle {
    font-size: 0.75rem;
  }
  
  .vote-grid {
    gap: 0.5rem;
    padding: 0 0.5rem;
  }
  
  .day-phase-container {
    padding: 0.75rem;
  }
}

@media (min-width: 375px) and (max-width: 414px) {
  .day-phase-container {
    padding: 0.875rem;
  }
  
  .vote-grid {
    gap: 0.625rem;
  }
}

@media (max-width: 360px) {
  .day-phase-container {
    padding: 0.5rem;
  }
  
  .phase-header {
    padding: 0.375rem 0;
  }
  
  .header-icon {
    width: 1.25rem;
    height: 1.25rem;
  }
  
  .day-title {
    font-size: 0.875rem;
  }
  
  .phase-subtitle {
    font-size: 0.625rem;
  }
  
  .status-bar {
    padding: 0.375rem 0;
  }
  
  .status-card {
    width: 4rem;
  }
  
  .vote-grid {
    grid-template-columns: 1fr;
    gap: 0.5rem;
    padding: 0 0.25rem;
  }
  
  .phase-footer {
    padding: 0.75rem 0;
  }
  
  .debate-container {
    padding: 0.5rem;
  }
  
  .no-vote-message {
    padding: 1rem;
  }
  
  .no-vote-message p {
    font-size: 0.875rem;
  }
}

.no-vote-message {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  word-wrap: break-word;
  white-space: normal;
  overflow-wrap: break-word;
}

.no-vote-message p {
  white-space: normal;
  word-wrap: break-word;
  overflow-wrap: break-word;
  line-height: 1.5;
}
</style>
