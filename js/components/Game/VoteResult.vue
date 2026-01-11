<template>
  <div class="vote-result-container relative h-screen w-screen overflow-hidden bg-cream flex items-center justify-center p-4 animate-fade-in">
    <!-- Background -->
    <div class="absolute inset-0 z-0">
      <img 
        v-if="backgroundExists" 
        src="/images/backgrounds/village-day.webp" 
        alt="Village" 
        class="absolute inset-0 w-full h-full object-cover opacity-20 animate-fade-in"
      />
      <div class="absolute inset-0 bg-gradient-to-b from-soft-gold/30 via-transparent to-cream"></div>
    </div>

    <!-- Content -->
    <div class="relative z-10 text-center text-text-dark animate-scale-in">
      <h1 class="font-serif text-4xl font-bold text-shadow-md mb-8">
        Résultat du Vote
      </h1>
      
      <!-- CORRECTION: Afficher les détails du vote -->
      <div v-if="Object.keys(voteCounts).length > 0" class="vote-details glass-surface border-glass-border rounded-xl p-4 mb-4 max-w-md w-full animate-fade-in-up">
        <p class="text-lg font-bold text-text-dark mb-3">📊 Comptage des voix :</p>
        <div class="space-y-2">
          <div 
            v-for="(count, name) in voteCounts" 
            :key="name"
            class="flex justify-between items-center p-2 rounded"
            :class="name === designatedPlayer?.user?.name ? 'bg-blood-red/20 border border-blood-red/50' : 'bg-text-dark/5'"
          >
            <span class="font-sans text-text-dark">{{ name }}</span>
            <span class="font-bold" :class="name === designatedPlayer?.user?.name ? 'text-blood-red' : 'text-text-dark/70'">
              {{ count }} voix
            </span>
          </div>
        </div>
      </div>
      
      <div v-if="designatedPlayer" class="designated-result glass-surface border-blood-red/30 rounded-xl p-6 max-w-md w-full animate-fade-in-up">
        <p class="text-lg font-sans text-text-dark/80 mb-2">➡️ Le village a désigné :</p>
        <p class="text-3xl font-bold text-blood-red font-serif text-shadow-lg">
          {{ designatedPlayer.user?.name }}
        </p>
        <p v-if="voteResult?.target_role" class="text-sm text-text-dark/60 mt-2">
          Rôle : {{ getRoleName(voteResult.target_role) }}
        </p>
      </div>
      
      <div v-else class="no-designated glass-surface border-green-500/30 rounded-xl p-6 max-w-md w-full animate-fade-in-up">
        <p class="text-xl font-sans text-text-dark/80">
          ➡️ Le village n'a pas réussi à se décider. Personne ne sera exécuté.
        </p>
        <p class="text-sm text-text-dark/60 mt-2">
          (Égalité ou vote blanc)
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import axios from 'axios';

const gameStore = useGameStore();
const backgroundExists = ref(true);
const voteCounts = ref({});

const getRoleName = (role) => {
  const names = {
    werewolf: 'Loup-Garou',
    seer: 'Voyante',
    witch: 'Sorcière',
    guard: 'Garde',
    cupid: 'Cupidon',
    hunter: 'Chasseur',
    elder: 'Ancien',
    fool: 'Fou',
    villager: 'Villageois'
  };
  return names[role] || role;
};

// CORRECTION: Lire vote_result depuis le state (comme le backend)
const voteResult = computed(() => {
  return gameStore.currentGame?.state?.vote_result || null;
});

const designatedPlayer = computed(() => {
  // CORRECTION: Utiliser vote_result.target_id au lieu de designated_player_id
  const targetId = voteResult.value?.target_id;
  if (!targetId) return null;
  return gameStore.players.find(p => p.id === targetId);
});

// Récupérer les détails des votes depuis l'API
async function fetchVoteDetails() {
  if (!gameStore.currentGame) return;
  
  try {
    const response = await axios.get(`/games/${gameStore.currentGame.id}/actions`);
    if (response.data.success && response.data.actions) {
      // Compter les votes par cible
      const votes = response.data.actions.filter(a => 
        a.type === 'day_vote' && 
        a.round === gameStore.currentGame?.day_number
      );
      
      const counts = {};
      votes.forEach(vote => {
        if (vote.target_id) {
          const target = gameStore.players.find(p => p.id === vote.target_id);
          if (target) {
            const name = target.user?.name || 'Joueur inconnu';
            counts[name] = (counts[name] || 0) + 1;
          }
        }
      });
      
      voteCounts.value = counts;
    }
  } catch (error) {
    console.error('Error fetching vote details:', error);
  }
}

onMounted(() => {
  fetchVoteDetails();
});
</script>

<style scoped>
.vote-result-container {
  background: linear-gradient(180deg, var(--color-cream) 0%, var(--color-soft-gold) 50%, var(--color-cream) 100%);
}

.designated-result,
.no-designated {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.vote-details {
  max-height: 40vh;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

/* Scrollbar personnalisée pour vote-details */
.vote-details::-webkit-scrollbar {
  width: 6px;
}

.vote-details::-webkit-scrollbar-track {
  background: transparent;
}

.vote-details::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 20px;
}

.vote-details::-webkit-scrollbar-thumb:hover {
  background-color: rgba(0, 0, 0, 0.3);
}


/* Responsive */
@media (max-width: 768px) {
  .vote-result-container {
    padding: 1rem;
  }
  
  .vote-result-container :deep(h1) {
    font-size: 1.75rem;
    margin-bottom: 1.5rem;
  }
  
  .vote-details {
    max-height: 30vh;
    margin-bottom: 0.75rem;
  }
  
  .designated-result,
  .no-designated {
    padding: 1rem;
    max-width: 100%;
  }
  
  .designated-result :deep(p),
  .no-designated :deep(p) {
    font-size: 1rem;
  }
  
  .designated-result :deep(.text-3xl) {
    font-size: 1.5rem;
  }
}

@media (max-width: 640px) {
  .vote-result-container {
    padding: 0.875rem;
  }
  
  .vote-result-container :deep(h1) {
    font-size: 1.5rem;
    margin-bottom: 1.25rem;
  }
  
  .vote-details {
    max-height: 28vh;
    padding: 0.875rem;
  }
  
  .designated-result,
  .no-designated {
    padding: 0.875rem;
  }
  
  .designated-result :deep(.text-3xl) {
    font-size: 1.375rem;
  }
}

@media (min-width: 375px) and (max-width: 414px) {
  .vote-result-container :deep(h1) {
    font-size: 1.625rem;
  }
  
  .vote-details {
    max-height: 30vh;
  }
}

@media (max-width: 360px) {
  .vote-result-container {
    padding: 0.75rem;
  }
  
  .vote-result-container :deep(h1) {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  
  .vote-details {
    padding: 0.75rem;
    max-height: 25vh;
  }
  
  .vote-details :deep(p) {
    font-size: 0.875rem;
  }
  
  .designated-result,
  .no-designated {
    padding: 0.75rem;
  }
  
  .designated-result :deep(p),
  .no-designated :deep(p) {
    font-size: 0.875rem;
  }
  
  .designated-result :deep(.text-3xl) {
    font-size: 1.25rem;
  }
  
  .designated-result :deep(.text-lg),
  .no-designated :deep(.text-xl) {
    font-size: 0.875rem;
  }
}

@media (min-width: 641px) and (max-width: 768px) {
  .vote-result-container :deep(h1) {
    font-size: 2rem;
  }
  
  .designated-result :deep(p),
  .no-designated :deep(p) {
    font-size: 1.25rem;
  }
}

@media (min-width: 1024px) {
  .vote-result-container :deep(h1) {
    font-size: 3rem;
  }
}
</style>
