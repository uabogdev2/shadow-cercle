<!-- js/components/Game/VoteResult.vue -->
<template>
  <div class="vote-result">
    <!-- Background -->
    <div class="vote-result-bg">
      <!-- Special background for Fool victory -->
      <div v-if="isFoolVictory" class="vote-result-bg-fool"></div>
      <div v-else class="vote-result-bg-normal"></div>
      <div class="vote-result-bg-orb"></div>
    </div>

    <!-- Content -->
    <div class="vote-result-content">
      <div class="glass-card vote-result-card">
        <h1 class="vote-result-title">Résultats du Vote</h1>
        
        <!-- Vote counts -->
        <div v-if="Object.keys(voteCounts).length > 0" class="vote-result-counts">
          <div
            v-for="(count, name) in sortedVoteCounts"
            :key="name"
            class="vote-result-count-item"
            :class="{ 'vote-result-count-item-designated': name === designatedPlayer?.user?.name }"
          >
            <span class="vote-result-count-name">{{ name }}</span>
            <div class="vote-result-count-right">
              <div class="vote-result-count-bars">
                <div 
                  v-for="i in count" 
                  :key="i"
                  class="vote-result-count-bar"
                  :class="name === designatedPlayer?.user?.name ? 'bg-red-500' : 'bg-violet-500'"
                ></div>
              </div>
              <span 
                class="vote-result-count-number"
                :class="name === designatedPlayer?.user?.name ? 'text-red-400' : 'text-violet-400'"
              >
                {{ count }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Fool Victory Special Display -->
        <div v-if="isFoolVictory" class="vote-result-fool-victory">
          <div class="vote-result-divider"></div>
          
          <div class="vote-result-fool-badge">
            <span class="vote-result-fool-icon">🃏</span>
          </div>
          
          <h2 class="vote-result-fool-title">Victoire du Fou !</h2>
          
          <p class="vote-result-fool-text">
            {{ designatedPlayer?.user?.name }} était l'Idiot du Village !<br/>
            En se faisant éliminer par le village, il remporte la partie !
          </p>
          
          <div class="vote-result-fool-winner">
            <span>{{ designatedPlayer?.user?.name }}</span>
            <span class="vote-result-fool-role">Idiot du Village</span>
          </div>
        </div>
        
        <!-- Normal Designated player -->
        <div v-else-if="designatedPlayer" class="vote-result-designated">
          <div class="vote-result-divider"></div>
          
          <p class="vote-result-designated-label">Condamné</p>
          
          <div class="vote-result-designated-name">
            <span>{{ designatedPlayer.user?.name }}</span>
          </div>
          
          <div class="vote-result-designated-role">
            <span 
              class="vote-result-role-badge"
              :style="{ 
                backgroundColor: `${getRoleColor(voteResult?.target_role)}20`,
                borderColor: `${getRoleColor(voteResult?.target_role)}40`,
                color: getRoleColor(voteResult?.target_role)
              }"
            >
              {{ getRoleIcon(voteResult?.target_role) }}
              {{ getRoleName(voteResult?.target_role) }}
            </span>
          </div>
        </div>
        
        <!-- No consensus -->
        <div v-else class="vote-result-no-consensus">
          <div class="vote-result-no-consensus-icon">
            <span>⚖️</span>
          </div>
          <p class="vote-result-no-consensus-title">Pas de consensus</p>
          <p class="vote-result-no-consensus-text">Personne n'est éliminé</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import axios from 'axios';

const gameStore = useGameStore();
const voteCounts = ref({});

const voteResult = computed(() => gameStore.currentGame?.state?.vote_result || null);

const designatedPlayer = computed(() => {
  const targetId = voteResult.value?.target_id;
  if (!targetId) return null;
  return gameStore.players.find(p => p.id === targetId);
});

// Check if the eliminated player is the Fool (special victory)
const isFoolVictory = computed(() => {
  const targetRole = voteResult.value?.target_role;
  const winner = gameStore.currentGame?.state?.winner;
  
  // Check if fool was eliminated or if winner is already set to fool
  return targetRole === 'fool' || winner === 'fool';
});

const sortedVoteCounts = computed(() => {
  const entries = Object.entries(voteCounts.value);
  entries.sort((a, b) => b[1] - a[1]);
  return Object.fromEntries(entries);
});

function getRoleName(role) {
  const names = {
    werewolf: 'Loup-Garou',
    seer: 'Voyante',
    witch: 'Sorcière',
    guard: 'Garde',
    hunter: 'Chasseur',
    cupid: 'Cupidon',
    elder: 'Ancien',
    fool: 'Idiot du Village',
    villager: 'Villageois'
  };
  return names[role] || role || 'Inconnu';
}

function getRoleIcon(role) {
  const icons = {
    werewolf: '🐺',
    seer: '🔮',
    witch: '🧪',
    guard: '🛡️',
    hunter: '🏹',
    cupid: '💘',
    elder: '👴',
    fool: '🃏',
    villager: '🏠'
  };
  return icons[role] || '❓';
}

function getRoleColor(role) {
  const colors = {
    werewolf: '#EF4444',
    seer: '#7C3AED',
    witch: '#EC4899',
    guard: '#3B82F6',
    hunter: '#F59E0B',
    cupid: '#F43F5E',
    elder: '#6B7280',
    fool: '#8B5CF6',
    villager: '#10B981'
  };
  return colors[role] || '#94A3B8';
}

async function fetchVoteDetails() {
  if (!gameStore.currentGame) return;
  try {
    const response = await axios.get(`/games/${gameStore.currentGame.id}/actions`);
    if (response.data.success && response.data.actions) {
      const votes = response.data.actions.filter(a => 
        a.type === 'day_vote' && a.round === gameStore.currentGame?.day_number
      );
      const counts = {};
      votes.forEach(vote => {
        if (vote.target_id) {
          const target = gameStore.players.find(p => p.id === vote.target_id);
          if (target) {
            const name = target.user?.name || 'Inconnu';
            counts[name] = (counts[name] || 0) + 1;
          }
        }
      });
      voteCounts.value = counts;
    }
  } catch (error) { 
    console.error(error); 
  }
}

onMounted(() => fetchVoteDetails());
</script>

<style scoped>
/* ============================================
   VOTE RESULT - DARK FOLKLORE
   ============================================ */

.vote-result {
  height: 100vh;
  height: 100dvh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
  background: var(--color-bg-ink);
}

/* Background */
.vote-result-bg {
  position: absolute;
  inset: 0;
}

.vote-result-bg-normal {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, #0d0d0d 0%, rgba(26, 26, 26, 0.9) 50%, #0d0d0d 100%);
}

.vote-result-bg-fool {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(139, 92, 246, 0.16) 0%, #0d0d0d 40%, #0d0d0d 100%);
  animation: fool-glow 3s ease-in-out infinite;
}

@keyframes fool-glow {
  0%, 100% { opacity: 0.85; }
  50% { opacity: 1; }
}

.vote-result-bg-orb {
  position: absolute;
  top: 33%;
  left: 50%;
  transform: translateX(-50%);
  width: 16rem;
  height: 16rem;
  background: radial-gradient(circle, rgba(217, 119, 6, 0.32), transparent 65%);
  border-radius: 50%;
  filter: blur(60px);
}

/* Content */
.vote-result-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 28rem;
}

.vote-result-card {
  padding: 1.5rem;
  border: 2px solid rgba(62, 47, 32, 0.45);
  border-radius: var(--radius-xl);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.45), inset 0 0 0 1px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
}

.vote-result-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: var(--color-noise);
  opacity: 0.24;
  pointer-events: none;
  mix-blend-mode: soft-light;
}

.vote-result-title {
  font-family: 'Cinzel', 'Playfair Display', serif;
  font-size: 1.5rem;
  color: var(--color-accent-paper);
  text-align: center;
  margin: 0 0 1.5rem 0;
}

/* Vote Counts */
.vote-result-counts {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 2rem;
}

.vote-result-count-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: rgba(26, 26, 26, 0.92);
  border: 1px solid rgba(62, 47, 32, 0.45);
  transition: all 0.3s;
}

.vote-result-count-item-designated {
  background: rgba(153, 27, 27, 0.2);
  border-color: rgba(153, 27, 27, 0.5);
}

.vote-result-count-name {
  color: var(--color-accent-paper);
  font-weight: 600;
}

.vote-result-count-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.vote-result-count-bars {
  display: flex;
  gap: 0.25rem;
}

.vote-result-count-bar {
  width: 0.5rem;
  height: 1.5rem;
  border-radius: 9999px;
}

.vote-result-count-number {
  font-weight: 700;
  font-size: 1.125rem;
  min-width: 1.5rem;
  text-align: center;
}

/* Divider */
.vote-result-divider {
  height: 1px;
  width: 100%;
  background: linear-gradient(90deg, transparent, rgba(62, 47, 32, 0.6), transparent);
  margin-bottom: 1.5rem;
}

/* Fool Victory Special */
.vote-result-fool-victory {
  text-align: center;
}

.vote-result-fool-badge {
  width: 5rem;
  height: 5rem;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: rgba(139, 92, 246, 0.18);
  border: 2px solid rgba(139, 92, 246, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fool-bounce 1s ease-in-out infinite;
  box-shadow: 0 0 32px rgba(139, 92, 246, 0.35);
}

@keyframes fool-bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.vote-result-fool-icon { font-size: 2.5rem; }

.vote-result-fool-title {
  font-family: 'Cinzel', 'Playfair Display', serif;
  font-size: 1.75rem;
  color: #A78BFA;
  margin: 0 0 1rem 0;
  text-shadow: 0 0 18px rgba(139, 92, 246, 0.45);
}

.vote-result-fool-text {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
}

.vote-result-fool-winner {
  display: inline-flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 1rem 2rem;
  border-radius: 0.75rem;
  background: rgba(139, 92, 246, 0.18);
  border: 1px solid rgba(139, 92, 246, 0.45);
  color: var(--color-accent-paper);
  font-size: 1.25rem;
  font-weight: 600;
}

.vote-result-fool-role {
  font-size: 0.75rem;
  color: #A78BFA;
  font-weight: 400;
}

/* Normal Designated */
.vote-result-designated { text-align: center; }

.vote-result-designated-label {
  color: var(--color-text-secondary);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin: 0 0 0.75rem 0;
}

.vote-result-designated-name {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  border-radius: 0.75rem;
  background: rgba(153, 27, 27, 0.2);
  border: 1px solid rgba(153, 27, 27, 0.45);
  color: var(--color-accent-paper);
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.vote-result-designated-role { margin-top: 1rem; }

.vote-result-role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  border: 1px solid;
  background: rgba(26, 26, 26, 0.92);
  border-color: rgba(62, 47, 32, 0.45);
  color: var(--color-accent-paper);
}

/* No Consensus */
.vote-result-no-consensus { text-align: center; }

.vote-result-no-consensus-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  border-radius: 50%;
  background: rgba(217, 119, 6, 0.16);
  border: 1px solid rgba(217, 119, 6, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.vote-result-no-consensus-title {
  color: var(--color-accent-paper);
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
}

.vote-result-no-consensus-text {
  color: var(--color-text-secondary);
  font-size: 0.875rem;
  margin: 0;
}
</style>
